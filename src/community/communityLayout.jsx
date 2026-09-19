// src/components/community/CommunityLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import CommunitySidebar, { CHARTER_FONT_STACK } from "./CommunitySidebar";
import TrendingSidebar from "./TrendingSidebar";
import CommunityHeader from "./communityHeader";
import WritePostModal from "./WritePostModel";

const CommunityLayout = () => {
  const [writeOpen, setWriteOpen] = React.useState(false);
  const [newPost, setNewPost] = React.useState(null);
  const location = useLocation();

  const handleCreated = (post) => {
    setNewPost(post); // Feed.jsx reads this via useOutletContext and prepends it
  };

  const isMeetingRoom = location.pathname.includes("/meetings/room/");

  if (isMeetingRoom) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-black">
        <Outlet context={{ newPost }} />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen w-full bg-white dark:bg-black gap-6 lg:gap-10"
      style={{ fontFamily: CHARTER_FONT_STACK }}
    >
      {/* Left sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-gray-100 dark:border-gray-900 h-screen sticky top-0 overflow-y-auto">
        <CommunitySidebar />
      </aside>

      {/* Center column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <CommunityHeader onWritePost={() => setWriteOpen(true)} notificationCount={0} />
        <main className="flex-1 w-full">
          <div className="w-full mx-auto px-6 sm:px-10 py-8 sm:py-10">
            <Outlet context={{ onOpenWrite: () => setWriteOpen(true), newPost }} />
          </div>
        </main>
      </div>

      {/* Right rail */}
      <aside className="hidden lg:block w-64 shrink-0 border-l border-gray-100 dark:border-gray-900 h-screen sticky top-0 overflow-y-auto">
        <TrendingSidebar />
      </aside>

      <WritePostModal
        open={writeOpen}
        onClose={() => setWriteOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default CommunityLayout;