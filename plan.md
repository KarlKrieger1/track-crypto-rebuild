# Plan

Map of the file, order of work and open questions. Rules are in `constitution.md`, goal and "done" in `spec.md`, progress in `tasks.md`.

## 1. Map and order of work

Everything here is **INTERPRETATION** (read from the code, not run). Line numbers are approximate.
The file has no main function. The loose code runs from top to bottom every time the file runs, and it calls the functions.

| Order | Piece | Type | Line | What it does | Called by |
|---|---|---|---|---|---|
| 1 | `generationOfValuesRandom` | function | ~520 | Fills 4 "current value" variables with random numbers (saves credits) | Nobody (commented out) |
| 2 | `generationOfValuesAPI` | function | ~528 | Fills the same 4 variables from the API answer (`parseData`) | Main loop, `updateConstantValues` |
| 3 | `updateAndFormatVolume` | function | ~313 | Writes the volume, calculates its change, colors the cell | Main loop |
| 4 | `putTheMaxAndMinColour` | function | ~366 | Keeps the lowest and highest percent column reached, colors them | `updateAndConfigureCellChanged` |
| 5 | `updateAndConfigureCellChanged` | function | ~335 | Counts the change in its percent column, colors green, red or cyan | Main loop |
| 6 | `updateID` | function | ~441 | Copies IDs and names from the sheet `dataBaseFiltered` | Nobody (manual) |
| 7 | `clearPercentCahanges` | function | ~412 | Clears formats and sets the percent columns to 0 | Nobody (manual) |
| 8 | `updateConstantValues` | function | ~425 | Replaces the saved reference values with the current ones | Nobody (manual) |
| 9 | `cryptoCarl`, `proofOfIndex`, `foolowingCalculatioAndRequest`, `showGeneratedIndex`, `showCellAdded` | functions | ~298 to ~509 | Empty or only write logs to check things | Nobody |
| 10 | Settings and column map | block | 1-64 | Reads the sheet into memory, defines column numbers and row limits | Runs on load |
| 11 | State variables and colors | block | 67-88 | Variables shared by all functions, color codes | Runs on load |
| 12 | API settings | block | 91-129 | Reads counters from sheet `APIinfo`, key list, URL, `requestOptions` | Runs on load |
| 13 | API request | block | 132-149 | Builds the ID list, calls the API, parses the answer | Runs on load |
| 14 | Key rotation and credit count | block | 151-183 | Counts credits, changes to the next key, saves the error | Runs on load |
| 15 | Main loop | block | 204-292 | For each coin: gets values, compares, writes, colors | Runs on load |
| 16 | Sort | block | 293-296 | Sorts the sheet by volume change | Runs on load |
| 17 | `runWholeSystem` | new function | none | Calls all the rebuilt pieces in the right order. Written last | Karl |

**Why this order:** functions first, as decided. They go from simple to complex, so each one is understood before the one that calls it. Number 2 reads the API answer, so it is studied together with block 13.

## 2. Open questions

Answered on the way, when we reach the code that needs them. Nothing to decide now.

| # | Question | When |
|---|---|---|
| 1 | How do we run one old function without spending credits or changing the real sheet? | Before the first test (row 1) |
| 2 | How do we compare old and new results when the API data changes? | Final test |
| 3 | Do the API keys still work? Karl checks if he can recover access | Before block 13 |
| 4 | Are the manual and helper functions (rows 6 to 9) rebuilt or dropped? | When we reach each one |
| 5 | Three things to check by running (**HYPOTHESIS**): the ID loop starts at the header row, the sort range may be one row too long, the error branch does not save the key counter | Blocks 13, 14 and 16 |