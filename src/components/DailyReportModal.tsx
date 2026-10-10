import React from 'react';
import {
  X,
  FileText,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Flame,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AssetInfo, TradeSignal } from '../types/trading';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: AssetInfo[];
  signals: TradeSignal[];
  language: 'ar' | 'en';
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  assets,
  signals,
  language,
}) => {
  const [copied, setCopied] = React.useState(false);
  const isAr = language === 'ar';

  if (!isOpen) return null;

  const topSignals = signals.filter((s) => s.tier === 'exceptional' || s.tier === 'high_probability').slice(0, 4);
  const goldAsset = assets.find((a) => a.symbol.includes('XAU'));
  const dxyAsset = assets.find((a) => a.symbol.includes('DXY'));

  const handleCopy = () => {
    const textContent = `SMART AI TRADING AGENT — INSTITUTIONAL DAILY BRIEFING\nDate: ${new Date().toLocaleDateString()}\nSession: London/New York Overlap\n\nEXECUTIVE SUMMARY:\n- Gold (XAU/USD): $${goldAsset?.price} (${goldAsset?.primaryTrend})\n- US Dollar (DXY): ${dxyAsset?.price} (${dxyAsset?.primaryTrend})\n\nTOP ACTIONABLE SETUPS:\n${topSignals
      .map(
        (s) =>
          `* ${s.asset} [${s.direction}] | Score: ${s.tradeScore}/100 | Entry: ${s.entryPrice} | SL: ${s.stopLoss.price} | TP1: ${s.takeProfits.tp1.price} | R:R: 1:${s.riskRewardRatio}\n  Invalidation: ${s.invalidatingCondition}`
      )
      .join('\n\n')}\n\nRISK DIRECTIVE: Maximum 1% risk per trade. No Martingale averaging allowed.`;

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel-elevated rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/20">
        {/* Modal Header */}
        <div className="p-4 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="font-bold text-white text-base">
                {isAr ? 'التقرير الاستخباراتي اليومي المؤسسي (Institutional Daily Intelligence Brief)' : 'Institutional Daily Intelligence Brief'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {new Date().toUTCString()} • Smart AI Trading Agent v1.0
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-lg border border-white/10 flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-orange-400" />}
              <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'نسخ التقرير' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-lg border border-white/10 flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>{isAr ? 'طباعة' : 'Print'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Report Document */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-xs leading-relaxed font-sans">
          {/* Section 1: Executive Market Summary */}
          <div className="bg-white/[0.03] backdrop-blur-md p-4 rounded-xl border border-white/10">
            <h4 className="font-bold text-sm text-orange-400 mb-2 uppercase tracking-wide">
              1. {isAr ? 'ملخص السوق التنفيذي (Executive Macro Summary)' : 'Executive Macro Summary'}
            </h4>
            <p className="text-slate-300">
              {isAr
                ? `تشهد الأسواق استقراراً مؤسسياً مع ترقب مسار الفائدة الأمريكية. يتداول الذهب (XAU/USD) حالياً عند مستويات $${goldAsset?.price.toFixed(
                    2
                  )} مع زخم ${goldAsset?.primaryTrend}، في حين يظهر مؤشر الدولار DXY عند ${dxyAsset?.price.toFixed(
                    2
                  )} ضغوطاً بيعية تدعم استمرار الصعود في المعادن والعملات الرئيسية مثل EUR/USD و GBP/USD.`
                : `Markets are exhibiting structured institutional flow. Gold (XAU/USD) is holding firm at $${goldAsset?.price.toFixed(
                    2
                  )} exhibiting a ${goldAsset?.primaryTrend} regime. The US Dollar Index (DXY) at ${dxyAsset?.price.toFixed(
                    2
                  )} is maintaining bearish pressure, providing macro tailwinds for risk assets and Precious Metals.`}
            </p>
          </div>

          {/* Section 2: Actionable Institutional Opportunities */}
          <div>
            <h4 className="font-bold text-sm text-orange-400 mb-3 uppercase tracking-wide">
              2. {isAr ? 'أفضل الإعدادات التنفيذية القابلة للتطبيق (Actionable Setups)' : 'Top Actionable Setups'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              {topSignals.map((sig) => (
                <div key={sig.id} className="bg-white/[0.03] backdrop-blur-md p-3.5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm stat-value">{sig.asset}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                        sig.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {sig.direction} (Score: {sig.tradeScore}/100)
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <div>Entry: <strong className="text-cyan-300 stat-value">${sig.entryPrice}</strong></div>
                    <div>Stop Loss: <strong className="text-rose-400 stat-value">${sig.stopLoss.price}</strong> (-{sig.stopLoss.pips}p)</div>
                    <div>Target TP1: <strong className="text-emerald-400 stat-value">${sig.takeProfits.tp1.price}</strong> (+{sig.takeProfits.tp1.pips}p)</div>
                    <div>Target TP2: <strong className="text-emerald-300 stat-value">${sig.takeProfits.tp2.price}</strong> (+{sig.takeProfits.tp2.pips}p)</div>
                    <div>R:R Ratio: <strong className="text-orange-300 stat-value">1:{sig.riskRewardRatio}</strong></div>
                  </div>

                  <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-white/10 font-sans">
                    <strong>Invalidation: </strong> {sig.invalidatingCondition}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Risk Management Directive */}
          <div className="bg-white/[0.03] backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-emerald-400 uppercase tracking-wide mb-1">
                3. {isAr ? 'توجيهات إدارة المخاطر المؤسسية' : 'Risk Management Directive'}
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                {isAr
                  ? 'الالتزام الصارم بمخاطرة لا تتجاوز 1% من رأس المال لكل صفقة. الالتزام بحجز 50% من الأرباح عند الهدف الأول (TP1) ونقل وقف الخسارة فوراً إلى نقطة الدخول (Break-Even). يمنع منعاً باتاً التعزيز التنازلي (Averaging Down).'
                  : 'Strict 1% maximum capital allocation per execution. Secure 50% partial profits at TP1 and immediately trail Stop Loss to Break-Even. Martingale averaging is strictly forbidden.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/40 backdrop-blur-md border-t border-white/10 text-center text-slate-400 text-[11px]">
          Smart AI Trading Agent Institutional Intelligence Suite • Confidential & Proprietary
        </div>
      </div>
    </div>
  );
};
