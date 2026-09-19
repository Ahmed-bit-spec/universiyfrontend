// Sidebar.jsx
// Primary navigation. Collapsible: when closed it shrinks to an icon rail
// and the main content reclaims the freed width (handled by the parent via
// the `collapsed` state it owns — this component is fully controlled).
// All labels via useLanguage()'s `t` with English fallbacks — no hardcoded copy.

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Armchair, CalendarCheck, BookOpen, Users,
  GraduationCap, PanelLeftClose, PanelLeftOpen, Grid3x3, Zap,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import UnicoreLogo from "@/FrontDoorSystem/components/Logo";

const getNavSections = (t) => [
  {
    label: t?.nav?.mainSection || "Main",
    items: [
      { href: "/dashboard",       label: t?.nav?.dashboard    || "Dashboard",    icon: LayoutDashboard },
      { href: "/seats",           label: t?.nav?.seats        || "Seats",        icon: Armchair },
      { href: "/my-reservations", label: t?.nav?.reservations || "Reservations", icon: CalendarCheck },
    ],
  },
  {
    label: t?.nav?.learnSection || "Learn",
    items: [
      { href: "/e-library",   label: t?.nav?.library  || "E-Library",  icon: BookOpen },
      { href: "/community",   label: t?.nav?.community || "Community", icon: Users },
      { href: "/exam-portal", label: t?.nav?.exam      || "E-exam",    icon: GraduationCap },
      { href: "/results",     label: t?.nav?.results   || "Results",   icon: Zap },
    ],
  },
];

const NavItem = ({ item, active, collapsed }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.href}
      title={collapsed ? item.label : undefined}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-150
        ${collapsed ? "justify-center px-0 w-11 mx-auto" : ""}
        ${active
          ? "bg-[#2C2DE0] text-white shadow-[0_3px_0_#1E1FAA]"
          : "text-gray-500 dark:text-gray-400 hover:bg-[#2C2DE0]/10 dark:hover:bg-[#2C2DE0]/10 hover:text-[#2C2DE0] dark:hover:text-[#6366f1]"}`}
    >
      <Icon size={18} className="flex-shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 z-50">
          {item.label}
        </span>
      )}
    </Link>
  );
};

// Small, quiet icon button in the header row — this is the "Claude-style"
// toggle: no big bar with text, just a compact rounded-square button that
// sits next to the logo and reveals a tooltip on hover.
const SidebarToggleButton = ({ collapsed, onToggle, label }) => (
  <button
    onClick={onToggle}
    aria-label={label}
    title={label}
    className="group relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
      text-gray-400 hover:text-gray-700 dark:hover:text-white
      hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-150"
  >
    {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
  </button>
);

const Sidebar = ({ collapsed, onToggle }) => {
  const { t, dir } = useLanguage();
  const { pathname } = useLocation();
  const sections = getNavSections(t);
  const toggleLabel = collapsed
    ? (t?.nav?.expand || "Expand sidebar")
    : (t?.nav?.collapse || "Collapse sidebar");

  return (
    <aside
      dir={dir}
      className={`hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 z-40 bg-white dark:bg-black border-e border-gray-100 dark:border-gray-800 transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-[248px]"
      }`}
    >
      {/* Header row: expanded shows logo + toggle side by side.
          Collapsed shows ONLY the toggle, centered — no shrunken logo,
          since a logo mark at ~76px width just clips or looks off anyway. */}
      <div
        className={`h-[60px] flex items-center border-b border-gray-100 dark:border-gray-800 flex-shrink-0 ${
          collapsed ? "justify-center px-0" : "justify-between px-4"
        }`}
      >
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <UnicoreLogo />
          </Link>
        )}
        <SidebarToggleButton collapsed={collapsed} onToggle={onToggle} label={toggleLabel} />
      </div>

      {/* Quick action — Seat grid shortcut, the thing people use most */}
      <div className={`px-3 pt-4 ${collapsed ? "px-2" : ""}`}>
        <Link
          to="/seats"
          title={collapsed ? (t?.nav?.findSeat || "Find a seat") : undefined}
          className={`flex items-center gap-2.5 rounded-xl text-sm font-bold text-white
            bg-[#2C2DE0] shadow-[0_4px_0_#1E1FAA]
            hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA]
            active:translate-y-1 active:shadow-none transition-all duration-150
            ${collapsed ? "w-11 h-11 mx-auto justify-center" : "px-3.5 py-2.5 justify-center"}`}
        >
          <Grid3x3 size={17} className="flex-shrink-0" />
          {!collapsed && <span>{t?.nav?.findSeat || "Find a seat"}</span>}
        </Link>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-gray-300 dark:text-gray-600">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  active={pathname === item.href || pathname.startsWith(item.href + "/")}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Streak / quick stat teaser — only shown expanded, keeps the rail lightweight */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-xl bg-[#2C2DE0]/5 dark:bg-[#2C2DE0]/10 border border-[#2C2DE0]/20 dark:border-[#2C2DE0]/10 px-3.5 py-3 flex items-center gap-2.5">
          <Zap size={16} className="text-[#2C2DE0] flex-shrink-0" />
          <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300 leading-snug">
            {t?.nav?.sidebarTip || "Reserve early — seats fill up fast in exam weeks."}
          </p>
        </div>
      )}
    </aside>
  );
};

// Mobile drawer — same nav content, slides in from the start edge, used by
// the topbar's menu button and StudentLayout's floating mobile button.
export const MobileSidebarDrawer = ({ open, onClose }) => {
  const { t, dir } = useLanguage();
  const { pathname } = useLocation();
  const sections = getNavSections(t);

  return (
    <>
      <div
        onClick={onClose}
        className={`lg:hidden fixed inset-0 bg-black/40 z-50 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        dir={dir}
        className={`lg:hidden fixed top-0 bottom-0 z-50 w-[260px] bg-white dark:bg-black border-e border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col transition-transform duration-200 ${
          dir === "rtl" ? "right-0" : "left-0"
        } ${open ? "translate-x-0" : dir === "rtl" ? "translate-x-full" : "-translate-x-full"}`}
      >
        <div className="h-[60px] flex items-center px-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2">
            <UnicoreLogo />
          </Link>
        </div>
        <div className="px-3 pt-4">
          <Link
            to="/seats"
            onClick={onClose}
            className="flex items-center justify-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white
              bg-[#2C2DE0] shadow-[0_4px_0_#1E1FAA]
              hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA]
              active:translate-y-1 active:shadow-none transition-all duration-150"
          >
            <Grid3x3 size={17} />
            {t?.nav?.findSeat || "Find a seat"}
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-gray-300 dark:text-gray-600">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    collapsed={false}
                    active={pathname === item.href || pathname.startsWith(item.href + "/")}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;