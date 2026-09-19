import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LineChartCard = ({ title, data, dataKey = "value", className }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.1 }}
    className={cn(
      "rounded-2xl border border-gray-200/60 dark:border-white/10",
      "bg-white/70 dark:bg-white dark:bg-gray-900/[0.04] backdrop-blur-xl p-5 shadow-sm",
      className
    )}
  >
    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="adminLineGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2C2DE0" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2C2DE0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50 dark:stroke-white/10" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "currentColor" }}
            className="text-gray-400"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "currentColor" }}
            className="text-gray-400"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#2C2DE0"
            strokeWidth={2}
            fill="url(#adminLineGreen)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default LineChartCard;
