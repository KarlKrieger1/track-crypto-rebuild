# Constitution

Rules of the project. They change only if we edit them here first.
Goal and "done" are in `spec.md`. Work order is in `plan.md`. Progress is in `tasks.md`.
## 1. How we understand a function or code block

A piece of code is understood only after four steps:

| Step | What we do |
|---|---|
| 1. Read | List what goes in, what comes out, and what it changes outside itself (sheet, variables) |
| 2. Predict | Write what we expect to happen before running it |
| 3. Run | Run the old code in a private copy of Apps Script, with small data |
| 4. Record | Add the block to `tasks.md` with its lines and short comments. Answer any open question it resolves. |

Code blocks outside functions (for example `requestOptions`) count the same as functions.

## 2. Labels

- **FACT**: tested by running it.
- **INTERPRETATION**: read from the code, not run yet.
- **HYPOTHESIS**: a guess.

## 3. Rules

1. The main idea of each function matters, not small details or unused code.
2. Check the real current state before changing anything.
3. No clean code is written until the idea is understood. Running the OLD code to learn is allowed (Rule 5).
4. No rebuilt code before the 4 SDD files are approved.
5. If old code and Karl's idea disagree, the idea stays and the code is rebuilt to match it. If we are not sure which is right, run the old function and look at the result.
6. Tests use the real API, with small requests to save credits.
7. One commit per block, with a clear message. Each file is reviewed before it is committed.
8. Work goes by blocks, in file order. Karl gives the line range. A function that a block calls is analyzed the first time it appears.
9. The legacy file in this repo is frozen. Line numbers always refer to it.

## 4. Security

- API keys live only in Apps Script Script Properties. They never go into any file or commit, and never into the chat.
- Before copying the legacy file into the repo, check that it has no key inside.

## 5. Names

- Professional English, camelCase (Apps Script / JavaScript standard).
- Functions start with a verb: `downloadPrices`. Variables are nouns: `priceList`.
- Booleans start with `is` or `has`. Constants use UPPER_SNAKE_CASE.
- No abbreviations and no numbered names (`f1`, `tmp`, `x`).
- If an old name is unclear, use the correct name and do not record the old one.
- Code comments: simple English, explain the WHY.

## 6. Code standards

Rebuilt code follows Apps Script and JavaScript best practices, with security first.

## 7. Repo quality

The repo is public and is a portfolio. Commits and documents must be clean, ordered and clear. Each SDD file is one page at most.