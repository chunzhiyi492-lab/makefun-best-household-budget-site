// NestEgg — seed data and state for the Miller family's November 2026 budget.
// All figures are demo data. The app computes every total live from this
// state; nothing on any page is a hard-coded total. State is kept in
// localStorage under KEY so edits survive a reload, and "Reset demo data"
// restores SEED exactly.

const STORE_KEY = "nestegg-v1";
// A fixed "today" inside the demo month, so overdue bills are stable.
const TODAY = new Date(2026, 10, 26);

const CATEGORIES = [
  { name: "Housing", budget: 1650, color: "#2F6F6A" },
  { name: "Groceries", budget: 720, color: "#4C9A52" },
  { name: "Dining Out", budget: 280, color: "#D97742" },
  { name: "Transport", budget: 340, color: "#4A7FA5" },
  { name: "Utilities", budget: 310, color: "#7A5FA0" },
  { name: "Entertainment", budget: 180, color: "#C65D7B" },
  { name: "Health", budget: 220, color: "#2E8B8B" },
  { name: "Shopping", budget: 260, color: "#B08954" },
  { name: "Kids & School", budget: 300, color: "#6A9E4F" },
  { name: "Subscriptions", budget: 95, color: "#8A8A8A" },
];

const SEED = {
  household: "The Miller Family",
  month: "November 2026",
  savingsPlanned: 1200,
  savingsMoved: 1200,
  categories: CATEGORIES,
  transactions: [
    { id: 1, date: "2026-11-01", desc: "Rent — Maple Court Apt 4B", cat: "Housing", amount: 1650, type: "expense" },
    { id: 2, date: "2026-11-02", desc: "Whole Foods Market", cat: "Groceries", amount: 142.30, type: "expense" },
    { id: 3, date: "2026-11-03", desc: "School lunch — Mia & Leo", cat: "Kids & School", amount: 85, type: "expense" },
    { id: 4, date: "2026-11-03", desc: "Pizza night — Tony's", cat: "Dining Out", amount: 38.50, type: "expense" },
    { id: 5, date: "2026-11-04", desc: "Shell — gas", cat: "Transport", amount: 48, type: "expense" },
    { id: 6, date: "2026-11-05", desc: "Trader Joe's", cat: "Groceries", amount: 96.45, type: "expense" },
    { id: 7, date: "2026-11-05", desc: "Kids' shoes — Foot Locker", cat: "Shopping", amount: 68, type: "expense" },
    { id: 8, date: "2026-11-06", desc: "Metro card top-up", cat: "Transport", amount: 34, type: "expense" },
    { id: 9, date: "2026-11-06", desc: "CVS Pharmacy", cat: "Health", amount: 38.50, type: "expense" },
    { id: 10, date: "2026-11-07", desc: "Sushi dinner — Kaito", cat: "Dining Out", amount: 64, type: "expense" },
    { id: 11, date: "2026-11-08", desc: "Movie tickets — Regal", cat: "Entertainment", amount: 42, type: "expense" },
    { id: 12, date: "2026-11-09", desc: "Costco", cat: "Groceries", amount: 188.20, type: "expense" },
    { id: 13, date: "2026-11-09", desc: "Soccer fees — Leo", cat: "Kids & School", amount: 120, type: "expense" },
    { id: 14, date: "2026-11-10", desc: "Corner coffee", cat: "Dining Out", amount: 18.75, type: "expense" },
    { id: 15, date: "2026-11-10", desc: "Dentist copay — Sam", cat: "Health", amount: 75, type: "expense" },
    { id: 16, date: "2026-11-11", desc: "Shell — gas", cat: "Transport", amount: 52, type: "expense" },
    { id: 17, date: "2026-11-12", desc: "Farmers market", cat: "Groceries", amount: 54, type: "expense" },
    { id: 18, date: "2026-11-12", desc: "Electric bill — City Power", cat: "Utilities", amount: 132, type: "expense" },
    { id: 19, date: "2026-11-12", desc: "Winter coats — Target", cat: "Shopping", amount: 142, type: "expense" },
    { id: 20, date: "2026-11-13", desc: "Toll — I-95", cat: "Transport", amount: 20, type: "expense" },
    { id: 21, date: "2026-11-13", desc: "Concert tickets — The Hall", cat: "Entertainment", amount: 85, type: "expense" },
    { id: 22, date: "2026-11-14", desc: "Thai takeout — Siam", cat: "Dining Out", amount: 42.30, type: "expense" },
    { id: 23, date: "2026-11-15", desc: "Internet — FiberNet", cat: "Utilities", amount: 79, type: "expense" },
    { id: 24, date: "2026-11-15", desc: "Streaming — Streamly", cat: "Subscriptions", amount: 16, type: "expense" },
    { id: 25, date: "2026-11-15", desc: "Music — TuneBox", cat: "Subscriptions", amount: 13, type: "expense" },
    { id: 26, date: "2026-11-15", desc: "Cloud storage — DriveUp", cat: "Subscriptions", amount: 9, type: "expense" },
    { id: 27, date: "2026-11-15", desc: "News — Daily Post", cat: "Subscriptions", amount: 12, type: "expense" },
    { id: 28, date: "2026-11-15", desc: "Downtown parking", cat: "Transport", amount: 22, type: "expense" },
    { id: 29, date: "2026-11-16", desc: "Whole Foods Market", cat: "Groceries", amount: 118.60, type: "expense" },
    { id: 30, date: "2026-11-16", desc: "Art supplies — Mia", cat: "Kids & School", amount: 60, type: "expense" },
    { id: 31, date: "2026-11-17", desc: "Brunch — The Corner Cafe", cat: "Dining Out", amount: 56.80, type: "expense" },
    { id: 32, date: "2026-11-17", desc: "Vitamins — HealthPlus", cat: "Health", amount: 31.50, type: "expense" },
    { id: 33, date: "2026-11-18", desc: "Shell — gas", cat: "Transport", amount: 46.50, type: "expense" },
    { id: 34, date: "2026-11-18", desc: "Water bill — City Water", cat: "Utilities", amount: 46, type: "expense" },
    { id: 35, date: "2026-11-18", desc: "Household items — Target", cat: "Shopping", amount: 54.50, type: "expense" },
    { id: 36, date: "2026-11-19", desc: "Gas bill — City Gas", cat: "Utilities", amount: 30, type: "expense" },
    { id: 37, date: "2026-11-19", desc: "Board game — GameStop", cat: "Entertainment", amount: 38, type: "expense" },
    { id: 38, date: "2026-11-20", desc: "Rideshare — Lyft", cat: "Transport", amount: 28.75, type: "expense" },
    { id: 39, date: "2026-11-21", desc: "Trader Joe's", cat: "Groceries", amount: 84.45, type: "expense" },
    { id: 40, date: "2026-11-21", desc: "Books — Bookshop", cat: "Shopping", amount: 23.50, type: "expense" },
    { id: 41, date: "2026-11-22", desc: "Burgers — Five Guys", cat: "Dining Out", amount: 47.25, type: "expense" },
    { id: 42, date: "2026-11-22", desc: "Gym — FitLife", cat: "Subscriptions", amount: 45, type: "expense" },
    { id: 43, date: "2026-11-23", desc: "Museum tickets", cat: "Entertainment", amount: 23, type: "expense" },
    { id: 44, date: "2026-11-24", desc: "Corner coffee", cat: "Dining Out", amount: 12.40, type: "expense" },
    { id: 45, date: "2026-11-24", desc: "Shell — gas", cat: "Transport", amount: 44.75, type: "expense" },
    { id: 46, date: "2026-11-24", desc: "Arcade — Fun Zone", cat: "Entertainment", amount: 16, type: "expense" },
    { id: 47, date: "2026-11-24", desc: "Socks & basics — Target", cat: "Shopping", amount: 30, type: "expense" },
    { id: 48, date: "2026-11-25", desc: "Taco truck", cat: "Dining Out", amount: 32, type: "expense" },
    { id: 101, date: "2026-11-01", desc: "Salary — Alex Miller", cat: "Income", amount: 5400, type: "income" },
    { id: 102, date: "2026-11-15", desc: "Part-time pay — Sam Miller", cat: "Income", amount: 1100, type: "income" },
    { id: 103, date: "2026-11-20", desc: "Freelance — Alex Miller", cat: "Income", amount: 350, type: "income" },
  ],
  goals: [
    { id: 1, name: "Emergency Fund", saved: 5200, target: 8000, note: "3 months of essentials" },
    { id: 2, name: "Family Vacation", saved: 1150, target: 2400, note: "Beach trip in July" },
    { id: 3, name: "New Car", saved: 3800, target: 12000, note: "Replace the 2014 sedan" },
    { id: 4, name: "Home Renovation", saved: 900, target: 5000, note: "Kitchen refresh" },
  ],
  // Bill amounts are set so the two header totals come out exactly:
  // paid $1,907 (Rent, Electric, Internet, Music), still to pay $2,083
  // across 6 open bills. The $30 gas bill is the overdue one the
  // dashboard calls out.
  bills: [
    { id: 1, name: "Rent", payee: "Maple Court", day: 1, amount: 1650, paid: true },
    { id: 2, name: "Electric", payee: "City Power", day: 12, amount: 132, paid: true },
    { id: 3, name: "Internet", payee: "FiberNet", day: 15, amount: 96, paid: true },
    { id: 4, name: "Gas", payee: "City Gas", day: 19, amount: 30, paid: false },
    { id: 5, name: "Water", payee: "City Water", day: 18, amount: 46, paid: false },
    { id: 6, name: "Phone", payee: "MobileCo", day: 20, amount: 62, paid: false },
    { id: 7, name: "Gym", payee: "FitLife", day: 22, amount: 45, paid: false },
    { id: 8, name: "Streaming", payee: "Streamly", day: 15, amount: 16, paid: false },
    { id: 9, name: "Music", payee: "TuneBox", day: 15, amount: 29, paid: true },
    { id: 10, name: "Insurance", payee: "SafeHome", day: 25, amount: 1884, paid: false },
  ],
  history: [
    { month: "Jun", income: 6400, spent: 4020 },
    { month: "Jul", income: 6550, spent: 4310 },
    { month: "Aug", income: 6700, spent: 4180 },
    { month: "Sep", income: 6620, spent: 4490 },
    { month: "Oct", income: 6800, spent: 4120 },
    { month: "Nov", income: 6850, spent: 4256 },
  ],
};

