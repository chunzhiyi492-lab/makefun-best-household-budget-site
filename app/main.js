// NestEgg — hash router, page renderers and every control. All figures are
// computed live from `state` (data.js); every change saves to localStorage
// and re-renders, so the page always shows the current numbers.

let state = loadState();
let txFilter = "All";
let txQuery = "";

const TITLES = {
  "": "Dashboard",
  transactions: "Transactions",
  budget: "Budget",
  goals: "Savings Goals",
  bills: "Bills",
  reports: "Reports",
};

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  return Object.prototype.hasOwnProperty.call(TITLES, hash) ? hash : "";
}

function save() {
  saveState(state);
}

function rerender() {
  const route = currentRoute();
  document.getElementById("page-title").textContent = TITLES[route];
  document.querySelectorAll("#nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === route);
  });
  const view = document.getElementById("view");
  if (route === "transactions") view.innerHTML = pageTransactions();
  else if (route === "budget") view.innerHTML = pageBudget();
  else if (route === "goals") view.innerHTML = pageGoals();
  else if (route === "bills") view.innerHTML = pageBills();
  else if (route === "reports") view.innerHTML = pageReports();
  else view.innerHTML = pageDashboard();
  if (storageUnavailable()) {
    view.insertAdjacentHTML("afterbegin",
      '<p class="storage-warning" role="alert">Browser storage is unavailable, ' +
      'so your changes work on this page but will not be saved after you leave. ' +
      'Allow cookies / site data for this page, or free up browser storage, then reload.</p>');
  }
  afterRender(route);
}

function afterRender(route) {
  if (route === "") drawDashboardCharts();
  if (route === "reports") drawReportChart();
  const txForm = document.getElementById("tx-form");
  if (txForm) txForm.addEventListener("submit", onAddTransaction);
  const goalForm = document.getElementById("goal-form");
  if (goalForm) goalForm.addEventListener("submit", onAddGoal);
  const filter = document.getElementById("tx-filter");
  if (filter) {
    filter.value = txFilter;
    filter.addEventListener("change", () => { txFilter = filter.value; renderTxTable(); });
  }
  const search = document.getElementById("tx-search");
  if (search) {
    search.value = txQuery;
    search.addEventListener("input", () => { txQuery = search.value; renderTxTable(); });
  }
  const reset = document.getElementById("reset-link");
  if (reset) reset.addEventListener("click", (e) => { e.preventDefault(); state = resetState(); save(); rerender(); });
}

// ---- shared bits ---------------------------------------------------------

function statCard(label, value, sub, dark) {
  return '<div class="stat' + (dark ? " dark" : "") + '">' +
    '<div class="stat-label">' + label + '</div>' +
    '<div class="stat-value">' + value + '</div>' +
    '<div class="stat-sub">' + sub + '</div></div>';
}

function barHtml(spent, budget) {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const over = spent > budget;
  return '<div class="bar"><i class="' + (over ? "over" : "") + '" style="width:' + pct + '%"></i></div>';
}

function pill(cat) {
  const color = cat === "Income" ? "#176B52" : categoryColor(state, cat);
  return '<span class="pill" style="background:' + color + '">' + escapeHtml(cat) + '</span>';
}

// ---- Dashboard -----------------------------------------------------------

