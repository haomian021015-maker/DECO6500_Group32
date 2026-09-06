/* ==========================================================
   DECO6500 Group 32 — Food Rescue Sorting Study
   One product screen.

   Phase A — the photo with four close-up circles around it and
             a straight Food Rescue / Discard choice.
   Phase B — the same photo shown inside the app's product card,
             which also carries the product details and a
             suggested classification. The participant either
             accepts that suggestion or changes it, giving a
             reason, which is written to the change log.

   Reached as product.html?phase=<A|B>&id=<product id>
   ========================================================== */

const params = new URLSearchParams(window.location.search);
const PHASE = params.get("phase") === "B" ? "B" : "A";
const PHASE_PAGE = phasePage(PHASE);

const el = {
  backBtn: document.getElementById("back-btn"),
  viewA: document.getElementById("view-a"),
  viewB: document.getElementById("view-b"),
  todayDates: document.querySelectorAll(".today-date"),

  // Phase A
  cardTitleA: document.getElementById("card-title-a"),
  figure: document.getElementById("product-figure"),
  mainPhotoA: document.getElementById("main-photo-a"),
  storeBtn: document.getElementById("store-btn"),
  discardBtn: document.getElementById("discard-btn"),
  currentDecisionA: document.getElementById("current-decision-a"),

  // Phase B
  cardTitleB: document.getElementById("card-title-b"),
  mainPhotoB: document.getElementById("main-photo-b"),
  infoName: document.getElementById("info-name"),
  infoShelf: document.getElementById("info-shelf"),
  infoLabelType: document.getElementById("info-label-type"),
  infoLabelDate: document.getElementById("info-label-date"),
  suggestionValue: document.getElementById("suggestion-value"),
  suggestionNote: document.getElementById("suggestion-note"),
  acceptBtn: document.getElementById("accept-btn"),
  changeBtn: document.getElementById("change-btn"),
  thumbs: document.getElementById("app-thumbs"),
  currentDecisionB: document.getElementById("current-decision-b"),

  // Close-up viewer
  detailOverlay: document.getElementById("detail-overlay"),
  detailPhoto: document.getElementById("detail-photo"),
  detailClose: document.getElementById("detail-close"),

  // Feedback
  feedbackOverlay: document.getElementById("feedback-overlay"),
  feedbackText: document.getElementById("feedback-text"),
  feedbackTarget: document.getElementById("feedback-target"),
  feedbackBack: document.getElementById("feedback-back"),
  feedbackSubmit: document.getElementById("feedback-submit")
};

/* ----------------------------------------------------------
   1. Which product is this, and is the run still valid?
   ---------------------------------------------------------- */

const productId = params.get("id");
const product = getProduct(PHASE, productId);
const state = Session.load();

// Read the latest state so leaving never overwrites a decision or feedback.
function stopCardVisit() {
  const current = Session.load();
  if (!current || !state || current.phase !== PHASE || current.startedAt !== state.startedAt) return;
  if (!current.activeCard || current.activeCard.productId !== productId) return;
  CardTiming.stop(current);
  Session.save(current);
}

window.addEventListener("pagehide", stopCardVisit);
window.addEventListener("pageshow", function (event) {
  // Rebuild from storage when browser Back restores an old product page.
  if (event.persisted) window.location.reload();
});

function backToPhase() {
  stopCardVisit();
  window.location.href = PHASE_PAGE;
}

// An unknown product, a run belonging to the other phase, a run that was never
// started, or a countdown that has already finished — in every case the phase
// screen is where the participant belongs, and it is the screen that shows the
// "time is up" dialog.
if (!product || !Session.isRunning(state) || state.phase !== PHASE) {
  window.location.replace(PHASE_PAGE);
} else {
  buildScreen();
  CardTiming.start(state, productId);
  Session.save(state);
}

/* ----------------------------------------------------------
   2. Build the screen
   ---------------------------------------------------------- */

