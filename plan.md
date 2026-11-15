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

A link as source means the fact was read in the official docs; a function name means a script in `tests/` measured it.

| Fact | Source | Date checked |
|---|---|---|
| Basic plan: 15,000 credits per month | https://coinmarketcap.com/api/pricing/ | 2026-11-13 |
| Key info reports the plan's monthly limit and the credits used and left; it costs no credits | https://coinmarketcap.com/api/documentation/pro-api-reference/tools#key-info | 2026-11-14 |
| On a Basic key, key info reports 15,000 and counted 1 credit for one v1 call and 1 for one v3 call with key (1 ID each) | `testKeyMeter` | 2026-11-14 |
| Per-minute limit: calls with one key in the same minute count; passing it returns HTTP 429 with error code 1008; it resets every minute | https://coinmarketcap.com/api/documentation/guides/errors-and-rate-limits | 2026-11-14 |
| Quotes update frequency: v1 every 60 seconds; v3 every 15 to 25 seconds | https://coinmarketcap.com/api/documentation/pro-api-reference/deprecated and https://coinmarketcap.com/api/documentation/changelog (version 3.0.7) | 2026-11-15 |
| Keyless v3 path is `/public-api/v3/cryptocurrency/quotes/latest`, sent without a key header; its limit is a shared pool per IP with no numbers published | https://coinmarketcap.com/api/documentation/pro-api-reference/keyless-public-api | 2026-11-15 |
| On a Basic key, key info reports 50 requests per minute; 49 were accepted in each of 3 runs and the 50th got 429 with code 1008; the counter resets at the start of each UTC minute and calls work again then | `testMinuteLimit` | 2026-11-15 |
| Toward the minute limit, a key info call counts 1 request, a v3 quotes call with key counts 1, and a v1 quotes call counts 2 (with 1 and with 5 coins) | `testKeyMeter`, `testQuotesFreshness` | 2026-11-15 |
| Each coin's price changes about every 15 seconds on v1 and v3 with key, the same rhythm (Bitcoin: 3 changes in 40 seconds polled every second); no price change was seen without a new update time; new data shows 5 to 7 seconds after its stated time; the quote's own `last_updated` moves only about once a minute | `testQuotesFreshness` | 2026-11-15 |
| An identical quotes call less than about 5 seconds after a charged call reported 0 credits (1 s and 3 s apart); calls 10 seconds apart cost 1 each; month used moved by exactly the credits reported | `testQuotesFreshness`, `testCreditSpacing` | 2026-11-15 |
| Keyless v3 was refused with HTTP 429, code 1022 (anonymous access limit), after 8 and after 3 calls 5 seconds apart, and not in two other runs (12 and 6 calls) | `testQuotesFreshness` | 2026-11-15 |

## 4. Open questions

None yet. A question is added only when a block cannot be rebuilt without its answer.