function pageDashboard() {
  const income = incomeTotal(state);
  const spent = expenseTotal(state);
  const savedPct = income > 0 ? Math.round(((income - spent) / income) * 100) : 0;
  const left = income - spent - state.savingsMoved;
  const byCat = spentByCategory(state);
  const top5 = state.categories
    .slice()
    .sort((a, b) => byCat[b.name] - byCat[a.name])
    .slice(0, 5);
  const recent = sortedTransactions(state).slice(0, 5);
  const upcoming = billsOpen(state).slice().sort((a, b) => a.day - b.day).slice(0, 4);

  let html = '<div class="stats">' +
    statCard("Income · Nov", money(income), "3 paycheques &amp; freelance", false) +
    statCard("Spent · Nov", money(spent), savedPct + "% saved of income", false) +
    statCard("Moved to savings", money(state.savingsMoved), "of " + money(state.savingsPlanned) + " planned", false) +
    statCard("Left to budget", money(left), "unallocated this month", true) +
    "</div>";

  html += '<div class="grid-2">' +
    '<div class="card"><h2>Where the money went</h2>' +
    '<p class="hint">Spending by category in November.</p>' +
    '<div class="donut-wrap"><canvas id="donut" class="chart" width="260" height="260"></canvas>' +
    '<ul class="legend" id="donut-legend"></ul></div>' +
    '<p style="margin:12px 0 0"><a href="#/budget">See budget &rarr;</a></p></div>' +

    '<div class="card"><h2>Budget vs actual</h2>' +
    '<p class="hint">The five biggest categories this month.</p>';
  for (const c of top5) {
    const s = byCat[c.name];
    const diff = c.budget - s;
    const note = diff >= 0
      ? money(s) + " spent &middot; " + money(diff) + " left"
      : "Over by " + money(-diff);
    html += '<div class="rowline"><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;gap:8px">' +
      '<span><span class="dot" style="background:' + c.color + '"></span>' + escapeHtml(c.name) + '</span>' +
      '<span class="' + (diff < 0 ? "red" : "muted") + '">' + note + '</span></div>' +
      '<div style="margin-top:6px">' + barHtml(s, c.budget) + '</div></div></div>';
  }
  html += "</div></div>";

  html += '<div class="grid-2" style="margin-top:18px">' +
    '<div class="card"><h2>Recent transactions</h2>';
  for (const t of recent) {
    html += '<div class="rowline"><div><div>' + escapeHtml(t.desc) + '</div>' +
      '<div class="muted" style="font-size:13px">' + shortDate(t.date) + ' &middot; ' + escapeHtml(t.cat) + '</div></div>' +
      '<span class="' + (t.type === "income" ? "pos" : "neg") + '">' +
      (t.type === "income" ? "+" : "&minus;") + money(t.amount, true) + '</span></div>';
  }
  html += '<p style="margin:12px 0 0"><a href="#/transactions">All transactions &rarr;</a></p></div>' +

    '<div class="card"><h2>Upcoming bills</h2>';
  for (const b of upcoming) {
    html += '<div class="rowline"><div><div>' + escapeHtml(b.name) + ' — ' + escapeHtml(b.payee) + '</div>' +
      '<div class="muted" style="font-size:13px">due Nov ' + b.day + ' &middot; ' + money(b.amount, true) +
      (isOverdue(b) ? '<span class="tag-overdue">overdue</span>' : '') + '</div></div>' +
      '<span>' + money(b.amount, true) + '</span></div>';
  }
  html += '<p style="margin:12px 0 0"><a href="#/bills">All bills &rarr;</a></p></div></div>';

  return html;
}

