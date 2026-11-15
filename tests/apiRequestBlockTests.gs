/**
 * @fileoverview Runnable checks for the CoinMarketCap API questions and for
 * the inputs of legacy block 90-194. Pick one function in the Apps Script
 * menu and click Run; read the result in the Execution log.
 *
 * Functions to run:
 * - testKeyMeter: checks the monthly credits that /v1/key/info reports.
 * - testMinuteLimit: sends key info calls until the API refuses one, to see
 *   the per-minute limit, the error answer and how the counter recovers.
 * - testQuotesFreshness: repeats quotes calls on v1, v3 with key and v3
 *   keyless, to see per coin whether the price and its update time change.
 * - testCreditSpacing: repeats identical v3 calls with key at two spacings,
 *   to see how the credit charge depends on the spacing.
 *
 * The other functions are helpers used by the tests; do not run them alone.
 * No key is ever printed. Keys come from the Script Property CMC_API_KEYS.
 */

const API_BASE_URL = 'https://pro-api.coinmarketcap.com';
const API_KEYS_PROPERTY = 'CMC_API_KEYS';
const KEY_INFO_PATH = '/v1/key/info';
const DEPRECATED_QUOTES_PATH = '/v1/cryptocurrency/quotes/latest';
const CURRENT_QUOTES_PATH = '/v3/cryptocurrency/quotes/latest';
const TEST_KEY_NUMBER = 4;
const BITCOIN_ID = '1';
const PAUSE_BEFORE_KEY_INFO_MS = 2000;
const EXPECTED_MONTHLY_CREDITS = 15000;
const KEYLESS_BASE_URL = 'https://pro-api.coinmarketcap.com/public-api';
// Bitcoin, Ethereum, XRP, Dogecoin, Solana: volatile coins, so prices move often.
const COIN_IDS = '1,1027,52,74,5426';
const HTTP_STATUS_OK = 200;
const MILLISECONDS_PER_MINUTE = 60000;
const MINUTE_START_MARGIN_MS = 1000;
const LIMIT_TEST_MAX_CALLS = 60;
const RECOVERY_POLL_INTERVAL_MS = 5000;
const RECOVERY_POLL_MAX_CALLS = 14;
const FRESHNESS_CALLS_WITH_KEY = 40;
// v1 counts two requests per call (measured), so it uses fewer and slower calls.
const FRESHNESS_CALLS_DEPRECATED = 24;
const FRESHNESS_INTERVAL_DEPRECATED_MS = 3000;
const SPACING_COIN_ID = '1';
const SPACING_SHORT_CALLS = 12;
const SPACING_SHORT_INTERVAL_MS = 3000;
const SPACING_LONG_CALLS = 6;
const SPACING_LONG_INTERVAL_MS = 10000;
const FRESHNESS_INTERVAL_WITH_KEY_MS = 1000;
const FRESHNESS_CALLS_KEYLESS = 6;
const FRESHNESS_INTERVAL_KEYLESS_MS = 5000;
const MINIMUM_GAP_BETWEEN_KEYED_SERIES_MS = 61000;

/**
 * Run this to check that key info reports the monthly credits and counts
 * the credits of one deprecated (v1) call and one current (v3) call with key.
 * It reads key info, makes each quotes call with one id, and reads key info
 * again to see how many credits each call used.
 * Cost: about 2 credits and 5 requests. Run it once.
 * @returns {void} Nothing; the result goes to the Execution log.
 */