// The suggestion currently on the card: the app's own reading of the product,
// unless the participant has already changed it during this run.
function currentSuggestion() {
  return state.suggestions[productId] || suggestionFor(product);
}

function buildScreen() {
  document.title = "Phase " + PHASE + " — " + product.name;
  el.backBtn.setAttribute("href", PHASE_PAGE);

  Array.prototype.forEach.call(el.todayDates, function (node) {
    node.textContent = product.todayDate;
  });

  const decision = state.decisions[productId];
  const decisionNote = decision
    ? "Currently sorted into " + zoneName(decision) + ". Choose again to change it."
    : "";

  if (PHASE === "A") {
    el.viewA.hidden = false;
    el.cardTitleA.textContent = product.name;
    el.mainPhotoA.src = product.image;
    el.mainPhotoA.alt = product.name;
    el.currentDecisionA.textContent = decisionNote;

    // Each circle opens the close-up photo with the matching number.
    Array.prototype.forEach.call(el.figure.querySelectorAll(".hotspot"), function (dot) {
      const index = Number(dot.dataset.detail);
      dot.addEventListener("click", function () { openDetail(index); });
    });

    el.storeBtn.addEventListener("click", function () { decide("store", "manual"); });
    el.discardBtn.addEventListener("click", function () { decide("discard", "manual"); });
  } else {
    el.viewB.hidden = false;
    el.cardTitleB.textContent = product.name;
    el.mainPhotoB.src = product.image;
    el.mainPhotoB.alt = product.name;
    el.infoName.textContent = product.productName;
    el.infoShelf.textContent = product.shelfCategory;
    const labelClass = product.labelType === "use by" ? "label-used-by" : "label-best-before";
    el.infoLabelType.textContent = product.labelType === "use by" ? "Use By:" : "Best Before:";
    el.infoLabelType.className = labelClass;
    el.infoLabelDate.textContent = product.labelDate;
    el.infoLabelDate.className = labelClass;
    el.currentDecisionB.textContent = decisionNote;

    buildThumbs();
    paintSuggestion();

    el.acceptBtn.addEventListener("click", function () {
      decide(currentSuggestion(), "accepted");
    });
    el.changeBtn.addEventListener("click", openFeedback);
  }

  // The countdown keeps running while the participant is reading this screen.
  setInterval(function () {
    if (!Session.isRunning(Session.load())) window.location.replace(PHASE_PAGE);
  }, 1000);
}

// The four close-ups, shown beside the app card in Phase B.
function buildThumbs() {
  product.details.forEach(function (src, index) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "app-thumb";
    btn.setAttribute("aria-label", "Show close-up " + (index + 1));

    const img = document.createElement("img");
    img.src = src;
    img.alt = product.name + " close-up " + (index + 1);
    btn.appendChild(img);

    btn.addEventListener("click", function () { openDetail(index); });
    el.thumbs.appendChild(btn);
  });
}

function paintSuggestion() {
  const suggestion = currentSuggestion();
  el.suggestionValue.textContent = zoneName(suggestion);
  el.suggestionValue.className = suggestion === "store" ? "suggestion-store" : "suggestion-discard";
  el.suggestionNote.hidden = !state.suggestions[productId];
}

/* ----------------------------------------------------------
   3. Close-up viewer — click to open, click the photo to zoom
      in, click the background or the X to close.
   ---------------------------------------------------------- */

function openDetail(index) {
  el.detailPhoto.src = product.details[index];
  el.detailPhoto.alt = product.name + " close-up " + (index + 1);
  el.detailPhoto.classList.remove("zoomed");
  el.detailOverlay.hidden = false;
  el.detailOverlay.scrollTop = 0;
  document.body.classList.add("no-scroll");
}

function closeDetail() {
  el.detailOverlay.hidden = true;
  el.detailPhoto.classList.remove("zoomed");
  el.detailPhoto.removeAttribute("src");
  document.body.classList.remove("no-scroll");
}

