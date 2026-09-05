/* ==========================================================
   DECO6500 Group 32 — Food Rescue Sorting Study
   Home page: starts every visit from a clean run, and shows
   the Phase B change log.
   ========================================================== */

// Reaching the home page always ends whatever run was in progress, so entering
// a phase from here starts a fresh one.
Session.clear();

const el = {
  logBtn: document.getElementById("log-btn"),
  logOverlay: document.getElementById("log-overlay"),
  logList: document.getElementById("log-list"),
  logClose: document.getElementById("log-close"),
  logClear: document.getElementById("log-clear"),

  historyBtn: document.getElementById("history-btn"),
  historyOverlay: document.getElementById("history-overlay"),
  historyBody: document.getElementById("history-body"),
  historyClose: document.getElementById("history-close"),
  historyClear: document.getElementById("history-clear")
};

/* ----------------------------------------------------------
   Test history
   ---------------------------------------------------------- */

const HISTORY_COLUMNS = [
  ["Phase", function (r) { return r.phase || "—"; }],
  ["Date", function (r) { return r.startedAt ? formatDateTime(r.startedAt).split(" ")[0] : "—"; }],
  ["Start time", function (r) { return formatClock(r.startedAt); }],
  ["End time", function (r) { return formatClock(r.endedAt); }],
  ["Total time (s)", function (r) { return r.totalSeconds != null ? String(r.totalSeconds) : "—"; }],
  ["Within 3 min", function (r) { return r.withinTimeLimit ? "Yes" : "No"; }],
  ["Cards completed", function (r) { return r.completedCards + " / " + r.totalCards; }],
  ["Not completed", function (r) { return listCards(r.notCompletedCards); }],
  ["Incorrect cards", function (r) { return listCards(r.incorrectCards); }],
  ["Cards changed", function (r) { return r.phase === "B" ? listCards(r.changedCards) : "—"; }]
];

function renderHistory() {
  // Runs saved before these columns existed have no start time; they are left out
  // rather than shown as a row of dashes.
  const runs = RunHistory.all().filter(function (r) { return r.startedAt; }).reverse();
  el.historyBody.innerHTML = "";

  if (!runs.length) {
    const empty = document.createElement("p");
    empty.className = "log-empty";
    empty.textContent = "No completed tests recorded yet.";
    el.historyBody.appendChild(empty);
    return;
  }

  const table = document.createElement("table");
  table.className = "history-table";

  const head = document.createElement("tr");
  HISTORY_COLUMNS.forEach(function (column) {
    const th = document.createElement("th");
    th.textContent = column[0];
    head.appendChild(th);
  });
  table.appendChild(head);

  runs.forEach(function (run) {
    const row = document.createElement("tr");
    if (run.outcome === "timeout") row.className = "history-row--timeout";
    HISTORY_COLUMNS.forEach(function (column) {
      const td = document.createElement("td");
      td.textContent = column[1](run);
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  el.historyBody.appendChild(table);
}

function openHistory() {
  renderHistory();
  el.historyOverlay.hidden = false;
}

function closeHistory() {
  el.historyOverlay.hidden = true;
  el.historyClear.textContent = "Clear history";
}

el.historyBtn.addEventListener("click", openHistory);
el.historyClose.addEventListener("click", closeHistory);

// Two clicks to wipe the history, so a stray click cannot lose the data.
el.historyClear.addEventListener("click", function () {
  if (el.historyClear.textContent !== "Clear history") {
    RunHistory.clear();
    el.historyClear.textContent = "Clear history";
    renderHistory();
    return;
  }
  el.historyClear.textContent = "Click again to confirm";
});

el.historyOverlay.addEventListener("click", function (event) {
  if (event.target === el.historyOverlay) closeHistory();
});

function renderLog() {
  const entries = ChangeLog.all().slice().reverse();   // newest first
  el.logList.innerHTML = "";

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "log-empty";
    empty.textContent = "No changes recorded yet.";
    el.logList.appendChild(empty);
    return;
  }

  entries.forEach(function (entry) {
    const item = document.createElement("div");
    item.className = "log-item";

    const head = document.createElement("div");
    head.className = "log-item-head";
    head.textContent =
      "Phase " + entry.phase + " · Scenario Card " + entry.cardNumber +
      " · " + zoneName(entry.from) + " → " + zoneName(entry.to);

    const meta = document.createElement("div");
    meta.className = "log-item-meta";
    meta.textContent = formatDateTime(entry.at) + " · " + entry.productId;

    const reason = document.createElement("p");
    reason.className = "log-item-reason";
    reason.textContent = entry.feedback;

    item.appendChild(head);
    item.appendChild(meta);
    item.appendChild(reason);
    el.logList.appendChild(item);
  });
}

function openLog() {
  renderLog();
  el.logOverlay.hidden = false;
}

function closeLog() {
  el.logOverlay.hidden = true;
  el.logClear.textContent = "Clear log";
}

el.logBtn.addEventListener("click", openLog);
el.logClose.addEventListener("click", closeLog);

// Two clicks to wipe the log, so a stray click cannot lose the record.
el.logClear.addEventListener("click", function () {
  if (el.logClear.textContent !== "Clear log") {
    ChangeLog.clear();
    el.logClear.textContent = "Clear log";
    renderLog();
    return;
  }
  el.logClear.textContent = "Click again to confirm";
});

el.logOverlay.addEventListener("click", function (event) {
  if (event.target === el.logOverlay) closeLog();
});

document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") return;
  if (!el.logOverlay.hidden) closeLog();
  if (!el.historyOverlay.hidden) closeHistory();
});
