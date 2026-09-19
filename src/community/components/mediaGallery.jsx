// MediaGallery — professional media layout (Facebook / LinkedIn / Threads style)
// Shared by PostCard (feed) and PostDetail (full post) so both places get the
// same gallery rules and the same fullscreen viewer.
//
// Layout rules:
//   1 item   → large, natural aspect ratio (object-contain, capped height)
//   2 items  → side by side, equal squares
//   3 items  → one large tile + two stacked tiles (collage)
//   4 items  → 2x2 grid
//   5+ items → 2x2 grid, last visible tile shows a "+N more" overlay
//
// Videos render muted/autoplay thumbnails with a tap-to-unmute button in the
// grid (consistent with the previous VideoThumb behavior); tapping anywhere
// else on a tile opens the fullscreen MediaViewer instead of navigating away.
//
// STYLE PASS — the mute button had the leftover bg-[#2C2DE0]/shadow "game
// button" classes. Replaced with a small semi-transparent dark circle so the
// icon stays legible over any photo/video, without the blue background.

import React, { useState } from "react";
import { FileText, Download, Volume2, VolumeX } from "lucide-react";
import { resolvePhoto, resolveMediaUrl } from "../ui";
import MediaViewer from "./mediaViewer";

const VideoTile = ({ src, onOpen, className = "" }) => {
  const [muted, setMuted] = useState(true);
  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMuted((m) => !m);
  };
  return (
    <div className={`relative bg-gray-100 dark:bg-gray-900 ${className}`} onClick={onOpen}>
      <video
        src={resolveMediaUrl(src)}
        className="w-full h-full object-cover"
        muted={muted}
        loop
        playsInline
        autoPlay
      />
      <button
        onClick={toggleMute}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
      >
        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
    </div>
  );
};

const Tile = ({ item, onOpen, className = "", overlay = null }) => (
  <div
    className={`relative overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-900 ${className}`}
    onClick={(e) => {
      if (e.target.closest?.("button")) return;
      onOpen();
    }}
  >
    {item.type === "image" ? (
      <img src={resolveMediaUrl(item.url)} alt="" className="w-full h-full object-cover" loading="lazy" />
    ) : (
      <VideoTile src={item.url} onOpen={onOpen} className="w-full h-full" />
    )}
    {overlay != null && (
      <div className="absolute inset-0 bg-black/55 flex items-center justify-center pointer-events-none">
        <span className="text-white text-2xl font-black">+{overlay}</span>
      </div>
    )}
  </div>
);

const MediaGallery = ({ attachments = [], legacyImage, size = "feed", canDownload = true }) => {
  const [viewerIndex, setViewerIndex] = useState(null);

  const media = attachments.filter((a) => a.type === "image" || a.type === "video");
  const pdfs = attachments.filter((a) => a.type === "pdf");
  const legacyUrl = attachments.length === 0 ? resolvePhoto(legacyImage) : null;

  const maxHeight = size === "feed" ? "max-h-[420px]" : "max-h-[520px]";
  const roundedWrap = size === "detail" ? "rounded-xl overflow-hidden mb-4" : "";

  if (!media.length && !pdfs.length && !legacyUrl) return null;

  const openAt = (i) => setViewerIndex(i);

  return (
    <div className={roundedWrap}>
      {legacyUrl && (
        <img
          src={legacyUrl}
          alt=""
          className={`w-full ${maxHeight} object-cover cursor-pointer`}
          loading="lazy"
          onClick={() => setViewerIndex(0)}
        />
      )}

      {/* 1 item — natural aspect ratio, not force-cropped */}
      {media.length === 1 && (
        <div className="bg-gray-100 dark:bg-gray-900">
          {media[0].type === "image" ? (
            <img
              src={resolveMediaUrl(media[0].url)}
              alt=""
              className={`w-full ${maxHeight} object-contain mx-auto cursor-pointer`}
              loading="lazy"
              onClick={() => openAt(0)}
            />
          ) : (
            <VideoTile src={media[0].url} onOpen={() => openAt(0)} className={`w-full ${maxHeight}`} />
          )}
        </div>
      )}

      {/* 2 items — side by side */}
      {media.length === 2 && (
        <div className="grid grid-cols-2 gap-1">
          {media.map((item, i) => (
            <Tile key={i} item={item} onOpen={() => openAt(i)} className="aspect-square" />
          ))}
        </div>
      )}

      {/* 3 items — one large + two stacked */}
      {media.length === 3 && (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-[4/3]">
          <Tile item={media[0]} onOpen={() => openAt(0)} className="row-span-2" />
          <Tile item={media[1]} onOpen={() => openAt(1)} className="" />
          <Tile item={media[2]} onOpen={() => openAt(2)} className="" />
        </div>
      )}

      {/* 4 items — 2x2 grid */}
      {media.length === 4 && (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-square">
          {media.map((item, i) => (
            <Tile key={i} item={item} onOpen={() => openAt(i)} />
          ))}
        </div>
      )}

      {/* 5+ items — 2x2 grid with "+N more" overlay on the last visible tile */}
      {media.length > 4 && (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-square">
          {media.slice(0, 4).map((item, i) => (
            <Tile
              key={i}
              item={item}
              onOpen={() => openAt(i)}
              overlay={i === 3 ? media.length - 4 : null}
            />
          ))}
        </div>
      )}

      {pdfs.length > 0 && (
        <div className="flex flex-col gap-1.5 px-4 py-2">
          {pdfs.map((att, i) => (
            <a
              key={i}
              href={resolveMediaUrl(att.url)}
              download={att.name}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 hover:border-[#2C2DE0] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-red-500" />
              </div>
              <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate flex-1">
                {att.name}
              </span>
              <Download size={14} className="text-gray-400 flex-shrink-0" />
            </a>
          ))}
        </div>
      )}

      {viewerIndex != null && (
        <MediaViewer
          media={media}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          canDownload={canDownload}
        />
      )}
    </div>
  );
};

export default MediaGallery;