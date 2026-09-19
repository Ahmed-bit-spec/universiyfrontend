// pages/community/Meetings.jsx
// Stub placeholder — not built yet (Phase 3 backlog item: Jitsi integration).
// Wired into the router so the "Meetings" sub-nav link resolves correctly.

import React from "react";
import { useLanguage } from "@/hooks/useLanguage";

const Meetings = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold text-gray-400 dark:text-gray-600 dark:text-gray-400">
        {t["community.nav.meetings"] ?? "Meetings"}
      </p>
      <p className="text-xs text-gray-300 dark:text-gray-700 dark:text-gray-300 mt-1">
        {t["community.comingSoon"] ?? "This section is coming soon."}
      </p>
    </div>
  );
};

export default Meetings;