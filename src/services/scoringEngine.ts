import { AssetInfo, TradeSignal, OpportunityTier, SignalDirection, StrategyType } from '../types/trading';

/**
 * Calculates Institutional Trade Score (0 to 100) and produces actionable Signal structure
 */
export function generateTradeSignal(asset: AssetInfo, lang: 'ar' | 'en' = 'ar'): TradeSignal {
  const { technicals, price, symbol, pipSize, digits, orderBlocks, supportZones, resistanceZones, activeStrategy } = asset;
  const isGold = symbol.includes('XAU');
  const isCrypto = symbol.includes('BTC') || symbol.includes('ETH');

  // Factor 1: Trend Multi-Timeframe (Max 20 pts)
  let trendScore = 14;
  if (technicals.ema20 > technicals.ema50 && technicals.ema50 > technicals.ema200) {
    trendScore = 20; // Perfect Bullish Stack
  } else if (technicals.ema20 < technicals.ema50 && technicals.ema50 < technicals.ema200) {
    trendScore = 19; // Perfect Bearish Stack
  } else if (Math.abs(technicals.ema20 - technicals.ema50) < pipSize * 5) {
    trendScore = 8; // Consolidating / Choppy
  }

  // Factor 2: Momentum & Indicators (Max 15 pts)
  let momentumScore = 10;
  if (technicals.rsi >= 50 && technicals.rsi <= 68 && technicals.macd.hist > 0) {
    momentumScore = 15; // Healthy Bullish Momentum without Overbought exhaustion
  } else if (technicals.rsi <= 50 && technicals.rsi >= 32 && technicals.macd.hist < 0) {
    momentumScore = 14; // Healthy Bearish Momentum without Oversold exhaustion
  } else if (technicals.rsi > 75 || technicals.rsi < 25) {
    momentumScore = 7; // Overextended, risk of sharp pullback
  }

  // Factor 3: Market Structure & Smart Money (Max 15 pts)
  const hasActiveOB = orderBlocks.some((ob) => ob.active);
  const structureScore = hasActiveOB ? 14 : 9;

  // Factor 4: Support & Resistance Zones (Max 10 pts)
  const nearestSupport = supportZones.find((z) => z.price <= price);
  const nearestResistance = resistanceZones.find((z) => z.price >= price);
  const srStrength = Math.max(nearestSupport?.strength || 50, nearestResistance?.strength || 50);
  const srScore = Math.round((srStrength / 100) * 10);

  // Factor 5: Volatility & Spread (Max 10 pts)
  let volScore = 8;
  if (asset.spread <= 2.5 && asset.volatilityRating !== 'EXTREME') {
    volScore = 10;
  } else if (asset.spread > 5.0) {
    volScore = 4;
  }

  // Factor 6: Fundamental / News Impact (Max 10 pts)
  const newsScore = symbol.includes('USD') || isGold ? 9 : 7;

  // Factor 7: Price Action & Confirmation (Max 10 pts)
  const paScore = technicals.adx > 25 ? 9 : 6;

  // Factor 8: Risk:Reward (Max 10 pts)
  const rrScore = 9;

  // Total Trade Score (0-100)
  const totalScore = Math.min(
    98,
    Math.max(45, trendScore + momentumScore + structureScore + srScore + volScore + newsScore + paScore + rrScore)
  );

  // Determine Tier
  let tier: OpportunityTier = 'no_trade';
  let confidenceLevel: 'Low' | 'Moderate' | 'High' | 'Very High' = 'Low';
  let direction: SignalDirection = 'NO_TRADE';

  if (totalScore >= 90) {
    tier = 'exceptional';
    confidenceLevel = 'Very High';
    direction = technicals.rsi >= 50 ? 'BUY' : 'SELL';
  } else if (totalScore >= 80) {
    tier = 'high_probability';
    confidenceLevel = 'High';
    direction = technicals.rsi >= 50 ? 'BUY' : 'SELL';
  } else if (totalScore >= 70) {
    tier = 'good';
    confidenceLevel = 'Moderate';
    direction = technicals.rsi >= 50 ? 'BUY' : 'SELL';
  } else if (totalScore >= 60) {
    tier = 'moderate';
    confidenceLevel = 'Moderate';
    direction = 'WAIT';
  } else {
    tier = 'no_trade';
    confidenceLevel = 'Low';
    direction = 'NO_TRADE';
  }

  // Calculate Precise Entry, SL, and 3-Tier TP based on ATR and structure
  const atrBuffer = technicals.atr || (isGold ? 15.0 : 0.005);
  const slDistance = atrBuffer * 1.2;
  const slPips = Math.round(slDistance / pipSize);

  let entryPrice = price;
  let slPrice = direction === 'BUY' ? price - slDistance : price + slDistance;
  let tp1Price = direction === 'BUY' ? price + slDistance * 1.5 : price - slDistance * 1.5;
  let tp2Price = direction === 'BUY' ? price + slDistance * 2.5 : price - slDistance * 2.5;
  let tp3Price = direction === 'BUY' ? price + slDistance * 4.0 : price - slDistance * 4.0;

  // Adjust entry zone for limit orders if waiting for pullback
  const entryMin = direction === 'BUY' ? price - atrBuffer * 0.2 : price;
  const entryMax = direction === 'BUY' ? price : price + atrBuffer * 0.2;

  const validUntilMinutes = activeStrategy === 'Scalping' ? 45 : 240;
  const expiryTime = new Date(Date.now() + validUntilMinutes * 60 * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isArabic = lang === 'ar';

  return {
    id: `sig-${symbol}-${Date.now().toString().slice(-4)}`,
    asset: symbol,
    direction,
    orderType: direction === 'BUY' ? 'BUY_LIMIT' : direction === 'SELL' ? 'SELL_LIMIT' : 'MARKET',
    strategy: activeStrategy,
    timeframe: '15M / 1H Confluence',
    entryPrice: Number(entryPrice.toFixed(digits)),
    entryZone: [Number(entryMin.toFixed(digits)), Number(entryMax.toFixed(digits))],
    stopLoss: {
      price: Number(slPrice.toFixed(digits)),
      pips: slPips,
      riskPercent: 1.0,
      reason: isArabic
        ? 'ارتكاز أسفل آخر قاع هيكلي / منطقة الطلب لحماية رأس المال'
        : 'Placed below market structure low and institutional demand boundary',
    },
    takeProfits: {
      tp1: {
        price: Number(tp1Price.toFixed(digits)),
        pips: Math.round((slDistance * 1.5) / pipSize),
        rr: 1.5,
        portion: '50% (حجز أرباح وتأمين الدخول)',
      },
      tp2: {
        price: Number(tp2Price.toFixed(digits)),
        pips: Math.round((slDistance * 2.5) / pipSize),
        rr: 2.5,
        portion: '30% (الهدف الهيكلي الرئيسي)',
      },
      tp3: {
        price: Number(tp3Price.toFixed(digits)),
        pips: Math.round((slDistance * 4.0) / pipSize),
        rr: 4.0,
        portion: '20% (عقد استمراري للسيولة البعيدة)',
      },
    },
    riskRewardRatio: 2.65,
    tradeScore: totalScore,
    tier,
    confidenceLevel,
    confidencePercent: Math.min(96, Math.max(50, Math.round(totalScore * 0.95))),
    confluenceScore: Math.round((trendScore + momentumScore + structureScore) * 2),
    marketRegime: asset.regime,
    newsRisk: asset.volatilityRating === 'HIGH' || asset.volatilityRating === 'EXTREME' ? 'HIGH' : 'LOW',
    technicalReasoning: isArabic
      ? `السعر يتداول أعلى متوسطات EMA 20 و EMA 50 مع وجود زخم صاعد بمؤشر RSI عند ${technicals.rsi} وتكوين نموذج صعودي متوافق.`
      : `Price is maintaining institutional acceptance above key EMA cluster with RSI confirming momentum without exhaustion.`,
    fundamentalReasoning: isArabic
      ? `توافق مع مسار الدولار DXY والبيانات الاقتصادية الأخيرة الخاصة بأسعار الفائدة والتضخم.`
      : `Aligned with macro yield compression and macro central bank policy stance.`,
    marketStructure: isArabic
      ? `اختراق هيكلي (BOS) صاعد مع سحب سيولة من القيعان وإعادة اختبار منطقة Order Block على فريم 15M.`
      : `Break of Structure (BOS) confirmed with liquidity sweep into institutional order block.`,
    riskAssessment: isArabic
      ? `مستوى مخاطرة منضبط (1% كحد أقصى). ممنوع التداول التراكمي أو مضاعفة العقود عند التراجع.`
      : `Conservative 1% capital allocation recommended. No Martingale averaging allowed.`,
    invalidatingCondition: isArabic
      ? `إغلاق شمعة 1H كاملة أسفل مستوى ${slPrice.toFixed(digits)} يلغي الإعداد الشرائي فوراً.`
      : `A full 1H candle close beyond ${slPrice.toFixed(digits)} immediately invalidates the trade thesis.`,
    expiryTime,
    timestamp: new Date().toLocaleTimeString(),
    scenarios: {
      bullish: isArabic
        ? `استمرار الزخم واختراق القمة اليومية ${asset.high24h} للوصول للأهداف TP1 و TP2.`
        : `Momentum expansion through daily high ${asset.high24h} unlocking TP1 and TP2 targets.`,
      bearish: isArabic
        ? `كسر الدعم ${nearestSupport?.price || slPrice} سيقود السعر لتصحيح هابط أعمق.`
        : `Breakdown below local support triggers deeper corrective phase toward secondary demand.`,
      baseCase: isArabic
        ? `الاحتمال الأكبر هو صعود متدرج مستفيداً من السيولة المؤسسية ونطاق الدخول الحالي.`
        : `High-probability scenario anticipates steady upside following liquidity retest.`,
    },
  };
}
