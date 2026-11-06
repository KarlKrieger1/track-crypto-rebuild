# Constitution

Highest authority of this repo, and the first file an AI reads. The order is: constitution, spec, plan, tasks, README. If two files disagree, or something is unclear, go up this order: each rule lives in the highest file that owns it.
A rule changes only here, in its own commit.

## 1. Terms

- **SDD**: Spec-Driven Development. Here, the five Markdown files in the repo root.
- **Legacy**: `legacy/pruebaBeforeProduction.gs`, the original script.
- **Block**: the unit of work. A stretch of legacy code (a line range, a group of functions or a single function) that Karl and Claude agree on after reviewing it together. The functions, files and tests needed to rebuild it come from Claude's analysis. They never define the block.
- **Rebuilt**: the clean code in `rebuilt/`.

## 2. One place per thing

A fact or rule is written in one file only. Every other file links to it.

| File | Holds |
|---|---|
| `README.md` | Overview, folder tree, links |
| `constitution.md` | Rules, labels, terms, this table |
| `spec.md` | Requirements: scope, what must stay unchanged, acceptance criteria, and a glossary that grows block by block |
| `plan.md` | The block cycle, decisions with their reasons, external facts, open questions |
| `tasks.md` | One row per block, in legacy line order: legacy lines, legacy names, rebuilt functions and files, what it reads and produces, status, commit |

## 3. Evidence labels

Every statement about the code or the API carries one label. An unlabeled statement is not accepted.

- **FACT**: shown by named evidence. The code says (cite the lines), a run shows (a manual run of the legacy, or a test; say what was run), or a dated official source says.
- **INTERPRETATION**: what the code appears to do or mean, read but not run.
- **HYPOTHESIS**: a possible reason or intent, not checked yet.

An external fact needs a link and the date it was checked. Paraphrase it. Never copy text from the source.

## 4. Rules

1. **Legacy is frozen.** The legacy file is never edited. Line numbers always refer to it.
2. **No secrets.** API keys, tokens and passwords never go into the repo, commits, logs or chat. Rebuilt code never hardcodes a key; if keys are used, they come from Script Properties.
3. **Karl leads, Claude verifies.** Karl gives the line range and explains it. Only then Claude checks it against the code. Claude changes no project file and implements no proposed change until Karl has understood and approved it.
4. **Understand by running, then rebuild.** Each block is rebuilt only after Karl has explained it and the legacy block has been run in a private Apps Script copy. Use small data and small requests to save credits. Variables or data the block needs from elsewhere in the legacy may be declared as inputs, only as much as needed to run it. They are not part of the block. Before any code, Claude analyzes the whole block: the problems and the proposed improvements as one picture, a simple diagram of its functions and how they interact, and the reason for each important technical choice. A simple block is reviewed and approved as a whole. For a complex block, Claude proposes smaller steps and Karl decides, then reviews each one. Code for a block or a step is written only after Karl says "Build it".
5. **Same output, better implementation.** The rebuild is a refactor, not a new system. Every observable result (outputs, data, quantities, structures, formats, behavior) stays identical. The implementation is corrected and improved wherever needed. A change to an observable result, or to anything the legacy takes from outside (API version, endpoints, parameters, limits), is a decision in `plan.md` with its reason and Karl's approval. It is never made silently.
6. **Questions must block something.** A question goes to `plan.md` only if it blocks a specific block. It names that block and the run that will answer it.
7. **Rebuilt code standard.**
   - Nothing runs on load: no code with side effects outside functions (the legacy fetches and writes on every execution).
   - `const` and `let`, never `var`. Named constants instead of magic numbers.
   - Claude analyzes the block and determines the reconstruction using established programming best practices and standards, and may split, combine or reorganize legacy code. Every resulting function has one clearly defined responsibility. Every split, combination or reorganization is approved first (rule 4), and its reasons are written in the header of each file.
   - Error handling, security and speed follow an official standard, taken from its source and recorded in `plan.md` section 3 when the block that needs it is reached. Never written from memory.
   - JSDoc on every function. Comments explain why, in simple English.
   - Names: English camelCase; descriptive, so a new reader understands what each one represents; functions start with a verb; booleans start with `is` or `has`; constants are UPPER_SNAKE_CASE; no abbreviations or numbered names.
   - Legacy names, typos included, appear only in `tasks.md`, next to the rebuilt name.
8. **Commits follow coherent units of work.** A completed block (rebuilt code, its test script and its `tasks.md` row) is one commit; the message names the block and its legacy lines. Every other task done while working on the block is its own commit, even if the block needed it: for example its glossary terms, a research item for `plan.md` section 3, or a decision. Its message names the block. There is no commit for a minor edit. A block's hash is written in `tasks.md` in a later commit; the last block has none.
9. **Clean public repo.** The repo is public. Commits stay clean and ordered, each SDD file stays about one page, and API responses are never committed.