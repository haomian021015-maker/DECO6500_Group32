# Food Rescue Sorting Study — DECO6500 Group 32

A static web prototype for an A/B test of how supermarket staff decide whether a
food item can still go to food rescue or has to be thrown away.

- **Phase A** — the participant judges each product from the label information alone.
- **Phase B** — the same task, but an app card also shows product details and a
  suggested classification, which the participant can accept or change.

Both phases are timed (3 minutes) and record the result, so the two conditions
can be compared.

## Running it

Open `index.html` in a browser. No build step and no server is required, though
running it through a local server (for example the **Live Server** extension in
VS Code) loads the photos faster and avoids browser restrictions on local
storage.

## How a run works

1. From the home page, choose **Phase A** or **Phase B**.
2. Press **Start** to begin the 3-minute countdown.
3. Click a card to open that product.
   - Phase A: four numbered circles show close-up photos; choose **Food Rescue** or **Discard**.
   - Phase B: the app card shows the product details and a suggested
     classification. **Accept** follows the suggestion; **Change** asks for a
     written reason and then flips the suggestion.
4. A sorted card moves into the Food Rescue or Discard zone. Clicking it there opens
   the product again so the decision can be changed.
5. **End the Timing** finishes the run and shows the summary. If the countdown
   runs out first, the run ends as a failure and is still recorded.

## What is recorded

The summary and the **Test History** table on the home page show, per run:
start time, end time, total seconds, whether it finished inside 3 minutes, how
many cards were completed, which cards were left, which cards were sorted
incorrectly, and (Phase B) which cards had their suggestion changed.

A card is correct when it matches this rule:

| Label | Food state | Correct choice |
| --- | --- | --- |
| use by | any | Discard |
| best before | intact | Food Rescue |
| best before | damaged | Discard |

Phase B's suggestion uses the same rule, so the app is always "right" and the
study measures whether people follow it.

Every **Change** in Phase B — the card, the old and new suggestion, and the
reason typed — is kept in the **Change Log** on the home page.

Runs and change-log entries are stored in the browser's `localStorage`
(`deco6500_results`, `deco6500_change_log`), so they stay on the machine the
test was run on and are cleared with the buttons in those dialogs.

## Files

| File | Purpose |
| --- | --- |
| `index.html` / `home.js` | Home page, test history, change log |
| `phase-a.html`, `phase-b.html` | The two test screens |
| `phase-screen.js` | Shared logic for both test screens (`data-phase` picks the set) |
| `product.html` / `product.js` | One product: photos, close-ups, the decision |
| `shared.js` | Product data, timing, correctness rule, saved results |
| `styles.css`, `phase.css` | Styling |
| `images/DECO6500_food_picture/` | The photo sets (`phase1-8group` for A, `phase2-8group` for B) |

Settings worth knowing about are at the top of `shared.js`: `TIMER_SECONDS`,
`RETURN_DELAY_SECONDS`, `TODAY_DATE` and `CARD_INFO`.

## Photos

Each product has one `-main` photo and four close-ups (`-1` … `-4`), named after
the folder they sit in. The folder name also encodes the condition being tested,
for example `phase1-usedby-2` or `phase2-bestbefore-damaged`.
