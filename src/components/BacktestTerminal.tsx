import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Award,
  DollarSign,
} from 'lucide-react';
import { BacktestMetrics, StrategyType, AssetInfo } from '../types/trading';
import { runStrategyBacktest } from '../services/backtestEngine';

interface BacktestTerminalProps {
  assets: AssetInfo[];
  language: 'ar' | 'en';
}

export const BacktestTerminal: React.FC<BacktestTerminalProps> = ({ assets, language }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>('Breakout Retest');
  const [selectedAsset, setSelectedAsset] = useState<string>('XAU/USD');
  const [tradeCount, setTradeCount] = useState<number>(60);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [metrics, setMetrics] = useState<BacktestMetrics>(() =>
    runStrategyBacktest('Breakout Retest', 'XAU/USD', 25000, 1.0, 60)
  );
  const [isRunning, setIsRunning] = useState(false);

  const isAr = language === 'ar';

  const strategies: { id: StrategyType; labelAr: string; labelEn: string }[] = [
    { id: 'Breakout Retest', labelAr: 'إعادة اختبار الاختراق (Breakout Retest)', labelEn: 'Breakout Retest' },
    { id: 'Trend Continuation', labelAr: 'استمرار الاتجاه المؤسسي (Trend Continuation)', labelEn: 'Trend Continuation' },
    { id: 'Liquidity Sweep', labelAr: 'سحب السيولة وOrder Blocks', labelEn: 'Liquidity Sweep' },
    { id: 'Scalping', labelAr: 'استراتيجية السكالبينج السريع (Scalping)', labelEn: 'Scalping' },
    { id: 'Range Trading', labelAr: 'تداول النطاقات العرضية (Range Trading)', labelEn: 'Range Trading' },
  ];

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runStrategyBacktest(selectedStrategy, selectedAsset, 25000, riskPercent, tradeCount);
      setMetrics(res);
      setIsRunning(false);
    }, 400);
  };

  // Equity Curve Chart scaling
  const minEquity = Math.min(...metrics.equityCurve.map((e) => e.equity)) * 0.98;
  const maxEquity = Math.max(...metrics.equityCurve.map((e) => e.equity)) * 1.02;
  const equityRange = maxEquity - minEquity || 1;
  const chartHeight = 180;
  const chartWidth = 600;

  const points = metrics.equityCurve
    .map((e, idx) => {
      const x = (idx / (metrics.equityCurve.length - 1)) * (chartWidth - 40) + 20;
      const y = chartHeight - ((e.equity - minEquity) / equityRange) * (chartHeight - 30) - 15;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="glass-panel rounded-xl p-4 shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-bold text-white">
              {isAr ? 'محرك الاختبار التاريخي المؤسسي (Backtesting & Walk-Forward Engine)' : 'Institutional Backtest Engine'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'محاكاة أداء الاستراتيجيات المؤسسية على البيانات التاريخية وحساب Sharpe و Sortino و Max Drawdown'
              : 'Quantitative backtesting simulation with risk-adjusted Sharpe/Sortino ratios and equity curve modeling'}
          </p>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={isRunning}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-orange-500/20 transition active:scale-95 disabled:opacity-50 border border-orange-400/40"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>{isRunning ? (isAr ? 'جاري المحاكاة...' : 'Simulating...') : isAr ? 'تشغيل المحاكاة الآن' : 'Run Backtest'}</span>
        </button>
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/[0.03] backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'الاستراتيجية المختبرة:' : 'Strategy:'}</label>
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value as StrategyType)}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-orange-500/50"
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {isAr ? s.labelAr : s.labelEn}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'الأصل / الزوج:' : 'Instrument:'}</label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-orange-500/50"
          >
            {assets.map((a) => (
              <option key={a.symbol} value={a.symbol} className="bg-slate-900 text-white">
                {a.symbol}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'عدد الصفقات في العينة:' : 'Sample Trade Count:'}</label>
          <input
            type="number"
            value={tradeCount}
            onChange={(e) => setTradeCount(Number(e.target.value) || 20)}
            min="20"
            max="200"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-orange-500/50 stat-value"
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'المخاطرة لكل صفقة (%):' : 'Risk Per Trade (%):'}</label>
          <input
            type="number"
            step="0.1"
            value={riskPercent}
            onChange={(e) => setRiskPercent(Number(e.target.value) || 1.0)}
            min="0.5"
            max="3.0"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-orange-500/50 stat-value"
          />
        </div>
      </div>

      {/* Institutional KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-center font-mono text-xs">
        <div className="bg-white/[0.03] backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="text-[10px] text-slate-400 uppercase tracking-tight">{isAr ? 'نسبة النجاح (Win Rate)' : 'Win Rate'}</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 stat-value">{metrics.winRate}%</div>
          <div className="text-[9px] text-slate-400 mt-0.5">{metrics.totalTrades} Trades</div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="text-[10px] text-slate-400 uppercase tracking-tight">{isAr ? 'معامل الربح (Profit Factor)' : 'Profit Factor'}</div>
          <div className="text-xl font-bold text-orange-300 mt-1 stat-value">{metrics.profitFactor}</div>
          <div className="text-[9px] text-slate-400 mt-0.5">&gt; 2.0 Institutional</div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="text-[10px] text-slate-400 uppercase tracking-tight">{isAr ? 'صافي الأرباح (Net Profit)' : 'Net Profit'}</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 stat-value">+${metrics.netProfit.toLocaleString()}</div>
          <div className="text-[9px] text-emerald-400 mt-0.5">
            +{(((metrics.finalBalance - metrics.initialBalance) / metrics.initialBalance) * 100).toFixed(1)}% ROI
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="text-[10px] text-slate-400 uppercase tracking-tight">{isAr ? 'أقصى تراجع (Max DD)' : 'Max Drawdown'}</div>
          <div className="text-xl font-bold text-rose-400 mt-1 stat-value">{metrics.maxDrawdown}%</div>
          <div className="text-[9px] text-slate-400 mt-0.5">Controlled Risk</div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="text-[10px] text-slate-400 uppercase tracking-tight">{isAr ? 'مؤشر شارب (Sharpe)' : 'Sharpe Ratio'}</div>
          <div className="text-xl font-bold text-orange-200 mt-1 stat-value">{metrics.sharpeRatio}</div>
          <div className="text-[9px] text-slate-400 mt-0.5">Annualized Risk Adj.</div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="text-[10px] text-slate-400 uppercase tracking-tight">{isAr ? 'مؤشر سورتينو (Sortino)' : 'Sortino Ratio'}</div>
          <div className="text-xl font-bold text-amber-300 mt-1 stat-value">{metrics.sortinoRatio}</div>
          <div className="text-[9px] text-slate-400 mt-0.5">Downside Protected</div>
        </div>
      </div>

      {/* Equity Curve SVG Chart */}
      <div className="bg-white/[0.03] backdrop-blur-md p-4 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'منحنى نمو رأس المال التراكمي (Equity Growth Curve)' : 'Cumulative Equity Curve'}</span>
          </span>
          <span className="font-mono text-slate-400">
            ${metrics.initialBalance.toLocaleString()} →{' '}
            <strong className="text-emerald-400 stat-value">${metrics.finalBalance.toLocaleString()}</strong>
          </span>
        </div>

        <div className="w-full h-[180px] relative">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
            {/* Grid */}
            <line x1={0} y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#ffffff" strokeDasharray="3 3" opacity={0.15} />

            {/* Gradient Fill */}
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <polygon
              points={`20,${chartHeight - 15} ${points} ${chartWidth - 20},${chartHeight - 15}`}
              fill="url(#equityGrad)"
            />

            {/* Polyline */}
            <polyline points={points} fill="none" stroke="#f97316" strokeWidth={2.5} />
          </svg>
        </div>
      </div>

      {/* Recent Simulated Trades Table */}
      <div className="bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-3 overflow-x-auto text-xs">
        <h4 className="font-bold text-white mb-2">{isAr ? 'سجل آخر الصفقات المنفذة في المحاكاة' : 'Simulated Trade Ledger'}</h4>
        <table className="w-full text-left rtl:text-right border-collapse font-mono">
          <thead className="text-[10px] text-slate-400 uppercase border-b border-white/10">
            <tr>
              <th className="py-1.5 px-2">#</th>
              <th className="py-1.5 px-2">{isAr ? 'الأصل' : 'Asset'}</th>
              <th className="py-1.5 px-2">{isAr ? 'النوع' : 'Type'}</th>
              <th className="py-1.5 px-2 text-right rtl:text-left">{isAr ? 'الدخول' : 'Entry'}</th>
              <th className="py-1.5 px-2 text-right rtl:text-left">{isAr ? 'الخروج' : 'Exit'}</th>
              <th className="py-1.5 px-2 text-center">{isAr ? 'النتيجة' : 'Result'}</th>
              <th className="py-1.5 px-2 text-right rtl:text-left">{isAr ? 'الربح/الخسارة' : 'PnL'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {metrics.trades.slice(-10).map((t) => (
              <tr key={t.id} className="hover:bg-white/5 transition">
                <td className="py-1.5 px-2 text-slate-500">{t.id}</td>
                <td className="py-1.5 px-2 text-slate-200 font-bold stat-value">{t.asset}</td>
                <td className="py-1.5 px-2">
                  <span className={t.direction === 'BUY' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{t.direction}</span>
                </td>
                <td className="py-1.5 px-2 text-right rtl:text-left text-slate-300 stat-value">${t.entry}</td>
                <td className="py-1.5 px-2 text-right rtl:text-left text-slate-300 stat-value">${t.exit}</td>
                <td className="py-1.5 px-2 text-center">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                      t.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {t.result}
                  </span>
                </td>
                <td
                  className={`py-1.5 px-2 text-right rtl:text-left font-bold stat-value ${
                    t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {t.pnl >= 0 ? '+' : ''}${t.pnl} ({t.pips >= 0 ? '+' : ''}{t.pips}p)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
