# Plan

How we work through the legacy file, the decisions taken, and the external facts we rely on.

## 1. Block cycle

1. Karl and Claude agree on the block. Karl gives the line range. A block can start anywhere in the file; the variables it needs from other lines are declared (constitution rule 4).
2. Karl explains it in his own words. Claude checks the explanation against the code and reports what is confirmed, wrong or uncertain, with labels.
3. The legacy block is run in a private Apps Script copy, with small data, and the output is compared with the explanation.
4. Claude analyzes the block and proposes the rebuild (constitution rule 4). With scripts in `tests/`, Claude shows how the rebuilt code will work and answers Karl's questions. The work goes on only when Karl has understood.
5. Claude writes the rebuilt code in `rebuilt/trackCrypto.gs` and adds the block to the entry function.
6. Karl runs the legacy block and the rebuilt code on the same data. The block is done when the output is identical.
7. The `tasks.md` row is added and the work is committed (constitution rule 8).

Glossary terms the block adds follow `spec.md` section 5.

Each block adds its call to the entry function, using its Reads and Produces. When every block is done, the whole file is compared with a full legacy run and the summary is written in `README.md`.

## 2. Decisions

- **Comparing results:** the legacy and the rebuilt code run on the same input. API data changes, so an API response is saved privately and fed to both versions in the private copy. It is never committed.
- **Tests:** scripts in `tests/` show how the rebuilt code will work and the output of what is unclear to Karl. Each file's header explains its purpose and names the functions Karl must run from the Apps Script menu. Application logic lives only in `rebuilt/`.
- **Debugging:** the block test and the Apps Script debugger. No logging framework. Legacy debug functions are rebuilt only if a block needs them.
- **Monthly credits:** read with `/v1/key/info`; one call covers v1 and v3 with key.

## 3. External facts

| Fact | Source | Date checked |
|---|---|---|
| Basic plan: 15,000 credits per month | https://coinmarketcap.com/api/pricing/ | 2026-11-13 |
| Key info reports the plan's monthly limit and the credits used and left; it costs no credits | https://coinmarketcap.com/api/documentation/pro-api-reference/tools#key-info | 2026-11-14 |
| Tested on a Basic key: key info reports 15,000 and counted 1 credit for one v1 call and 1 for one v3 call with key (1 ID each) | `tests/apiRequestBlockTests.gs`, `testKeyMeter` | 2026-11-14 |

## 4. Open questions

None yet. A question is added only when a block cannot be rebuilt without its answer.