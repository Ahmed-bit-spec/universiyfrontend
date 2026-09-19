// teacher/config/sidebarConfig.js
import {
  LayoutDashboard,
  BookOpen,
  FilePen,
  Library,
  ClipboardList,
  BarChart2,
  FolderOpen,
  UserCircle,
  MessageSquare,
} from "lucide-react";

export const TEACHER_SIDEBAR_SECTIONS = [
  {
    id: "main",
    sectionKey: "main",
    items: [
      { id: "dashboard", labelKey: "dashboard", path: "/teacher/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    id: "academic",
    sectionKey: "academic",
    items: [
      { id: "classes",      labelKey: "classes",      path: "/teacher/classes",       icon: BookOpen       },
      { id: "exams",        labelKey: "exams",        path: "/teacher/exams",         icon: FilePen        },
      { id: "questionBank", labelKey: "questionBank", path: "/teacher/question-bank", icon: Library        },
      { id: "submissions",  labelKey: "submissions",  path: "/teacher/submissions",   icon: ClipboardList  },
      { id: "results",      labelKey: "results",      path: "/teacher/results",       icon: BarChart2      },
      { id: "appeals",      labelKey: "appeals",      path: "/teacher/appeals",       icon: MessageSquare  },
    ],
  },
  {
    id: "manage",
    sectionKey: "manage",
    items: [
      { id: "resources", labelKey: "resources", path: "/teacher/resources", icon: FolderOpen  },
      { id: "profile",   labelKey: "profile",   path: "/teacher/profile",   icon: UserCircle  },
    ],
  },
];