el.detailPhoto.addEventListener("click", function (event) {
  event.stopPropagation();
  el.detailPhoto.classList.toggle("zoomed");
});

el.detailClose.addEventListener("click", function (event) {
  event.stopPropagation();
  closeDetail();
});

// A click anywhere outside the photo closes the viewer.
el.detailOverlay.addEventListener("click", closeDetail);

document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") return;
  if (!el.detailOverlay.hidden) closeDetail();
  else if (!el.feedbackOverlay.hidden) closeFeedback();
});

/* ----------------------------------------------------------
   4. Phase B — changing the suggestion
   ---------------------------------------------------------- */

function otherChoice(choice) {
  return choice === "store" ? "discard" : "store";
}

function openFeedback() {
  const target = otherChoice(currentSuggestion());
  el.feedbackTarget.textContent = zoneName(target);
  el.feedbackTarget.className = target === "store" ? "suggestion-store" : "suggestion-discard";
  el.feedbackSubmit.textContent = "Change to " + zoneName(target);
  el.feedbackText.value = "";
  el.feedbackOverlay.hidden = false;
  document.body.classList.add("no-scroll");
  el.feedbackText.focus();
}

function closeFeedback() {
  el.feedbackOverlay.hidden = true;
  document.body.classList.remove("no-scroll");
}

// Submitting the reason writes the change to the log and immediately sorts
// the card into the classification the participant chose. The app's own
// suggestion is never overwritten — it always shows what the app suggested.
function submitFeedback() {
  const reason = el.feedbackText.value.trim();
  if (!reason) {
    el.feedbackText.focus();
    el.feedbackText.classList.add("needs-text");
    return;
  }
  el.feedbackText.classList.remove("needs-text");

  const current = Session.load();
  if (!Session.isRunning(current) || current.phase !== PHASE) {
    window.location.replace(PHASE_PAGE);
    return;
  }

  const from = suggestionFor(product);
  const to = otherChoice(from);

  const entry = {
    phase: PHASE,
    participantId: current.participantId || "",
    productId: productId,
    cardNumber: product.cardNumber,
    labelType: product.labelType,
    damaged: product.damaged,
    from: from,
    to: to,
    feedback: reason,
    atSecond: TIMER_SECONDS - Session.remaining(current),
    at: new Date().toISOString()
  };
  recordCardChange(current, Object.assign({}, entry, { kind: "suggestion" }));
  current.feedback.push(entry);
  Session.save(current);

  // Kept outside the run as well, so the home page can show it afterwards.
  ChangeLog.add(entry);

  state.feedback.push(entry);

  closeFeedback();
  decide(to, "changed");
}

el.feedbackBack.addEventListener("click", closeFeedback);
el.feedbackSubmit.addEventListener("click", submitFeedback);
el.feedbackOverlay.addEventListener("click", function (event) {
  if (event.target === el.feedbackOverlay) closeFeedback();
});

/* ----------------------------------------------------------
   5. The decision
   ---------------------------------------------------------- */

function decide(choice, how) {
  const current = Session.load();
  if (!Session.isRunning(current) || current.phase !== PHASE) {
    window.location.replace(PHASE_PAGE);
    return;
  }

  const previous = current.decisions[productId] || null;
  recordCardChange(current, {
    kind: "decision",
    productId: productId,
    cardNumber: product.cardNumber,
    from: previous,
    to: choice,
    atSecond: TIMER_SECONDS - Session.remaining(current),
    at: new Date().toISOString()
  });
  current.decisions[productId] = choice;
  current.log.push({
    productId: productId,
    from: previous,
    to: choice,
    how: how,   // "manual" in Phase A, "accepted" in Phase B
    followedSuggestion: PHASE === "B" ? choice === suggestionFor(product) : null,
    atSecond: TIMER_SECONDS - Session.remaining(current)
  });

  CardTiming.stop(current);
  Session.save(current);
  backToPhase();
}
