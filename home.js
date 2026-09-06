/* ==========================================================
   DECO6500 Group 32 — Food Rescue Sorting Study
   Home page: starts every visit from a clean run, and shows
   the Phase B change log.
   ========================================================== */

// Reaching the home page always ends whatever run was in progress, so entering
// a phase from here starts a fresh one.
Session.clear();

// Each home-page visit requires acknowledgement before a phase can be opened —
// but the same participant moving from Phase A to Phase B (same browser tab)
// should not have to confirm all three again, so the confirmations are read
// back from ConsentState rather than always starting at false.
const acknowledgeBtn = document.getElementById("acknowledge-btn");
const participantInput = document.getElementById("participant-id");
const participantStatus = document.getElementById("participant-status");
const informationConfirmBtn = document.getElementById("information-confirm-btn");
const consentConfirmBtn = document.getElementById("consent-confirm-btn");
const studyNextSteps = document.getElementById("study-next-steps");
const consentState = ConsentState.load();
let acknowledged = consentState.acknowledged;
let informationConfirmed = consentState.information;
let consentConfirmed = consentState.consent;
participantInput.value = Participant.load();

// Phase A and Phase B are each a single attempt per participant (this
// browser tab). Once a phase has been run, its link is disabled here and
// the report can only be downloaded once both phases show as done.
const phaseCompletion = PhaseCompletion.load();

function saveConsentState() {
  ConsentState.save({
    information: informationConfirmed,
    consent: consentConfirmed,
    acknowledged: acknowledged
  });
}

function markInformationConfirmed() {
  informationConfirmBtn.setAttribute("aria-pressed", "true");
  informationConfirmBtn.textContent = "Completed — read and understood";
  informationConfirmBtn.disabled = true;
  informationConfirmBtn.closest(".study-document").classList.add("study-document--completed");
}

function markConsentConfirmed() {
  consentConfirmBtn.setAttribute("aria-pressed", "true");
  consentConfirmBtn.textContent = "Completed — Consent Form signed";
  consentConfirmBtn.disabled = true;
  consentConfirmBtn.closest(".study-document").classList.add("study-document--completed");
}

function markAcknowledged() {
  acknowledgeBtn.textContent = "Understanding confirmed";
  acknowledgeBtn.disabled = true;
}

function updatePhaseAccess() {
  const participantId = participantInput.value.trim();
  const saved = Participant.save(participantId);
  studyNextSteps.hidden = !(informationConfirmed && consentConfirmed);
  const enabled = acknowledged && informationConfirmed && consentConfirmed && !!participantId && saved;
  // The "required" participant ID gates the acknowledge button itself, not
  // just the phase links — no ID entered, no Understanding confirmed.
  acknowledgeBtn.disabled = acknowledged || !participantId;
  document.querySelectorAll("[data-phase-href]").forEach(function (link) {
    const phase = link.dataset.phase;
    const alreadyDone = phase && phaseCompletion[phase];
    const hint = link.querySelector(".phase-hint");
    if (enabled && !alreadyDone) {
      link.setAttribute("href", link.dataset.phaseHref);
      link.removeAttribute("aria-disabled");
      link.removeAttribute("tabindex");
    } else {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
    }
    if (hint) {
      if (alreadyDone) {
        hint.textContent = "Already completed — this phase can only be run once.";
        hint.classList.add("phase-hint--done");
      } else {
        hint.textContent = hint.dataset.defaultHint;
        hint.classList.remove("phase-hint--done");
      }
    }
  });
  participantStatus.textContent = !saved
    ? "Your ID could not be saved. Please ask the research staff for help before continuing."
    : participantId
      ? "Participant ID saved: " + participantId
      : "Please enter the participant ID provided by the research staff before choosing a phase.";
  document.getElementById("acknowledgement-status").textContent = enabled
    ? "Thank you. You can now choose Phase A or Phase B."
    : !informationConfirmed || !consentConfirmed
      ? "Please confirm that you have read the Participant Information Sheet and signed the Consent Form above."
      : !acknowledged && !participantId
        ? "Please enter the participant ID above before confirming your understanding."
        : !acknowledged
          ? "Please confirm your understanding of the research background and Task Instructions before choosing a phase."
        : "Understanding confirmed. Please enter and save your participant ID above to choose a phase.";

  // The report can only be downloaded once both phases have been run.
  const bothDone = !!(phaseCompletion.A && phaseCompletion.B);
  el.exportBtn.disabled = !bothDone;
  el.exportStatus.textContent = bothDone
    ? "Both phases complete. You can now download the report."
    : "Complete Phase A and Phase B to enable the download.";
}

