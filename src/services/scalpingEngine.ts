import { AssetInfo, TradeSignal } from '../types/trading';

export interface ScalpOpportunity {
  asset: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  slPrice: number;
  tpPrice: number;
  slPips: number;
  tpPips: number;
  rrRatio: number;
  expectedDuration: string;
  spreadCondition: 'Optimal' | 'Acceptable' | 'Too High';
  vwapDistance: number;
  tradeScore: number;
  reason: string;
  invalidation: string;
}

/**
 * High-Speed Scalping Engine for 1M / 5M timeframes
 */
export function scanScalpingOpportunities(assets: AssetInfo[], lang: 'ar' | 'en' = 'ar'): ScalpOpportunity[] {
  const opportunities: ScalpOpportunity[] = [];
  const isAr = lang === 'ar';

  for (const asset of assets) {
    // Only scalp liquid assets with tight spread
    if (asset.spread > 4.5 && !asset.symbol.includes('BTC')) continue;

    const { price, technicals, pipSize, digits, symbol } = asset;
    const isGold = symbol.includes('XAU');

    const vwapDiff = price - technicals.vwap;
    const isAboveVwap = vwapDiff > 0;
    const emaFastCross = technicals.ema9 > technicals.ema20;

    const targetPips = isGold ? 45 : 12;
    const slPips = isGold ? 25 : 7;

    const slDistance = slPips * pipSize;
    const tpDistance = targetPips * pipSize;

    if (isAboveVwap && emaFastCross && technicals.rsi >= 52 && technicals.rsi <= 70) {
      // Long Scalp Setup
      const entry = price;
      const sl = price - slDistance;
      const tp = price + tpDistance;

      opportunities.push({
        asset: symbol,
        direction: 'BUY',
        entryPrice: Number(entry.toFixed(digits)),
        slPrice: Number(sl.toFixed(digits)),
        tpPrice: Number(tp.toFixed(digits)),
        slPips,
        tpPips: targetPips,
        rrRatio: Number((targetPips / slPips).toFixed(2)),
        expectedDuration: '5–20 دقيقة (1M/5M Execution)',
        spreadCondition: asset.spread <= 2.5 ? 'Optimal' : 'Acceptable',
        vwapDistance: Number((vwapDiff / pipSize).toFixed(1)),
        tradeScore: Math.min(95, Math.round(asset.tradeScore + 4)),
        reason: isAr
          ? `ارتداد سريع من متوسط VWAP مع تقاطع إيجابي لـ EMA 9/20 على فريم 5 دقائق وزخم RSI صحي.`
          : `VWAP bounce and EMA 9/20 momentum thrust on 5M timeframe with positive RSI acceleration.`,
        invalidation: isAr
          ? `كسر أسفل VWAP عند ${technicals.vwap.toFixed(digits)} يلغي فرصة السكالبينج فوراً.`
          : `Break below VWAP at ${technicals.vwap.toFixed(digits)} cancels the scalp immediately.`,
      });
    } else if (!isAboveVwap && !emaFastCross && technicals.rsi <= 48 && technicals.rsi >= 30) {
      // Short Scalp Setup
      const entry = price;
      const sl = price + slDistance;
      const tp = price - tpDistance;

      opportunities.push({
        asset: symbol,
        direction: 'SELL',
        entryPrice: Number(entry.toFixed(digits)),
        slPrice: Number(sl.toFixed(digits)),
        tpPrice: Number(tp.toFixed(digits)),
        slPips,
        tpPips: targetPips,
        rrRatio: Number((targetPips / slPips).toFixed(2)),
        expectedDuration: '5–20 دقيقة (1M/5M Execution)',
        spreadCondition: asset.spread <= 2.5 ? 'Optimal' : 'Acceptable',
        vwapDistance: Number((Math.abs(vwapDiff) / pipSize).toFixed(1)),
        tradeScore: Math.min(95, Math.round(asset.tradeScore + 3)),
        reason: isAr
          ? `رفض هبوطي من VWAP مع تقاطع سلبي لمتوسطات الزخم على فريم 5 دقائق.`
          : `Bearish rejection from VWAP with downward EMA slope on 5M timeframe.`,
        invalidation: isAr
          ? `إغلاق شمعة 5M أعلى VWAP عند ${technicals.vwap.toFixed(digits)} يلغي الصفقة.`
          : `5M close above VWAP at ${technicals.vwap.toFixed(digits)} invalidates the setup.`,
      });
    }
  }

  return opportunities.sort((a, b) => b.tradeScore - a.tradeScore);
}
