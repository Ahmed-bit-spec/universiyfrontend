import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const COLORS = ["#2C2DE0", "#2C2DE0", "#2C2DE0", "#2C2DE0", "#2C2DE0"];

const DonutChartCard = ({ title, data, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.2 }}
    className={cn(
      "rounded-2xl border border-gray-200/60 dark:border-white/10",
      "bg-white/70 dark:bg-white dark:bg-gray-900/[0.04] backdrop-blur-xl p-5 shadow-sm",
      className
    )}
  >
    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => (
              <span className="text-gray-600 dark:text-gray-300">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default DonutChartCard;
