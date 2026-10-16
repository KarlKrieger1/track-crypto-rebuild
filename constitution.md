# Constitution

Highest authority of this repo. If two files disagree, the order is: constitution, spec, plan, tasks, README.
A rule changes only here, in its own commit.

## 1. Terms

- **SDD**: Spec-Driven Development. Here, the five Markdown files in the repo root.
- **Legacy**: `legacy/pruebaBeforeProduction.gs` (540 lines), the original script.
- **Block**: a function or a stretch of top-level code, identified by the legacy line range that Karl gives.
- **Rebuilt**: the clean code in `rebuilt/`.

## 2. One place per thing

A fact or rule is written in one file only. Every other file links to it.

| File | Holds |
|---|---|
| `README.md` | Overview, folder tree, links |
| `constitution.md` | Rules, labels, terms, this table |
| `spec.md` | Requirements: scope, what must stay unchanged, acceptance criteria, and a glossary that grows block by block |
| `plan.md` | The block cycle, decisions with their reasons, external facts, open questions |
| `tasks.md` | One row per finished block, in legacy line order: legacy lines, legacy and rebuilt names, what it reads and produces, status, commit |

## 3. Evidence labels

Every statement about the code or the API carries one label. An unlabeled statement is not accepted.

- **FACT**: what the code literally says (cite the lines), or what a test or a dated official source shows.
- **INTERPRETATION**: what the code appears to do or mean, read but not run.
- **HYPOTHESIS**: a possible reason or intent, not checked yet.

An external fact needs a link and the date it was checked. Paraphrase it. Never copy text from the source.

## 4. Rules

1. **Legacy is frozen.** The legacy file is never edited. Line numbers always refer to it.
2. **No secrets.** API keys, tokens and passwords never go into files, commits, logs or chat. Rebuilt code never hardcodes a key; if keys are used, they come from Script Properties. A private legacy copy may hold keys and is never committed.
3. **Karl leads, Claude verifies.** Karl gives the line range and explains it. Only then Claude checks it against the code. Claude does not analyze ahead of him. Nothing enters the SDD until Karl has understood and approved it.
4. **Understand by running, then rebuild.** Rebuilding starts only after Karl approves the SDD. Each block is rebuilt only after Karl has explained it and the legacy block has been run in a private Apps Script copy. Use small data and small requests to save credits. If running needs setup, the setup belongs to the block.
5. **Same behavior unless decided.** A rebuilt block reproduces the legacy behavior. A deliberate difference (bug fix, simplification, new API version) is a decision in `plan.md` with its reason and Karl's approval, never a silent change.
6. **Questions must block something.** A question goes to `plan.md` only if it blocks a specific block. It names that block and the run that will answer it.
7. **Rebuilt code standard.**
   - Nothing runs on load: no code with side effects outside functions (the legacy fetches and writes on every execution).
   - `const` and `let`, never `var`. Named constants instead of magic numbers.
   - One job per function, one file per function in `rebuilt/`. A loose top-level block becomes a function.
   - JSDoc on every function. Comments explain why, in simple English.
   - Names: English camelCase; functions start with a verb; booleans start with `is` or `has`; constants are UPPER_SNAKE_CASE; no abbreviations or numbered names. Each name matches its definition in `spec.md`.
   - Legacy names, typos included, appear only in `tasks.md`, next to the rebuilt name.
8. **One commit per completed block.** The message names the block and its legacy lines. `tasks.md` is updated in that commit, except the commit's own hash, which is written in the next block's commit.
9. **Clean public repo.** The repo is public. Commits stay clean and ordered, each SDD file stays about one page, and API responses are never committed.