function testKeyMeter() {
  const apiKey = readApiKey(TEST_KEY_NUMBER);
  if (!apiKey) {
    return;
  }

  const infoBefore = readKeyInfo('BEFORE', apiKey);
  if (!infoBefore) {
    return;
  }

  const reportedCreditsDeprecatedCall = callQuotesEndpoint(
    'v1 quotes (1 id)', DEPRECATED_QUOTES_PATH, apiKey);
  const infoAfterDeprecatedCall = readKeyInfo('AFTER v1', apiKey);
  if (!infoAfterDeprecatedCall) {
    return;
  }

  const reportedCreditsCurrentCall = callQuotesEndpoint(
    'v3 quotes with key (1 id)', CURRENT_QUOTES_PATH, apiKey);
  const infoAfterCurrentCall = readKeyInfo('AFTER v3', apiKey);
  if (!infoAfterCurrentCall) {
    return;
  }

  // The summary only subtracts the numbers above, so no guess is added.
  Logger.log('---------- SUMMARY ----------');
  Logger.log('Monthly limit reported by key info: ' + infoBefore.monthlyLimit
    + ' | expected ' + EXPECTED_MONTHLY_CREDITS
    + ' | equal: ' + (infoBefore.monthlyLimit === EXPECTED_MONTHLY_CREDITS));
  Logger.log('v1: month used changed by '
    + (infoAfterDeprecatedCall.monthUsed - infoBefore.monthUsed)
    + ' | day used changed by '
    + (infoAfterDeprecatedCall.dayUsed - infoBefore.dayUsed)
    + ' | the call reported credit_count ' + reportedCreditsDeprecatedCall);
  Logger.log('v3 with key: month used changed by '
    + (infoAfterCurrentCall.monthUsed - infoAfterDeprecatedCall.monthUsed)
    + ' | day used changed by '
    + (infoAfterCurrentCall.dayUsed - infoAfterDeprecatedCall.dayUsed)
    + ' | the call reported credit_count ' + reportedCreditsCurrentCall);
}
/**
 * Run this first. Sends key info calls (0 credits) one after another until
 * the API refuses one, then polls to see when calls are accepted again.
 * Each line shows the UTC time and the minute counter, so we can see the
 * limit, the error answer, whether the counter matches the calls made, and
 * whether the minute is a fixed UTC minute or a rolling 60 seconds.
 * Cost: 0 credits; about 60 to 75 requests. Run it once, then wait more
 * than 60 seconds before running testQuotesFreshness.
 * @returns {void} Nothing; the result goes to the Execution log.
 */
function testMinuteLimit() {
  const apiKey = readApiKey(TEST_KEY_NUMBER);
  if (!apiKey) {
    return;
  }

  // Wait for the start of the next UTC minute so all calls fall in one window.
  Utilities.sleep(MILLISECONDS_PER_MINUTE - (Date.now() % MILLISECONDS_PER_MINUTE)
    + MINUTE_START_MARGIN_MS);
  const firstCallTime = formatUtcTime(new Date());
  let callsAccepted = 0;
  let lastAcceptedCounter = null;
  let refusedCallNumber = null;
  let refusedTime = null;
  let refusedAnswer = null;

  for (let callNumber = 1; callNumber <= LIMIT_TEST_MAX_CALLS; callNumber++) {
    const callTime = formatUtcTime(new Date());
    const result = fetchApi(KEY_INFO_PATH, apiKey);
    const counter = readMinuteCounter(result.body);
    Logger.log('call ' + callNumber + ' | UTC ' + callTime
      + ' | HTTP ' + result.statusCode
      + ' | counter made ' + counter.requestsMade + ', left ' + counter.requestsLeft
      + ' | ' + describeStatus(result.body));

    // Stop at the first refusal: more calls would only extend the block.
    if (result.statusCode !== HTTP_STATUS_OK) {
      refusedCallNumber = callNumber;
      refusedTime = callTime;
      refusedAnswer = describeStatus(result.body);
      break;
    }
    callsAccepted++;
    lastAcceptedCounter = counter;
  }

  let recoveredTime = null;
  let recoveryCallsMade = 0;
  if (refusedCallNumber !== null) {
    Logger.log('Refused. Polling every ' + RECOVERY_POLL_INTERVAL_MS / 1000
      + ' s to see when calls are accepted again.');
    for (let pollNumber = 1; pollNumber <= RECOVERY_POLL_MAX_CALLS; pollNumber++) {
      Utilities.sleep(RECOVERY_POLL_INTERVAL_MS);
      const pollTime = formatUtcTime(new Date());
      const pollResult = fetchApi(KEY_INFO_PATH, apiKey);
      recoveryCallsMade++;
      Logger.log('poll ' + pollNumber + ' | UTC ' + pollTime
        + ' | HTTP ' + pollResult.statusCode
        + ' | ' + describeStatus(pollResult.body));
      if (pollResult.statusCode === HTTP_STATUS_OK) {
        recoveredTime = pollTime;
        break;
      }
    }
  }

  // The summary only repeats numbers from the lines above; no guess is added.
  Logger.log('---------- SUMMARY ----------');
  Logger.log('First call at UTC ' + firstCallTime);
  Logger.log('Calls accepted: ' + callsAccepted
    + ' | per-minute limit reported by key info: '
    + (lastAcceptedCounter ? lastAcceptedCounter.requestsLimit : 'n/a')
    + ' | counter "made" on the last accepted call: '
    + (lastAcceptedCounter ? lastAcceptedCounter.requestsMade : 'n/a'));
  if (refusedCallNumber === null) {
    Logger.log('No refusal in ' + LIMIT_TEST_MAX_CALLS + ' calls.');
    return;
  }
  Logger.log('Refused at call ' + refusedCallNumber + ' (UTC ' + refusedTime + ') | '
    + refusedAnswer);
  Logger.log(recoveredTime
    ? 'Accepted again at UTC ' + recoveredTime + ' after ' + recoveryCallsMade + ' polls.'
    : 'Not accepted again in ' + recoveryCallsMade + ' polls.');
}

