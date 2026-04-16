const DEBUG = false;

if (DEBUG) console.log("🔥 Background script loaded");

// Idle detection (15 minutes)
chrome.idle.setDetectionInterval(900);

let isTracking = false;
let startTime = null;
let currentTabId = null;
let currentPlatform = null;

let currentProblem = null;
let problemStartTime = null;


// 🔽 RESTORE STATE
chrome.storage.local.get("trackingState", (res) => {
  const state = res?.trackingState;

  if (state && state.isTracking) {
    if (DEBUG) console.log("♻️ Restoring tracking state");

    isTracking = state.isTracking;
    startTime = state.startTime;
    currentPlatform = state.currentPlatform;
    currentTabId = state.currentTabId;
  }
});


// 🔹 Get today's date key (local timezone, not UTC)
function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function notifyDataUpdated() {
  chrome.runtime.sendMessage(
    { type: "DATA_UPDATED" },
    () => chrome.runtime.lastError
  );
}


// 🔽 ALARM — Chrome MV3 minimum is 30 seconds
chrome.alarms.create("trackProgress", {
  periodInMinutes: 0.5
});


// 🔹 Detect platform
function getPlatform(url) {
  if (!url) return null;

  if (url.includes("leetcode.com")) return "leetcode";
  if (url.includes("geeksforgeeks.org")) return "geeksforgeeks";

  return null;
}


// 🔹 Save problem time
async function saveProblemTime() {

  if (!currentProblem || !problemStartTime) return;

  const problemTime = Math.floor((Date.now() - problemStartTime) / 1000);

  if (problemTime < 10) {
    if (DEBUG) console.log("Ignored short problem visit");

    currentProblem = null;
    problemStartTime = null;
    return;
  }

  if (DEBUG) console.log("🧩 Problem session ended:", problemTime);

  const todayKey = getTodayKey();

  const result = await chrome.storage.local.get(todayKey);
  const sessions = result[todayKey] || [];

  sessions.push({
    type: "problem",
    platform: currentPlatform,
    problem: currentProblem,
    timeSpent: problemTime,
    solved: currentProblem?.solved || false,
    timestamp: Date.now(),
    start: problemStartTime,
    end: Date.now()
  });

  await chrome.storage.local.set({ [todayKey]: sessions });

  notifyDataUpdated();

  currentProblem = null;
  problemStartTime = null;
}


// 🔹 Start tracking
function startTracking(tabId, platform) {

  if (isTracking && currentTabId === tabId && currentPlatform === platform) {
    return;
  }

  isTracking = true;
  currentTabId = tabId;
  currentPlatform = platform;
  startTime = Date.now();

  chrome.storage.local.set({
    trackingState: {
      isTracking: true,
      startTime,
      currentPlatform,
      currentTabId
    }
  });

  if (DEBUG) console.log("🟢 Tracking started on", platform);
}


// 🔹 Stop tracking
async function stopTracking() {

  if (!isTracking) return;

  const endTime = Date.now();
  const duration = Math.floor((endTime - startTime) / 1000);

  if (duration < 5) {
    if (DEBUG) console.log("Ignored short session");

    isTracking = false;
    startTime = null;
    currentTabId = null;
    currentPlatform = null;

    chrome.storage.local.remove("trackingState");
    return;
  }

  if (DEBUG) console.log("🔴 Tracking stopped 🔴");

  await saveProblemTime();

  const todayKey = getTodayKey();

  const result = await chrome.storage.local.get(todayKey);
  const sessions = result[todayKey] || [];

  sessions.push({
    type: "platform",
    platform: currentPlatform,
    start: startTime,
    end: endTime,
    duration: duration
  });

  await chrome.storage.local.set({ [todayKey]: sessions });

  notifyDataUpdated();

  isTracking = false;
  startTime = null;
  currentTabId = null;
  currentPlatform = null;

  chrome.storage.local.remove("trackingState");
}


// 🔹 Handle tab change (with try/catch for closed tabs)
async function handleTabChange(tabId) {

  let tab;
  try {
    tab = await chrome.tabs.get(tabId);
  } catch {
    // Tab was closed or doesn't exist
    await stopTracking();
    return;
  }

  if (!tab || tab.url?.startsWith("chrome://")) {
    await stopTracking();
    return;
  }

  const platform = getPlatform(tab.url);

  if (platform) {

    if (!isTracking) {
      startTracking(tabId, platform);
    }

    else if (currentTabId !== tabId || currentPlatform !== platform) {
      await stopTracking();
      startTracking(tabId, platform);
    }

  } else {
    await stopTracking();
  }
}


