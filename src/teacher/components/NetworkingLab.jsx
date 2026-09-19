import React, { useCallback, useRef, useState } from "react";
import { Router, Network, Monitor, Wifi, Cable, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const DEVICE_TYPES = [
  { type: "router", label: "Router", icon: Router, color: "#2C2DE0" },
  { type: "switch", label: "Switch", icon: Network, color: "#2C2DE0" },
  { type: "pc", label: "PC", icon: Monitor, color: "#2C2DE0" },
  { type: "wireless", label: "Wireless AP", icon: Wifi, color: "#2C2DE0" },
];

let idCounter = 1;

export default function NetworkingLab({ question, value, onChange }) {
  const canvasRef = useRef(null);
  const [devices, setDevices] = useState(value?.devices || []);
  const [connections, setConnections] = useState(value?.connections || []);
  const [dragType, setDragType] = useState(null);
  const [linkFrom, setLinkFrom] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const { t } = useLanguage();
  const deviceLabels = {
    router: t("exam.deviceRouter") || "Router",
    switch: t("exam.deviceSwitch") || "Switch",
    pc: t("exam.devicePC") || "PC",
    wireless: t("exam.deviceWirelessAP") || "Wireless AP",
  };

  const persist = useCallback(
    (d, c) => {
      onChange?.({ devices: d, connections: c });
    },
    [onChange]
  );

  const handleDrop = e => {
    e.preventDefault();
    if (!dragType || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const next = [
      ...devices,
      { id: `dev-${idCounter++}`, type: dragType, x, y, label: dragType.toUpperCase() },
    ];
    setDevices(next);
    persist(next, connections);
    setDragType(null);
  };

  const toggleLink = deviceId => {
    if (!linkFrom) {
      setLinkFrom(deviceId);
      return;
    }
    if (linkFrom === deviceId) {
      setLinkFrom(null);
      return;
    }
    const exists = connections.some(
      c => (c.from === linkFrom && c.to === deviceId) || (c.from === deviceId && c.to === linkFrom)
    );
    if (!exists) {
      const next = [...connections, { from: linkFrom, to: deviceId, status: "pending" }];
      setConnections(next);
      persist(devices, next);
    }
    setLinkFrom(null);
  };

  const simulate = () => {
    if (devices.length < 2 || connections.length === 0) {
      setSimResult({ ok: false, message: t("exam.networkTopologyError") || "Add at least 2 devices and connect them with cables." });
      return;
    }
    const hasRouter = devices.some(d => d.type === "router");
    const hasSwitch = devices.some(d => d.type === "switch");
    const ok = hasRouter && hasSwitch && connections.length >= 2;
    const next = connections.map(c => ({ ...c, status: ok ? "success" : "failure" }));
    setConnections(next);
    persist(devices, next);
    setSimResult({
      ok,
      message: ok
        ? t("exam.networkSimulationSuccess") || "Packet simulation: all links UP — topology valid."
        : t("exam.networkSimulationFailed") || "Simulation failed: topology needs a router, switch, and at least 2 cable links.",
    });
  };

  const getPos = id => {
    const d = devices.find(x => x.id === id);
    return d ? { x: d.x + 24, y: d.y + 24 } : { x: 0, y: 0 };
  };

  return (
    <div className="-mx-6 -my-6 h-[600px] flex flex-col bg-[#0f172a]">
      <div className="h-11 bg-slate-900 flex items-center justify-between px-4 border-b border-slate-700">
        <span className="text-sm font-medium text-[#2C2DE0] flex items-center gap-2">
          <Cable className="w-4 h-4" />
          {t("exam.networkLab") || "Cisco Network Lab"}
        </span>
        <button
          type="button"
          onClick={simulate}
          className="text-xs bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white px-3 py-1.5 rounded-md font-medium text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
        >
          {t("exam.simulatePackets") || "Simulate packets"}
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-48 bg-slate-900 border-r border-slate-700 p-3 flex flex-col gap-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            {t("exam.devicesLabel") || "Devices"}
          </p>
          {DEVICE_TYPES.map(d => {
            const Icon = d.icon;
            return (
              <div
                key={d.type}
                draggable
                onDragStart={() => setDragType(d.type)}
                className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-lg flex items-center gap-2 text-slate-200 text-sm cursor-grab active:cursor-grabbing"
              >
                <Icon className="w-4 h-4 text-[#2C2DE0]" />
                {deviceLabels[d.type]}
              </div>
            );
          })}
          <p className="text-[10px] text-slate-500 mt-2 px-1">
            {t("exam.networkHint") || "Click a device, then another to draw a cable. Drag devices from the palette."}
          </p>
        </div>

        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            backgroundImage:
              "linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((c, i) => {
              const a = getPos(c.from);
              const b = getPos(c.to);
              const color = c.status === "success" ? "#2C2DE0" : c.status === "failure" ? "#f87171" : "#64748b";
              return (
                <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={2} strokeDasharray="6 4" />
              );
            })}
          </svg>

          {devices.map(d => {
            const meta = DEVICE_TYPES.find(t => t.type === d.type) || DEVICE_TYPES[0];
            const Icon = meta.icon;
            const selected = linkFrom === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleLink(d.id)}
                style={{ left: d.x, top: d.y }}
                className={`absolute w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
                  selected ? "border-[#2C2DE0] bg-[#2C2DE0]/40" : "border-slate-600 bg-slate-800 hover:border-[#2C2DE0]"
                }`}
              >
                <Icon className="w-5 h-5 text-[#2C2DE0]" />
                <span className="text-[8px] text-slate-400 mt-0.5">{d.label}</span>
              </button>
            );
          })}

          {devices.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-slate-500 text-sm max-w-xs text-center">
                {question?.question || t("exam.networkDefaultInstruction") || "Drag routers, switches, and PCs onto the canvas to build your topology."}
              </p>
            </div>
          )}
        </div>
      </div>

      {simResult && (
        <div
          className={`h-10 flex items-center gap-2 px-4 text-sm border-t ${
            simResult.ok ? "bg-[#2C2DE0]/50 border-[#2C2DE0] text-[#2C2DE0]" : "bg-red-950/50 border-red-800 text-red-300"
          }`}
        >
          {simResult.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {simResult.message}
        </div>
      )}
    </div>
  );
}