/**
 * Run this second. Repeats a quotes call for five volatile coins on three
 * versions and records, per coin, the price, its own update time and the age
 * of the data. Order: v1 with key, v3 keyless (it also serves as the pause
 * between the two keyed series), v3 with key. Each series stops at its first
 * non-200 answer and never retries, to protect the shared keyless pool.
 * Key info is read before and after each keyed series to measure the credits.
 * Cost: about 15 credits and about 100 requests. Duration: about 3.5 minutes.
 * @returns {void} Nothing; the result goes to the Execution log.
 */
function testQuotesFreshness() {
  const apiKey = readApiKey(TEST_KEY_NUMBER);
  if (!apiKey) {
    return;
  }
  const quotesQuery = '?id=' + COIN_IDS;

  const infoBefore = readKeyInfo('BEFORE', apiKey);
  if (!infoBefore) {
    return;
  }

  const deprecatedSeries = runFreshnessSeries('v1 with key',
    () => fetchApi(DEPRECATED_QUOTES_PATH + quotesQuery, apiKey),
    FRESHNESS_CALLS_DEPRECATED, FRESHNESS_INTERVAL_DEPRECATED_MS);
  const deprecatedSeriesEndMs = Date.now();
  const infoAfterDeprecated = readKeyInfo('AFTER v1 series', apiKey);
  if (!infoAfterDeprecated) {
    return;
  }

  const keylessSeries = runFreshnessSeries('v3 keyless',
    () => fetchKeylessApi(CURRENT_QUOTES_PATH + quotesQuery),
    FRESHNESS_CALLS_KEYLESS, FRESHNESS_INTERVAL_KEYLESS_MS);
  // Wait until the v1 calls are more than 60 seconds old, whatever keyless did.
  Utilities.sleep(Math.max(0,
    MINIMUM_GAP_BETWEEN_KEYED_SERIES_MS - (Date.now() - deprecatedSeriesEndMs)));

  const currentSeries = runFreshnessSeries('v3 with key',
    () => fetchApi(CURRENT_QUOTES_PATH + quotesQuery, apiKey),
    FRESHNESS_CALLS_WITH_KEY, FRESHNESS_INTERVAL_WITH_KEY_MS);
  const infoAfterCurrent = readKeyInfo('AFTER v3 series', apiKey);
  if (!infoAfterCurrent) {
    return;
  }

  // The summary only subtracts the numbers above, so no guess is added.
  Logger.log('---------- SUMMARY ----------');
  Logger.log('v1 with key: ' + deprecatedSeries.callsMade + ' calls | month used changed by '
    + (infoAfterDeprecated.monthUsed - infoBefore.monthUsed)
    + ' | credits reported ' + deprecatedSeries.creditsReported
    + ' | calls with new data ' + deprecatedSeries.newDataCalls
    + ' | price-only changes ' + deprecatedSeries.priceOnlyChanges);
  Logger.log('v3 keyless: ' + keylessSeries.callsMade + ' calls | no credits'
    + ' | calls with new data ' + keylessSeries.newDataCalls
    + ' | price-only changes ' + keylessSeries.priceOnlyChanges);
  Logger.log('v3 with key: ' + currentSeries.callsMade + ' calls | month used changed by '
    + (infoAfterCurrent.monthUsed - infoAfterDeprecated.monthUsed)
    + ' | credits reported ' + currentSeries.creditsReported
    + ' | calls with new data ' + currentSeries.newDataCalls
    + ' | price-only changes ' + currentSeries.priceOnlyChanges);
}

