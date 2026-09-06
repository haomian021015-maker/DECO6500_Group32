/* ==========================================================
   DECO6500 Group 32 — Food Rescue Sorting Study
   Data and session state shared by the home page, both phase
   screens and the individual product screens.
   ========================================================== */

/* ----------------------------------------------------------
   1. SETTINGS
   ---------------------------------------------------------- */

// Length of the countdown, in seconds. 180 = 3 minutes.
const TIMER_SECONDS = 180;

// How long the result dialog stays up before returning home, in seconds.
const RETURN_DELAY_SECONDS = 6;

// The default reference date printed on scenario cards, so participants can read
// the printed best-before / use-by dates against a fixed "today".
const TODAY_DATE = "05/09/2026";

// The Phase B app card shows product details. This is a simulation, not a real
// stock system, so every card carries the same placeholder values.
// const CARD_INFO = {
//   productName: "Milk",
//   shelfCategory: "1-2-C",
//   labelDate: "05/09/2026"
// };
const PHASE_B_CARDS = {
  1: { productName: "Cheese",           shelfCategory: "1-3-D", labelDate: "29/10/2026" },
  2: { productName: "Salad",            shelfCategory: "2-5-W", labelDate: "08/09/2026" },
  3: { productName: "Kipling",          shelfCategory: "4-2-V", labelDate: "28/09/2026" },
  4: { productName: "Protein Smoothie", shelfCategory: "4-5-G", labelDate: "22/12/2026" },
  5: { productName: "Fruit",            shelfCategory: "2-2-R", labelDate: "11/09/2026" },
  6: { productName: "Fast food",        shelfCategory: "2-2-G", labelDate: "20/09/2026" },
  7: { productName: "Bread",            shelfCategory: "1-2-C", labelDate: "05/09/2026" },
  8: { productName: "Primo",            shelfCategory: "1-2-C", labelDate: "29/09/2026" }
};

// Where the photo folders live. The tree came straight from the group's shared
// drive, so its original folder and file names are kept untouched.
const PHOTO_ROOT = "images/DECO6500_food_picture/";

/* ----------------------------------------------------------
   2. PRODUCTS
   ---------------------------------------------------------- */

// One product card.
//   id        — the original folder name, so the photos, the cards and any
//               later correctness check all line up.
//   labelType — "best before" or "use by", taken from the id.
//   damaged   — true for the two spoiled-food items.
//   folder    — URL-safe folder name, which is also the file-name stem inside
//               it (a space is written as %20 in a path), e.g.
//               phase1-usedby-2/phase1-usedby-2-main.png plus the four close-ups
//               phase1-usedby-2-1 … -4.
function makeProduct(group, id, labelType, damaged, folder, ext) {
  const base = PHOTO_ROOT + group + "/" + folder + "/" + folder + "-";
  return {
    id: id,
    labelType: labelType,
    damaged: damaged,
    image: base + "main" + ext,
    details: [1, 2, 3, 4].map(function (n) { return base + n + ext; })
  };
}

// Phase A — the phase1 photo set.
const PRODUCTS_A = [
  makeProduct("phase1-8group", "phase1-best before-1",      "best before", false, "phase1-best%20before-1", ".png"),
  makeProduct("phase1-8group", "phase1-usedby-2",           "use by",      false, "phase1-usedby-2", ".png"),
  makeProduct("phase1-8group", "phase1-best before-3",      "best before", false, "phase1-best%20before-3", ".png"),
  makeProduct("phase1-8group", "phase1-usedby-4",           "use by",      false, "phase1-usedby-4", ".png"),
  makeProduct("phase1-8group", "phase1-best before-5",      "best before", false, "phase1-best%20before-5", ".png"),
  makeProduct("phase1-8group", "phase1-usedby-6",           "use by",      false, "phase1-usedby-6", ".jpg"),
  makeProduct("phase1-8group", "phase1-bestbefore-damaged", "best before", true,  "phase1-bestbefore-damaged", ".png"),
  makeProduct("phase1-8group", "phase1-usedby-damaged",     "use by",      true,  "phase1-usedby-damaged", ".png")
];

