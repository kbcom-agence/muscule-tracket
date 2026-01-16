"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface DataPoint {
  date: string;
  weight: number;
  volume?: number;
  reps?: number;
}

interface ProgressChartProps {
  title: string;
  data: DataPoint[];
  dataKey?: "weight" | "volume" | "reps";
  color?: string;
}

export function ProgressChart({
  title,
  data,
  dataKey = "weight",
  color = "#8b5cf6",
}: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-white/50">Pas encore de données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" style={{ color }} />
        {title}
      </h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 10, 31, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.8)" }}
              itemStyle={{ color }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: color, stroke: "white", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
