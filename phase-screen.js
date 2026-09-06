/* ==========================================================
   DECO6500 Group 32 — Food Rescue Sorting Study
   The test screen used by both phases: the timer, the two
   sorting zones and the tray of cards.

   Which phase it is running comes from <body data-phase="A">,
   which also decides the photo set. The sorting itself happens
   on product.html, so the run is kept in sessionStorage
   (see shared.js).
   ========================================================== */

const PHASE = document.body.dataset.phase;
const PRODUCTS = getProducts(PHASE);

// Each phase can only be run once per participant. A completed phase sends
// the participant straight back home instead of letting them start again
// (including a direct visit to this URL, not just the home page link).
if (PhaseCompletion.load()[PHASE]) {
  window.location.replace("index.html");
}

const el = {
  timer: document.getElementById("timer"),
  startBtn: document.getElementById("start-btn"),
  endBtn: document.getElementById("end-btn"),
  status: document.getElementById("status"),
  tray: document.getElementById("tray"),
  zoneStore: document.getElementById("zone-store"),
  zoneDiscard: document.getElementById("zone-discard"),
  storeCount: document.getElementById("store-count"),
  discardCount: document.getElementById("discard-count"),

  overtimeBanner: document.getElementById("overtime-banner"),

  resultOverlay: document.getElementById("result-overlay"),
  resultSummary: document.getElementById("result-summary"),
  resultHome: document.getElementById("result-home"),
  resultCountdown: document.getElementById("result-countdown"),

  confirmOverlay: document.getElementById("confirm-overlay"),
  confirmText: document.getElementById("confirm-text"),
  confirmYes: document.getElementById("confirm-yes"),
  confirmNo: document.getElementById("confirm-no")
};

// The run in progress. Reloaded from storage on every visit, because the
// participant comes back here after each product screen. A run belonging to the
// other phase is discarded.
let state = Session.load();
if (!state || state.phase !== PHASE) {
  state = Session.blank(PHASE);
  Session.save(state);
}

// Settle a visit if a previous page could not deliver its pagehide event.
CardTiming.stop(state);
Session.save(state);
window.addEventListener("pageshow", function (event) {
  if (event.persisted) window.location.reload();
});

let finished = false;   // this visit has already settled the run
let tickId = null;

/* ----------------------------------------------------------
   1. Rendering
   ---------------------------------------------------------- */

function buildCard(product) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "card";
  btn.dataset.productId = product.id;
  btn.title = product.name;
  btn.setAttribute("aria-label", product.name);
  btn.disabled = !Session.isRunning(state) || finished;

  const img = document.createElement("img");
  img.src = product.image;
  img.alt = product.name;
  // If a photo file is missing, name the card instead of showing a broken icon.
  img.addEventListener("error", function () {
    btn.innerHTML = "";
    const miss = document.createElement("span");
    miss.className = "card-placeholder";
    miss.textContent = "photo missing: " + product.id;
    btn.appendChild(miss);
  });
  btn.appendChild(img);

  btn.addEventListener("click", function () {
    window.location.href =
      "product.html?phase=" + PHASE + "&id=" + encodeURIComponent(product.id);
  });

  return btn;
}

function render() {
  el.tray.innerHTML = "";
  el.zoneStore.innerHTML = "";
  el.zoneDiscard.innerHTML = "";

  PRODUCTS.forEach(function (product) {
    const slot = document.createElement("div");
    const decision = state.decisions[product.id];

    if (decision) {
      // The tray keeps an empty hole where the card used to be.
      slot.className = "slot slot--empty";
      const zone = decision === "store" ? el.zoneStore : el.zoneDiscard;
      zone.appendChild(buildCard(product));
    } else {
      slot.className = "slot";
      slot.appendChild(buildCard(product));
    }

    el.tray.appendChild(slot);
  });

  const counts = countDecisions();
  el.storeCount.textContent = "(" + counts.store + ")";
  el.discardCount.textContent = "(" + counts.discard + ")";
  updateStatus();
}

function countDecisions() {
  let store = 0;
  let discard = 0;
  Object.keys(state.decisions).forEach(function (id) {
    if (state.decisions[id] === "store") store++;
    else discard++;
  });
  return { store: store, discard: discard, sorted: store + discard };
}

function updateStatus() {
  if (finished) return;
  if (!Session.available()) {
    el.status.textContent =
      "This page needs to run through a local server (VS Code Live Server) so decisions can be kept between screens.";
    return;
  }
  if (!state.startedAt) {
    el.status.innerHTML = "Press <strong>Start</strong> to begin the task.";
    return;
  }
  const left = PRODUCTS.length - countDecisions().sorted;
  el.status.textContent = left === 0
    ? "All cards sorted. Click a card to change it, or press End the Timing."
    : left + " of " + PRODUCTS.length + " cards left. Click a card to open it.";
}

/* ----------------------------------------------------------
   2. Timer
   ---------------------------------------------------------- */

