// pages/community/FeedPage.jsx
//
// Thin page component that connects the Feed to the layout's composerRef.
// Import this instead of Feed.jsx in your router.

import React from "react";
import { useOutletContext } from "react-router-dom";
import Feed from "./Feed";

const FeedPage = () => {
  const { composerRef } = useOutletContext() ?? {};
  return <Feed composerRef={composerRef} />;
};

export default FeedPage;