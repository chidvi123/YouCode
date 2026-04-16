import React from "react";

export default function GoalTracker({
  target, setTarget, isEditing, saveTarget, deleteTarget, saveMessage, progress
}) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 className="card-title" style={{ margin: 0 }}>🎯 Daily Targets</h2>
        {!isEditing && (
          <button className="goal-edit-btn" onClick={deleteTarget}>
            Reset Target
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="goal-edit-form">
          <div className="goal-edit-inputs">
            <input
              type="number" min="0" max="23" placeholder="HH"
              value={target.time.h}
              onChange={(e) => setTarget({ ...target, time: { ...target.time, h: e.target.value } })}
              className="goal-input"
            />
            <span className="goal-edit-sep">:</span>
            <input
              type="number" min="0" max="59" placeholder="MM"
              value={target.time.m}
              onChange={(e) => setTarget({ ...target, time: { ...target.time, m: e.target.value } })}
              className="goal-input"
            />
            <span className="goal-edit-sep">:</span>
            <input
              type="number" min="0" max="59" placeholder="SS"
              value={target.time.s}
              onChange={(e) => setTarget({ ...target, time: { ...target.time, s: e.target.value } })}
              className="goal-input"
            />
            <input
              type="number" min="0" max="100" placeholder="Problems"
              value={target.problems || ""}
              onChange={(e) => setTarget({ ...target, problems: e.target.value })}
              className="goal-input wide"
              style={{ flex: 2 }}
            />
          </div>
          <button
            className="goal-save-btn"
            onClick={saveTarget}
            disabled={!target.time.h && !target.time.m && !target.time.s && !target.problems}
          >
            Save Target
          </button>
          {saveMessage && (
            <div style={{ color: "#4ade80", fontSize: "11px", textAlign: "center" }}>
              {saveMessage}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="goal-today-row">
            <span className="goal-today-label">Today</span>
            <div className="goal-today-right">
              <span className="goal-today-time">
                {target.time.h || 0}h {target.time.m || 0}m {target.time.s || 0}s
              </span>
              <span className="goal-prob-badge">
                {target.problems || 0} problems
              </span>
            </div>
          </div>

          {(target.time.h || target.time.m || target.time.s) && (
            <div className="goal-row">
              <div className="goal-row-top">
                <div className="goal-row-name">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Time goal
                </div>
                <span className="goal-row-pct green">{Math.round(progress.time)}%</span>
              </div>
              <div className="goal-bar">
                <div className="goal-bar-fill green" style={{ width: `${progress.time}%` }} />
              </div>
            </div>
          )}

          {target.problems && (
            <div className="goal-row">
              <div className="goal-row-top">
                <div className="goal-row-name">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  Problem goal
                </div>
                <span className="goal-row-pct amber">{Math.round(progress.problems)}%</span>
              </div>
              <div className="goal-bar">
                <div className="goal-bar-fill amber" style={{ width: `${progress.problems}%` }} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
