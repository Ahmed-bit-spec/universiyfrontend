import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BarChartCard = ({ title, data, dataKey = "value", className }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.15 }}
    className={cn(
      "rounded-2xl border border-gray-200/60 dark:border-white/10",
      "bg-white/70 dark:bg-white dark:bg-gray-900/[0.04] backdrop-blur-xl p-5 shadow-sm",
      className
    )}
  >
    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50 dark:stroke-white/10" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            className="text-gray-400"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10 }}
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
            cursor={{ fill: "rgba(34,197,94,0.08)" }}
          />
          <Bar dataKey={dataKey} fill="#2C2DE0" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default BarChartCard;
