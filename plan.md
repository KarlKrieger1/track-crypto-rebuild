# Plan

How we work through the legacy file, the decisions taken, and the external facts we rely on.

## 1. Block cycle

1. Karl gives the next legacy line range: normally the first line that no row of `tasks.md` covers, or a function that the block calls.
2. Karl explains it in his own words.
3. Claude checks the explanation against the code and reports what is confirmed, wrong or uncertain, with labels.
4. The legacy block is run in a private Apps Script copy, with small data, and the output is compared with the explanation.
5. Karl approves the glossary lines the block adds to `spec.md`.
6. The block is rebuilt in `rebuilt/`, with its test in `tests/`.
7. The test passes.
8. A row is added to `tasks.md` and one commit is made.

When every block is done, the entry function is written last, from the rows of `tasks.md`: their line order, Reads and Produces. Then the whole file is compared with a full legacy run and the summary is written in `README.md`.

## 2. Decisions

- **Comparing results:** the legacy and the rebuilt code run on the same input. API data changes, so an API response is saved privately and fed to both versions in the private copy. It is never committed.
- **Tests:** one test per block, in `tests/`, named after the rebuilt function.
- **Debugging:** the block test and the Apps Script debugger. No logging framework. Legacy debug functions are rebuilt only if a block needs them.

## 3. External facts

| Fact | Source | Date checked |
|---|---|---|

## 4. Open questions

None yet. A question is added only when a block cannot be rebuilt without its answer.