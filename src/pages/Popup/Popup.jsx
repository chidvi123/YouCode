import React from "react";
import "./Popup.css";

import { useTrackerData } from "./hooks/useTrackerData";
import Header from "./components/Header";
import RangeSelector from "./components/RangeSelector";
import CodingTimeCard from "./components/CodingTimeCard";
import GoalTracker from "./components/GoalTracker";
import ProblemsSolvedCard from "./components/ProblemsSolvedCard";
import ActivityTrend from "./components/ActivityTrend";
import TopTopics from "./components/TopTopics";

export default function Popup() {
  const {
    stats, target, setTarget, saveTarget, deleteTarget, isEditing, saveMessage,
    progress, streak, graphData, range, setRange, dark, toggleTheme, animated
  } = useTrackerData();

  const dateStr =
    range === "day"
      ? new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
      : range === "week"
      ? "Last 7 Days"
      : "Last 30 Days";

  return (
    <div className={`popup ${dark ? "dark" : "light"}`}>
      <Header streak={streak} dark={dark} toggleTheme={toggleTheme} />
      <p className="date">{dateStr}</p>
      
      <RangeSelector range={range} setRange={setRange} />
      
      <CodingTimeCard stats={stats} range={range} animated={animated} />
      
      <GoalTracker
        target={target} setTarget={setTarget} isEditing={isEditing}
        saveTarget={saveTarget} deleteTarget={deleteTarget}
        saveMessage={saveMessage} progress={progress}
      />
      
      <ProblemsSolvedCard stats={stats} animated={animated} />
      
      <ActivityTrend graphData={graphData} range={range} dark={dark} />
      
      <TopTopics stats={stats} />

      <button
        className="analytics-btn"
        onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL("analytics.html") })}
      >
        📊 View Full Analytics
      </button>
    </div>
  );
}