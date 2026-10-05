# track-crypto-rebuild

Rebuild of a legacy Google Apps Script file (last edited Dec 2021) that works with CoinMarketCap data in Google Sheets.
First we understand the old code by running it. Then we rebuild it clean, one function or code block at a time, with the same behavior.

Progress is tracked in `tasks.md`.

## Documents

| File | What it holds |
|---|---|
| [constitution.md](constitution.md) | Rules and how we understand each piece |
| [spec.md](spec.md) | Goal, scope and when something is done |
| [plan.md](plan.md) | Map of the file, order of work, open questions |
| [tasks.md](tasks.md) | One line per piece with its status |

## Folder tree

```
track-crypto-rebuild/
├── README.md          # This page
├── constitution.md    # Rules of the project
├── spec.md            # Goal and definition of done
├── plan.md            # Map of the file and order of work
├── tasks.md           # Status for each piece
├── legacy/
│   └── pruebaBeforeProduction.gs   # Original copy, never edited
└── rebuilt/           # Clean version, one file per function
```

## Security

No API keys are stored in this repository. Keys live only in Apps Script Script Properties.