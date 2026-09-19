/**
 * Official exam watermark — identity + university stamp.
 * Position shifts every few seconds so static crops are harder to scrub.
 */
import React, { useState, useEffect } from "react";

export default function ExamWatermark({
  studentName = "Student",
  studentId = "",
  examId = "",
  examTitle = "",
  sessionId = "",
  universityName = "UNIVERSITY OF SOMALIA",
}) {
  const [now, setNow] = useState(new Date());
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setOffset({
        x: Math.floor(Math.random() * 18) - 9,
        y: Math.floor(Math.random() * 14) - 7,
      });
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const pad2 = (n) => String(n).padStart(2, "0");
  const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  const date = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const eid = examId ? String(examId).slice(-6).toUpperCase() : "";
  const sid = sessionId ? String(sessionId).slice(-6).toUpperCase() : "";

  const stamps = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 3; col++) {
      stamps.push({ row, col });
    }
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {stamps.map(({ row, col }) => (
        <div
          key={`${row}-${col}`}
          style={{
            position: "absolute",
            left: `calc(${col * 34 - 4}% + ${offset.x}px)`,
            top: `calc(${row * 13 - 2}% + ${offset.y}px)`,
            transform: "rotate(-28deg)",
            opacity: 0.07,
            color: "#000",
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1.45,
            whiteSpace: "nowrap",
            letterSpacing: 0.4,
            transition: "left 1.2s ease, top 1.2s ease",
          }}
        >
          <div>{universityName}</div>
          <div>OFFICIAL EXAM DOCUMENT</div>
          <div>
            Student: {studentName}
            {studentId ? ` · ID: ${studentId}` : ""}
          </div>
          <div>
            {date} · {time}
            {examTitle ? ` · ${examTitle}` : ""}
          </div>
          <div>
            Exam:{eid} · Ses:{sid}
          </div>
        </div>
      ))}
    </div>
  );
}
