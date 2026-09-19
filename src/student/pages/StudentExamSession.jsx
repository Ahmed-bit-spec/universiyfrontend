/**
 * StudentExamSession.jsx
 * ─────────────────────
 * Enterprise-grade exam session page.
 *
 * Key behaviours:
 *  ● All lab answers (coding, design, linux, essay, mcq) are persisted to
 *    localStorage on every keystroke so navigating away and back to any
 *    question NEVER loses work.  The store is keyed by `examId` and cleared
 *    on submit.
 *
 *  ● Dynamic watermark: student name, ID, exam ID, session ID, live clock —
 *    tiles across the full viewport with pointer-events:none.
 *
 *  ● Security: fullscreen enforcement, tab-switch detection, copy/paste
 *    blocking, print prevention, devtools heuristic — all via
 *    useExamSecurity.  Violations are logged to the backend in real time.
 *
 *  ● LinuxLab session ID is stored in answers so returning to a terminal
 *    question reconnects the SAME container (no data loss, no wasted
 *    container spin-up).
 *
 *  ● DesignLab design ID is stored in answers so the student's canvas is
 *    reloaded from the DB when they navigate back to the question.
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import {
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
} from "lucide-react";

import "../../styles/examtheme.css";
import useExamSecurity from "@/teacher/hooks/useexamsecurity";
import ExamWatermark from "../components/ExamWatermark";
import ExamCameraMonitor from "../components/ExamCameraMonitor";
import StandardQuestion from "../components/StandardQuestion";
import { StudentCodingLab } from "@/teacher/components/CodingLab";
import LinuxLab from "@/teacher/components/LinuxLab";
import DesignLab from "@/teacher/components/DesignLab";
import NetworkingLab from "@/teacher/components/NetworkingLab";
import WindowsLab from "@/teacher/components/WindowsLab";
import { uploadDesignToCloudinary } from "@/utils/designUploadUtils.js";

// ─── Shared Duolingo-style primary button ─────────────────────────────────────
const PRIMARY_BTN =
  "bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] " +
  "hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] " +
  "active:translate-y-1 active:shadow-none transition-all duration-150";

function unescapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/** Build the localStorage key for this exam's answer draft. */
const draftKey = (examId) => `exam_draft_${examId}`;

