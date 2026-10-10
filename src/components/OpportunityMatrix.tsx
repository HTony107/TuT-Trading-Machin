import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Shield,
  Layers,
  ArrowRight,
  Zap,
  Target,
  Clock,
  BarChart2,
} from 'lucide-react';
import { AssetInfo, TradeSignal, OpportunityTier } from '../types/trading';
import { generateTradeSignal } from '../services/scoringEngine';

interface OpportunityMatrixProps {
  assets: AssetInfo[];
  onSelectAsset: (asset: AssetInfo) => void;
  onExecuteTrade: (signal: TradeSignal) => void;
  language: 'ar' | 'en';
}

export const OpportunityMatrix: React.FC<OpportunityMatrixProps> = ({
  assets,
  onSelectAsset,
  onExecuteTrade,
  language,
}) => {
  const [selectedTier, setSelectedTier] = useState<OpportunityTier | 'all'>('all');
  const isAr = language === 'ar';

  // Compute live signals for all assets
  const signals: TradeSignal[] = assets
    .map((asset) => generateTradeSignal(asset, language))
    .sort((a, b) => b.tradeScore - a.tradeScore);

  const filteredSignals = signals.filter((sig) => {
    if (selectedTier === 'all') return true;
    return sig.tier === selectedTier;
  });

  const tierCounts = {
    exceptional: signals.filter((s) => s.tier === 'exceptional').length,
    high_probability: signals.filter((s) => s.tier === 'high_probability').length,
    good: signals.filter((s) => s.tier === 'good').length,
    moderate: signals.filter((s) => s.tier === 'moderate').length,
    no_trade: signals.filter((s) => s.tier === 'no_trade').length,
  };

  return (
    <div className="glass-panel rounded-xl p-4 shadow-2xl flex flex-col gap-4">
      {/* Header & Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-bold text-white">
              {isAr ? 'مصفوفة الفرص المؤسسية (Opportunity Matrix)' : 'Institutional Opportunity Matrix'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'تصنيف الفرص وفق نموذج النقاط الكمي الشامل (0 - 100) مع شروط الإلغاء ونسب المخاطرة للعائد'
              : 'Ranked algorithmic opportunities with precise Entry/SL/TP confluence and invalidation triggers'}
          </p>
        </div>

        {/* Tier Selector Pills */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedTier('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
              selectedTier === 'all'
                ? 'bg-orange-500 text-slate-950 font-bold border-orange-400/40 signal-glow-orange'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
            }`}
          >
            {isAr ? 'الكل' : 'All'} ({signals.length})
          </button>

          <button
            onClick={() => setSelectedTier('exceptional')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
              selectedTier === 'exceptional'
                ? 'bg-orange-500 text-slate-950 font-bold border-orange-400/40 signal-glow-orange'
                : 'bg-orange-500/10 text-orange-300 border-orange-500/30 hover:bg-orange-500/20'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isAr ? 'استثنائية (90-100)' : 'Exceptional'}</span>
            <span className="font-mono font-bold">({tierCounts.exceptional})</span>
          </button>

          <button
            onClick={() => setSelectedTier('high_probability')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
              selectedTier === 'high_probability'
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400/40 signal-glow-emerald'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'عالية الاحتمالية (80-89)' : 'High Prob'}</span>
            <span className="font-mono font-bold">({tierCounts.high_probability})</span>
          </button>

          <button
            onClick={() => setSelectedTier('good')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
              selectedTier === 'good'
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400/40'
                : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20'
            }`}
          >
            <span>{isAr ? 'جيدة (70-79)' : 'Good'}</span>
            <span className="font-mono font-bold"> ({tierCounts.good})</span>
          </button>

          <button
            onClick={() => setSelectedTier('no_trade')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
              selectedTier === 'no_trade'
                ? 'bg-rose-500 text-slate-950 font-bold border-rose-400/40'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            <span>{isAr ? 'تجنب التداول (<60)' : 'No Trade'}</span>
            <span className="font-mono font-bold"> ({tierCounts.no_trade})</span>
          </button>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSignals.map((signal) => {
          const correspondingAsset = assets.find((a) => a.symbol === signal.asset) || assets[0];
          const isExceptional = signal.tier === 'exceptional';
          const isHighProb = signal.tier === 'high_probability';
          const isBuy = signal.direction === 'BUY';
          const isNoTrade = signal.direction === 'NO_TRADE' || signal.direction === 'WAIT';

          return (
            <div
              key={signal.id}
              className={`bg-white/[0.03] backdrop-blur-md rounded-xl border p-4 flex flex-col justify-between transition-all hover:shadow-xl hover:border-white/20 ${
                isExceptional
                  ? 'border-orange-500/40 signal-glow-orange ring-1 ring-orange-500/30'
                  : isHighProb
                  ? 'border-emerald-500/30 signal-glow-emerald'
                  : 'border-white/10'
              }`}
            >
              <div>
                {/* Card Top: Asset Symbol, Direction, Trade Score */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectAsset(correspondingAsset)}
                      className="font-bold text-base text-white hover:text-orange-400 transition stat-value"
                    >
                      {signal.asset}
                    </button>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                        isBuy
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : signal.direction === 'SELL'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-white/5 text-slate-400 border-white/10'
                      }`}
                    >
                      {signal.direction}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[10px] text-slate-400 uppercase">{isAr ? 'النقاط' : 'Score'}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-sm stat-value border ${
                        isExceptional
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : isHighProb
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-slate-300 border-white/10'
                      }`}
                    >
                      {signal.tradeScore}/100
                    </span>
                  </div>
                </div>

                {/* Strategy & Market Regime Badge */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-orange-300 border border-white/10 font-semibold">
                    {signal.strategy}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
                    {signal.marketRegime}
                  </span>
                </div>

                {/* Price Matrix Parameters */}
                {!isNoTrade ? (
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2.5 border border-white/10 mb-3 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">{isAr ? 'نطاق الدخول:' : 'Entry Zone:'}</span>
                      <span className="font-bold text-cyan-300 stat-value">${signal.entryPrice}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 text-[11px]">{isAr ? 'وقف الخسارة (SL):' : 'Stop Loss:'}</span>
                      <span className="font-bold text-rose-400 stat-value">
                        ${signal.stopLoss.price} <span className="text-[10px] text-slate-400 font-normal">(-{signal.stopLoss.pips}p)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 text-[11px]">{isAr ? 'الهدف TP1 (50%):' : 'Target TP1:'}</span>
                      <span className="font-bold text-emerald-400 stat-value">
                        ${signal.takeProfits.tp1.price} <span className="text-[10px] text-slate-400 font-normal">(+{signal.takeProfits.tp1.pips}p)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-300 text-[11px]">{isAr ? 'الهدف TP2 (30%):' : 'Target TP2:'}</span>
                      <span className="font-bold text-emerald-300 stat-value">
                        ${signal.takeProfits.tp2.price} <span className="text-[10px] text-slate-400 font-normal">(+{signal.takeProfits.tp2.pips}p)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[11px]">
                      <span className="text-slate-400">{isAr ? 'نسبة R:R:' : 'R:R Ratio:'}</span>
                      <span className="text-orange-300 font-bold stat-value">1:{signal.riskRewardRatio}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/30 rounded-lg p-3 border border-white/10 mb-3 text-xs text-slate-400 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>
                      {isAr
                        ? 'شروط الدخول غير مكتملة حالياً (تذبذب أو تضارب في مؤشرات الزخم). يوصى بالانتظار.'
                        : 'Confluence score below threshold. No trade recommended in current choppy condition.'}
                    </span>
                  </div>
                )}

                {/* Invalidation Rule */}
                <div className="text-[10px] text-slate-400 mb-3 bg-black/30 p-2 rounded-lg border border-white/10 leading-relaxed">
                  <strong className="text-orange-300">{isAr ? 'إلغاء الفكرة: ' : 'Invalidation: '}</strong>
                  {signal.invalidatingCondition}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => onSelectAsset(correspondingAsset)}
                  className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border border-white/10 transition"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isAr ? 'عرض الشارت' : 'Inspect Chart'}</span>
                </button>

                {!isNoTrade && (
                  <button
                    onClick={() => onExecuteTrade(signal)}
                    className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 transition active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تنفيذ تجريبي' : 'Paper Trade'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
