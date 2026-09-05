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

// The reference date printed on every scenario card, so participants can read
// the printed best-before / use-by dates against a fixed "today".
const TODAY_DATE = "05/09/2026";

// The Phase B app card shows product details. This is a simulation, not a real
// stock system, so every card carries the same placeholder values.
const CARD_INFO = {
  productName: "Milk",
  shelfCategory: "1-2-C",
  labelDate: "05/09/2026"
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

// The correct classification for a product:
//   every "use by" item is discarded, without exception;
//   a "best before" item is stored unless the food itself is damaged.
// This is both the answer a run is marked against and the suggestion the
// Phase B app card shows.
function correctChoice(product) {
  if (product.labelType === "use by") return "discard";
  return product.damaged ? "discard" : "store";
}

function suggestionFor(product) {
  return correctChoice(product);
}

function zoneName(choice) {
  return choice === "store" ? "Store" : "Discard";
}

/* ----------------------------------------------------------
   3. SESSION STATE
   The run has to survive moving between the phase screen and
   the product screens, so it is held in sessionStorage rather
   than in a variable.
   ---------------------------------------------------------- */

const Session = {
  KEY: "deco6500_run",

  // A run that has not been started yet.
  blank: function (phase) {
    return {
      phase: phase,
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

  // Seconds left, or 0 once the countdown has run out.
  remaining: function (state) {
    if (!state || !state.endsAt) return TIMER_SECONDS;
    return Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
  },

  isRunning: function (state) {
    return !!(state && state.startedAt && Session.remaining(state) > 0);
  }
};

/* ----------------------------------------------------------
   4. RESULTS
   Finished runs are appended to localStorage so the group can
   read them back out of the browser afterwards.
   ---------------------------------------------------------- */

function saveRunResult(state, outcome) {
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

  // Phase B: the cards where the participant overrode the app's suggestion.
  const changedIds = [];
  state.feedback.forEach(function (entry) {
    if (changedIds.indexOf(entry.productId) === -1) changedIds.push(entry.productId);
  });
  const changedCards = changedIds.map(function (id) {
    const product = getProduct(state.phase, id);
    return product ? product.cardNumber : id;
  }).sort(function (a, b) { return a - b; });

  const result = {
    phase: state.phase,
    outcome: outcome,                       // "completed" | "timeout"
    startedAt: state.startedAt ? new Date(state.startedAt).toISOString() : null,
    endedAt: new Date(endedAt).toISOString(),
    totalSeconds: totalSeconds,
    withinTimeLimit: outcome === "completed" && totalSeconds <= TIMER_SECONDS,
    totalCards: products.length,
    completedCards: products.length - notCompleted.length,
    notCompletedCards: notCompleted,
    incorrectCards: incorrect,
    changedCards: changedCards,             // Phase B only
    store: store,
    discard: discard,
    reclassifications: state.log.filter(function (e) { return e.from !== null; }).length,
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
