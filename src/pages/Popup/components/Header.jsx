import React from "react";

export default function Header({ streak, dark, toggleTheme }) {
  return (
    <div className="header">
      <div className="header-left">
        <div>
          <h1 className="title">Coding Tracker</h1>
          <p className="subtitle">Track your daily coding productivity</p>
        </div>
      </div>
      <div className="header-right">
        <div className="streak">
          <span>🔥</span>
          <span className="streak-num">{streak}d</span>
        </div>
        <button className="theme-btn" onClick={toggleTheme}>
          {dark ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
}
