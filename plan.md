# Plan

How we work through the legacy file, the decisions taken, and the external facts we rely on.

## 1. Block cycle

1. Karl and Claude agree on the block. Karl gives the line range: normally the first line that no row of `tasks.md` covers, or a function that the previous block calls. A block may start later in the file if it depends on earlier lines that are not rebuilt yet (constitution rule 4).
2. Karl explains it in his own words. Claude checks the explanation against the code and reports what is confirmed, wrong or uncertain, with labels.
3. The legacy block is run in a private Apps Script copy, with small data, and the output is compared with the explanation.
4. Claude analyzes the block and proposes the rebuild (constitution rule 4). Karl says "Build it".
5. Claude rebuilds it in `rebuilt/` and writes its test script in `tests/`.
6. Karl runs the test script from the Apps Script menu, and it passes.
7. The `tasks.md` row is added and the work is committed (constitution rule 8).

Glossary terms the block adds follow `spec.md` section 5.

When every block is done, the entry function is written last, from the rows of `tasks.md`: their line order, Reads and Produces. Then the whole file is compared with a full legacy run and the summary is written in `README.md`.

## 2. Decisions

- **Comparing results:** the legacy and the rebuilt code run on the same input. API data changes, so an API response is saved privately and fed to both versions in the private copy. It is never committed.
- **Tests:** one test script per block, in `tests/`. Its header explains its purpose and names the functions Karl must run from the Apps Script menu. More files only if good practice requires it: Claude explains why, shows how they work together and waits for Karl's approval.
- **Debugging:** the block test and the Apps Script debugger. No logging framework. Legacy debug functions are rebuilt only if a block needs them.

## 3. External facts

| Fact | Source | Date checked |
|---|---|---|

## 4. Open questions

None yet. A question is added only when a block cannot be rebuilt without its answer.