/**
 * Run this third. Repeats identical v3 calls with key for one coin at two
 * spacings (short, then long) and compares the credits reported by each call
 * with the change of the month-used value in key info.
 * Cost: up to about 18 credits and about 22 requests. Duration: about 2 minutes.
 * @returns {void} Nothing; the result goes to the Execution log.
 */
function testCreditSpacing() {
  const apiKey = readApiKey(TEST_KEY_NUMBER);
  if (!apiKey) {
    return;
  }
  const fetchSingleCoin = () => fetchApi(CURRENT_QUOTES_PATH + '?id=' + SPACING_COIN_ID, apiKey);

  const infoBefore = readKeyInfo('BEFORE', apiKey);
  if (!infoBefore) {
    return;
  }
  const shortSeries = runFreshnessSeries(
    'v3 with key, ' + SPACING_SHORT_INTERVAL_MS / 1000 + ' s apart',
    fetchSingleCoin, SPACING_SHORT_CALLS, SPACING_SHORT_INTERVAL_MS);
  const infoAfterShort = readKeyInfo('AFTER short spacing', apiKey);
  if (!infoAfterShort) {
    return;
  }
  const longSeries = runFreshnessSeries(
    'v3 with key, ' + SPACING_LONG_INTERVAL_MS / 1000 + ' s apart',
    fetchSingleCoin, SPACING_LONG_CALLS, SPACING_LONG_INTERVAL_MS);
  const infoAfterLong = readKeyInfo('AFTER long spacing', apiKey);
  if (!infoAfterLong) {
    return;
  }

  // The summary only subtracts the numbers above, so no guess is added.
  Logger.log('---------- SUMMARY ----------');
  Logger.log('Short spacing: ' + shortSeries.callsMade + ' calls | credits reported '
    + shortSeries.creditsReported + ' | month used changed by '
    + (infoAfterShort.monthUsed - infoBefore.monthUsed));
  Logger.log('Long spacing: ' + longSeries.callsMade + ' calls | credits reported '
    + longSeries.creditsReported + ' | month used changed by '
    + (infoAfterLong.monthUsed - infoAfterShort.monthUsed));
}
/**
 * Repeats one call at a fixed interval and logs, per call, the credits it
 * reported and the age of the data (time of the call minus the coin's own
 * update time, measured at the start of the call). It also reports, per coin,
 * when its own update time changed and when its price changed while its own
 * update time did not. It stops at the first non-200 answer, never retries.
 * @param {string} label - Text that marks this series in the log.
 * @param {function(): {statusCode: number, body: ?Object}} fetchOneCall - Makes one call.
 * @param {number} callCount - Maximum number of calls.
 * @param {number} intervalMs - Time from the start of one call to the next.
 * @returns {{callsMade: number, newDataCalls: number, priceOnlyChanges: number, creditsReported: number}}
 *     Calls made, calls where at least one coin had a new update time, number
 *     of coin price changes without a new update time, and the sum of the
 *     credits the calls reported.
 */