// 🔹 Tab switch
chrome.tabs.onActivated.addListener((activeInfo) => {
  handleTabChange(activeInfo.tabId);
});


// 🔹 URL change
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    handleTabChange(tabId);
  }
});


// 🔹 Idle
chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === "idle" || state === "locked") {
    await stopTracking();
    await chrome.storage.local.remove("trackingState");
  }
});


// 🔹 Content script messages (proper async handling with return true)
async function handleMessage(message) {
  if (message.type === "PROBLEM_DETECTED") {

    if (currentProblem && problemStartTime) {
      await saveProblemTime();
    }

    currentProblem = {
      ...message.data,
      solved: false
    };

    problemStartTime = Date.now();
  }

  if (message.type === "PROBLEM_SOLVED") {

    if (currentProblem && problemStartTime) {
      currentProblem.solved = true;
    }

    await saveProblemTime();
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PROBLEM_DETECTED" || message.type === "PROBLEM_SOLVED") {
    handleMessage(message).then(() => {
      sendResponse({ ok: true });
    });
    return true; // keeps message channel open for async
  }
});


// 🔹 STARTUP
setTimeout(async () => {

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (tab?.id) {
      handleTabChange(tab.id);
    }
  } catch {
    // No active tab — ignore
  }

}, 300);


// 🔹 STARTUP CLEANUP — prune sessions older than 180 days
chrome.runtime.onStartup.addListener(async () => {
  try {
    const data = await chrome.storage.local.get(null);
    const now = new Date();
    const cutoff = 180; // days

    const keysToRemove = [];

    Object.keys(data).forEach((key) => {
      // Only process date-formatted keys (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
        const keyDate = new Date(key);
        const ageInDays = (now - keyDate) / (1000 * 60 * 60 * 24);

        if (ageInDays > cutoff) {
          keysToRemove.push(key);
        }
      }
    });

    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
      if (DEBUG) console.log(`🧹 Cleaned up ${keysToRemove.length} old sessions`);
    }
  } catch (err) {
    if (DEBUG) console.error("Cleanup error:", err);
  }
});


// 🔥 ALARM HANDLER
chrome.alarms.onAlarm.addListener(async (alarm) => {

  if (alarm.name !== "trackProgress") return;

  const res = await chrome.storage.local.get("trackingState");
  const state = res?.trackingState;

  if (!state || !state.isTracking) return;

  // restore first
  isTracking = true;
  startTime = state.startTime;
  currentPlatform = state.currentPlatform;
  currentTabId = state.currentTabId;

  let activeTab;
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
    activeTab = tab;
  } catch {
    await stopTracking();
    return;
  }

  if (!activeTab) return;

  if (activeTab.id !== currentTabId) {
    await stopTracking();
    return;
  }

  const platform = getPlatform(activeTab.url);
  if (!platform || platform !== currentPlatform) {
    await stopTracking();
    return;
  }
  const now = Date.now();

  // 🔥 Safety: stop zombie sessions after 4 hours
  const sessionAge = now - state.startTime;

  if (sessionAge > 4 * 60 * 60 * 1000) {
    await stopTracking();
    return;
  }

  let duration = Math.floor((now - startTime) / 1000);

  // Cap to slightly above alarm interval (30s) to prevent jumps
  duration = Math.min(duration, 35);

  if (duration < 2) return;

  const todayKey = getTodayKey();

  const result = await chrome.storage.local.get(todayKey);
  const sessions = result[todayKey] || [];

  sessions.push({
    type: "platform",
    platform: currentPlatform,
    start: startTime,
    end: now,
    duration: duration,
  });

  await chrome.storage.local.set({ [todayKey]: sessions });

  if (DEBUG) console.log("⏱️ Auto progress saved");

  startTime = now;

  // 🔥 UPDATE STORAGE STATE
  chrome.storage.local.set({
    trackingState: {
      isTracking: true,
      startTime,
      currentPlatform,
      currentTabId
    }
  });

  notifyDataUpdated();
});