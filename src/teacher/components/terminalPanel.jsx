// TerminalPanel.jsx
// A REAL terminal (xterm.js) wired to your existing Docker-backed routes:
//   POST /api/labs/terminal/start
//   POST /api/labs/terminal/exec
//   POST /api/labs/terminal/stop
//   POST /api/labs/terminal/validate
//
// These routes already exist in LabController.js / LabRouter.js and already
// talk to a real Docker container per student (DockerService.js) — they were
// just never connected to a proper terminal UI. This component is that UI.
//
// npm install @xterm/xterm @xterm/addon-fit
// (must be imported once, e.g. in your app entry: import "@xterm/xterm/css/xterm.css")

import { useEffect, useRef, useState, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import axios from "axios";

export default function TerminalPanel({ examId, onSessionReady }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitRef = useRef(null);
  const inputBufferRef = useRef("");
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("connecting"); // connecting | ready | error | ended

  const prompt = useCallback(() => {
    termRef.current?.write("\r\n\x1b[32m$\x1b[0m ");
  }, []);

  // ── Boot the terminal + start the Docker session ───────────────────────
  useEffect(() => {
    const term = new Terminal({
      convertEol: true,
      fontFamily: "'JetBrains Mono', Consolas, monospace",
      fontSize: 13,
      theme: {
        background: "#0d1117",
        foreground: "#e6edf3",
        cursor: "#58a6ff",
      },
      cursorBlink: true,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();
    termRef.current = term;
    fitRef.current = fitAddon;

    term.writeln("Connecting to sandbox…");

    let disposed = false;

    (async () => {
      try {
        const res = await axios.post("/api/labs/terminal/start", { examId });
        if (disposed) return;
        const { sessionId: sid, welcome } = res.data.data;
        setSessionId(sid);
        setStatus("ready");
        onSessionReady?.(sid);
        term.clear();
        term.write(welcome.replace(/\n/g, "\r\n"));
        prompt();
      } catch (err) {
        setStatus("error");
        term.writeln(
          `\r\n\x1b[31mFailed to start sandbox: ${
            err.response?.data?.message || err.message
          }\x1b[0m`
        );
      }
    })();

    const onResize = () => fitAddon.fit();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      term.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  // ── Keystroke handling: local line editing, send full command on Enter ──
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;

    const disposable = term.onData(async (data) => {
      if (status !== "ready" || !sessionId) return;

      const code = data.charCodeAt(0);

      if (data === "\r") {
        // Enter
        const command = inputBufferRef.current;
        inputBufferRef.current = "";
        term.write("\r\n");
        if (!command.trim()) {
          prompt();
          return;
        }
        try {
          const res = await axios.post("/api/labs/terminal/exec", {
            sessionId,
            command,
          });
          const { output, clear } = res.data.data;
          if (clear) {
            term.clear();
          } else if (output) {
            term.write(output.replace(/\n/g, "\r\n"));
          }
        } catch (err) {
          term.write(
            `\r\n\x1b[31m${err.response?.data?.message || err.message}\x1b[0m`
          );
          if (err.response?.status === 410) {
            setStatus("ended");
          }
        }
        prompt();
      } else if (code === 127) {
        // Backspace
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          term.write("\b \b");
        }
      } else if (code < 32) {
        // ignore other control chars (arrows, ctrl+c handled minimally)
        if (data === "\u0003") {
          // Ctrl+C
          inputBufferRef.current = "";
          term.write("^C");
          prompt();
        }
      } else {
        inputBufferRef.current += data;
        term.write(data);
      }
    });

    return () => disposable.dispose();
  }, [status, sessionId, prompt]);

  // ── Cleanup: stop the Docker session when the component unmounts ───────
  useEffect(() => {
    return () => {
      if (sessionId) {
        axios.post("/api/labs/terminal/stop", { sessionId }).catch(() => {});
      }
    };
  }, [sessionId]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0d1117",
        // `position: relative` + `isolation: isolate` pin a new stacking/
        // positioning context right here. xterm.js creates an absolutely
        // positioned helper <textarea> (for keyboard capture) that resolves
        // against the NEAREST POSITIONED ANCESTOR. If that ancestor doesn't
        // exist (or xterm.css never loaded, which sets `.xterm { position:
        // relative }` itself), the helper — and sometimes the render layer
        // with it — falls back to the viewport's containing block and
        // visually covers everything above it, including Monaco. This div
        // guarantees a containing block exists regardless of whether the
        // global xterm.css import was added.
        position: "relative",
        isolation: "isolate",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0.35rem 0.75rem",
          background: "#161b22",
          borderBottom: "1px solid #30363d",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, color: "#8b949e" }}>
          🐧 Linux Sandbox
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            padding: "0.1rem 0.5rem",
            borderRadius: 999,
            color:
              status === "ready"
                ? "#3fb950"
                : status === "error"
                ? "#f85149"
                : "#d29922",
            border: `1px solid ${
              status === "ready"
                ? "#2ea043"
                : status === "error"
                ? "#f85149"
                : "#d29922"
            }`,
          }}
        >
          {status === "ready" ? "connected" : status}
        </span>
      </div>
      {/* position: relative here too — this is xterm's actual mount point,
          so its internal absolutely-positioned layers (.xterm-screen,
          .xterm-helper-textarea) are contained to THIS box, not the page. */}
      <div
        ref={containerRef}
        style={{ flex: 1, minHeight: 0, padding: "0.4rem", position: "relative", overflow: "hidden" }}
      />
    </div>
  );
}