// src/components/community/CommunitySidebar.jsx
// Left sidebar — Medium-style navigation hub

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Rss, Map, Users, Video, MessageSquare,
  Bookmark, TrendingUp, Star, Settings, HelpCircle, ChevronRight,
  LayoutDashboard, ArrowLeft,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/context/AuthContext";
import { listConversations } from "@/api/chatApi";
import socket from "@/socket.js";
import UnicoreLogo from "@/FrontDoorSystem/components/Logo";

export const CHARTER_FONT_STACK =
  "'inter var', 'Inter', 'Charter', 'Georgia', 'Cambria', 'Times New Roman', 'Times', serif";

const DASHBOARD_ROUTE_BY_ROLE = {
  student: "/dashboard",
  teacher: "/teacher/dashboard",
  admin: "/admin/dashboard",
};

const NAV_SECTIONS = (t, chatCount) => [
  {
    label: null,
    items: [
      { href: "/community", icon: Rss, label: t["sidebar.feed"] ?? "Feed", exact: true },
      { href: "/community/bookmarks", icon: Bookmark, label: t["sidebar.bookmarks"] ?? "Bookmarks", exact: false },
      { href: "/community/trending", icon: TrendingUp, label: t["sidebar.trending"] ?? "Trending", exact: false },
    ],
  },
  {
    label: t["sidebar.discover"] ?? "Discover",
    items: [
      { href: "/community/roadmaps", icon: Map, label: t["sidebar.roadmaps"] ?? "Roadmaps", exact: false },
      { href: "/community/groups", icon: Users, label: t["sidebar.groups"] ?? "Groups", exact: false },
      { href: "/community/meetings", icon: Video, label: t["sidebar.meetings"] ?? "Meetings", exact: false },
    ],
  },
  {
    label: t["sidebar.connect"] ?? "Connect",
    items: [
      { href: "/community/chat", icon: MessageSquare, label: t["sidebar.chat"] ?? "Chat", exact: false, badge: chatCount > 0 ? String(chatCount) : null },
    ],
  },
  {
    label: t["sidebar.more"] ?? "More",
    items: [
      { href: "/community/settings", icon: Settings, label: t["sidebar.settings"] ?? "Settings", exact: false },
      { href: "/community/help", icon: HelpCircle, label: t["sidebar.help"] ?? "Help", exact: false },
    ],
  },
];

const SidebarLink = ({ href, icon: Icon, label, exact, badge, pathname }) => {
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      to={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 group ${isActive
          ? "bg-[#2C2DE0] text-white shadow-[0_3px_0_#1E1FAA] font-bold"
          : "text-gray-600 dark:text-gray-400 hover:bg-[#2C2DE0]/10 dark:hover:bg-[#2C2DE0]/15 hover:text-[#1E1FAA] dark:hover:text-[#8fe040]"
        }`}
    >
      <Icon
        size={16}
        className={`flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-[#2C2DE0]"
          }`}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-[#2C2DE0] text-white text-[10px] font-black flex items-center justify-center px-1">
          {badge}
        </span>
      )}
      {isActive && !badge && (
        <ChevronRight size={12} className="ml-auto text-gray-400 flex-shrink-0" />
      )}
    </Link>
  );
};

const BackToDashboard = ({ href }) => (
  <Link
    to={href}
    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-800 dark:hover:text-white transition-all group"
  >
    <ArrowLeft size={15} className="flex-shrink-0 group-hover:-translate-x-0.5 transition-transform" />
    <span className="flex-1 truncate">Back to dashboard</span>
    <LayoutDashboard size={14} className="flex-shrink-0 text-gray-300 dark:text-gray-600 dark:text-gray-400" />
  </Link>
);

const CommunitySidebar = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      listConversations()
        .then((d) => setChatCount(d.conversations?.length ?? 0))
        .catch(() => setChatCount(0));
    };
    refresh();
    socket.on("chat:conversation_updated", refresh);
    return () => socket.off("chat:conversation_updated", refresh);
  }, []);

  const sections = NAV_SECTIONS(t, chatCount);
  const dashboardHref = DASHBOARD_ROUTE_BY_ROLE[user?.role] ?? "/dashboard";

  return (
    <div className="flex flex-col h-full w-full" style={{ fontFamily: CHARTER_FONT_STACK }}>
      <div className="h-[60px] flex items-center px-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <Link to="/community" className="flex items-center gap-2">
          <UnicoreLogo />
        </Link>
      </div>

      <div className="flex flex-col flex-1 py-5 px-3 gap-5 overflow-y-auto">
        <BackToDashboard href={dashboardHref} />

        <nav className="flex flex-col gap-5">
          {sections.map((section, si) => (
            <div key={si}>
              {section.label && (
                <p className="px-3 mb-1.5 text-[10.5px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 dark:text-gray-400">
                  {section.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <SidebarLink key={item.href} {...item} pathname={pathname} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="px-3 py-3.5 rounded-xl bg-[#2C2DE0]/10 dark:bg-[#2C2DE0]/15 border border-[#2C2DE0]/20 dark:border-[#2C2DE0]/30">
            <p className="text-xs font-bold text-[#1E1FAA] dark:text-[#8fe040] mb-0.5">
              {t["sidebar.cta.title"] ?? "Be part of it"}
            </p>
            <p className="text-[11px] text-[#1E1FAA]/80 dark:text-[#8fe040]/70 leading-relaxed">
              {t["sidebar.cta.desc"] ?? "Share ideas, ask questions, grow together."}
            </p>
          </div>

          <p className="mt-4 px-3 text-[10px] text-gray-300 dark:text-gray-700 dark:text-gray-300 leading-relaxed">
            © {new Date().getFullYear()} Uniso ·{" "}
            <Link to="/privacy" className="hover:underline">Privacy</Link>{" "}
            ·{" "}
            <Link to="/terms" className="hover:underline">Terms</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunitySidebar;