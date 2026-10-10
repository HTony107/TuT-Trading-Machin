import { AssetInfo, Candle, TechnicalSnapshot, TradingSessionName } from '../types/trading';

/**
 * Calculates current active Forex/Metals Trading Session based on UTC hour
 */
export function getCurrentTradingSession(utcHour: number = new Date().getUTCHours()): {
  session: TradingSessionName;
  description: string;
  isLondonNYOverlap: boolean;
  volatilityExpectation: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
} {
  // Asian Session: 00:00 - 08:00 UTC (Tokyo, Sydney)
  // London Session: 07:00 - 16:00 UTC
  // New York Session: 12:00 - 21:00 UTC
  // London/NY Overlap: 12:00 - 16:00 UTC (Peak institutional volume)
  if (utcHour >= 12 && utcHour < 16) {
    return {
      session: 'London/NY Overlap',
      description: 'Peak Institutional Liquidity & Volatility (London + NY simultaneous trading)',
      isLondonNYOverlap: true,
      volatilityExpectation: 'EXTREME',
    };
  } else if (utcHour >= 7 && utcHour < 16) {
    return {
      session: 'London',
      description: 'High European Institutional Order Flow (London Morning Session)',
      isLondonNYOverlap: false,
      volatilityExpectation: 'HIGH',
    };
  } else if (utcHour >= 16 && utcHour < 21) {
    return {
      session: 'New York',
      description: 'US Afternoon Liquidity & Fixing Flow',
      isLondonNYOverlap: false,
      volatilityExpectation: 'HIGH',
    };
  } else {
    return {
      session: 'Asian',
      description: 'Tokyo / Sydney Session (Range trading & Accumulation)',
      isLondonNYOverlap: false,
      volatilityExpectation: 'MEDIUM',
    };
  }
}

/**
 * Technical Indicator calculation suite
 */
export function computeRSI(candles: Candle[], period = 14): number {
  if (candles.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = candles.length - period; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - 100 / (1 + rs)).toFixed(1));
}

export function computeEMA(candles: Candle[], period: number): number {
  if (candles.length === 0) return 0;
  const k = 2 / (period + 1);
  let ema = candles[0].close;

  for (let i = 1; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
  }

  return Number(ema.toFixed(5));
}

export function computeSMA(candles: Candle[], period: number): number {
  if (candles.length < period) return candles[candles.length - 1]?.close || 0;
  const slice = candles.slice(-period);
  const sum = slice.reduce((acc, c) => acc + c.close, 0);
  return Number((sum / period).toFixed(5));
}

export function computeATR(candles: Candle[], period = 14): number {
  if (candles.length < 2) return 0.001;
  const trs: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const prev = candles[i - 1];
    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - prev.close),
      Math.abs(current.low - prev.close)
    );
    trs.push(tr);
  }

  const slice = trs.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return Number((sum / Math.min(period, slice.length)).toFixed(5));
}

export function computeBollingerBands(candles: Candle[], period = 20, multiplier = 2) {
  const sma = computeSMA(candles, period);
  if (candles.length < period) return { upper: sma * 1.01, mid: sma, lower: sma * 0.99 };

  const slice = candles.slice(-period);
  const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: Number((sma + stdDev * multiplier).toFixed(5)),
    mid: Number(sma.toFixed(5)),
    lower: Number((sma - stdDev * multiplier).toFixed(5)),
  };
}

export function computeMACD(candles: Candle[]) {
  const ema12 = computeEMA(candles, 12);
  const ema26 = computeEMA(candles, 26);
  const macd = ema12 - ema26;
  const signal = macd * 0.85; // approximation for dynamic calculation
  const hist = macd - signal;

  return {
    macd: Number(macd.toFixed(5)),
    signal: Number(signal.toFixed(5)),
    hist: Number(hist.toFixed(5)),
  };
}

export function computeVWAP(candles: Candle[]): number {
  if (candles.length === 0) return 0;
  let cumVolPrice = 0;
  let cumVol = 0;

  for (const c of candles) {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumVolPrice += typicalPrice * c.volume;
    cumVol += c.volume;
  }

  return cumVol > 0 ? Number((cumVolPrice / cumVol).toFixed(5)) : candles[candles.length - 1].close;
}

/**
 * Simulates real-time market tick with micro-movements, spreads, and OHLC bar evolution
 */
export function simulateMarketTick(asset: AssetInfo): AssetInfo {
  const isGold = asset.symbol.includes('XAU');
  const isJpy = asset.symbol.includes('JPY');
  const isCrypto = asset.category === 'crypto';
  const isIndex = asset.category === 'indices';

  // Base random tick increment scaled to asset price & volatility
  let tickFactor = asset.pipSize * (Math.random() - 0.485) * (asset.volatilityRating === 'HIGH' || asset.volatilityRating === 'EXTREME' ? 3.5 : 1.5);
  if (isGold) tickFactor *= 4.0;
  if (isIndex) tickFactor *= 3.0;
  if (isCrypto) tickFactor *= 10.0;

  const newPrice = Number(Math.max(asset.price + tickFactor, asset.pipSize * 10).toFixed(asset.digits));
  const halfSpread = (asset.spread * asset.pipSize) / 2;
  const bid = Number((newPrice - halfSpread).toFixed(asset.digits));
  const ask = Number((newPrice + halfSpread).toFixed(asset.digits));

  const high24h = Math.max(asset.high24h, newPrice);
  const low24h = Math.min(asset.low24h, newPrice);
  const change24h = Number((((newPrice - asset.candles[0]?.open) / (asset.candles[0]?.open || 1)) * 100).toFixed(2));

  // Update latest candle in sequence
  const candles = [...asset.candles];
  const lastCandle = candles[candles.length - 1];

  if (lastCandle) {
    lastCandle.close = newPrice;
    lastCandle.high = Math.max(lastCandle.high, newPrice);
    lastCandle.low = Math.min(lastCandle.low, newPrice);
    lastCandle.volume += Math.floor(Math.random() * 15 + 1);
  }

  // Recalculate indicators
  const rsi = computeRSI(candles, 14);
  const ema9 = computeEMA(candles, 9);
  const ema20 = computeEMA(candles, 20);
  const ema50 = computeEMA(candles, 50);
  const ema100 = computeEMA(candles, 100);
  const ema200 = computeEMA(candles, 200);
  const sma50 = computeSMA(candles, 50);
  const atr = computeATR(candles, 14);
  const bollinger = computeBollingerBands(candles, 20, 2);
  const macd = computeMACD(candles);
  const vwap = computeVWAP(candles);

  const updatedTechnicals: TechnicalSnapshot = {
    ema9,
    ema20,
    ema50,
    ema100,
    ema200,
    sma50,
    rsi,
    macd,
    stochastic: {
      k: Number(Math.min(95, Math.max(5, rsi + (Math.random() * 6 - 3))).toFixed(1)),
      d: Number(Math.min(95, Math.max(5, rsi - 2 + (Math.random() * 4 - 2))).toFixed(1)),
    },
    atr,
    adx: Number(Math.min(60, Math.max(12, asset.technicals.adx + (Math.random() * 0.4 - 0.2))).toFixed(1)),
    bollinger,
    vwap,
  };

  return {
    ...asset,
    price: newPrice,
    bid,
    ask,
    high24h,
    low24h,
    change24h,
    candles,
    technicals: updatedTechnicals,
  };
}
