import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Area, ResponsiveContainer } from "recharts";
import { formatTime } from "../utils";

export default function ActivityTrend({ graphData, range, dark }) {
  return (
    <div className="card">
      <h2 className="card-title">📊 Activity Trend</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#4ade80" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey={range === "day" ? "hour" : range === "week" ? "day" : "date"}
            tickFormatter={(val) => {
              if (range === "day") return `${val}:00`;
              if (range === "week") return val;
              return val.slice(5); // MM-DD
            }}
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
          />

          <YAxis stroke="#475569" tick={{ fontSize: 10 }} width={30} />

          <Tooltip
            formatter={(v) => formatTime(v)}
            contentStyle={{
              background: dark ? "#0f172a" : "#ffffff",
              border: dark ? "1px solid #252d3d" : "1px solid #e2e8f0",
              borderRadius: "10px",
              color: dark ? "#fff" : "#1a202c",
              fontSize: "12px",
              padding: "8px 10px",
            }}
            labelStyle={{ color: dark ? "#94a3b8" : "#4a5568" }}
          />

          <Area type="monotone" dataKey="time" stroke="none" fill="url(#gradient)" />

          <Line
            type="monotone"
            dataKey="time"
            stroke="#4ade80"
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 5,
              stroke: "#4ade80",
              strokeWidth: 2,
              fill: dark ? "#0f172a" : "#ffffff",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
