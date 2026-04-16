import React from "react";

export default function TopTopics({ stats }) {
  const topicList = Object.entries(stats.topics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="card">
      <h2 className="card-title">Top Topics Practiced</h2>
      {topicList.length === 0 ? (
        <p className="empty">No topics detected yet</p>
      ) : (
        topicList.map(([topic, count], i) => (
          <div className="topic-row" key={topic}>
            <span className="topic-num">{i + 1}</span>
            <span className="topic-name">{topic}</span>
            <span className="topic-count">
              {count} {count === 1 ? "problem" : "problems"}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
