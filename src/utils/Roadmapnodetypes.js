// Single source of truth for how each node "type" looks and reads across the
// roadmap builder and the roadmap viewer. Keep this in sync in one place
// instead of duplicating Tailwind classes in every component.

export const NODE_TYPES = {
  required: {
    label: "Required",
    dot: "bg-emerald-500",
    border: "border-emerald-300 dark:border-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-400",
  },
  recommended: {
    label: "Recommended",
    dot: "bg-blue-500",
    border: "border-blue-300 dark:border-blue-800",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    ring: "ring-blue-400",
  },
  optional: {
    label: "Optional",
    dot: "bg-gray-400",
    border: "border-gray-300 dark:border-gray-700",
    bg: "bg-gray-50 dark:bg-gray-900",
    text: "text-gray-600 dark:text-gray-400",
    ring: "ring-gray-400",
  },
  milestone: {
    label: "Milestone",
    dot: "bg-amber-500",
    border: "border-amber-300 dark:border-amber-800",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-400",
  },
};

export const NODE_TYPE_ORDER = ["required", "recommended", "optional", "milestone"];

export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 68;

export const nodeCenter = (node) => ({
  x: node.x + NODE_WIDTH / 2,
  y: node.y + NODE_HEIGHT / 2,
});

export const makeNodeId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;