function paintTimer() {
  const running = Session.isRunning(state);
  const overtime = state.startedAt ? Session.overtimeSeconds(state) : 0;

  if (overtime > 0) {
    el.timer.textContent = "+" + formatTime(overtime);
  } else {
    const remaining = state.startedAt ? Session.remaining(state) : TIMER_SECONDS;
    el.timer.textContent = formatTime(remaining);
  }
  el.timer.classList.toggle("timer--running", running && overtime === 0 && Session.remaining(state) > 30);
  el.timer.classList.toggle("timer--warning", running && overtime === 0 && Session.remaining(state) <= 30 && !!state.startedAt);
  el.timer.classList.toggle("timer--overtime", overtime > 0);

  // The 3-minute limit no longer stops the task — it only shows this
  // non-blocking notice so the participant knows to wrap up.
  el.overtimeBanner.hidden = !(running && overtime > 0);
}

function startTask() {
  if (state.startedAt) return;
  state.startedAt = Date.now();
  state.endsAt = state.startedAt + TIMER_SECONDS * 1000;
  Session.save(state);

  el.startBtn.disabled = true;
  el.startBtn.textContent = "Running";
  el.endBtn.disabled = false;

  paintTimer();
  render();
}

function startTicking() {
  stopTicking();
  tickId = setInterval(paintTimer, 250);
}

function stopTicking() {
  if (tickId !== null) {
    clearInterval(tickId);
    tickId = null;
  }
}

/* ----------------------------------------------------------
   3. Finishing
   ---------------------------------------------------------- */

function openOverlay(overlay) { overlay.hidden = false; }
function closeOverlay(overlay) { overlay.hidden = true; }

function requestEnd() {
  if (!Session.isRunning(state) || finished) return;
  const left = PRODUCTS.length - countDecisions().sorted;
  if (left > 0) {
    el.confirmText.textContent =
      left + " card" + (left === 1 ? " has" : "s have") + " not been sorted yet. Finish anyway?";
    openOverlay(el.confirmOverlay);
    return;
  }
  finishTask();
}

function finishTask() {
  if (finished) return;
  finished = true;
  stopTicking();
  closeOverlay(el.confirmOverlay);
  el.endBtn.disabled = true;
  el.startBtn.disabled = true;
  el.status.textContent = "Task finished.";

  const result = saveRunResult(state, "completed");
  Session.clear();
  render();
  showResult(result);
}

// The rows of the end-of-run summary, shown after End the Timing and after the
// countdown runs out.
function renderSummary(container, result) {
  const rows = [
    ["Start time", formatClock(result.startedAt)],
    ["End time", formatClock(result.endedAt)],
    ["Total time (s)", String(result.totalSeconds)],
    ["Finished within 3 minutes", result.withinTimeLimit ? "Yes" : "No"],
    ["Cards completed", result.completedCards + " / " + result.totalCards],
    ["Cards not completed", listCards(result.notCompletedCards)],
    ["Incorrect cards", listCards(result.incorrectCards)]
  ];
  rows.push(["Cards changed", listCards(result.changedCards)]);
  rows.push(["Number of changes", String(result.changeCount)]);
  rows.push(["Recorded actions", String(result.actionCount)]);

  container.innerHTML = "";
  rows.forEach(function (row) {
    const line = document.createElement("div");
    const label = document.createElement("span");
    const value = document.createElement("span");
    label.textContent = row[0];
    value.textContent = row[1];
    line.appendChild(label);
    line.appendChild(value);
    container.appendChild(line);
  });
}

function showResult(result) {
  renderSummary(el.resultSummary, result);
  openOverlay(el.resultOverlay);

  let left = RETURN_DELAY_SECONDS;
  el.resultCountdown.textContent = "Returning to the home page in " + left + "s";
  const countdown = setInterval(function () {
    left--;
    if (left <= 0) {
      clearInterval(countdown);
      goHome();
      return;
    }
    el.resultCountdown.textContent = "Returning to the home page in " + left + "s";
  }, 1000);
}

function goHome() {
  Session.clear();
  window.location.href = "index.html";
}

/* ----------------------------------------------------------
   4. Wiring
   ---------------------------------------------------------- */

el.startBtn.addEventListener("click", startTask);
el.endBtn.addEventListener("click", requestEnd);

el.confirmYes.addEventListener("click", finishTask);
el.confirmNo.addEventListener("click", function () { closeOverlay(el.confirmOverlay); });

el.resultHome.addEventListener("click", goHome);

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !el.confirmOverlay.hidden) closeOverlay(el.confirmOverlay);
});

/* ----------------------------------------------------------
   5. Start-up — a visit either resumes a run in progress, ends
      one whose countdown expired, or waits on the Start button.
   ---------------------------------------------------------- */

paintTimer();
render();

if (Session.isRunning(state)) {
  el.startBtn.disabled = true;
  el.startBtn.textContent = "Running";
  el.endBtn.disabled = false;
}
startTicking();