function runFreshnessSeries(label, fetchOneCall, callCount, intervalMs) {
  Logger.log('---------- SERIES: ' + label + ' ----------');
  let callsMade = 0;
  let newDataCalls = 0;
  let priceOnlyChanges = 0;
  let creditsReported = 0;
  let smallestAge = null;
  let largestAge = null;
  const previousRecords = {};

  for (let callNumber = 1; callNumber <= callCount; callNumber++) {
    const callStartMs = Date.now();
    const callTime = formatUtcTime(new Date(callStartMs));
    const result = fetchOneCall();
    callsMade++;

    if (result.statusCode !== HTTP_STATUS_OK) {
      Logger.log('call ' + callNumber + ' | UTC ' + callTime + ' | HTTP '
        + result.statusCode + ' | ' + describeStatus(result.body)
        + ' | STOPPED, no retry.');
      break;
    }

    const reportedCredits = result.body && result.body.status
      ? result.body.status.credit_count : 'n/a';
    if (typeof reportedCredits === 'number') {
      creditsReported += reportedCredits;
    }

    // Sorted by coin ID, so a change in the order of the answer cannot look like a change.
    const records = collectCoinRecords(result.body)
      .sort((first, second) => Number(first.coinId) - Number(second.coinId));
    const ages = records
      .map((record) => (callStartMs - Date.parse(record.quoteUpdated)) / 1000)
      .filter(Number.isFinite);
    const youngestAge = ages.length > 0 ? Math.min(...ages) : null;
    const oldestAge = ages.length > 0 ? Math.max(...ages) : null;
    if (youngestAge !== null && (smallestAge === null || youngestAge < smallestAge)) {
      smallestAge = youngestAge;
    }
    if (oldestAge !== null && (largestAge === null || oldestAge > largestAge)) {
      largestAge = oldestAge;
    }

    const coinAges = records
      .map((record) => (callStartMs - Date.parse(record.coinUpdated)) / 1000)
      .filter(Number.isFinite);
    const bitcoinRecord = records.find((record) => record.coinId === BITCOIN_ID);
    Logger.log('call ' + callNumber + ' | UTC ' + callTime + ' | HTTP ' + result.statusCode
      + ' | credit_count ' + reportedCredits + ' | coins ' + records.length
      + ' | quote age ' + (youngestAge === null ? 'n/a' : youngestAge.toFixed(1))
      + ' to ' + (oldestAge === null ? 'n/a' : oldestAge.toFixed(1))
      + ' s | coin age ' + (coinAges.length > 0
        ? Math.min(...coinAges).toFixed(1) + ' to ' + Math.max(...coinAges).toFixed(1) : 'n/a')
      + ' s | bitcoin price ' + (bitcoinRecord ? bitcoinRecord.price : 'n/a'));

    const newDataCoins = [];
    const priceOnlyCoins = [];
    records.forEach(function (record) {
      const previous = previousRecords[record.coinId];
      if (previous) {
        const hasNewUpdateTime = record.quoteUpdated !== previous.quoteUpdated;
        const hasNewCoinTime = record.coinUpdated !== previous.coinUpdated;
        const hasNewPrice = String(record.price) !== String(previous.price);
        if (hasNewUpdateTime || hasNewCoinTime) {
          newDataCoins.push(record.coinId);
        }
        if (hasNewPrice && !hasNewUpdateTime && !hasNewCoinTime) {
          priceOnlyCoins.push(record.coinId);
        }
      }
      previousRecords[record.coinId] = record;
    });
    if (newDataCoins.length > 0) {
      newDataCalls++;
      Logger.log('  NEW DATA (own update time changed): coins ' + newDataCoins.join(','));
    }
    if (priceOnlyCoins.length > 0) {
      priceOnlyChanges += priceOnlyCoins.length;
      Logger.log('  PRICE ONLY (price changed, own update time did not): coins '
        + priceOnlyCoins.join(','));
    }

    // Wait only the rest of the interval, so the pace does not drift.
    const waitMs = intervalMs - (Date.now() - callStartMs);
    if (waitMs > 0 && callNumber < callCount) {
      Utilities.sleep(waitMs);
    }
  }

  Logger.log('Series ' + label + ': ' + callsMade + ' calls | calls with new data '
    + newDataCalls + ' | price-only changes ' + priceOnlyChanges
    + ' | credits reported ' + creditsReported
    + ' | smallest data age ' + (smallestAge === null ? 'n/a' : smallestAge.toFixed(1))
    + ' s | largest ' + (largestAge === null ? 'n/a' : largestAge.toFixed(1)) + ' s');
  return {
    callsMade: callsMade,
    newDataCalls: newDataCalls,
    priceOnlyChanges: priceOnlyChanges,
    creditsReported: creditsReported
  };
}

