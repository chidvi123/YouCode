import React from "react";

export default function ProblemsSolvedCard({ stats, animated }) {
  const maxDiff = Math.max(...Object.values(stats.difficulty), 1);

  function diffPct(key) {
    return animated ? `${(stats.difficulty[key] / maxDiff) * 100}%` : "0%";
  }

  return (
    <>
      <div className="card">
        <h2 className="card-title">✅ Problems Solved</h2>
        <div className="prob-grid">
          <div className="prob-box blue">
            <div className="prob-num">{stats.totalProblems}</div>
            <div className="prob-lbl">Total</div>
          </div>
          <div className="prob-box orange">
            <div className="prob-num">{stats.problemPlatform.leetcode}</div>
            <div className="prob-lbl">LeetCode</div>
          </div>
          <div className="prob-box green">
            <div className="prob-num">{stats.problemPlatform.geeksforgeeks}</div>
            <div className="prob-lbl">GFG</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">📊 Difficulty Distribution</h2>
        <div className="chart">
          <div className="y-axis">
            {[
              maxDiff,
              Math.ceil(maxDiff * 0.75),
              Math.ceil(maxDiff * 0.5),
              Math.ceil(maxDiff * 0.25),
              0
            ].map((v, i) => (
              <span key={i} className="y-label">
                {v}
              </span>
            ))}
          </div>

          <div className="chart-bars">
            {[
              ["Easy", "green"],
              ["Medium", "orange"],
              ["Hard", "red"]
            ].map(([key, color]) => (
              <div className="chart-col" key={key}>
                <div className="chart-bar-wrap">
                  <div
                    className={`chart-bar ${color}`}
                    style={{ height: diffPct(key) }}
                  />
                </div>
                <span className="chart-lbl">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
