/**
 * Community real-time events — dispatches window CustomEvents so Feed / PostDetail
 * can update without coupling to React Query.
 */
import { useEffect } from "react";
import socket from "@/socket.js";

const dispatch = (name, detail) => {
  window.dispatchEvent(new CustomEvent(name, { detail }));
};

export const useCommunitySocket = () => {
  useEffect(() => {
    const onPostLike = (data) => dispatch("community:post-like", data);
    const onCommentNew = (data) => dispatch("community:comment-new", data);
    const onCommentDeleted = (data) => dispatch("community:comment-deleted", data);
    const onPostCreated = (data) => dispatch("community:post-created", data);
    const onPostDeleted = (data) => dispatch("community:post-deleted", data);

    socket.on("post:like", onPostLike);
    socket.on("comment:new", onCommentNew);
    socket.on("comment:deleted", onCommentDeleted);
    socket.on("post:created", onPostCreated);
    socket.on("post:deleted", onPostDeleted);

    return () => {
      socket.off("post:like", onPostLike);
      socket.off("comment:new", onCommentNew);
      socket.off("comment:deleted", onCommentDeleted);
      socket.off("post:created", onPostCreated);
      socket.off("post:deleted", onPostDeleted);
    };
  }, []);
};

export default useCommunitySocket;
