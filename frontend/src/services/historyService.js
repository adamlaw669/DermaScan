// src/services/historyService.js

const HISTORY_KEY = 'dermaScanHistory';

// --- Base Functions ---
const getHistory = () => {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    if (history) {
      return JSON.parse(history);
    }
  } catch (error) {
    console.error("Could not parse history from localStorage", error);
  }
  // Return a default structure if no history is found or parsing fails
  return { scans: [], chats: {} };
};

const saveHistory = (history) => {
  try {
    const historyString = JSON.stringify(history);
    localStorage.setItem(HISTORY_KEY, historyString);
  } catch (error)
  {
    console.error("Could not save history to localStorage", error);
  }
};

// --- Helper to convert a file to a Base64 string for storage ---
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});


// --- Public API for History Service ---

export const addScanToHistory = async (scanResult, imageFiles) => {
  if (!scanResult || !imageFiles || imageFiles.length === 0) return;

  const history = getHistory();
  
  // Convert all image files to Base64 concurrently
  const imagePromises = imageFiles.map(file => toBase64(file));
  const imagesBase64 = await Promise.all(imagePromises);

  const newScan = {
    id: Date.now(),
    date: new Date().toISOString(),
    diagnosis: scanResult.label,
    confidence: scanResult.confidence,
    images: imagesBase64, // Store an array of images
  };

  history.scans.unshift(newScan);
  
  if (history.scans.length > 20) {
      history.scans.pop();
  }

  saveHistory(history);
};

export const addChatToHistory = (condition, chatLog) => {
  if (!condition || !chatLog || chatLog.length === 0) return;

  const history = getHistory();
  history.chats[condition] = {
    log: chatLog,
    lastUpdated: new Date().toISOString(),
  };

  saveHistory(history);
};

export const getChatHistory = (condition) => {
    const history = getHistory();
    return history.chats[condition]?.log || [];
};

export const getAllHistory = () => {
    return getHistory();
};
