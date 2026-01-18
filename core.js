/* =========================================================
   CORE.JS – TRADING JOURNAL ÇEKİRDEK MOTOR
   ========================================================= */

/* ===== GLOBAL STATE ===== */
const Core = {
  settings: {
    priceInterval: 15000, // varsayılan 15 sn
    soundEnabled: true,
    dataSource: "tradingview" // altyapı hazır
  },

  prices: {},       // anlık fiyatlar
  trades: [],       // açık işlemler
  listeners: [],    // UI güncelleyiciler
  timer: null
};

/* ===== UTIL ===== */
function now() {
  return Date.now();
}

/* ===== PRICE PROVIDER (15 dk gecikmeli altyapı) ===== */
async function fetchPrice(symbol) {
  try {
    // DEMO / TradingView benzeri gecikmeli yapı
    const res = await fetch(
      `https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
    );
    const data = await res.json();
    return data.quoteResponse.result[0]?.regularMarketPrice || null;
  } catch (e) {
    return null;
  }
}

/* ===== PRICE WATCHER ===== */
async function updatePrices() {
  for (let trade of Core.trades) {
    const price = await fetchPrice(trade.symbol);
    if (price) {
      Core.prices[trade.symbol] = price;
      evaluateTrade(trade, price);
    }
  }
  notifyUI();
}

/* ===== START / STOP WATCHER ===== */
function startWatcher() {
  stopWatcher();
  updatePrices();
  Core.timer = setInterval(updatePrices, Core.settings.priceInterval);
}

function stopWatcher() {
  if (Core.timer) clearInterval(Core.timer);
}

/* ===== TRADE EVALUATION ===== */
function evaluateTrade(trade, price) {
  trade.lastPrice = price;
  trade.pnl =
    trade.direction === "LONG"
      ? ((price - trade.entry) / trade.entry) * 100
      : ((trade.entry - price) / trade.entry) * 100;

  trade.distanceToStop = Math.abs(
    ((price - trade.stop) / trade.entry) * 100
  );

  if (
    (trade.direction === "LONG" && price <= trade.stop) ||
    (trade.direction === "SHORT" && price >= trade.stop)
  ) {
    trade.status = "STOP";
    if (trade.autoClose) trade.closed = true;
    playSound("stop");
  } else if (
    (trade.direction === "LONG" && price >= trade.target) ||
    (trade.direction === "SHORT" && price <= trade.target)
  ) {
    trade.status = "TARGET";
    if (trade.autoClose) trade.closed = true;
    playSound("target");
  } else if (trade.distanceToStop < 0.3) {
    trade.status = "RISK";
    playSound("warning");
  } else {
    trade.status = "ACTIVE";
  }
}

/* ===== SOUND ===== */
function playSound(type) {
  if (!Core.settings.soundEnabled) return;

  const sounds = {
    stop: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-alarm-tone-996.mp3"),
    target: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3"),
    warning: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-interface-hint-notification-911.mp3")
  };

  sounds[type]?.play().catch(() => {});
}

/* ===== TRADE MANAGEMENT ===== */
function addTrade(trade) {
  Core.trades.push({
    ...trade,
    createdAt: now(),
    status: "ACTIVE",
    lastPrice: null,
    pnl: 0
  });
}

function getTrades() {
  return Core.trades.filter(t => !t.closed);
}

/* ===== UI HOOK ===== */
function subscribe(fn) {
  Core.listeners.push(fn);
}

function notifyUI() {
  Core.listeners.forEach(fn => fn(Core));
}

/* ===== SETTINGS ===== */
function setIntervalSeconds(sec) {
  Core.settings.priceInterval = sec * 1000;
  startWatcher();
}

/* ===== AUTO START ===== */
startWatcher();

/* ===== EXPORT (GLOBAL) ===== */
window.Core = {
  addTrade,
  getTrades,
  subscribe,
  setIntervalSeconds,
  state: Core
};