/** Load answers: prefer the localStorage draft, fall back to server answers. */
function loadInitialAnswers(examId, serverAnswers = []) {
  try {
    const raw = localStorage.getItem(draftKey(examId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch { }
  // Build from server state (previous autosave)
  const initial = {};
  serverAnswers.forEach((a) => {
    initial[a.questionId] = {
      questionId: a.questionId,
      type: a.type,
      answer: a.answer,
      codeOutput: a.codeOutput ?? "",
    };
  });
  return initial;
}

export default function StudentExamSession() {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [examSession, setExamSession] = useState(location.state?.examSession || null);
  const [sessionLoading, setSessionLoading] = useState(!location.state?.examSession);
  const [currentQ, setCurrentQ] = useState(0);

  const exam = examSession?.exam;
  const questions = exam?.questions || [];

  // Resume session after refresh / SEB reconnect (location.state is lost on reload)
  useEffect(() => {
    if (examSession || !examId) {
      setSessionLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`/api/exams/student/${examId}/start`);
        if (!cancelled) setExamSession(data.data);
      } catch (err) {
        if (!cancelled) {
          toast.error(err.response?.data?.message || "Could not resume exam session");
          navigate("/exam-portal");
        }
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [examId, examSession, navigate]);

  // ─── answers: ALL student work lives here ───────────────────────────────────
  // Initialised from localStorage → then server → then empty.
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (!examId || !examSession) return;
    setAnswers(loadInitialAnswers(examId, examSession?.answers));
  }, [examId, examSession]);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Persist answers to localStorage on every change ────────────────────────
  // This is the core of "don't lose work when switching questions".
  // The write is synchronous (localStorage.setItem) so data survives
  // unmount/remount of individual lab components.
  useEffect(() => {
    if (!examId) return;
    try {
      localStorage.setItem(draftKey(examId), JSON.stringify(answers));
    } catch { }
  }, [answers, examId]);

  // ─── Universal answer change handler ────────────────────────────────────────
  const handleAnswerChange = useCallback(
    (questionId, value, extra = {}) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          questionId,
          type: questions.find((q) => q._id === questionId)?.type,
          answer: value,
          codeOutput: extra.codeOutput ?? value?.codeOutput ?? prev[questionId]?.codeOutput ?? "",
        },
      }));
    },
    [questions]
  );

  // ─── Submit exam ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (isAuto = false) => {
      if (!isAuto) {
        const ok = window.confirm(
          t("exam.confirmSubmit") ||
          "Are you sure you want to submit? You cannot change answers after submitting."
        );
        if (!ok) return;
      }
      setIsSubmitting(true);
      try {
        // Prepare answers for submission
        let finalAnswers = Object.values(answers);

        // For design_lab questions, we already have the designImageUrl stored
        // If not, try to grab it from the exam HTML canvas if available
        finalAnswers = finalAnswers.map((ans) => {
          const question = exam?.questions?.find((q) => q._id === ans.questionId);
          // If it's a design lab and we don't have an image URL yet, keep designId
          // The backend will handle storing what we have
          return {
            ...ans,
            answer: ans.answer, // Will contain { designId, designImageUrl } if exported
          };
        });

        await axios.post(`/api/exams/student/${examId}/submit`, {
          answers: finalAnswers,
        });
        // Clear draft on successful submit
        localStorage.removeItem(draftKey(examId));
        if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
        toast.success(
          isAuto
            ? "Exam auto-submitted."
            : `${t("exam.submit") || "Exam"} submitted successfully!`
        );
        navigate("/dashboard");
      } catch (err) {
        toast.error(err.response?.data?.message || "Submit failed");
        setIsSubmitting(false);
      }
    },
    [answers, examId, navigate, t]
  );

  // ─── Security hook ───────────────────────────────────────────────────────────
  const { violations, isFullscreen, violationCount, sessionId } =
    useExamSecurity({
      enabled: !!exam,
      rules: {
        fullscreenRequired: exam?.security?.fullscreenRequired,
        preventTabSwitch: exam?.security?.detectTabSwitch ?? exam?.security?.preventTabSwitch,
        blockClipboard:
          exam?.security?.disableCopy !== false ||
          exam?.security?.disablePaste !== false,
        blockRightClick: exam?.security?.disableRightClick !== false,
        detectDevtools: true,
        preventDuplicateTabs: true,
      },
      maxViolations: 5,
      onViolation: (entry) => {
        axios
          .post(`/api/exams/student/${examId}/log-cheating`, {
            action: entry.type,
          })
          .catch(() => { });
        toast.error(
          t("exam.cheatingWarning") ||
          "Warning: this action was logged. Further violations may auto-submit your exam."
        );
      },
      onMaxViolations: () => {
        if (exam?.security?.autoSubmit) {
          toast.error(
            t("exam.autoSubmitted") ||
            "Exam auto-submitted due to repeated violations."
          );
          handleSubmit(true);
        }
      },
    });

  // ─── Countdown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!exam) return;
    const sessionEnd = new Date(exam.endTime).getTime();
    setTimeLeft(Math.max(0, Math.floor((sessionEnd - Date.now()) / 1000)));

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (exam.security?.autoSubmit) handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  // ─── FAULT TRACKING (3 strikes = auto-submit) ─────────────────────────────────
  const [faultCount, setFaultCount] = useState(0);
  const [maxFaults] = useState(3);
  const faultTimeoutRef = useRef(null);
  const lastFaultTimeRef = useRef(0);

  // Record a fault (exit, blur, etc.) — throttled to prevent spam
  const recordFault = useCallback(
    async (reason = "window_blur") => {
      const now = Date.now();
      if (now - lastFaultTimeRef.current < 2000) return; // throttle
      lastFaultTimeRef.current = now;

      try {
        const { data } = await axios.post(
          `/api/exams/student/${examId}/record-fault`,
          { reason, currentQuestionId: questions[currentQ]?._id }
        );

        const newFaultCount = data.data?.faultCount || 0;
        setFaultCount(newFaultCount);

        if (data.data?.autoSubmitted) {
          toast.error(
            `Exam auto-submitted: reached fault limit (${newFaultCount}/${maxFaults})`
          );
          handleSubmit(true);
        } else {
          const remaining = data.data?.remainingAttempts || 0;
          if (remaining === 1) {
            toast.error(
              `⚠️ Warning: 1 more fault and your exam will auto-submit!`
            );
          } else if (remaining > 0) {
            toast.warning(
              `Fault recorded: ${remaining} attempt(s) remaining`
            );
          }
        }
      } catch (err) {
        console.error("Failed to record fault:", err);
      }
    },
    [examId, questions, currentQ, handleSubmit, maxFaults]
  );

  // Check fault status on session load
  useEffect(() => {
    if (!examId) return;
    axios
      .get(`/api/exams/student/${examId}/fault-status`)
      .then(({ data }) => {
        setFaultCount(data.data?.faultCount || 0);
        if (data.data?.autoSubmitted) {
          toast.error("Your exam was auto-submitted due to faults");
          navigate("/dashboard");
        }
      })
      .catch(() => { }); // silently fail
  }, [examId, navigate]);

  // Detect window blur (lost focus) — Linux/Chrome doesn't enforce fullscreen
  // so we need to detect when student minimizes or switches tabs
  useEffect(() => {
    if (!exam || exam.status === "submitted") return;

    const handleBlur = () => {
      recordFault("window_blur");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordFault("tab_hidden");
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [exam, recordFault]);

  // Request fullscreen on Linux/Chrome (no enforcement needed, just modal)
  useEffect(() => {
    if (!exam || !document.fullscreenEnabled) return;

    // For Linux users, offer fullscreen modal instead of forcing it
    if (
      !document.fullscreenElement &&
      exam.security?.fullscreenRequired &&
      !window.sessionStorage.getItem(`exam_fullscreen_requested_${examId}`)
    ) {
      const handleFullscreenRequest = async () => {
        try {
          window.sessionStorage.setItem(`exam_fullscreen_requested_${examId}`, "true");
          const rootElement = document.querySelector(".exam-root") || document.documentElement;
          await rootElement.requestFullscreen?.();
        } catch (err) {
          // Linux Chrome may not support fullscreen from user gesture
          // This is OK — we just log the fault instead
          console.debug("Fullscreen request failed (expected on Linux):", err.message);
        }
      };

      // Request fullscreen after a short delay to ensure proper event handling
      const timer = setTimeout(handleFullscreenRequest, 500);
      return () => clearTimeout(timer);
    }
  }, [exam, examId]);

  // ─── Backend autosave (3-second debounce, belt-and-suspenders) ──────────────
  // localStorage covers page refresh; backend autosave covers server-side
  // persistence for the teacher's monitoring dashboard.
  useEffect(() => {
    if (!examId || Object.keys(answers).length === 0) return;
    const timer = setTimeout(() => {
      axios
        .post(`/api/exams/student/${examId}/autosave`, {
          answers: Object.values(answers),
        })
        .catch(() => { });
    }, 3000);
    return () => clearTimeout(timer);
  }, [answers, examId]);

  if (sessionLoading || !examSession || !exam) {
    return (
      <div className="p-8 text-center font-display text-lg">
        {t("exam.loadingSession") || "Loading session…"}
      </div>
    );
  }

  const activeQuestion = questions[currentQ];

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const answeredCount = questions.filter(
    (q) =>
      answers[q._id]?.answer !== undefined && answers[q._id]?.answer !== ""
  ).length;

  // Student identity for watermark — use what the server gave us
  const studentName = examSession?.studentName || examSession?.student?.fullName || "";
  const studentId = examSession?.studentId || examSession?.student?.studentId || "";

  return (
    <div className="exam-root h-screen w-full flex flex-col bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 overflow-hidden">
      {/* ── Dynamic watermark (pointer-events:none overlay) ──────────────── */}
      <ExamWatermark
        studentName={studentName}
        studentId={studentId}
        examId={String(examId)}
        examTitle={exam.title}
        sessionId={sessionId || examSession?.submissionId}
      />
      <ExamCameraMonitor
        examId={examId}
        required={!!exam?.security?.cameraRequired}
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#2C2DE0]/10 rounded-lg flex items-center justify-center text-[#1E1FAA] dark:text-[#2C2DE0] font-display font-bold tracking-wider">
            EX
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg leading-tight exam-no-select">
              {exam.title}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 exam-no-select">
              {t("exam.secureEnvironment") || "Secure environment"}
              {studentName && ` · ${studentName}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-lg font-semibold border ${timeLeft < 300
              ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              : "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-600"
              }`}
          >
            <Clock className="w-5 h-5 opacity-70" />
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className={`${PRIMARY_BTN} px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50`}
          >
            {isSubmitting
              ? t("exam.submitting") || "Submitting…"
              : t("exam.submit") || "Submit exam"}
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Integrity status strip ───────────────────────────────────────── */}
      <div
        className={`h-9 flex items-center justify-center gap-6 text-xs font-medium shrink-0 border-b exam-no-select ${faultCount > 0 || violationCount > 0
          ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
          : "bg-[#2C2DE0]/15 border-[#2C2DE0]/40 text-[#1E1FAA] dark:bg-[#2C2DE0]/20 dark:border-[#2C2DE0]/50 dark:text-[#A5A6FF]"
          }`}
      >
        <span className="flex items-center gap-2">
          <span
            className={`integrity-dot ${isFullscreen ? "text-[#2C2DE0]" : "text-orange-500"
              }`}
          />
          {isFullscreen
            ? t("exam.fullscreenActive") || "Fullscreen active"
            : t("exam.fullscreenInfo") || "Fullscreen recommended"}
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" />
          {violationCount === 0
            ? t("exam.noViolations") || "No violations"
            : `${violationCount} ${t("exam.violations") || "violation(s)"}`}
        </span>
        {faultCount > 0 && (
          <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            ⚠️ {faultCount}/{maxFaults} exits
          </span>
        )}
        <span>
          {answeredCount}/{questions.length} {t("exam.answered") || "answered"}
        </span>
        {sessionId && (
          <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px]">
            Session {sessionId}
          </span>
        )}
      </div>

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question navigator */}
        <aside className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto shrink-0 hidden md:block">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800">
            <h3 className="font-semibold text-xs text-neutral-500 uppercase tracking-wider exam-no-select">
              {t("exam.questionsLabel") || "Questions"}
            </h3>
          </div>
          <div className="p-4 grid grid-cols-4 gap-2">
            {questions.map((q, idx) => {
              const ans = answers[q._id];
              const isAnswered =
                ans?.answer !== undefined && ans?.answer !== "" && ans?.answer !== null;
              const isActive = currentQ === idx;
              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentQ(idx)}
                  className={`aspect-square rounded-lg flex items-center justify-center font-medium text-sm border-2 ${isActive
                    ? `${PRIMARY_BTN} border-transparent`
                    : isAnswered
                      ? "border-transparent bg-[#2C2DE0]/20 text-[#2f6b01] dark:bg-[#2C2DE0]/20 dark:text-[#8fe040] transition-colors"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 transition-colors"
                    }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-900">
          <div className="flex-1 overflow-y-auto p-6 lg:p-10">
            <div
              className={`mx-auto space-y-8 ${["lab", "os_linux", "design_lab"].includes(activeQuestion.type)
                ? "max-w-none"
                : "max-w-4xl"
                }`}
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl font-semibold exam-no-select">
                  <span className="text-neutral-400 mr-2">{currentQ + 1}.</span>
                  {unescapeHtml(activeQuestion.question)}
                </h2>
                <div className="bg-[#2C2DE0]/15 text-[#2f6b01] dark:text-[#8fe040] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap exam-no-select">
                  {activeQuestion.marks} {t("exam.marks") || "marks"}
                </div>
              </div>

              {/* Attached image */}
              {activeQuestion.image && (
                <div className="mt-4 mb-6">
                  <img
                    src={activeQuestion.image}
                    alt="Question attachment"
                    className="max-w-full h-auto rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm"
                    style={{ maxHeight: "400px" }}
                  />
                </div>
              )}

              {/* ── Lab / answer area ────────────────────────────────────────── */}
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700">
                {/* Standard questions: MCQ, T/F, Essay */}
                {["mcq", "truefalse", "essay"].includes(activeQuestion.type) && (
                  <StandardQuestion
                    question={activeQuestion}
                    value={answers[activeQuestion._id]?.answer}
                    onChange={(val) =>
                      handleAnswerChange(activeQuestion._id, val)
                    }
                  />
                )}

                {/* ── Coding Lab ─────────────────────────────────────────────── */}
                {activeQuestion.type === "lab" && (
                  <StudentCodingLab
                    key={activeQuestion._id}
                    question={activeQuestion}
                    value={answers[activeQuestion._id]?.answer}
                    onSave={(val) =>
                      handleAnswerChange(activeQuestion._id, val)
                    }
                  />
                )}

                {/* ── Linux / Terminal Lab ────────────────────────────────────
                  We pass the previously stored sessionId back so the lab
                  reconnects to the SAME Docker container instead of spawning
                  a new one every time the student navigates back.
                ─────────────────────────────────────────────────────────── */}
                {activeQuestion.type === "os_linux" && (
                  <LinuxLab
                    key={activeQuestion._id}
                    examId={examId}
                    question={activeQuestion}
                    initialSessionId={
                      answers[activeQuestion._id]?.answer?.sessionId ||
                      (typeof answers[activeQuestion._id]?.answer === "string"
                        ? answers[activeQuestion._id]?.answer
                        : null)
                    }
                    onSessionReady={(sid) =>
                      handleAnswerChange(activeQuestion._id, {
                        ...(typeof answers[activeQuestion._id]?.answer === "object"
                          ? answers[activeQuestion._id]?.answer
                          : {}),
                        sessionId: sid,
                      })
                    }
                    value={answers[activeQuestion._id]?.answer}
                    onChange={(val) =>
                      handleAnswerChange(activeQuestion._id, val)
                    }
                  />
                )}

                {/* ── Design Lab ──────────────────────────────────────────────
                  We pass the previously stored designId back so the design
                  canvas loads the student's saved design instead of creating
                  a new blank one every time they navigate back.
                ─────────────────────────────────────────────────────────── */}
                {activeQuestion.type === "design_lab" && (
                  <DesignLab
                    key={activeQuestion._id}
                    question={activeQuestion}
                    initialDesignId={
                      answers[activeQuestion._id]?.answer?.designId ||
                      (typeof answers[activeQuestion._id]?.answer === "string"
                        ? answers[activeQuestion._id]?.answer
                        : null)
                    }
                    onDesignCreated={(designId) =>
                      handleAnswerChange(activeQuestion._id, {
                        ...(typeof answers[activeQuestion._id]?.answer === "object"
                          ? answers[activeQuestion._id]?.answer
                          : {}),
                        designId,
                      })
                    }
                    value={answers[activeQuestion._id]?.answer}
                    onChange={(val) =>
                      handleAnswerChange(activeQuestion._id, val)
                    }
                  />
                )}

                {activeQuestion.type === "networking_lab" && (
                  <NetworkingLab
                    key={activeQuestion._id}
                    question={activeQuestion}
                    value={answers[activeQuestion._id]?.answer}
                    onChange={(val) =>
                      handleAnswerChange(activeQuestion._id, val)
                    }
                  />
                )}

                {activeQuestion.type === "os_windows" && (
                  <WindowsLab
                    key={activeQuestion._id}
                    question={activeQuestion}
                    value={answers[activeQuestion._id]?.answer}
                    onChange={(val) =>
                      handleAnswerChange(activeQuestion._id, val)
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer navigation */}
          <div className="h-20 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <button
              onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
              disabled={currentQ === 0}
              className={`${PRIMARY_BTN} px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-30 disabled:shadow-none disabled:translate-y-0`}
            >
              <ChevronLeft className="w-5 h-5" />
              {t("exam.previous") || "Previous"}
            </button>

            <div className="text-sm font-medium text-neutral-500 exam-no-select">
              {t("exam.question") || "Question"} {currentQ + 1}{" "}
              {t("exam.of") || "of"} {questions.length}
            </div>

            <button
              onClick={() =>
                setCurrentQ((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
              disabled={currentQ === questions.length - 1}
              className={`${PRIMARY_BTN} px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-30 disabled:shadow-none disabled:translate-y-0`}
            >
              {t("exam.next") || "Next"}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}