// ---- state ---------------------------------------------------------------

function freshState() {
  return JSON.parse(JSON.stringify(SEED));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.categories)) {
      return freshState();
    }
    return parsed;
  } catch (e) {
    return freshState();
  }
}

function saveState(state) {
  // localStorage can throw (private mode, disabled cookies, quota full).
  // A failed write must never kill the edit itself: keep the change in
  // memory, remember that persistence is down, and let the UI say so.
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    storageFailed = true;
  }
}

function resetState() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch (e) {
    storageFailed = true;
  }
  return freshState();
}

// True once a save has failed, so the page can warn that edits will not
// survive leaving the page. Starts false; loadState already tolerates a
// broken store on the read side.
let storageFailed = false;

function storageUnavailable() {
  return storageFailed;
}

// ---- money and sums ------------------------------------------------------

function money(n, cents) {
  const v = Number(n) || 0;
  return "$" + v.toLocaleString("en-US", {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
}

function incomeTotal(state) {
  return state.transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
}

function expenseTotal(state) {
  return state.transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
}

function budgetTotal(state) {
  return state.categories.reduce((s, c) => s + c.budget, 0);
}

function spentByCategory(state) {
  const out = {};
  for (const c of state.categories) out[c.name] = 0;
  for (const t of state.transactions) {
    if (t.type === "expense" && Object.prototype.hasOwnProperty.call(out, t.cat)) {
      out[t.cat] += t.amount;
    }
  }
  return out;
}

function categoryColor(state, name) {
  const found = state.categories.find((c) => c.name === name);
  return found ? found.color : "#8A8A8A";
}

function goalsSavedTotal(state) {
  return state.goals.reduce((s, g) => s + g.saved, 0);
}

function goalsTargetTotal(state) {
  return state.goals.reduce((s, g) => s + g.target, 0);
}

function billsOpen(state) {
  return state.bills.filter((b) => !b.paid);
}

function billsOpenTotal(state) {
  return billsOpen(state).reduce((s, b) => s + b.amount, 0);
}

function billsPaidTotal(state) {
  return state.bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
}

function isOverdue(bill) {
  return !bill.paid && bill.day < TODAY.getDate();
}

function shortDate(iso) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = iso.split("-");
  return months[Number(parts[1]) - 1] + " " + Number(parts[2]);
}

function sortedTransactions(state) {
  return state.transactions.slice().sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.id - a.id;
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
