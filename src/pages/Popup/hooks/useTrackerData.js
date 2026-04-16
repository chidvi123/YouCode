import { useState, useEffect, useRef } from "react";

const EMPTY = {
  totalCodingTime: 0,
  platformTime: { leetcode: 0, geeksforgeeks: 0 },
  problemPlatform: { leetcode: 0, geeksforgeeks: 0 },
  totalProblems: 0,
  difficulty: { Easy: 0, Medium: 0, Hard: 0 },
  topics: {}
};

function getLocalDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeStreak(data) {
  const keys = Object.keys(data);
  const today = new Date();
  const todayKey = getLocalDateKey(today);

  let count = 0;
  let startOffset = 0;

  if (!keys.includes(todayKey)) {
    startOffset = 1;
  }

  for (let i = startOffset; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = getLocalDateKey(date);

    if (keys.includes(key)) {
      count++;
    } else {
      break;
    }
  }

  return count;
}

function buildGraphData(data, range) {
  const now = new Date();

  if (range === "day") {
    const hours = Array(24).fill(0);
    const todayKey = getLocalDateKey(now);
    const sessions = data[todayKey] || [];
    
    sessions.forEach((rec) => {
      if (rec.type === "platform") {
        const hour = new Date(rec.start).getHours();
        hours[hour] += rec.duration;
      }
    });

    return hours.map((v, i) => ({ hour: i, time: v }));
  }

  if (range === "week") {
    const days = Array(7).fill(0);
    Object.entries(data).forEach(([dateKey, sessions]) => {
      const d = new Date(dateKey);
      const diff = (now - d) / (1000 * 60 * 60 * 24);

      if (diff <= 7) {
        const day = d.getDay();
        sessions.forEach((rec) => {
          if (rec.type === "platform") {
             days[day] += rec.duration;
          }
        });
      }
    });

    return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, i) => ({
      day: d,
      time: days[i]
    }));
  }

  if (range === "month") {
    const result = [];
    Object.entries(data).forEach(([dateKey, sessions]) => {
      const d = new Date(dateKey);
      const diff = (now - d) / (1000 * 60 * 60 * 24);

      if (diff <= 30) {
        let total = 0;
        sessions.forEach((rec) => {
          if (rec.type === "platform") {
            total += rec.duration;
          }
        });
        result.push({ date: dateKey, time: total });
      }
    });

    return result.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
}

export function useTrackerData() {
  const [stats, setStats] = useState(EMPTY);
  const [range, setRange] = useState("day");
  const [streak, setStreak] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [dark, setDark] = useState(true);
  const [animated, setAnimated] = useState(false);
  
  const [target, setTarget] = useState({ time: { h: "", m: "", s: "" }, problems: "" });
  const [progress, setProgress] = useState({ time: 0, problems: 0 });
  const [isEditing, setIsEditing] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");

  const hasAnimated = useRef(false);

  function loadDataFromStorage() {
    chrome.storage.local.get(null, (data) => {
      const currentStreak = computeStreak(data);
      setStreak(currentStreak);
      setGraphData(buildGraphData(data, range));

      const now = new Date();
      const sessions = [];

      Object.keys(data).forEach((dateKey) => {
        const date = new Date(dateKey);
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);

        if (range === "day") {
          const todayKey = getLocalDateKey(now);
          if (dateKey === todayKey) sessions.push(...data[dateKey]);
        } else if (range === "week") {
          if (diffDays <= 7) sessions.push(...data[dateKey]);
        } else if (range === "month") {
          if (diffDays <= 30) sessions.push(...data[dateKey]);
        }
      });

      const s = structuredClone(EMPTY);

      sessions.forEach((record) => {
        if (record.type === "platform") {
          s.totalCodingTime += record.duration;
          if (record.platform === "leetcode") s.platformTime.leetcode += record.duration;
          if (record.platform === "geeksforgeeks") s.platformTime.geeksforgeeks += record.duration;
        }

        if (record.type === "problem" && record.solved) {
          s.totalProblems++;
          if (record.platform === "leetcode") s.problemPlatform.leetcode++;
          if (record.platform === "geeksforgeeks") s.problemPlatform.geeksforgeeks++;

          const diff = record.problem?.difficulty;
          if (diff in s.difficulty) s.difficulty[diff]++;

          (record.problem?.topics || []).forEach((t) => {
            s.topics[t] = (s.topics[t] || 0) + 1;
          });
        }
      });

      setStats(s);
    });
  }

  function saveTarget() {
    chrome.storage.local.get("targets", (res) => {
      const existing = res.targets || {};
      const h = Number(target.time.h || 0);
      const m = Number(target.time.m || 0);
      const s = Number(target.time.s || 0);
      const totalSeconds = h * 3600 + m * 60 + s;

      const updated = {
        ...existing,
        [range]: {
          time: totalSeconds || null,
          problems: target.problems ? Number(target.problems) : null
        }
      };

      chrome.storage.local.set({ targets: updated });
      setSaveMessage("✅ Target saved!");
      setTimeout(() => setSaveMessage(""), 2000);
      setIsEditing(false);
      loadDataFromStorage();
    });
  }

  function deleteTarget() {
    chrome.storage.local.get("targets", (res) => {
      const existing = res.targets || {};
      delete existing[range];
      chrome.storage.local.set({ targets: existing });

      setTarget({ time: { h: "", m: "", s: "" }, problems: "" });
      setIsEditing(true);
      loadDataFromStorage();
    });
  }

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    chrome.storage.local.set({ theme: next ? "dark" : "light" });
  }

  useEffect(() => {
    chrome.storage.local.get("theme", (res) => {
      if (res.theme === "light") setDark(false);
    });
  }, []);

  useEffect(() => {
    loadDataFromStorage();

    if (!hasAnimated.current) {
      hasAnimated.current = true;
      setTimeout(() => setAnimated(true), 100);
    }

    chrome.storage.local.get("targets", (res) => {
      if (res.targets && res.targets[range]) {
        const t = res.targets[range].time || 0;
        setTarget({
          time: {  
            h: Math.floor(t / 3600), 
            m: Math.floor((t % 3600) / 60), 
            s: t % 60 
          },
          problems: res.targets[range].problems || ""
        });
        setIsEditing(false);
      } else {
        setTarget({ time:{h:"",m:"",s:""}, problems:"" });
        setIsEditing(true);
      }
    });
  }, [range]);

  useEffect(() => {
    chrome.storage.local.get("targets", (res) => {
      const current = res.targets?.[range];
      if (!current) return;

      let timeProgress = 0;
      let problemProgress = 0;

      if (current.time) timeProgress = Math.min((stats.totalCodingTime / current.time) * 100, 100);
      if (current.problems) problemProgress = Math.min((stats.totalProblems / current.problems) * 100, 100);

      setProgress({ time: timeProgress, problems: problemProgress });
    });
  }, [stats, range]);

  useEffect(() => {
    function handleUpdate(message) {
      if (message.type === "DATA_UPDATED") {
        loadDataFromStorage();
      }
    }
    chrome.runtime.onMessage.addListener(handleUpdate);
    return () => chrome.runtime.onMessage.removeListener(handleUpdate);
  }, [range]);

  return {
    stats, target, setTarget, saveTarget, deleteTarget, isEditing, setIsEditing, saveMessage,
    progress, streak, graphData, range, setRange, dark, toggleTheme, animated
  };
}
