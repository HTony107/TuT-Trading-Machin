import { RiskSettings, AssetInfo } from '../types/trading';

export const DEFAULT_RISK_SETTINGS: RiskSettings = {
  accountBalance: 25000,
  riskModel: 'conservative',
  riskPercentage: 1.0, // 1% per trade
  maxDailyLoss: 1250, // 5% max daily drawdown limit
  maxWeeklyLoss: 2500, // 10% weekly limit
  maxOpenTrades: 3,
  maxPortfolioExposure: 5.0, // max 5 standard lots total
  leverage: 100,
  emergencyKillSwitch: false,
  blockMartingale: true,
  currencyExposureLimits: {
    usd: 3.0,
    eur: 2.0,
    gbp: 2.0,
    jpy: 2.0,
    gold: 1.5,
  },
};

/**
 * Calculates exact institutional lot size based on account balance, risk %, and stop loss distance
 */
export function calculatePositionSize(
  balance: number,
  riskPercentage: number,
  slPips: number,
  asset: AssetInfo
): {
  lotSize: number;
  riskAmount: number;
  pipValue: number;
  marginRequired: number;
  warning?: string;
} {
  const isGold = asset.symbol.includes('XAU');
  const isSilver = asset.symbol.includes('XAG');
  const isCrypto = asset.category === 'crypto';
  const isIndex = asset.category === 'indices';

  const riskAmount = (balance * (riskPercentage / 100));

  // Value per pip per 1 standard lot (approximate standards in USD base)
  let pipValuePerLot = 10.0; // standard Forex pair (EUR/USD, GBP/USD, etc.)
  if (isGold) pipValuePerLot = 10.0; // 1 lot Gold ($0.01 pip = $1, $1 move = $100)
  if (isSilver) pipValuePerLot = 50.0;
  if (isIndex) pipValuePerLot = 1.0;
  if (isCrypto) pipValuePerLot = 1.0;

  if (slPips <= 0) {
    return {
      lotSize: 0.01,
      riskAmount,
      pipValue: 0.1,
      marginRequired: 50,
      warning: 'Invalid Stop Loss distance',
    };
  }

  // Calculated standard lots = Risk Amount / (SL Pips * Pip Value Per Lot)
  const rawLots = riskAmount / (slPips * pipValuePerLot);
  const lotSize = Math.max(0.01, Number(rawLots.toFixed(2)));

  // Estimated Margin required (assuming 1:100 leverage)
  const marginRequired = Math.round((asset.price * (lotSize * (isGold ? 100 : 100000))) / 100);

  let warning: string | undefined;
  if (lotSize > 3.0) {
    warning = 'High position size! Consider reducing risk percentage.';
  }

  return {
    lotSize,
    riskAmount: Number(riskAmount.toFixed(2)),
    pipValue: Number((lotSize * pipValuePerLot).toFixed(2)),
    marginRequired,
    warning,
  };
}

/**
 * Checks portfolio-level exposure to prevent correlated overexposure (e.g. multiple USD shorts)
 */
export function evaluatePortfolioRisk(
  openPositions: { asset: string; direction: 'BUY' | 'SELL'; lots: number }[],
  settings: RiskSettings
): {
  totalLots: number;
  usdExposure: number;
  goldExposure: number;
  isOverexposed: boolean;
  statusMessage: string;
} {
  let totalLots = 0;
  let usdExposure = 0;
  let goldExposure = 0;

  for (const pos of openPositions) {
    totalLots += pos.lots;
    if (pos.asset.includes('USD')) {
      usdExposure += pos.lots;
    }
    if (pos.asset.includes('XAU')) {
      goldExposure += pos.lots;
    }
  }

  const isOverexposed = totalLots > settings.maxPortfolioExposure || usdExposure > settings.currencyExposureLimits.usd;

  let statusMessage = 'Risk Parameters Optimal. Balanced Exposure.';
  if (isOverexposed) {
    statusMessage = '⚠️ Overexposure Warning: High correlated USD or total lot exposure detected!';
  } else if (openPositions.length >= settings.maxOpenTrades) {
    statusMessage = 'Max concurrent trades limit reached. New signal execution paused.';
  }

  return {
    totalLots: Number(totalLots.toFixed(2)),
    usdExposure: Number(usdExposure.toFixed(2)),
    goldExposure: Number(goldExposure.toFixed(2)),
    isOverexposed,
    statusMessage,
  };
}
