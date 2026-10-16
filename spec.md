# Spec

Requirements for the rebuild.

## 1. Goal

Rebuild `legacy/pruebaBeforeProduction.gs` as clean, secure, tested code that does the same job.

## 2. Scope

| In | Out |
|---|---|
| The 13 functions of the legacy file | Other files of the old repo |
| The top-level code (lines 1–298): settings, API request, main loop, sort | Whatever fills `dataBaseFiltered` |
| Clean, tested code in `rebuilt/` | New features |

Anything outside the scope enters only as a decision in `plan.md`.

## 3. Requirements

- **Stays unchanged:** the result in the sheet. For the same input, the rebuilt code writes the same values and formats as the legacy code.
- **May change:** names, structure, efficiency, security and the way it is debugged.
- Any other change is a decision in `plan.md`.

## 4. Acceptance criteria

| Level | Done when |
|---|---|
| Block | Karl has explained it. The legacy block has been run. The rebuilt function passes its test. Its row is added to `tasks.md`. One commit is made |
| Whole file | The rebuilt entry function reproduces a full legacy run: the same sheet result |
| Project | Every block is done. The rows of `tasks.md` cover legacy lines 1–540 with no gaps. No API key is anywhere in the repo. `README.md` shows the before and after summary |

## 5. Glossary

Terms the requirements use. One line per term, added only after Karl has understood the block that introduces it and approved the line.

| Term | Meaning | Rebuilt name |
|---|---|---|