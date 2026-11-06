# Spec

Requirements for the rebuild.

## 1. Goal

Rebuild the legacy script as clean, secure, tested code that does the same job.

## 2. Scope

| In | Out |
|---|---|
| The whole legacy script: its top-level code (settings, API request, main loop, sort) and its functions | Other files of the old repo |
| Clean, tested code in `rebuilt/` | Whatever supplies the input data of the script |
| | New features |

Anything outside the scope enters only as a decision (constitution rule 5).

## 3. Requirements

What stays unchanged and what may change: constitution rule 5.

## 4. Acceptance criteria

| Level | Done when |
|---|---|
| Block | The plan cycle is complete for it (`plan.md` section 1) |
| Whole file | The rebuilt entry function reproduces a full legacy run: the same sheet result |
| Project | Every legacy line is covered by a `done` or `dropped` row of `tasks.md`. No API key is anywhere in the repo. `README.md` shows the before and after summary |

## 5. Glossary

Key terms of each block, from tracked variables to programming concepts: meaning and source. Rebuilt names only. Claude explains each term with examples and tests Karl. A term is added only after Karl shows he understands it.

| Term | Meaning | Source |
|---|---|---|