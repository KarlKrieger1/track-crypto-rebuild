# Tasks

One row per block, in legacy line order. Legacy lines refer to `legacy/pruebaBeforeProduction.gs`. A block's row is added when it is done or dropped.

- **Status:** `done` (rebuilt, tested and committed) or `dropped` (understood, then judged not needed; the note says why).
- **Reads:** the dependencies of the rebuilt block: what it receives from other blocks (variables or sheet cells). Inputs declared only to run the block are not listed. **Produces:** what it leaves for later blocks. At the end, these two columns show how to connect the blocks.
- **Commit:** the commit that holds the block's rebuilt code (constitution rule 8).

| Legacy lines | Legacy names | Rebuilt functions and files | Reads | Produces | Status | Commit | Note |
|---|---|---|---|---|---|---|---|