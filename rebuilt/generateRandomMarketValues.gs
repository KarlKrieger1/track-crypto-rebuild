const MAX_PRICE = 5;
const MAX_RANK = 34;
const MAX_VOLUME = 145;

/**
 * Returns random market values so the code can be tested without
 * spending API credits. Never use it when working with real data.
 *
 * @return {{price: number, rank: number, volume: number, sellOrBuyRatio: number}}
 */
function generateRandomMarketValues() {
  // 1 - random() is never 0, so the ratio below never divides by zero.
  const price = MAX_PRICE * (1 - Math.random());
  const rank = Math.round(Math.random() * MAX_RANK);
  const volume = Math.random() * MAX_VOLUME;

  return { price, rank, volume, sellOrBuyRatio: volume / price };
}