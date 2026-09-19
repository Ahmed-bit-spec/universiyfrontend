import { useState } from "react";
import { LayoutDashboard, CalendarCheck, Users, BookOpen, Library, BarChart3 } from "lucide-react";
import OverviewPage from "./Overviewpage";
import ReservationsPage from "./ReservationPage";
import StudentsPage from "./StudentPage";
import BooksPage from "./BooksPage";
import BorrowingPage from "./BorrowingBooks";
import LibraryUsagePage from "./Libraryusagepage";

const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, page: OverviewPage },
    { id: "reservations", label: "Reservations", icon: CalendarCheck, page: ReservationsPage },
    { id: "students", label: "Students", icon: Users, page: StudentsPage },
    { id: "books", label: "Books", icon: BookOpen, page: BooksPage },
    { id: "borrowing", label: "Borrowing", icon: Library, page: BorrowingPage },
    { id: "library-usage", label: "Library Usage", icon: BarChart3, page: LibraryUsagePage },
];

const AnalyticsRouter = () => {
    const [active, setActive] = useState("overview");
    const ActivePage = TABS.find(t => t.id === active)?.page ?? OverviewPage;

    return (
        <div>
            {/* Tab bar */}
            <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-gray-200/70 bg-white/60 p-1.5 backdrop-blur-sm dark:border-white/10 dark:bg-white dark:bg-gray-900/[0.04]">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = active === tab.id;
                    return (
                        <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                            key={tab.id}
                            onClick={() => setActive(tab.id)}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${isActive
                                    ? "bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900 dark:text-gray-100"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200"
                                }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Active page */}
            <ActivePage />
        </div>
    );
};

export default AnalyticsRouter;