/**
 * @fileoverview Runnable checks for the CoinMarketCap API questions and for
 * the inputs of legacy block 90-194. Pick one function in the Apps Script
 * menu and click Run; read the result in the Execution log.
 *
 * Functions to run:
 * - testKeyMeter: checks the monthly credits that /v1/key/info reports.
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