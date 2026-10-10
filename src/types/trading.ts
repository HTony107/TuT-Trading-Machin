export type AssetCategory = 'majors' | 'crosses' | 'metals' | 'indices' | 'crypto';

export type Timeframe = '1M' | '5M' | '15M' | '30M' | '1H' | '4H' | '1D' | '1W' | '1MN';

export type SignalDirection = 'BUY' | 'SELL' | 'WAIT' | 'NO_TRADE';

export type StrategyType =
  | 'Trend Continuation'
  | 'Breakout Retest'
  | 'Pullback'
  | 'Momentum Entry'
  | 'Mean Reversion'
  | 'Range Trading'
  | 'Support/Resistance Reversal'
  | 'Liquidity Sweep'
  | 'Order Block Retest'
  | 'FVG Fill'
  | 'Scalping'
  | 'News Momentum'
  | 'Gold Momentum';

export type OpportunityTier =
  | 'exceptional' // 90-100 🔥
  | 'high_probability' // 80-89 🟢
  | 'good' // 70-79 🟡
  | 'moderate' // 60-69 ⚠️
  | 'no_trade'; // < 60 🔴

export type MarketRegime =
  | 'Strong Bullish Trend'
  | 'Strong Bearish Trend'
  | 'Weak Trend'
  | 'Range / Consolidation'
  | 'High Volatility Expansion'
  | 'Low Volatility Compression'
  | 'Breakout Phase'
  | 'Breakout Retest'
  | 'Pullback'
  | 'Scalp Momentum'
  | 'News Driven'
  | 'Unstable / Low Liquidity';

export type NewsImpact = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export type PrimaryTrend =
  | 'Strong Bullish'
  | 'Bullish'
  | 'Neutral'
  | 'Weak Bearish'
  | 'Bearish'
  | 'Strong Bearish';

export interface PaperPosition {
  id: string;
  asset: string;
  direction: 'BUY' | 'SELL';
  lotSize: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  openTime: string;
  pnl: number;
  pips: number;
  strategy: string;
  status: 'OPEN' | 'CLOSED';
}

export type TradingSessionName = 'Asian' | 'London' | 'New York' | 'London/NY Overlap' | 'Market Closed';

export type OperatingMode =
  | 'MONITORING'
  | 'ANALYSIS'
  | 'SIGNAL'
  | 'SCALPING'
  | 'NEWS'
  | 'RISK'
  | 'REPORT'
  | 'BACKTEST'
  | 'PAPER_TRADING'
  | 'LIVE_SIMULATOR';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SupportResistanceZone {
  price: number;
  strength: number; // 0 to 100
  type: 'major_support' | 'minor_support' | 'major_resistance' | 'minor_resistance' | 'supply' | 'demand' | 'breakout' | 'retest';
  touches: number;
}

export interface OrderBlockZone {
  top: number;
  bottom: number;
  type: 'bullish_ob' | 'bearish_ob' | 'bullish_fvg' | 'bearish_fvg' | 'liquidity_sweep';
  timeframe: string;
  active: boolean;
}

export interface TechnicalSnapshot {
  ema9: number;
  ema20: number;
  ema50: number;
  ema100: number;
  ema200: number;
  sma50: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    hist: number;
  };
  stochastic: {
    k: number;
    d: number;
  };
  atr: number;
  adx: number;
  bollinger: {
    upper: number;
    mid: number;
    lower: number;
  };
  vwap: number;
}

export interface AssetInfo {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  bid: number;
  ask: number;
  spread: number; // in pips
  change24h: number; // %
  high24h: number;
  low24h: number;
  pipSize: number;
  digits: number;
  volatilityRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  primaryTrend: PrimaryTrend;
  regime: MarketRegime;
  tradeScore: number;
  direction: SignalDirection;
  activeStrategy: StrategyType;
  technicals: TechnicalSnapshot;
  candles: Candle[];
  supportZones: SupportResistanceZone[];
  resistanceZones: SupportResistanceZone[];
  orderBlocks: OrderBlockZone[];
}

export interface TradeSignal {
  id: string;
  asset: string;
  direction: SignalDirection;
  orderType: 'MARKET' | 'BUY_LIMIT' | 'BUY_STOP' | 'SELL_LIMIT' | 'SELL_STOP';
  strategy: StrategyType;
  timeframe: string;
  entryPrice: number;
  entryZone: [number, number];
  stopLoss: {
    price: number;
    pips: number;
    riskPercent: number;
    reason: string;
  };
  takeProfits: {
    tp1: { price: number; pips: number; rr: number; portion: string };
    tp2: { price: number; pips: number; rr: number; portion: string };
    tp3: { price: number; pips: number; rr: number; portion: string };
  };
  riskRewardRatio: number;
  tradeScore: number;
  tier: OpportunityTier;
  confidenceLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  confidencePercent: number;
  confluenceScore: number;
  marketRegime: string;
  newsRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  technicalReasoning: string;
  fundamentalReasoning: string;
  marketStructure: string;
  riskAssessment: string;
  invalidatingCondition: string;
  expiryTime: string;
  timestamp: string;
  scenarios: {
    bullish: string;
    bearish: string;
    baseCase: string;
  };
}

export interface EconomicNewsEvent {
  id: string;
  time: string;
  currency: string;
  country: string;
  title: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  actual?: string;
  forecast: string;
  previous: string;
  surprise: 'positive' | 'negative' | 'neutral' | 'pending';
  affectedAssets: string[];
  analysis: string;
}

export interface RiskSettings {
  accountBalance: number;
  riskModel: 'conservative' | 'balanced' | 'aggressive';
  riskPercentage: number; // e.g. 1%
  maxDailyLoss: number; // $
  maxWeeklyLoss: number; // $
  maxOpenTrades: number;
  maxPortfolioExposure: number; // in lots
  leverage: number; // e.g. 100:1
  emergencyKillSwitch: boolean;
  blockMartingale: boolean;
  currencyExposureLimits: {
    usd: number;
    eur: number;
    gbp: number;
    jpy: number;
    gold: number;
  };
}

export interface PaperTrade {
  id: string;
  asset: string;
  direction: 'BUY' | 'SELL';
  orderType: string;
  entryPrice: number;
  currentPrice: number;
  slPrice: number;
  tp1Price: number;
  tp2Price: number;
  tp3Price: number;
  lots: number;
  pnl: number;
  pnlPips: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  openTime: string;
  closeTime?: string;
  strategy: string;
  tradeScore: number;
  exitReason?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  time: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  strategy: string;
  entry: number;
  exit: number;
  sl: number;
  tp: number;
  result: 'WIN' | 'LOSS' | 'BE';
  pnl: number;
  pnlPips: number;
  rr: number;
  regime: string;
  confidence: string;
  notes: string;
}

export interface BacktestMetrics {
  totalTrades: number;
  winRate: number; // %
  profitFactor: number;
  expectancy: number; // $
  avgWin: number; // $
  avgLoss: number; // $
  maxDrawdown: number; // %
  sharpeRatio: number;
  sortinoRatio: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  netProfit: number; // $
  initialBalance: number;
  finalBalance: number;
  equityCurve: { trade: number; equity: number; drawdown: number }[];
  trades: {
    id: number;
    asset: string;
    direction: 'BUY' | 'SELL';
    entry: number;
    exit: number;
    result: 'WIN' | 'LOSS';
    pnl: number;
    pips: number;
    strategy: string;
  }[];
}

export interface CorrelationItem {
  pair1: string;
  pair2: string;
  coefficient: number; // -1.00 to +1.00
  description: string;
  warning?: string;
}