/**
 * Walks through a parsed JSON answer and collects one record per coin: any
 * object that has an "id" and a "quote" is taken as a coin. This avoids
 * assuming whether the answer lists coins in an object or in an array, which
 * may differ between v1 and v3.
 * @param {*} node - The parsed JSON (object, array or value).
 * @returns {{coinId: string, price: *, quoteUpdated: *, coinUpdated: *}[]}
 *     One record per coin: its ID, its price and its own update time taken
 *     from the first quote currency, and the update time of the coin itself.
 */
function collectCoinRecords(node) {
  const records = [];
  if (node === null || typeof node !== 'object') {
    return records;
  }
  const isCoin = !Array.isArray(node) && node.id !== undefined
    && node.quote !== null && typeof node.quote === 'object';
  if (isCoin) {
    const quoteList = Array.isArray(node.quote) ? node.quote : Object.values(node.quote);
    const firstQuote = quoteList.length > 0 ? quoteList[0] : {};
    records.push({
      coinId: String(node.id),
      price: firstQuote.price,
      quoteUpdated: firstQuote.last_updated,
      coinUpdated: node.last_updated
    });
    return records;
  }
  Object.keys(node).forEach(function (key) {
    records.push(...collectCoinRecords(node[key]));
  });
  return records;
}

/**
 * Reads one key from the Script Property. The key stays inside the script
 * so it never appears in the log, the chat or the repo (constitution rule 2).
 * @param {number} keyNumber - Position of the key in the list (1 is the first).
 * @returns {?string} The key, or null if the property or the position is missing.
 */
function readApiKey(keyNumber) {
  const rawKeys = PropertiesService.getScriptProperties().getProperty(API_KEYS_PROPERTY);
  if (!rawKeys) {
    Logger.log('STOP: Script Property ' + API_KEYS_PROPERTY + ' is missing or empty.');
    return null;
  }

  // The keys are separated by commas; trim removes spaces around each one.
  const keys = rawKeys.split(',').map(key => key.trim());
  // Lists start at position 0, so key number 4 is at position 3.
  const apiKey = keys[keyNumber - 1];
  if (!apiKey) {
    Logger.log('STOP: key ' + keyNumber + ' not found. The list has ' + keys.length + ' keys.');
    return null;
  }

  Logger.log('Using key ' + keyNumber + ' (value hidden).');
  return apiKey;
}

/**
 * Makes one GET call to the API. HTTP errors are muted so the test can log
 * the error code instead of stopping with an exception.
 * @param {string} path - Endpoint path, for example '/v1/key/info'.
 * @param {string} apiKey - The key sent in the X-CMC_PRO_API_KEY header.
 * @returns {{statusCode: number, body: ?Object}} The HTTP code and the parsed
 *     JSON answer (null if the answer was not valid JSON).
 */
function fetchApi(path, apiKey) {
  const response = UrlFetchApp.fetch(API_BASE_URL + path, {
    method: 'get',
    headers: { 'X-CMC_PRO_API_KEY': apiKey, 'Accept': 'application/json' },
    muteHttpExceptions: true
  });

  let body = null;
  try {
    body = JSON.parse(response.getContentText());
  } catch (parseError) {
    body = null;
  }
  return { statusCode: response.getResponseCode(), body: body };
}

/**
 * Reads key info and logs it. It waits first because the credits counter may
 * take a moment to update; without the pause, a lag could look like "no charge".
 * @param {string} label - Text that marks this reading in the log.
 * @param {string} apiKey - The key to check.
 * @returns {?Object} The numbers read (limit and usage), or null if the call failed.
 */
