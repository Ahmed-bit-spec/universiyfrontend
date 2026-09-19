// teacher/TeacherRoutes.jsx
// Paste these routes inside your main router (e.g. App.jsx / router.jsx).
// All teacher pages live under /teacher/* and share TeacherLayout.

import { Route } from "react-router-dom";
import {
  BookOpen,
  FilePen,
  Library,
  ClipboardList,
  BarChart2,
  FolderOpen,
  UserCircle,
} from "lucide-react";
import TeacherDashboardPage from "./page/TeacherDashboardPage";
import TeacherPlaceholderPage from "./page/TeacherPlaceholderPage";
import TeacherLayout from "./TeacherLayout";
import TeacherClassesPage from "./page/TeacherClassPage";
import TeacherExamsPage from "./page/TeacherExamsPage";
import TeacherQuestionBankPage from "./page/TeacherQuestionBankPage";
import TeacherSubmissionsPage from "./page/TeacherSubmissionsPage";
import TeacherResultsPage from "./page/TeacherResultsPage";
import TeacherResourcesPage from "./page/TeacherResourcesPage";
import TeacherProfilePage from "./page/TeacherProfilePage";

// ── Usage (inside your <Routes> or createBrowserRouter) ──────────────────────
//
//   <Route path="/teacher" element={<TeacherLayout />}>
//     {teacherRoutes}
//   </Route>
//
// ─────────────────────────────────────────────────────────────────────────────

export const teacherRoutes = (
  <>
    {/* Default → dashboard */}
    <Route index element={<TeacherDashboardPage />} />
    <Route path="dashboard" element={<TeacherDashboardPage />} />

    <Route
      path="classes"
      element={
        <TeacherPlaceholderPage
          title="My Classes"
          icon={BookOpen}
          description="Create and manage your classes, enroll students, and track attendance."
        />
      }
    />
    <Route
      path="exams"
      element={
        <TeacherPlaceholderPage
          title="Exams"
          icon={FilePen}
          description="Build exams with multiple choice, true/false, and written answer questions."
        />
      }
    />
    <Route
      path="question-bank"
      element={<TeacherQuestionBankPage />}
    />
    <Route
      path="submissions"
      element={<TeacherSubmissionsPage />}
    />
    <Route
      path="results"
      element={<TeacherResultsPage />}
    />
    <Route
      path="resources"
      element={<TeacherResourcesPage />}
    />
    <Route
      path="profile"
      element={<TeacherProfilePage />}
    />
  </>
);

// ── Example: standalone export (for createBrowserRouter) ─────────────────────
export const teacherRouterConfig = {
  path: "/teacher",
  element: <TeacherLayout />,
  children: [
    { index: true,                element: <TeacherDashboardPage /> },
    { path: "dashboard",          element: <TeacherDashboardPage /> },
    { path: "classes",            element: <TeacherClassesPage /> },
    { path: "exams",              element: <TeacherExamsPage /> },
    { path: "question-bank",      element: <TeacherQuestionBankPage /> },
    { path: "submissions",        element: <TeacherSubmissionsPage /> },
    { path: "results",            element: <TeacherResultsPage /> },
    { path: "resources",          element: <TeacherResourcesPage /> },
    { path: "profile",            element: <TeacherProfilePage /> },
  ],
};