import { useState } from "react";
import {
  HelpCircle, Wrench, CreditCard, Building2, ShieldAlert,
  Send, CheckCircle2, AlertCircle, Loader2, Clock, Mail,
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

const inputCls = "w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/40 focus:border-[#2C2DE0] dark:focus:border-[#2C2DE0] transition-all py-3 px-3.5";

const CONTACT_TYPES = [
  { icon: HelpCircle, title: "General Support", subtitle: "Questions about using the platform." },
  { icon: Wrench, title: "Technical Support", subtitle: "Problems with labs, terminals, Docker environments, or coding." },
  { icon: CreditCard, title: "Billing", subtitle: "Subscription and payment inquiries." },
  { icon: Building2, title: "Business", subtitle: "Partnerships, schools, universities, and enterprise inquiries." },
  { icon: ShieldAlert, title: "Security", subtitle: "Report security vulnerabilities responsibly." },
];

const RESPONSE_TIMES = [
  { label: "General inquiries", value: "within 24–48 hours" },
  { label: "Technical support", value: "within 24 hours" },
  { label: "Security reports", value: "as soon as possible" },
];

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ type: null, msg: null });
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSend = async () => {
    setStatus({ type: null, msg: null });
    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus({ type: "error", msg: "Please fill in all fields before sending." });
      return;
    }
    setSending(true);
    try {
      await new Promise((res) => setTimeout(res, 900));
      setStatus({ type: "success", msg: "Message sent! We'll get back to you soon." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus({ type: "error", msg: "Something went wrong. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-col gap-6 px-4 sm:px-8 py-10 bg-white dark:bg-gray-950 min-h-screen"
      style={{ fontFamily: "'Geist Variable', 'Inter', sans-serif" }}
    >
      <div className="flex flex-col items-center text-center gap-3 mb-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2C2DE0] to-[#1E1FAA] flex items-center justify-center shadow-[0_4px_0_#1E1FAA]">
          <Mail size={26} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Contact Support</h1>
        <p className="text-sm text-gray-400 max-w-md">Need help? Our support team is here to assist you.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONTACT_TYPES.map((c) => (
          <div key={c.title} className="flex items-start gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 flex items-center justify-center flex-shrink-0">
              <c.icon size={16} className="text-[#2C2DE0]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{c.title}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">{c.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <Card title="Send a Message" icon={Send}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Name</label>
            <input value={form.name} onChange={set("name")} className={inputCls} placeholder="Jane Student" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Email</label>
            <input value={form.email} onChange={set("email")} type="email" className={inputCls} placeholder="you@example.com" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Subject</label>
          <input value={form.subject} onChange={set("subject")} className={inputCls} placeholder="What can we help with?" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Message</label>
          <textarea value={form.message} onChange={set("message")} rows={4} className={`${inputCls} resize-none`} placeholder="Tell us more…" />
        </div>

        <Banner type={status.type} message={status.msg} />

        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2C2DE0] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_#1E1FAA] disabled:cursor-not-allowed transition-all duration-150"
        >
          {sending && <Loader2 size={14} className="animate-spin" />}
          {sending ? "Sending…" : "Send Message"}
        </button>
      </Card>

      <Card title="Office Hours & Response Times" icon={Clock}>
        <div className="flex items-center justify-between py-1">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Monday – Friday</p>
          <p className="text-sm text-gray-400">9:00 AM – 6:00 PM (UTC)</p>
        </div>
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 pt-1">
          {RESPONSE_TIMES.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-2.5">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{r.label}</p>
              <p className="text-[13px] text-gray-400">{r.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ContactUs;