informationConfirmBtn.addEventListener("click", function () {
  informationConfirmed = true;
  markInformationConfirmed();
  saveConsentState();
  updatePhaseAccess();
  if (!studyNextSteps.hidden) participantInput.focus();
});
consentConfirmBtn.addEventListener("click", function () {
  consentConfirmed = true;
  markConsentConfirmed();
  saveConsentState();
  updatePhaseAccess();
  if (!studyNextSteps.hidden) participantInput.focus();
});

participantInput.addEventListener("input", updatePhaseAccess);
acknowledgeBtn.addEventListener("click", function () {
  acknowledged = true;
  markAcknowledged();
  saveConsentState();
  updatePhaseAccess();
});

// Restore the on-screen "completed" state for anything already confirmed
// earlier in this browser tab (e.g. returning from Phase A to choose Phase B).
if (informationConfirmed) markInformationConfirmed();
if (consentConfirmed) markConsentConfirmed();
if (acknowledged) markAcknowledged();

const el = {
  logBtn: document.getElementById("log-btn"),
  logOverlay: document.getElementById("log-overlay"),
  logList: document.getElementById("log-list"),
  logClose: document.getElementById("log-close"),

  historyBtn: document.getElementById("history-btn"),
  historyOverlay: document.getElementById("history-overlay"),
  historyBody: document.getElementById("history-body"),
  historyClose: document.getElementById("history-close"),

  exportBtn: document.getElementById("export-btn"),
  exportStatus: document.getElementById("export-status"),

  resetBtn: document.getElementById("reset-btn"),
  resetOverlay: document.getElementById("reset-overlay"),
  resetWarning: document.getElementById("reset-warning"),
  resetConfirmInput: document.getElementById("reset-confirm-input"),
  resetConfirmBtn: document.getElementById("reset-confirm"),
  resetCancelBtn: document.getElementById("reset-cancel")
};

updatePhaseAccess();

/* ----------------------------------------------------------
   Test history
   ---------------------------------------------------------- */

const HISTORY_COLUMNS = [
  ["Participant ID", function (r) { return r.participantId || "—"; }],
  ["Phase", function (r) { return r.phase || "—"; }],
  ["Date", function (r) { return r.startedAt ? formatDateTime(r.startedAt).split(" ")[0] : "—"; }],
  ["Start time", function (r) { return formatClock(r.startedAt); }],
  ["End time", function (r) { return formatClock(r.endedAt); }],
  ["Total time (s)", function (r) { return r.totalSeconds != null ? String(r.totalSeconds) : "—"; }],
  ["Within 3 min", function (r) { return r.withinTimeLimit ? "Yes" : "No"; }],
  ["Cards completed", function (r) { return r.completedCards + " / " + r.totalCards; }],
  ["Not completed", function (r) { return listCards(r.notCompletedCards); }],
  ["Incorrect cards", function (r) { return listCards(r.incorrectCards); }],
  ["Cards changed / Selection history", formatCardChanges, "history-card-visits"]
];

function formatCardChanges(run) {
  const events = getCardChanges(run);
  if (!events.length) return "No selections recorded";
  const counts = {};
  events.forEach(function (entry) {
    counts[entry.cardNumber] = (counts[entry.cardNumber] || 0) + 1;
  });
  const summary = Object.keys(counts).map(function (number) {
    return "Card " + number + ": " + counts[number] + " action(s)";
  });
  const occurrence = {};
  const details = events.map(function (entry, index) {
    const number = entry.cardNumber;
    occurrence[number] = (occurrence[number] || 0) + 1;
    const type = entry.kind === "suggestion" ? "suggestion" : "decision";
    const from = entry.from == null ? "Not classified" : zoneName(entry.from);
    return (index + 1) + ". Card " + number + " (action " + occurrence[number] + ", " + type + "): " +
      from + " → " + zoneName(entry.to);
  });
  const changes = events.filter(function (entry) {
    return entry.from != null && entry.from !== entry.to;
  }).length;
  return [events.length + " action(s) total; " + changes + " changed answer(s)"].concat(summary, details).join("\n");
}

function formatCardVisits(run) {
  if (Array.isArray(run.cardVisits)) {
    return run.cardVisits.map(function (visit) {
      const repeat = visit.visitNumber > 1 ? " (" + visit.visitNumber + ")" : "";
      return "Card " + visit.cardNumber + repeat + ": " + visit.seconds.toFixed(1) + "s";
    }).join("\n") || "—";
  }
  const totals = run.cardTimesSeconds || {};
  const lines = Object.keys(totals).filter(function (number) {
    return totals[number] != null;
  }).map(function (number) {
    return "Card " + number + ": " + totals[number].toFixed(1) + "s";
  });
  return lines.length ? "Older record — totals only; visit order unavailable\n" + lines.join("\n") : "—";
}

