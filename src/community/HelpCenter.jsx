import { useState, useMemo } from "react";
import {
  Rocket, TerminalSquare, Code2, UserCog, GraduationCap,
  Search, ChevronDown, LifeBuoy,
  MessageCircle,
  MessagesSquare,
  Video,
  BookOpen,
  ClipboardCheck,
  PenTool,
  Terminal,
  
} from "lucide-react";
import { Link } from "react-router"; // or "react-router-dom"

// ── Shared bits (matches CommunitySettings visual language) ────────────────
const Card = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <Icon size={13} className="text-[#2C2DE0] flex-shrink-0" />
      <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{title}</p>
    </div>
    <div className="px-4 pt-5 pb-5 bg-white dark:bg-gray-950 flex flex-col gap-1">{children}</div>
  </div>
);

const CATEGORIES = [
  {
    key: "getting-started",
    icon: Rocket,
    label: "Getting Started",
    items: [
      "Creating an account",
      "University verification",
      "Understanding the dashboard",
      "Using the sidebar navigation",
    ],
  },

  {
    key: "community",
    icon: MessageCircle,
    label: "Community",
    items: [
      "Creating posts",
      "Commenting on posts",
      "Liking and saving posts",
      "Reporting inappropriate content",
    ],
  },

  {
    key: "chat",
    icon: MessagesSquare,
    label: "Chat & Communication",
    items: [
      "Starting a conversation",
      "Messaging students and teachers",
      "Sending files",
      "Managing conversations",
    ],
  },

  {
    key: "meetings",
    icon: Video,
    label: "Meetings",
    items: [
      "Joining a live meeting",
      "Finding happening now sessions",
      "Using microphone and camera",
      "Screen sharing",
    ],
  },

  {
    key: "library",
    icon: BookOpen,
    label: "E-Library",
    items: [
      "Searching books",
      "Reading online books",
      "Using AI reading assistant",
      "Adding notes and bookmarks",
    ],
  },

  {
    key: "exams",
    icon: ClipboardCheck,
    label: "Online Exams",
    items: [
      "Starting an exam",
      "Exam security rules",
      "Submitting answers",
      "Viewing exam results",
    ],
  },

  {
    key: "coding-lab",
    icon: Code2,
    label: "Coding Lab",
    items: [
      "Opening the coding environment",
      "Writing and running code",
      "Viewing output",
      "Using supported languages",
    ],
  },

  {
    key: "design-lab",
    icon: PenTool,
    label: "Design Lab",
    items: [
      "Creating designs",
      "Using the design canvas",
      "Uploading assets",
      "Submitting design work",
    ],
  },

  {
    key: "terminal-lab",
    icon: Terminal,
    label: "Terminal Lab",
    items: [
      "Opening terminal",
      "Running commands",
      "Managing files",
      "Resetting terminal environment",
    ],
  },

  {
    key: "account",
    icon: UserCog,
    label: "Account & Security",
    items: [
      "Changing password",
      "Updating profile",
      "Managing devices",
      "Privacy settings",
    ],
  },
];

const FAQS = [
  {
    q: "How do I search and read books in the E-Library?",
    a: "Open the E-Library from the sidebar. Search for a book, open the reading page, and use available tools such as notes, bookmarks, and AI assistance."
  },

  {
    q: "How do I join a meeting?",
    a: "Open Meetings from the sidebar. The Happening Now section shows active meetings that you can join."
  },

  {
    q: "How does Chat work?",
    a: "Chat allows students and teachers to communicate directly. You can create conversations, send messages, and receive notifications."
  },

  {
    q: "How do Coding Labs work?",
    a: "Coding Labs provide a development environment where you can write code, run programs, view output, and practice programming tasks."
  },

  {
    q: "What can I do in Terminal Lab?",
    a: "Terminal Lab provides a secure command-line environment where you can practice Linux commands, manage files, and execute terminal tasks."
  },

  {
    q: "How does Design Lab work?",
    a: "Design Lab provides a workspace where you can create designs, edit your work, preview results, and submit your final design."
  },

  {
    q: "How are online exams protected?",
    a: "Online exams use security features such as fullscreen mode, monitoring controls, restrictions, and submission tracking to maintain exam integrity."
  },

  {
    q: "Where can I see my exam results?",
    a: "After grading is completed, you can open the Results page to view scores, feedback, and teacher comments."
  },

  {
    q: "How do I report a problem?",
    a: "Use the Contact Support page to report technical issues related to the library, exams, labs, meetings, or your account."
  },
];

const FaqRow = ({ q, a, open, onToggle }) => (
  <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 py-3.5 text-left"
    >
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{q}</span>
      <ChevronDown
        size={16}
        className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180 text-[#2C2DE0]" : ""}`}
      />
    </button>
    <div className={`grid transition-all duration-200 ${open ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"} overflow-hidden`}>
      <div className="min-h-0">
        <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
      </div>
    </div>
  </div>
);

const HelpCenter = () => {
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return CATEGORIES;
    const q = query.toLowerCase();
    return CATEGORIES
      .map((c) => ({ ...c, items: c.items.filter((i) => i.toLowerCase().includes(q)) }))
      .filter((c) => c.items.length > 0 || c.label.toLowerCase().includes(q));
  }, [query]);

  const filteredFaqs = useMemo(() => {
    if (!query.trim()) return FAQS;
    const q = query.toLowerCase();
    return FAQS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [query]);

  return (
    <div
      className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-4 sm:px-8 py-10 bg-white dark:bg-gray-950 min-h-screen"
      style={{ fontFamily: "'Geist Variable', 'Inter', sans-serif" }}
    >
      {/* Hero */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2C2DE0] to-[#1E1FAA] flex items-center justify-center shadow-[0_4px_0_#1E1FAA]">
          <LifeBuoy size={26} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Help Center</h1>
        <p className="text-sm text-gray-400 max-w-md">
          Find answers to common questions, troubleshoot issues, and learn how to use Terminal Lab.
        </p>

        <div className="relative w-full max-w-md mt-2">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles…"
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/40 focus:border-[#2C2DE0] dark:focus:border-[#2C2DE0] transition-all py-3 pl-10 pr-4"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredCategories.map((c) => (
          <Card key={c.key} title={c.label} icon={c.icon}>
            {c.items.map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-[#1E1FAA] dark:hover:text-[#8FE02C] py-1.5 transition-colors"
              >
                {item}
              </a>
            ))}
          </Card>
        ))}
        {filteredCategories.length === 0 && (
          <p className="col-span-full text-center text-sm text-gray-400 py-6">
            No articles match "{query}".
          </p>
        )}
      </div>

      {/* FAQ */}
      {filteredFaqs.length > 0 && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
              Frequently Asked Questions
            </p>
          </div>
          <div className="px-4 bg-white dark:bg-gray-950">
            {filteredFaqs.map((f, i) => (
              <FaqRow
                key={f.q}
                q={f.q}
                a={f.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-400 pb-4">
        Still stuck? <Link to="/community/support" className="text-[#2C2DE0] font-bold hover:text-[#1E1FAA]">Contact Support</Link> and we'll help you out.
      </div>
    </div>
  );
};

export default HelpCenter;