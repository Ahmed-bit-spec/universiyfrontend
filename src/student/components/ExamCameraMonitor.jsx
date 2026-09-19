/**
 * Practical camera monitor — requires webcam when exam.security.cameraRequired.
 * Shows a small preview, sends heartbeats + periodic JPEG snapshots for teacher review.
 * Does NOT run ML face detection; missing camera is flagged for the lecturer.
 */
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Camera, CameraOff } from "lucide-react";

export default function ExamCameraMonitor({ examId, required = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOk, setCameraOk] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!required || !examId) return;
    let cancelled = false;
    let heartbeatTimer;
    let snapshotTimer;

    const sendHeartbeat = async (ok, snapshot = null, note) => {
      try {
        await axios.post(`/api/exams/student/${examId}/proctor-heartbeat`, {
          cameraOk: ok,
          snapshot: snapshot || undefined,
          note,
        });
      } catch {
        // never block the exam UI on heartbeat failure
      }
    };

    const captureSnapshot = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return null;
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.55);
    };

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 360 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraOk(true);
        setError("");
        await sendHeartbeat(true);

        heartbeatTimer = setInterval(() => {
          const alive = streamRef.current?.getVideoTracks?.()?.[0]?.readyState === "live";
          setCameraOk(Boolean(alive));
          sendHeartbeat(Boolean(alive), null, alive ? undefined : "camera_lost");
        }, 12_000);

        snapshotTimer = setInterval(() => {
          const snap = captureSnapshot();
          if (snap) sendHeartbeat(true, snap);
        }, 30_000);
      } catch (err) {
        setCameraOk(false);
        setError(err?.message || "Camera permission denied");
        sendHeartbeat(false, null, "camera_denied");
      }
    };

    start();

    return () => {
      cancelled = true;
      clearInterval(heartbeatTimer);
      clearInterval(snapshotTimer);
      streamRef.current?.getTracks?.().forEach((t) => t.stop());
    };
  }, [examId, required]);

  if (!required) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[10000] w-44 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-600 shadow-lg bg-black/90">
      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80 bg-black/60">
        {cameraOk ? <Camera className="w-3 h-3 text-emerald-400" /> : <CameraOff className="w-3 h-3 text-red-400" />}
        {cameraOk ? "Camera on" : "Camera required"}
      </div>
      <video
        ref={videoRef}
        muted
        playsInline
        className="w-full h-28 object-cover bg-neutral-900"
      />
      <canvas ref={canvasRef} className="hidden" />
      {error && (
        <p className="px-2 py-1 text-[10px] text-red-300 bg-red-950/80">{error}</p>
      )}
    </div>
  );
}
