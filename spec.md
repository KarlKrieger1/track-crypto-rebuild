# Spec

What we build and when it counts as done. How we work is in `constitution.md`.

## 1. Goal

Understand and rebuild `legacy/pruebaBeforeProduction.gs`, one function or code block at a time, and test the rebuilt file at the end.

## 2. Reference

The legacy file was last edited in Dec 2021 and still runs. It is the version known to work, so it is the reference for behavior.

## 3. Scope

| In | Out |
|---|---|
| The 13 functions of the file | Other files of the old repo |
| The code blocks outside functions (settings, API request, loops) | New features |
| A file that behaves like the original, with clean code | Changes in what the file calculates |

A file outside the scope enters only if a piece we rebuild calls it. It is then added to `plan.md` as an open question.

## 4. When is something DONE

| Level | Done when |
|---|---|
| Function or block | The four steps of understanding are finished. Karl explains it in his own words. The rebuilt version in `rebuilt/` passes its test with the real API and gives the same result as the old one. Its status in `tasks.md` is updated. One commit is made. |
| Whole file | The full rebuilt run is compared with the original and the result is the same. |
| Project | Every function and block is done. `README.md` links all files. No API key is anywhere in the repo. |

**Same** means the same values and formats in the sheet.

How to compare old and new results (the API data changes over time) is decided in `plan.md`.

## 5. Connections

| File | What it holds |
|---|---|
| `constitution.md` | Rules and how we understand each piece |
| `plan.md` | Map of functions and blocks, order of work, open questions |
| `tasks.md` | One line per piece with its status |