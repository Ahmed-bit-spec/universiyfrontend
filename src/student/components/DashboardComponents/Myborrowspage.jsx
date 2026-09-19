import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLanguage } from "@/hooks/useLanguage";
import {
  BookOpen, Calendar, Clock, CheckCircle2, AlertTriangle,
  Inbox, ArrowLeft, BookMarked, User, RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";

// ─── API ──────────────────────────────────────────────────────────────────────
const getMyBorrows = () => axios.get("/api/borrows/my").then((r) => r.data.data);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const isOverdue = (dueDate, status) =>
  status !== "returned" && status !== "lost" && new Date() > new Date(dueDate);

const daysOverdue = (dueDate) =>
  Math.max(0, Math.floor((new Date() - new Date(dueDate)) / 86400000));

const daysUntil = (dueDate) =>
  Math.max(0, Math.ceil((new Date(dueDate) - new Date()) / 86400000));

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  active:   " dark:bg-[#2C2DE0]/10 text-[#2C2DE0] dark:text-[#2C2DE0] border-[#2C2DE0] dark:border-[#2C2DE0]/20",
  returned: "dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  overdue:  " dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
  lost:     "dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
};
const STATUS_DOT = {
  active: "bg-[#2C2DE0]", returned: "bg-gray-400",
  overdue: "bg-red-500 animate-pulse", lost: "bg-orange-500",
};

// ─── Borrow Card ──────────────────────────────────────────────────────────────
const BorrowCard = ({ borrow, t }) => {
  const p = t.borrow;
  const over = isOverdue(borrow.dueDate, borrow.status);
  const days = over ? daysOverdue(borrow.dueDate) : daysUntil(borrow.dueDate);
  const isActive = ["active", "overdue"].includes(borrow.status);

  return (
    <div className={` w-full rounded-2xl border bg-white dark:bg-gray-950 overflow-hidden ${over ? "border-red-200 dark:border-red-500/20" : "border-gray-100 dark:border-gray-800"}`}>
      {/* Colored top stripe */}
      <div className={`h-1 w-full ${over ? "bg-gradient-to-r from-red-400 to-red-500" : borrow.status === "returned" ? "bg-gradient-to-r from-gray-300 to-gray-400" : "bg-gradient-to-r from-[#2C2DE0] to-[#2C2DE0]"}`} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Cover */}
          {(typeof borrow.book?.coverImage === "object" ? borrow.book?.coverImage?.url : borrow.book?.coverImage) ? (
            <img
              src={typeof borrow.book.coverImage === "object" ? borrow.book.coverImage.url : borrow.book.coverImage}
              alt={borrow.book.title}
              className="w-16 rounded-xl object-cover flex-shrink-0 aspect-[2/3] shadow-sm"
            />
          ) : (
            <div className="w-16 h-24 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <BookOpen size={20} className="text-gray-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Title + status */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p className="font-black text-gray-900 dark:text-white leading-tight truncate">{borrow.book?.title}</p>
                <p className="text-sm text-gray-400 mt-0.5">{borrow.book?.author}</p>
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLE[borrow.status]}`}>
                <span className={`size-1.5 rounded-full ${STATUS_DOT[borrow.status]}`} />
                {p[`status_${borrow.status}`] || borrow.status}
              </span>
            </div>

            {/* Dates */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={11} />{p.borrowedAt}: <strong className="text-gray-700 dark:text-gray-300">{fmtDate(borrow.borrowedAt)}</strong>
              </span>
              <span className={`flex items-center gap-1 text-xs ${over ? "text-red-500" : "text-gray-400"}`}>
                <Clock size={11} />{p.dueDate}: <strong className={over ? "text-red-600" : "text-gray-700 dark:text-gray-300"}>{fmtDate(borrow.dueDate)}</strong>
              </span>
              {borrow.returnedAt && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <CheckCircle2 size={11} className="text-[#2C2DE0]" />{p.returnedAt}: <strong className="text-gray-700 dark:text-gray-300">{fmtDate(borrow.returnedAt)}</strong>
                </span>
              )}
            </div>

            {/* Overdue / due soon banner */}
            {isActive && over && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-2">
                <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  {p.overdueBy} {days} {days === 1 ? p.day : p.days} — {p.pleaseReturn}
                </p>
              </div>
            )}
            {isActive && !over && days <= 3 && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 px-3 py-2">
                <Clock size={13} className="text-yellow-500 flex-shrink-0" />
                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                  {p.dueSoon} — {days} {days === 1 ? p.day : p.days} {p.remaining}
                </p>
              </div>
            )}

            {/* Shelf info */}
            {borrow.book?.shelfLocation && isActive && (
              <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                <BookMarked size={10} />{p.shelf}: {borrow.book.shelfLocation}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MyBorrowsPage = () => {
  const { t } = useLanguage();
  const p = t.borrow;

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["myBorrows"],
    queryFn: getMyBorrows,
  });

  const active   = data.filter((b) => ["active", "overdue"].includes(b.status));
  const history  = data.filter((b) => ["returned", "lost"].includes(b.status));
  const overdue  = data.filter((b) => b.status === "overdue");

  return (
    <section className="max-w-2xl mx-auto px-4 mt-6 pb-16">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900 dark:text-white">{p.myBorrowsTitle}</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {isLoading ? t.common.loading : `${data.length} ${p.totalBorrows}`}
        </p>
      </div>

      {/* Overdue alert banner */}
      {overdue.length > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {overdue.length} {overdue.length === 1 ? p.bookOverdue : p.booksOverdue} — {p.pleaseReturnSoon}
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => <div key={i} className="h-36 rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse" />)}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-center text-sm text-red-400 py-10">{p.loadError}</p>}

      {/* Empty */}
      {!isLoading && !error && data.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="size-14 rounded-2xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4">
            <Inbox size={22} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="font-bold text-gray-900 dark:text-white text-sm">{p.noBorrows}</p>
          <p className="text-xs text-gray-400 mt-1">{p.noBorrowsSub}</p>
          <Link to="/books" className="mt-6 bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-[#2C2DE0] dark:shadow-none">
            {p.browseBooks}
          </Link>
        </div>
      )}

      {/* Active borrows */}
      {!isLoading && active.length > 0 && (
        <div className="flex flex-col gap-3 mb-6">
          {active.map((b) => <BorrowCard key={b._id} borrow={b} t={t} />)}
        </div>
      )}

      {/* History */}
      {!isLoading && history.length > 0 && (
        <>
          {active.length > 0 && (
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{p.history}</span>
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            {history.map((b) => <BorrowCard key={b._id} borrow={b} t={t} />)}
          </div>
        </>
      )}

      {/* Back link */}
      <div className="mt-10 text-center">
        <Link to="/dashboard" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-[#2C2DE0] dark:hover:text-[#2C2DE0] transition-colors">
          {t.common?.backHome || p.backHome}
        </Link>
      </div>
    </section>
  );
};

export default MyBorrowsPage;