function drawDashboardCharts() {
  const canvas = document.getElementById("donut");
  const legend = document.getElementById("donut-legend");
  if (!canvas || !legend) return;
  const byCat = spentByCategory(state);
  const slices = state.categories
    .map((c) => ({ name: c.name, value: byCat[c.name], color: c.color }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
  drawDonut(canvas, slices, money(expenseTotal(state)), "spent in Nov");
  legend.innerHTML = slices.map((s) =>
    '<li><span class="dot" style="background:' + s.color + '"></span>' + escapeHtml(s.name) +
    '<span class="amt">' + money(s.value) + '</span></li>'
  ).join("");
}

// ---- Transactions --------------------------------------------------------

function pageTransactions() {
  const cats = state.categories.map((c) => c.name);
  let html = '<div class="card"><h2>Add a transaction</h2>' +
    '<form id="tx-form"><div class="form-grid">' +
    '<label>Date<input type="date" name="date" value="2026-11-26" required></label>' +
    '<label>Description<input type="text" name="desc" placeholder="e.g. Whole Foods Market" required></label>' +
    '<label>Type<select name="type"><option value="expense">Expense</option><option value="income">Income</option></select></label>' +
    '<label>Category<select name="cat">' + cats.map((c) => '<option>' + c + '</option>').join("") + '<option>Income</option></select></label>' +
    '<label>Amount ($)<input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>' +
    '<button class="btn" type="submit">Add</button>' +
    '</div></form></div>';

  html += '<div class="card"><h2 id="tx-count">All transactions &middot; ' + state.transactions.length + '</h2>' +
    '<div class="toolbar">' +
    '<select id="tx-filter" aria-label="Filter by category"><option>All</option>' +
    cats.map((c) => '<option>' + c + '</option>').join("") + '<option>Income</option></select>' +
    '<input type="search" id="tx-search" placeholder="Search descriptions&hellip;" aria-label="Search descriptions">' +
    '</div><div id="tx-table">' + txTableHtml() + '</div></div>';
  return html;
}

function filteredTransactions() {
  return sortedTransactions(state).filter((t) => {
    if (txFilter !== "All" && t.cat !== txFilter) return false;
    if (txQuery && t.desc.toLowerCase().indexOf(txQuery.toLowerCase()) === -1) return false;
    return true;
  });
}

function txTableHtml() {
  const rows = filteredTransactions();
  let html = '<table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead><tbody>';
  for (const t of rows) {
    html += '<tr><td>' + shortDate(t.date) + '</td><td>' + escapeHtml(t.desc) + '</td><td>' + pill(t.cat) + '</td>' +
      '<td class="num"><span class="' + (t.type === "income" ? "pos" : "neg") + '">' +
      (t.type === "income" ? "+" : "&minus;") + money(t.amount, true) + '</span></td>' +
      '<td class="num"><button class="btn small danger" data-del="' + t.id + '" aria-label="Delete ' + escapeHtml(t.desc) + '">&times;</button></td></tr>';
  }
  html += '</tbody></table>';
  if (!rows.length) html += '<p class="muted">No transactions match.</p>';
  return html;
}

function renderTxTable() {
  const table = document.getElementById("tx-table");
  const count = document.getElementById("tx-count");
  if (table) table.innerHTML = txTableHtml();
  if (count) count.textContent = "All transactions · " + filteredTransactions().length;
}

function onAddTransaction(e) {
  e.preventDefault();
  const f = e.target;
  const desc = f.elements.desc.value.trim();
  const amount = Number(f.elements.amount.value);
  if (!desc || !(amount > 0)) return;
  const type = f.elements.type.value;
  const nextId = state.transactions.reduce((m, t) => Math.max(m, t.id), 0) + 1;
  state.transactions.push({
    id: nextId,
    date: f.elements.date.value || "2026-11-26",
    desc: desc,
    cat: type === "income" ? "Income" : f.elements.cat.value,
    amount: Math.round(amount * 100) / 100,
    type: type,
  });
  save();
  txFilter = "All";
  txQuery = "";
  rerender();
}

// ---- Budget --------------------------------------------------------------

function pageBudget() {
  const spent = expenseTotal(state);
  const budgeted = budgetTotal(state);
  const byCat = spentByCategory(state);
  let html = '<div class="card"><h2>November budget</h2>' +
    '<p class="hint">Budgeted ' + money(budgeted) + ' &middot; Spent ' + money(spent) +
    ' &middot; ' + money(budgeted - spent) + ' left overall</p>';
  for (const c of state.categories) {
    const s = byCat[c.name];
    const diff = c.budget - s;
    const note = diff >= 0
      ? money(s) + " spent &middot; " + money(diff) + " left"
      : money(s) + " spent &middot; over by " + money(-diff);
    html += '<div class="rowline"><div style="min-width:150px"><span class="dot" style="background:' + c.color + '"></span>' +
      escapeHtml(c.name) + '</div>' +
      '<div style="flex:1;min-width:120px">' + barHtml(s, c.budget) + '</div>' +
      '<div style="min-width:190px;text-align:right" class="' + (diff < 0 ? "red" : "") + '">' + note + '</div>' +
      '<label style="font-size:13px;color:#6E6252">$ <input type="number" min="0" step="1" value="' + c.budget +
      '" data-budget="' + escapeHtml(c.name) + '" aria-label="' + escapeHtml(c.name) + ' budget"></label></div>';
  }
  html += '<p style="margin:14px 0 0"><a href="#" id="reset-link">Reset demo data</a></p></div>';
  return html;
}

// ---- Savings goals -------------------------------------------------------

function pageGoals() {
  const saved = goalsSavedTotal(state);
  const target = goalsTargetTotal(state);
  const pct = target > 0 ? Math.round((saved / target) * 100) : 0;
  let html = '<div class="card"><h2>Savings goals — ' + money(saved) + ' saved of ' + money(target) +
    ' (' + pct + '%)</h2><p class="hint">Every dollar moved here is a dollar the family set aside on purpose.</p></div>';
  html += '<div class="goal-grid">';
  for (const g of state.goals) {
    const gpct = g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0;
    html += '<div class="goal-card"><h3>' + escapeHtml(g.name) + '</h3>' +
      '<p class="muted" style="margin:0">' + escapeHtml(g.note) + '</p>' +
      '<div class="goal-amt">' + money(g.saved) + ' <span>of ' + money(g.target) + ' (' + gpct + '%)</span></div>' +
      barHtml(g.saved, g.target) +
      '<div class="goal-add">' +
      '<button class="btn small" data-add-funds="' + g.id + '" data-amount="50">+ $50</button>' +
      '<button class="btn small" data-add-funds="' + g.id + '" data-amount="100">+ $100</button>' +
      '<input type="number" min="1" step="1" placeholder="$" data-custom-amount="' + g.id + '" aria-label="Custom amount for ' + escapeHtml(g.name) + '">' +
      '<button class="btn small ghost" data-add-custom="' + g.id + '">Add</button>' +
      '</div></div>';
  }
  html += '</div>';
  html += '<div class="card" style="margin-top:18px"><h2>Start a new goal</h2>' +
    '<form id="goal-form"><div class="form-grid">' +
    '<label>Goal name<input type="text" name="name" placeholder="e.g. New bikes" required></label>' +
    '<label>Target ($)<input type="number" name="target" min="1" step="1" required></label>' +
    '<label>Already saved ($)<input type="number" name="saved" min="0" step="1" value="0"></label>' +
    '<button class="btn" type="submit">Add goal</button>' +
    '</div></form></div>';
  return html;
}

function onAddGoal(e) {
  e.preventDefault();
  const f = e.target;
  const name = f.elements.name.value.trim();
  const target = Number(f.elements.target.value);
  const saved = Number(f.elements.saved.value) || 0;
  if (!name || !(target > 0)) return;
  const nextId = state.goals.reduce((m, g) => Math.max(m, g.id), 0) + 1;
  state.goals.push({ id: nextId, name: name, saved: saved, target: target, note: "Added by the family" });
  save();
  rerender();
}

// ---- Bills ---------------------------------------------------------------

function pageBills() {
  const open = billsOpen(state);
  const openTotal = billsOpenTotal(state);
  const paidTotal = billsPaidTotal(state);
  let html = '<div class="stats">' +
    statCard("Still to pay", money(openTotal), open.length + " bills open", false) +
    statCard("Paid this month", money(paidTotal), (state.bills.length - open.length) + " bills paid", false) +
    '</div>';
  html += '<div class="card"><h2>Recurring bills</h2><p class="hint">Tap a bill to mark it paid — the totals above move with it.</p>';
  const sorted = state.bills.slice().sort((a, b) => a.day - b.day);
  for (const b of sorted) {
    html += '<div class="bill-row"><div class="bill-name">' + escapeHtml(b.name) + '</div>' +
      '<div class="bill-meta">' + escapeHtml(b.payee) + ' &middot; due Nov ' + b.day +
      (isOverdue(b) ? '<span class="tag-overdue">overdue</span>' : '') +
      (b.paid ? ' <span class="tag-paid">paid</span>' : '') + '</div>' +
      '<div class="bill-amt">' + money(b.amount, true) + '</div>' +
      '<button class="btn small ' + (b.paid ? "ghost" : "") + '" data-toggle-bill="' + b.id + '">' +
      (b.paid ? "Mark unpaid" : "Mark paid") + '</button></div>';
  }
  html += '</div>';
  return html;
}

// ---- Reports -------------------------------------------------------------

function pageReports() {
  const months = state.history;
  const withSaved = months.map((m) => ({ month: m.month, income: m.income, spent: m.spent, saved: m.income - m.spent }));
  const best = withSaved.reduce((a, b) => (b.saved > a.saved ? b : a));
  const worst = withSaved.reduce((a, b) => (b.saved < a.saved ? b : a));
  let html = '<div class="card"><h2>Income vs spending — Jun to Nov</h2>' +
    '<p class="hint">Best month: ' + best.month + ' — ' + money(best.saved) + ' saved. ' +
    'Toughest: ' + worst.month + ' — ' + money(worst.saved) + ' saved.</p>' +
    '<canvas id="bars" class="chart" width="640" height="300"></canvas></div>';
  html += '<div class="card"><h2>Month by month</h2><table>' +
    '<thead><tr><th>Month</th><th class="num">Income</th><th class="num">Spent</th><th class="num">Saved</th></tr></thead><tbody>';
  for (const m of withSaved) {
    html += '<tr><td>' + m.month + '</td><td class="num">' + money(m.income) + '</td>' +
      '<td class="num">' + money(m.spent) + '</td><td class="num"><span class="pos">' + money(m.saved) + '</span></td></tr>';
  }
  html += '</tbody></table></div>';
  return html;
}

function drawReportChart() {
  const canvas = document.getElementById("bars");
  if (!canvas) return;
  drawBars(canvas, state.history);
}

// ---- global clicks --------------------------------------------------------

document.getElementById("view").addEventListener("click", (e) => {
  const del = e.target.closest("[data-del]");
  if (del) {
    state.transactions = state.transactions.filter((t) => t.id !== Number(del.dataset.del));
    save();
    rerender();
    return;
  }
  const addFunds = e.target.closest("[data-add-funds]");
  if (addFunds) {
    const goal = state.goals.find((g) => g.id === Number(addFunds.dataset.addFunds));
    if (goal) {
      goal.saved += Number(addFunds.dataset.amount);
      save();
      rerender();
    }
    return;
  }
  const addCustom = e.target.closest("[data-add-custom]");
  if (addCustom) {
    const goal = state.goals.find((g) => g.id === Number(addCustom.dataset.addCustom));
    const input = document.querySelector('[data-custom-amount="' + addCustom.dataset.addCustom + '"]');
    const amount = input ? Number(input.value) : 0;
    if (goal && amount > 0) {
      goal.saved += amount;
      save();
      rerender();
    }
    return;
  }
  const toggle = e.target.closest("[data-toggle-bill]");
  if (toggle) {
    const bill = state.bills.find((b) => b.id === Number(toggle.dataset.toggleBill));
    if (bill) {
      bill.paid = !bill.paid;
      save();
      rerender();
    }
    return;
  }
});

document.getElementById("view").addEventListener("change", (e) => {
  const input = e.target.closest("[data-budget]");
  if (!input) return;
  const cat = state.categories.find((c) => c.name === input.dataset.budget);
  const value = Number(input.value);
  if (cat && value >= 0) {
    cat.budget = Math.round(value);
    save();
    rerender();
  }
});

window.addEventListener("hashchange", rerender);
rerender();