HISTORY_COLUMNS.push(["Card visits (in order)", formatCardVisits, "history-card-visits"]);

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
      if (column[2]) td.className = column[2];
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
}

el.historyBtn.addEventListener("click", openHistory);
el.historyClose.addEventListener("click", closeHistory);

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
    meta.textContent =
      "Participant " + (entry.participantId || "—") + " · " +
      formatDateTime(entry.at) + " · " + entry.productId;

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
}

el.logBtn.addEventListener("click", openLog);
el.logClose.addEventListener("click", closeLog);

el.logOverlay.addEventListener("click", function (event) {
  if (event.target === el.logOverlay) closeLog();
});

document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") return;
  if (!el.logOverlay.hidden) closeLog();
  if (!el.historyOverlay.hidden) closeHistory();
});

/* ----------------------------------------------------------
   Export — Test History and Change Log as ONE CSV file (two
   tables, one after another, separated by a blank row), so the
   group can open a single file in Excel/Numbers/Google Sheets.
   The filename carries the current participant ID so files from
   different participants do not overwrite each other.
   ---------------------------------------------------------- */

function csvField(value) {
  const str = value == null ? "" : String(value);
  return /[",\r\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
}

function csvLine(row) {
  return row.map(csvField).join(",");
}

function sectionRows(title, headers, rows) {
  const result = [[title], headers];
  rows.forEach(function (row) { result.push(row); });
  result.push([]);
  return result;
}

function downloadCsv(filename, csvContent) {
  // Leading BOM keeps Excel reading the file as UTF-8 (participant-typed
  // feedback reasons may contain non-ASCII characters).
  const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function sanitizeFilenamePart(value) {
  const cleaned = (value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "unknown";
}

function timestampForFilename() {
  const d = new Date();
  const pad = function (n) { return String(n).padStart(2, "0"); };
  return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
}

el.exportBtn.addEventListener("click", function () {
  const runs = RunHistory.all().filter(function (r) { return r.startedAt; }).reverse();
  const historyHeaders = HISTORY_COLUMNS.map(function (column) { return column[0]; });
  const historyRows = runs.map(function (run) {
    return HISTORY_COLUMNS.map(function (column) { return column[1](run); });
  });

  const entries = ChangeLog.all().slice().reverse();
  const logHeaders = ["Participant ID", "Phase", "Scenario Card", "Product ID", "From", "To", "Reason", "Date/Time"];
  const logRows = entries.map(function (entry) {
    return [
      entry.participantId || "—",
      entry.phase,
      entry.cardNumber,
      entry.productId,
      zoneName(entry.from),
      zoneName(entry.to),
      entry.feedback,
      formatDateTime(entry.at)
    ];
  });

  const allRows = sectionRows("Test History", historyHeaders, historyRows)
    .concat(sectionRows("Change Log", logHeaders, logRows));
  const csvContent = allRows.map(csvLine).join("\r\n");

  const participantTag = sanitizeFilenamePart(Participant.load());
  const stamp = timestampForFilename();
  downloadCsv("study-report_" + participantTag + "_" + stamp + ".csv", csvContent);
  ReportExportState.markExported();
});

/* ----------------------------------------------------------
   Reset for Next Participant — clears everything this device
   holds (Test History, Change Log, Participant ID, the three
   confirmations, Phase A/B completion) so the next participant
   starts from a blank slate. Typing "RESET" is required so a
   stray click on this page cannot lose data by accident.
   ---------------------------------------------------------- */

function openResetOverlay() {
  el.resetConfirmInput.value = "";
  el.resetConfirmBtn.disabled = true;
  el.resetWarning.hidden = ReportExportState.wasExported();
  el.resetOverlay.hidden = false;
  el.resetConfirmInput.focus();
}

function closeResetOverlay() {
  el.resetOverlay.hidden = true;
}

el.resetBtn.addEventListener("click", openResetOverlay);
el.resetCancelBtn.addEventListener("click", closeResetOverlay);
el.resetOverlay.addEventListener("click", function (event) {
  if (event.target === el.resetOverlay) closeResetOverlay();
});

el.resetConfirmInput.addEventListener("input", function () {
  el.resetConfirmBtn.disabled = el.resetConfirmInput.value.trim() !== "RESET";
});

el.resetConfirmBtn.addEventListener("click", function () {
  if (el.resetConfirmInput.value.trim() !== "RESET") return;

  RunHistory.clear();
  ChangeLog.clear();
  ReportExportState.clear();
  ConsentState.clear();
  Participant.clear();
  PhaseCompletion.clear();

  // The whole page's on-screen state (confirmation buttons, phase links,
  // participant field) is derived from storage on load, so reloading is the
  // simplest way to reflect the now-blank state correctly everywhere.
  window.location.reload();
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !el.resetOverlay.hidden) closeResetOverlay();
});
