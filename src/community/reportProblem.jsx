import { useState, useRef } from "react";
import {
  Bug, TerminalSquare, Code2, LogIn, Gauge, ShieldAlert,
  MessageSquareWarning, MoreHorizontal, Paperclip, CheckCircle2,
  AlertCircle, Loader2, Flag,
} from "lucide-react";

const Banner = ({ type, message }) => {
  if (!message) return null;
  const ok = type === "success";
  return (
    <div className={`flex items-start gap-2 rounded-xl px-3.5 py-3 border text-xs leading-relaxed ${ok
      ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 border-[#2C2DE0] dark:border-[#2C2DE0]/20 text-[#2C2DE0] dark:text-[#2C2DE0]"
      : "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400"
      }`}>
      {ok ? <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />}
      <span>{message}</span>
    </div>
  );
};

const Card = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <Icon size={13} className="text-[#2C2DE0] flex-shrink-0" />
      <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{title}</p>
    </div>
    <div className="px-4 pt-5 pb-5 bg-white dark:bg-gray-950 flex flex-col gap-4">{children}</div>
  </div>
);

const Field = ({ label, children, optional }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
      {label} {optional && <span className="text-gray-300 dark:text-gray-600 normal-case font-medium">(optional)</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/40 focus:border-[#2C2DE0] dark:focus:border-[#2C2DE0] transition-all py-3 px-3.5";

const CATEGORIES = [
  { key: "bug", label: "Bug", icon: Bug },
  { key: "terminal", label: "Terminal issue", icon: TerminalSquare },
  { key: "coding", label: "Coding issue", icon: Code2 },
  { key: "login", label: "Login problem", icon: LogIn },
  { key: "performance", label: "Performance issue", icon: Gauge },
  { key: "security", label: "Security vulnerability", icon: ShieldAlert },
  { key: "abuse", label: "Abuse", icon: MessageSquareWarning },
  { key: "other", label: "Other", icon: MoreHorizontal },
];

const ABUSE_TYPES = ["Harassment", "Offensive content", "Cheating", "Spam", "Copyright infringement"];

const ReportProblem = () => {
  const fileRef = useRef(null);
  const [category, setCategory] = useState(null);
  const [form, setForm] = useState({
    name: "", email: "", course: "", labId: "", subject: "", description: "", steps: "",
  });
  const [fileName, setFileName] = useState(null);
  const [status, setStatus] = useState({ type: null, msg: null });
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = async () => {
    setStatus({ type: null, msg: null });
    if (!category) {
      setStatus({ type: "error", msg: "Please choose an issue category." });
      return;
    }
    if (!form.email || !form.subject || !form.description) {
      setStatus({ type: "error", msg: "Please fill in email, subject, and description." });
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 900));
      setStatus({ type: "success", msg: "Thanks — your report has been submitted. We'll follow up by email." });
      setForm({ name: "", email: "", course: "", labId: "", subject: "", description: "", steps: "" });
      setCategory(null);
      setFileName(null);
    } catch {
      setStatus({ type: "error", msg: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto flex flex-col gap-6 px-4 sm:px-8 py-10 bg-white dark:bg-gray-950 min-h-screen"
      style={{ fontFamily: "'Geist Variable', 'Inter', sans-serif" }}
    >
      <div className="flex flex-col items-center text-center gap-3 mb-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2C2DE0] to-[#1E1FAA] flex items-center justify-center shadow-[0_4px_0_#1E1FAA]">
          <Flag size={26} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Report an Issue</h1>
        <p className="text-sm text-gray-400 max-w-md">Having trouble? Let us know and we'll investigate.</p>
      </div>

      <Card title="Issue Category" icon={Bug}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all duration-150 ${active
                  ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 border-[#2C2DE0] dark:border-[#2C2DE0]"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-[#2C2DE0] dark:hover:border-[#2C2DE0]"
                  }`}
              >
                <c.icon size={17} className={active ? "text-[#2C2DE0] dark:text-[#2C2DE0]" : "text-gray-400"} />
                <span className={`text-[11px] font-bold leading-tight ${active ? "text-[#2C2DE0] dark:text-[#2C2DE0]" : "text-gray-600 dark:text-gray-300"}`}>
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>

        {category === "abuse" && (
          <div className="flex flex-wrap gap-2 pt-1">
            {ABUSE_TYPES.map((t) => (
              <span key={t} className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card title="Your Details" icon={MessageSquareWarning}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name">
            <input value={form.name} onChange={set("name")} className={inputCls} placeholder="Jane Student" />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={set("email")} type="email" className={inputCls} placeholder="you@example.com" />
          </Field>
          <Field label="Course" optional>
            <input value={form.course} onChange={set("course")} className={inputCls} placeholder="e.g. CS101" />
          </Field>
          <Field label="Lab ID" optional>
            <input value={form.labId} onChange={set("labId")} className={inputCls} placeholder="e.g. lab-4821" />
          </Field>
        </div>

        <Field label="Subject">
          <input value={form.subject} onChange={set("subject")} className={inputCls} placeholder="Short summary of the issue" />
        </Field>

        <Field label="Description">
          <textarea value={form.description} onChange={set("description")} rows={4} className={`${inputCls} resize-none`} placeholder="What happened?" />
        </Field>

        <Field label="Steps to Reproduce" optional>
          <textarea value={form.steps} onChange={set("steps")} rows={3} className={`${inputCls} resize-none`} placeholder="1. Open a terminal lab&#10;2. Run…&#10;3. See error" />
        </Field>

        <Field label="Screenshot / Attachment" optional>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 text-sm font-bold text-[#2C2DE0] hover:text-[#1E1FAA] transition-colors"
          >
            <Paperclip size={14} />
            {fileName ? fileName : "Attach a file"}
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        </Field>

        <Banner type={status.type} message={status.msg} />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2C2DE0] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_#1E1FAA] disabled:cursor-not-allowed transition-all duration-150"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? "Submitting…" : "Submit Report"}
        </button>
      </Card>
    </div>
  );
};

export default ReportProblem;