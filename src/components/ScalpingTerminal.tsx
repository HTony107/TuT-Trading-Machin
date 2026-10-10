import React from 'react';
import {
  Activity,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { AssetInfo, TradeSignal } from '../types/trading';
import { scanScalpingOpportunities, ScalpOpportunity } from '../services/scalpingEngine';

interface ScalpingTerminalProps {
  assets: AssetInfo[];
  onSelectAsset: (asset: AssetInfo) => void;
  onExecuteTrade: (signal: TradeSignal) => void;
  language: 'ar' | 'en';
}

export const ScalpingTerminal: React.FC<ScalpingTerminalProps> = ({
  assets,
  onSelectAsset,
  onExecuteTrade,
  language,
}) => {
  const isAr = language === 'ar';
  const scalpOpps = scanScalpingOpportunities(assets, language);

  return (
    <div className="glass-panel rounded-xl p-4 shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-bold text-white">
              {isAr ? 'رادار السكالبينج فائق السرعة (High-Speed Scalping Desk)' : 'High-Speed Scalping Desk'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'فرص خاطفة على فريمات 1M و 5M تعتمد على ارتدادات VWAP وزخم EMA السريع والفوارق السعرية المنخفضة'
              : 'Rapid 1M/5M momentum scalps with strict VWAP alignment and ultra-tight risk bounds'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-slate-300 font-mono stat-value">
            {scalpOpps.length} {isAr ? 'فرصة نشطة حالياً' : 'Active Scalps'}
          </span>
        </div>
      </div>

      {/* Scalp Opportunities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scalpOpps.map((opp, idx) => {
          const correspondingAsset = assets.find((a) => a.symbol === opp.asset) || assets[0];
          const isBuy = opp.direction === 'BUY';

          return (
            <div
              key={idx}
              className="bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-4 hover:border-orange-500/40 transition shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectAsset(correspondingAsset)}
                      className="font-bold text-base text-white hover:text-orange-400 transition stat-value"
                    >
                      {opp.asset}
                    </button>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                        isBuy
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {opp.direction} (SCALP)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">{isAr ? 'السرعة:' : 'Duration:'}</span>
                    <span className="text-orange-400 font-semibold stat-value">{opp.expectedDuration}</span>
                  </div>
                </div>

                {/* Levels Grid */}
                <div className="grid grid-cols-3 gap-2 bg-black/30 backdrop-blur-sm p-2.5 rounded-lg border border-white/10 font-mono text-xs text-center mb-3">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-tight">{isAr ? 'سعر الدخول' : 'Entry'}</div>
                    <div className="font-bold text-cyan-300 stat-value">${opp.entryPrice}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-rose-400 uppercase tracking-tight">{isAr ? 'الوقف (SL)' : 'Stop'}</div>
                    <div className="font-bold text-rose-400 stat-value">
                      ${opp.slPrice} <span className="text-[9px] font-normal">(-{opp.slPips}p)</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-400 uppercase tracking-tight">{isAr ? 'الهدف (TP)' : 'Target'}</div>
                    <div className="font-bold text-emerald-400 stat-value">
                      ${opp.tpPrice} <span className="text-[9px] font-normal">(+{opp.tpPips}p)</span>
                    </div>
                  </div>
                </div>

                {/* Reasoning & Invalidation */}
                <div className="text-xs text-slate-300 mb-2 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-white/10">
                  <strong className="text-orange-300">{isAr ? 'الأساس الفني: ' : 'Technical Thesis: '}</strong>
                  {opp.reason}
                </div>

                <div className="text-[10px] text-slate-400 mb-3 bg-black/30 p-2 rounded-lg border border-white/10">
                  <strong className="text-slate-300">{isAr ? 'إلغاء السكالب: ' : 'Invalidation: '}</strong>
                  {opp.invalidation}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
                <div className="text-[11px] font-mono text-slate-400">
                  {isAr ? 'فارق السعر: ' : 'Spread: '}
                  <span className="text-emerald-400 font-bold stat-value">{opp.spreadCondition}</span>
                </div>

                <button
                  onClick={() => {
                    const dummySig: TradeSignal = {
                      id: `scalp-${opp.asset}-${Date.now().toString().slice(-4)}`,
                      asset: opp.asset,
                      direction: opp.direction,
                      orderType: 'MARKET',
                      strategy: 'Scalping',
                      timeframe: '5M Execution',
                      entryPrice: opp.entryPrice,
                      entryZone: [opp.entryPrice, opp.entryPrice],
                      stopLoss: {
                        price: opp.slPrice,
                        pips: opp.slPips,
                        riskPercent: 0.5,
                        reason: 'Tight VWAP-backed structural scalping stop',
                      },
                      takeProfits: {
                        tp1: { price: opp.tpPrice, pips: opp.tpPips, rr: opp.rrRatio, portion: '100% Full Take Profit' },
                        tp2: { price: opp.tpPrice, pips: opp.tpPips, rr: opp.rrRatio, portion: '100%' },
                        tp3: { price: opp.tpPrice, pips: opp.tpPips, rr: opp.rrRatio, portion: '100%' },
                      },
                      riskRewardRatio: opp.rrRatio,
                      tradeScore: opp.tradeScore,
                      tier: 'high_probability',
                      confidenceLevel: 'High',
                      confidencePercent: 88,
                      confluenceScore: 85,
                      marketRegime: 'Scalp Momentum',
                      newsRisk: 'LOW',
                      technicalReasoning: opp.reason,
                      fundamentalReasoning: 'Liquidity burst',
                      marketStructure: 'Fast 5M trend structure',
                      riskAssessment: '0.5% risk allocation on scalps',
                      invalidatingCondition: opp.invalidation,
                      expiryTime: '20 mins',
                      timestamp: new Date().toLocaleTimeString(),
                      scenarios: {
                        bullish: 'Rapid target hit',
                        bearish: 'VWAP rejection',
                        baseCase: 'Fast execution',
                      },
                    };
                    onExecuteTrade(dummySig);
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition active:scale-95 border border-orange-400/40"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تنفيذ فوري (Instant Scalp)' : 'Instant Scalp Order'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