// Phase B — the phase2 photo set.
const PRODUCTS_B = [
  makeProduct("phase2-8group", "phase2-best before-1",      "best before", false, "phase2-best%20before-1", ".png"),
  makeProduct("phase2-8group", "phase2-usedby-2",           "use by",      false, "phase2-usedby-2", ".png"),
  makeProduct("phase2-8group", "phase2-best before-3",      "best before", false, "phase2-best%20before-3", ".png"),
  makeProduct("phase2-8group", "phase2-usedby-4",           "use by",      false, "phase2-usedby-4", ".png"),
  makeProduct("phase2-8group", "phase2-best before-5",      "best before", false, "phase2-best%20before-5", ".png"),
  makeProduct("phase2-8group", "phase2-usedby-6",           "use by",      false, "phase2-usedby-6", ".png"),
  makeProduct("phase2-8group", "phase2-bestbefore-damaged", "best before", true,  "phase2-bestbefore-damaged", ".png"),
  makeProduct("phase2-8group", "phase2-usedby-damaged",     "use by",      true,  "phase2-usedby-damaged", ".png")
];

const PRODUCTS_BY_PHASE = { A: PRODUCTS_A, B: PRODUCTS_B };

// Cards are shown to the participant as neutral "Scenario Card n" — the id stays
// in the data only, so nothing on screen hints at the right answer.
Object.keys(PRODUCTS_BY_PHASE).forEach(function (phase) {
  PRODUCTS_BY_PHASE[phase].forEach(function (product, index) {
    product.phase = phase;
    product.cardNumber = index + 1;
    // The id ends up in the URL (product.html?phase=...&id=...), so it must
    // not hint at the answer the way the original folder name does (e.g.
    // "phase1-best before-1" gives away the label type before the card is
    // even opened). The actual photo path (product.image / product.details,
    // built from the folder name above) is untouched — only this id changes.
    product.id = phase + "-" + product.cardNumber;
    product.todayDate = TODAY_DATE;
    if (phase === "A" && product.cardNumber === 1) product.todayDate = "18/10/2026";
    if (phase === "A" && product.cardNumber === 2) product.todayDate = "10/9/2026";
    if (phase === "A" && product.cardNumber === 3) product.todayDate = "07/09/2026";
    if (phase === "A" && product.cardNumber === 4) product.todayDate = "20/12/2026";
    if (phase === "A" && product.cardNumber === 5) product.todayDate = "14/09/2026";
    if (phase === "A" && product.cardNumber === 6) product.todayDate = "08/09/2026";
    if (phase === "A" && product.cardNumber === 7) product.todayDate = "12/09/2026";
    if (phase === "A" && product.cardNumber === 8) product.todayDate = "06/08/2026";
    if (phase === "B") {
      const cardInfo = PHASE_B_CARDS[product.cardNumber];
      product.productName = cardInfo.productName;
      product.shelfCategory = cardInfo.shelfCategory;
      product.labelDate = cardInfo.labelDate;
      product.todayDate = cardInfo.labelDate;
    }
    product.name = "Scenario Card " + product.cardNumber;
  });
});

function getProducts(phase) {
  return PRODUCTS_BY_PHASE[phase] || [];
}

function getProduct(phase, id) {
  return getProducts(phase).filter(function (p) { return p.id === id; })[0] || null;
}

// The screen a phase runs on.
function phasePage(phase) {
  return phase === "B" ? "phase-b.html" : "phase-a.html";
}

// Researcher-confirmed answers for Phase A, indexed by Scenario Card number.
const PHASE_A_ANSWERS = {
  1: "store",
  2: "discard",
  3: "store",
  4: "discard",
  5: "store",
  6: "discard",
  7: "discard",
  8: "discard"
};

const PHASE_B_ANSWERS = {
  1: "store",
  2: "discard",
  3: "store",
  4: "discard",
  5: "store",
  6: "discard",
  7: "discard",
  8: "discard"
};

// What the Phase B app suggests to the participant. Kept separate from
// PHASE_B_ANSWERS (the grading answer key) so the two can be made to differ —
// e.g. a deliberately wrong suggestion, to see whether participants catch it.
// Defaults to matching the answer key.
const PHASE_B_SUGGESTIONS = {
  1: "store",
  2: "discard",
  3: "store",
  4: "discard",
  5: "store",
  6: "discard",
  7: "store",
  8: "discard"
};

function correctChoice(product) {
  if (product.phase === "A") return PHASE_A_ANSWERS[product.cardNumber];
  return PHASE_B_ANSWERS[product.cardNumber];
}

function suggestionFor(product) {
  // Phase A has no suggestion card.
  if (product.phase === "A") return null;
  return PHASE_B_SUGGESTIONS[product.cardNumber];
}

function zoneName(choice) {
  return choice === "store" ? "Food Rescue" : "Discard";
}

/* ----------------------------------------------------------
   3. SESSION STATE
   The run has to survive moving between the phase screen and
   the product screens, so it is held in sessionStorage rather
   than in a variable.
   ---------------------------------------------------------- */

