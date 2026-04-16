import React from "react";

export default function RangeSelector({ range, setRange }) {
  return (
    <div className="range-selector">
      <button
        className={range === "day" ? "active" : ""}
        onClick={() => setRange("day")}
      >
        Day
      </button>
      <button
        className={range === "week" ? "active" : ""}
        onClick={() => setRange("week")}
      >
        Week
      </button>
      <button
        className={range === "month" ? "active" : ""}
        onClick={() => setRange("month")}
      >
        Month
      </button>
    </div>
  );
}