function readKeyInfo(label, apiKey) {
  Utilities.sleep(PAUSE_BEFORE_KEY_INFO_MS);
  const result = fetchApi(KEY_INFO_PATH, apiKey);
  if (result.statusCode !== 200 || !result.body || !result.body.data) {
    Logger.log(label + ' -> key info FAILED, HTTP ' + result.statusCode);
    return null;
  }

  const data = result.body.data;
  const keyInfo = {
    monthlyLimit: data.plan.credit_limit_monthly,
    minuteLimit: data.plan.rate_limit_minute,
    monthUsed: data.usage.current_month.credits_used,
    monthLeft: data.usage.current_month.credits_left,
    dayUsed: data.usage.current_day.credits_used,
    dayLeft: data.usage.current_day.credits_left,
    minuteRequestsMade: data.usage.current_minute.requests_made,
    minuteRequestsLeft: data.usage.current_minute.requests_left,
    creditsOfThisCall: result.body.status ? result.body.status.credit_count : 'n/a'
  };

  Logger.log(label + ' -> HTTP ' + result.statusCode
    + ' | monthly limit ' + keyInfo.monthlyLimit
    + ' | month used ' + keyInfo.monthUsed + ', left ' + keyInfo.monthLeft
    + ' | day used ' + keyInfo.dayUsed + ', left ' + keyInfo.dayLeft
    + ' | minute requests made ' + keyInfo.minuteRequestsMade
    + ', left ' + keyInfo.minuteRequestsLeft
    + ' | per-minute limit ' + keyInfo.minuteLimit
    + ' | credit_count of this call ' + keyInfo.creditsOfThisCall);
  return keyInfo;
}

/**
 * Calls a quotes endpoint for one coin and logs what the call itself reports.
 * @param {string} label - Text that marks this call in the log.
 * @param {string} quotesPath - Quotes endpoint path, without the id parameter.
 * @param {string} apiKey - The key to use.
 * @returns {(number|string)} The credit_count the call reported, or 'n/a'.
 */
function callQuotesEndpoint(label, quotesPath, apiKey) {
  const result = fetchApi(quotesPath + '?id=' + BITCOIN_ID, apiKey);
  
  let reportedCredits = 'n/a';
  let errorCode = 'n/a';
  if (result.body && result.body.status) {
    reportedCredits = result.body.status.credit_count;
    errorCode = result.body.status.error_code;
  }

  Logger.log(label + ' -> HTTP ' + result.statusCode
    + ' | error_code ' + errorCode
    + ' | credit_count reported ' + reportedCredits);
  return reportedCredits;
}
/**
 * Makes one keyless GET call. It sends no key header, as the docs require.
 * HTTP errors are muted so the test can log the answer instead of stopping.
 * @param {string} path - Endpoint path, for example '/v3/cryptocurrency/quotes/latest?id=1'.
 * @returns {{statusCode: number, body: ?Object}} The HTTP code and the parsed
 *     JSON answer (null if the answer was not valid JSON).
 */
function fetchKeylessApi(path) {
  const response = UrlFetchApp.fetch(KEYLESS_BASE_URL + path, {
    method: 'get',
    headers: { 'Accept': 'application/json' },
    muteHttpExceptions: true
  });

  let body = null;
  try {
    body = JSON.parse(response.getContentText());
  } catch (parseError) {
    body = null;
  }
  return { statusCode: response.getResponseCode(), body: body };
}

/**
 * Reads the minute counter from a key info answer without failing when the
 * answer is an error and has no data.
 * @param {?Object} body - The parsed key info answer.
 * @returns {{requestsMade: (number|string), requestsLeft: (number|string), requestsLimit: (number|string)}}
 *     The counter values, or 'n/a' where the answer has none.
 */
function readMinuteCounter(body) {
  const hasCounter = Boolean(body && body.data && body.data.usage && body.data.usage.current_minute);
  const hasPlan = Boolean(body && body.data && body.data.plan);
  return {
    requestsMade: hasCounter ? body.data.usage.current_minute.requests_made : 'n/a',
    requestsLeft: hasCounter ? body.data.usage.current_minute.requests_left : 'n/a',
    requestsLimit: hasPlan ? body.data.plan.rate_limit_minute : 'n/a'
  };
}

/**
 * Describes the status block of an answer in one line for the log.
 * @param {?Object} body - The parsed answer.
 * @returns {string} The error code and message, or a note if there is no status.
 */
function describeStatus(body) {
  if (!body || !body.status) {
    return 'no status in the answer';
  }
  return 'error_code ' + body.status.error_code
    + ' | error_message ' + body.status.error_message;
}

/**
 * Formats a time as UTC hours, minutes, seconds and milliseconds. UTC is used
 * because the docs describe the minute window in UTC.
 * @param {Date} time - The moment to format.
 * @returns {string} The time as HH:mm:ss.SSS.
 */
function formatUtcTime(time) {
  return Utilities.formatDate(time, 'UTC', 'HH:mm:ss.SSS');
}