// Keep the staff-assigned ID across phases in the same browser tab.
const Participant = {
  KEY: "deco6500_participant_id",
  load: function () {
    try {
      return sessionStorage.getItem(this.KEY) || "";
    } catch (e) {
      return "";
    }
  },
  save: function (id) {
    try {
      sessionStorage.setItem(this.KEY, id.trim());
      return true;
    } catch (e) {
      return false;
    }
  },
  clear: function () {
    try {
      sessionStorage.removeItem(this.KEY);
    } catch (e) {
      // nothing to do
    }
  }
};

// Keeps the three "before you can start" confirmations (Participant Information
// Sheet, Consent Form, understanding) for the length of this browser tab, so
// moving from Phase A to Phase B does not ask the same participant to confirm
// them again. Cleared when the tab closes, same as the participant ID, so the
// next participant on this computer still has to confirm for themselves.
const ConsentState = {
  KEY: "deco6500_consent_state",
  blank: function () {
    return { information: false, consent: false, acknowledged: false };
  },
  load: function () {
    try {
      return Object.assign(this.blank(), JSON.parse(sessionStorage.getItem(this.KEY)) || {});
    } catch (e) {
      return this.blank();
    }
  },
  save: function (state) {
    try {
      sessionStorage.setItem(this.KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  },
  clear: function () {
    try {
      sessionStorage.removeItem(this.KEY);
    } catch (e) {
      // nothing to do
    }
  }
};

// Marks Phase A / Phase B as run for this participant (this browser tab), so
// each phase can only be run once and the report can only be downloaded once
// both are finished. Cleared when the tab closes, same as ConsentState — the
// next participant on this computer gets a fresh Phase A and Phase B.
const PhaseCompletion = {
  KEY: "deco6500_phase_completion",
  blank: function () {
    return { A: false, B: false };
  },
  load: function () {
    try {
      return Object.assign(this.blank(), JSON.parse(sessionStorage.getItem(this.KEY)) || {});
    } catch (e) {
      return this.blank();
    }
  },
  markDone: function (phase) {
    try {
      const state = this.load();
      state[phase] = true;
      sessionStorage.setItem(this.KEY, JSON.stringify(state));
      return state;
    } catch (e) {
      return this.load();
    }
  },
  clear: function () {
    try {
      sessionStorage.removeItem(this.KEY);
    } catch (e) {
      // nothing to do
    }
  }
};

const Session = {
  KEY: "deco6500_run",

  // A run that has not been started yet.
  blank: function (phase) {
    return {
      phase: phase,
      participantId: Participant.load(),
      cardTimesMs: {},    // retained for compatibility with earlier results
      cardVisits: [],     // one entry per visit, in opening order
      changeEvents: [],   // all selections and suggestion changes, in order
      actionHistoryVersion: 2,
      activeCard: null,   // persisted visit, so refreshes do not lose time
      startedAt: null,   // epoch ms, set by the Start button
      endsAt: null,      // epoch ms, when the countdown hits zero
      decisions: {},     // productId -> "store" | "discard"
      log: [],           // every decision, so re-classifications stay visible
      suggestions: {},   // Phase B: productId -> the suggestion after a Change
      feedback: []       // Phase B: the Change events made during this run
    };
  },

  // Older saved runs may predate a field, so read through this.
  normalise: function (state) {
    if (!state) return state;
    state.decisions = state.decisions || {};
    state.log = state.log || [];
    state.suggestions = state.suggestions || {};
    state.feedback = state.feedback || [];
    return state;
  },

  load: function () {
    try {
      return Session.normalise(JSON.parse(sessionStorage.getItem(this.KEY)) || null);
    } catch (e) {
      return null;
    }
  },

  save: function (state) {
    try {
      sessionStorage.setItem(this.KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  },

  clear: function () {
    try {
      sessionStorage.removeItem(this.KEY);
    } catch (e) {
      // nothing to do — the run simply will not be remembered
    }
  },

  // Browsers block storage on some file:// setups; the pages warn instead of
  // silently losing the participant's decisions.
  available: function () {
    try {
      sessionStorage.setItem("deco6500_probe", "1");
      sessionStorage.removeItem("deco6500_probe");
      return true;
    } catch (e) {
      return false;
    }
  },

  // Seconds left, or 0 once the countdown has run out. Used for the
  // on-screen timer before the limit and for per-card timing stats.
  remaining: function (state) {
    if (!state || !state.endsAt) return TIMER_SECONDS;
    return Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
  },

  // Seconds past the 3-minute limit, or 0 if still within it. The task is
  // not cut off at the limit any more — this only drives the "time's up"
  // display (an accumulating counter plus a banner), never blocks input.
  overtimeSeconds: function (state) {
    if (!state || !state.endsAt) return 0;
    return Math.max(0, Math.ceil((Date.now() - state.endsAt) / 1000));
  },

  // A run counts as "running" from Start until the participant explicitly
  // ends it (End the Timing) — running past the 3-minute mark no longer
  // locks the task, it only shows a non-blocking "time's up" notice. The
  // 3-minute limit is still recorded in each result via withinTimeLimit.
  isRunning: function (state) {
    return !!(state && state.startedAt);
  }
};

/* ----------------------------------------------------------
   4. RESULTS
   Finished runs are appended to localStorage so the group can
   read them back out of the browser afterwards.
   ---------------------------------------------------------- */

// Track elapsed viewing time, including close-ups and feedback, capped at timeout.
const CardTiming = {
  start: function (state, productId, now) {
    now = now == null ? Date.now() : now;
    this.stop(state, now);
    // The 3-minute limit no longer cuts the task off, so a card opened after
    // it still gets timed normally — only "not started yet" skips timing.
    if (!state.startedAt) return;
    state.cardTimesMs = state.cardTimesMs || {};
    if (state.cardTimesMs[productId] == null) state.cardTimesMs[productId] = 0;
    state.cardVisits = state.cardVisits || [];
    const visitNumber = state.cardVisits.filter(function (visit) {
      return visit.productId === productId;
    }).length + 1;
    state.cardVisits.push({
      productId: productId,
      cardNumber: getProduct(state.phase, productId).cardNumber,
      visitNumber: visitNumber,
      openedAt: now,
      durationMs: 0
    });
    state.activeCard = { productId: productId, openedAt: now, visitIndex: state.cardVisits.length - 1 };
  },
  stop: function (state, now) {
    if (!state || !state.activeCard) return;
    now = now == null ? Date.now() : now;
    const visit = state.activeCard;
    const elapsed = Math.max(0, now - visit.openedAt);
    state.cardTimesMs = state.cardTimesMs || {};
    state.cardTimesMs[visit.productId] = (state.cardTimesMs[visit.productId] || 0) + elapsed;
    if (state.cardVisits && state.cardVisits[visit.visitIndex]) {
      state.cardVisits[visit.visitIndex].durationMs = elapsed;
    }
    state.activeCard = null;
  }
};

// Older results already contain decision logs and feedback, so their changes
// can be reconstructed without rewriting stored history.
function getCardChanges(run) {
  if (run.actionHistoryVersion === 2 && Array.isArray(run.changeEvents)) return run.changeEvents.slice();
  const events = [];
  function collect(entries, kind) {
    (entries || []).forEach(function (entry) {
      if (!["store", "discard"].includes(entry.to)) return;
      const product = getProduct(run.phase, entry.productId);
      events.push(Object.assign({}, entry, {
        kind: kind,
        cardNumber: entry.cardNumber || (product && product.cardNumber) || entry.productId
      }));
    });
  }
  collect(run.log, "decision");
  collect(run.feedback, "suggestion");
  return events.sort(function (a, b) { return (a.atSecond || 0) - (b.atSecond || 0); });
}

function recordCardChange(state, entry) {
  if (state.actionHistoryVersion !== 2 || !Array.isArray(state.changeEvents)) {
    state.changeEvents = getCardChanges(state);
    state.actionHistoryVersion = 2;
  }
  state.changeEvents.push(entry);
}

function saveRunResult(state, outcome) {
  CardTiming.stop(state);
  const products = getProducts(state.phase);
  const endedAt = Date.now();
  const totalSeconds = state.startedAt
    ? Math.round((endedAt - state.startedAt) / 1000)
    : 0;

  let store = 0;
  let discard = 0;
  const notCompleted = [];   // card numbers with no decision
  const incorrect = [];      // card numbers sorted into the wrong zone

  products.forEach(function (product) {
    const decision = state.decisions[product.id];
    if (!decision) {
      notCompleted.push(product.cardNumber);
      return;
    }
    if (decision === "store") store++;
    else discard++;
    if (decision !== correctChoice(product)) incorrect.push(product.cardNumber);
  });

  const changeEvents = getCardChanges(state);
  const actualChanges = changeEvents.filter(function (entry) {
    return entry.from != null && entry.from !== entry.to;
  });
  const changedCards = Array.from(new Set(actualChanges.map(function (entry) {
    return entry.cardNumber;
  }))).sort(function (a, b) { return a - b; });

  const cardTimesSeconds = {};
  products.forEach(function (product) {
    const ms = state.cardTimesMs && state.cardTimesMs[product.id];
    cardTimesSeconds[product.cardNumber] = ms == null ? null : Math.round(ms / 100) / 10;
  });

  const result = {
    cardTimesSeconds: cardTimesSeconds,
    cardVisits: state.cardVisits ? state.cardVisits.map(function (visit) {
      return {
        cardNumber: visit.cardNumber,
        visitNumber: visit.visitNumber,
        openedAt: new Date(visit.openedAt).toISOString(),
        seconds: Math.round(visit.durationMs / 100) / 10
      };
    }) : null,
    participantId: state.participantId || "",
    phase: state.phase,
    outcome: outcome,                       // "completed" (older records may say "timeout")
    startedAt: state.startedAt ? new Date(state.startedAt).toISOString() : null,
    endedAt: new Date(endedAt).toISOString(),
    totalSeconds: totalSeconds,
    withinTimeLimit: outcome === "completed" && totalSeconds <= TIMER_SECONDS,
    totalCards: products.length,
    completedCards: products.length - notCompleted.length,
    notCompletedCards: notCompleted,
    incorrectCards: incorrect,
    changedCards: changedCards,
    changeEvents: changeEvents,
    actionHistoryVersion: 2,
    actionCount: changeEvents.length,
    changeCount: actualChanges.length,
    store: store,
    discard: discard,
    reclassifications: changeEvents.filter(function (e) { return e.kind === "decision" && e.from != null; }).length,
    decisions: Object.assign({}, state.decisions),
    log: state.log.slice(),
    feedback: state.feedback.slice()
  };

  try {
    const key = "deco6500_results";
    const all = JSON.parse(localStorage.getItem(key) || "[]");
    all.push(result);
    localStorage.setItem(key, JSON.stringify(all));
  } catch (e) {
    // Private browsing or file:// restrictions — the on-screen summary still works.
  }

  // Whether the run finished within time or timed out, that is this
  // participant's one attempt at this phase — mark it used.
  PhaseCompletion.markDone(state.phase);

  return result;
}

// Past runs, for the history table on the home page.
const RunHistory = {
  KEY: "deco6500_results",

  all: function () {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || "[]");
    } catch (e) {
      return [];
    }
  },

  clear: function () {
    try {
      localStorage.removeItem(this.KEY);
    } catch (e) {
      // nothing to do
    }
  }
};

// "3, 7" — or a dash when the list is empty.
function listCards(cards) {
  return cards && cards.length ? cards.join(", ") : "—";
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

/* ----------------------------------------------------------
   5. CHANGE LOG
   Every time a participant overrides the app's suggestion in
   Phase B, the card and the reason they typed are appended
   here. It outlives a single run so the team can read it from
   the home page afterwards.
   ---------------------------------------------------------- */

const ChangeLog = {
  KEY: "deco6500_change_log",

  all: function () {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || "[]");
    } catch (e) {
      return [];
    }
  },

  add: function (entry) {
    try {
      const all = this.all();
      all.push(entry);
      localStorage.setItem(this.KEY, JSON.stringify(all));
    } catch (e) {
      // storage unavailable — the run still works, the log just is not kept
    }
  },

  clear: function () {
    try {
      localStorage.removeItem(this.KEY);
    } catch (e) {
      // nothing to do
    }
  }
};

// Whether the Test History / Change Log currently sitting in localStorage on
// this device has been downloaded yet. Cleared together with that data by
// "Reset for Next Participant", so it only ever reflects the data that is
// actually still on the device right now.
const ReportExportState = {
  KEY: "deco6500_report_exported",
  wasExported: function () {
    try {
      return localStorage.getItem(this.KEY) === "1";
    } catch (e) {
      return false;
    }
  },
  markExported: function () {
    try {
      localStorage.setItem(this.KEY, "1");
    } catch (e) {
      // nothing to do — the export itself still succeeded
    }
  },
  clear: function () {
    try {
      localStorage.removeItem(this.KEY);
    } catch (e) {
      // nothing to do
    }
  }
};

function formatDateTime(isoString) {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const pad = function (n) { return String(n).padStart(2, "0"); };
  return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear() +
    " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

// "14:32:05" — the wall-clock time a run started or ended.
function formatClock(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "—";
  const pad = function (n) { return String(n).padStart(2, "0"); };
  return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
}
