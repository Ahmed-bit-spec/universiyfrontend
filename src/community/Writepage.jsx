// src/pages/community/WritePage.jsx
// Standalone /community/write route — same UX as WritePostModal but as a page

import React from "react";
import { useNavigate } from "react-router-dom";
import WritePostModal from "@/components/community/WritePostModal";

const WritePage = () => {
  const navigate = useNavigate();

  const handleClose   = () => navigate(-1);
  const handleCreated = (post) => navigate(`/community/post/${post._id}`);

  return (
    <WritePostModal
      open={true}
      onClose={handleClose}
      onCreated={handleCreated}
    />
  );
};

export default WritePage;