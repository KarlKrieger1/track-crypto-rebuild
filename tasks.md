# Tasks

One row per finished block, in legacy line order. A row is added when the block is done or dropped. Legacy lines refer to `legacy/pruebaBeforeProduction.gs`.

- **Status:** `done` (rebuilt, tested and committed) or `dropped` (understood, then judged not needed; the note says why).
- **Reads:** what the block needs from earlier blocks (variables or sheet cells). **Produces:** what it leaves for later blocks. At the end, these two columns show how to connect the blocks.
- **Commit:** the block's commit hash, written in the next block's commit (constitution rule 8).

| Legacy lines | Legacy name | Rebuilt name | Reads | Produces | Status | Commit | Note |
|---|---|---|---|---|---|---|---|