# Plan

How we work through the legacy file. Rules are in `constitution.md`, goal and "done" in `spec.md`, progress in `tasks.md`.

## 1. Reference

The legacy file is `legacy/pruebaBeforeProduction.gs` in this GitHub repo. It is frozen. Every line number in the SDD files refers to this file.

## 2. Procedure

The old plan studied functions first. It broke when a function needed an input that lives in a block of loose code. So we work by blocks, in file order.

For each block:

1. Karl gives the line range from the legacy file.
2. Claude explains only those lines: what they do, what they need, what they produce.
3. Karl explains the main idea back in his own words.
4. We test it when it can be tested. Every statement gets a label (FACT, INTERPRETATION or HYPOTHESIS).
5. A doubt that matters for understanding the code or for the refactor becomes an open question (section 3).
6. When the block is understood, it is recorded in `tasks.md` with its lines and short comments. One commit per block.

A function that a block calls is analyzed the first time it appears.

## 3. Open questions

Written only when a real doubt appears in a block. Answered in the same row, when we reach the code that resolves it.

| # | Question | Raised in (lines) | Answer | Label |
|---|---|---|---|---|
| | | | | |