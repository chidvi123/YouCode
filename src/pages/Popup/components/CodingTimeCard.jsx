import React from "react";
import { formatTime } from "../utils";

export default function CodingTimeCard({ stats, range, animated }) {
  const totalPlatform = stats.platformTime.leetcode + stats.platformTime.geeksforgeeks || 1;

  const lcPct = animated ? `${(stats.platformTime.leetcode / totalPlatform) * 100}%` : "0%";
  const gfgPct = animated ? `${(stats.platformTime.geeksforgeeks / totalPlatform) * 100}%` : "0%";

  return (
    <div className="card">
      <h2 className="card-title">🕐 Coding Time</h2>

      <div className="big-time">
        <div className="big-time-val">{formatTime(stats.totalCodingTime)}</div>
        <div className="big-time-lbl">Total coding time {range}</div>
      </div>

      <div className="platform-row">
        <span className="dot orange" />
        LeetCode
        <span className="time-right">{formatTime(stats.platformTime.leetcode)}</span>
      </div>

      <div className="bar-track">
        <div className="bar-fill orange" style={{ width: lcPct }} />
      </div>

      <div className="platform-row" style={{ marginTop: "12px" }}>
        <span className="dot green" />
        GeeksforGeeks
        <span className="time-right">{formatTime(stats.platformTime.geeksforgeeks)}</span>
      </div>

      <div className="bar-track">
        <div className="bar-fill green" style={{ width: gfgPct }} />
      </div>
    </div>
  );
}
