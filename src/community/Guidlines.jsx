import {
  Handshake, GraduationCap, Gauge, ShieldAlert, KeyRound,
  FileWarning, TriangleAlert, ShieldCheck,
} from "lucide-react";

const Card = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <Icon size={13} className="text-[#2C2DE0] flex-shrink-0" />
      <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{title}</p>
    </div>
    <div className="px-4 pt-5 pb-5 bg-white dark:bg-gray-950 flex flex-col gap-3">{children}</div>
  </div>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full">
    {children}
  </span>
);

const RESPONSIBLE_USAGE = ["Malware", "Phishing", "Cryptocurrency mining", "Unauthorized access", "Spam", "Illegal activities"];
const NEVER_SHARE = ["Passwords", "API keys", "Personal information", "Secret tokens"];
const CONTENT_POLICY = ["Illegal content", "Copyrighted material without permission", "Hate speech", "Harassment", "Adult content"];

const Guidelines = () => {
  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-col gap-6 px-4 sm:px-8 py-10 bg-white dark:bg-gray-950 min-h-screen"
      style={{ fontFamily: "'Geist Variable', 'Inter', sans-serif" }}
    >
      <div className="flex flex-col items-center text-center gap-3 mb-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2C2DE0] to-[#1E1FAA] flex items-center justify-center shadow-[0_4px_0_#1E1FAA]">
          <ShieldCheck size={26} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Community Guidelines</h1>
        <p className="text-sm text-gray-400 max-w-md">
          A few simple rules that keep Terminal Lab safe, fair, and productive for everyone learning here.
        </p>
      </div>

      <Card title="Respect Others" icon={Handshake}>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Treat instructors and fellow students respectfully. Disagreements happen — keep them constructive and assume good intent.
        </p>
      </Card>

      <Card title="Academic Integrity" icon={GraduationCap}>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Complete your own work unless collaboration is explicitly allowed by your instructor or course rules.
        </p>
      </Card>

      <Card title="Responsible Usage" icon={ShieldAlert}>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed -mt-1">
          Do not use the platform for:
        </p>
        <div className="flex flex-wrap gap-2">
          {RESPONSIBLE_USAGE.map((r) => <Pill key={r}>{r}</Pill>)}
        </div>
      </Card>

      <Card title="Security" icon={KeyRound}>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed -mt-1">
          Never share:
        </p>
        <div className="flex flex-wrap gap-2">
          {NEVER_SHARE.map((r) => <Pill key={r}>{r}</Pill>)}
        </div>
      </Card>

      <Card title="Fair Use" icon={Gauge}>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Avoid excessive resource usage that affects other users, such as long-running background processes or large-scale mining jobs.
        </p>
      </Card>

      <Card title="Content Policy" icon={FileWarning}>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed -mt-1">
          Do not upload:
        </p>
        <div className="flex flex-wrap gap-2">
          {CONTENT_POLICY.map((r) => <Pill key={r}>{r}</Pill>)}
        </div>
      </Card>

      <div className="rounded-2xl border border-yellow-100 dark:border-yellow-500/20 bg-yellow-50 dark:bg-yellow-500/10 px-4 py-4 flex items-start gap-3">
        <TriangleAlert size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">Violations</p>
          <p className="text-[13px] text-yellow-700/80 dark:text-yellow-400/80 leading-relaxed mt-0.5">
            Accounts may be temporarily suspended or permanently banned for serious or repeated violations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Guidelines;