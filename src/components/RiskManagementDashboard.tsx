import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Sliders,
  DollarSign,
  AlertTriangle,
  Lock,
  Zap,
  Info,
  Scale,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { AssetInfo, RiskSettings } from '../types/trading';
import { calculatePositionSize, DEFAULT_RISK_SETTINGS } from '../services/riskEngine';
import { CORRELATION_MATRIX } from '../data/marketData';

interface RiskManagementDashboardProps {
  assets: AssetInfo[];
  selectedAsset: AssetInfo;
  riskSettings: RiskSettings;
  onUpdateRiskSettings: (settings: RiskSettings) => void;
  language: 'ar' | 'en';
}

export const RiskManagementDashboard: React.FC<RiskManagementDashboardProps> = ({
  assets,
  selectedAsset,
  riskSettings,
  onUpdateRiskSettings,
  language,
}) => {
  const [calcAsset, setCalcAsset] = useState<AssetInfo>(selectedAsset);
  const [calcSlPips, setCalcSlPips] = useState<number>(
    selectedAsset.symbol.includes('XAU') ? 35 : 20
  );
  const [customRiskPercent, setCustomRiskPercent] = useState<number>(riskSettings.riskPercentage);

  const isAr = language === 'ar';

  const positionCalculation = calculatePositionSize(
    riskSettings.accountBalance,
    customRiskPercent,
    calcSlPips,
    calcAsset
  );

  const handleModelChange = (model: 'conservative' | 'balanced' | 'aggressive') => {
    let riskPct = 1.0;
    if (model === 'conservative') riskPct = 0.75;
    if (model === 'balanced') riskPct = 1.5;
    if (model === 'aggressive') riskPct = 2.5;

    setCustomRiskPercent(riskPct);
    onUpdateRiskSettings({
      ...riskSettings,
      riskModel: model,
      riskPercentage: riskPct,
    });
  };

  return (
    <div className="glass-panel rounded-xl p-4 shadow-2xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              {isAr ? 'مركز إدارة المخاطر المؤسسي (Risk Management & Exposure Engine)' : 'Institutional Risk & Exposure Center'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'حساب أحجام العقود الدقيقة (Lot Sizer)، مراقبة مصفوفة الارتباط، ومنع التداول الانتقامي أو مضاعفات مارتينجال'
              : 'Institutional lot sizing, anti-martingale protection, and multi-asset correlation monitoring'}
          </p>
        </div>

        {/* Emergency Kill Switch */}
        <button
          onClick={() =>
            onUpdateRiskSettings({
              ...riskSettings,
              emergencyKillSwitch: !riskSettings.emergencyKillSwitch,
            })
          }
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition border ${
            riskSettings.emergencyKillSwitch
              ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30 animate-pulse'
              : 'bg-white/5 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 border-white/10'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isAr ? 'قاطع الطوارئ (Emergency Kill Switch)' : 'Emergency Kill Switch'}</span>
        </button>
      </div>

      {/* Top 3 Risk KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white/[0.03] backdrop-blur-md p-3.5 rounded-xl border border-white/10">
          <div className="text-xs text-slate-400 mb-1">{isAr ? 'نموذج المخاطرة النشط' : 'Active Risk Model'}</div>
          <div className="flex items-center gap-1.5 mt-1">
            {(['conservative', 'balanced', 'aggressive'] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleModelChange(m)}
                className={`flex-1 py-1 rounded-md text-[11px] font-semibold capitalize transition border ${
                  riskSettings.riskModel === m
                    ? 'bg-orange-500 text-slate-950 font-bold border-orange-400/40 signal-glow-orange'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 border-white/5'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            {isAr
              ? 'محافظ (0.5% - 1%) | متوازن (1% - 2%) | هجومي (2% - 3%)'
              : 'Conservative (0.5-1%) | Balanced (1-2%) | Aggressive (2-3%)'}
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md p-3.5 rounded-xl border border-white/10 font-mono">
          <div className="text-xs text-slate-400 mb-1">{isAr ? 'حد التراجع اليومي الأقصى (Max Daily DD)' : 'Max Daily Drawdown'}</div>
          <div className="text-xl font-bold text-rose-400 stat-value">
            ${riskSettings.maxDailyLoss.toLocaleString()}{' '}
            <span className="text-xs text-slate-400 font-normal">(5.0%)</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {isAr ? 'يتم إيقاف فتح أي صفقات جديدة آلياً عند الوصول للحد' : 'Trading stops automatically if hit'}
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md p-3.5 rounded-xl border border-white/10">
          <div className="text-xs text-slate-400 mb-1">{isAr ? 'حماية الحساب ضد Martingale' : 'Anti-Martingale Rule'}</div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm mt-1">
            <Lock className="w-4 h-4" />
            <span>{isAr ? 'مفعل إجبارياً (Strict Active)' : 'Active (No Averaging Down)'}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {isAr ? 'ممنوع زيادة العقود لتعويض صفقات خاسرة' : 'Prevents revenge trading and compounding losses'}
          </div>
        </div>
      </div>

      {/* Position Sizer Calculator */}
      <div className="bg-white/[0.03] backdrop-blur-md p-4 rounded-xl border border-white/10">
        <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-orange-400" />
          <span>{isAr ? 'حاسبة حجم اللوت المؤسسي الدقيق (Exact Lot Sizer)' : 'Exact Lot Size Calculator'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Controls */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'اختر الأصل / الزوج:' : 'Select Asset:'}</label>
              <select
                value={calcAsset.symbol}
                onChange={(e) => {
                  const found = assets.find((a) => a.symbol === e.target.value);
                  if (found) {
                    setCalcAsset(found);
                    setCalcSlPips(found.symbol.includes('XAU') ? 35 : 20);
                  }
                }}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
              >
                {assets.map((a) => (
                  <option key={a.symbol} value={a.symbol} className="bg-slate-900 text-white">
                    {a.symbol} - {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {isAr ? 'مسافة وقف الخسارة (Stop Loss Pips):' : 'Stop Loss Distance (Pips):'}
              </label>
              <input
                type="number"
                value={calcSlPips}
                onChange={(e) => setCalcSlPips(Number(e.target.value) || 1)}
                min="1"
                max="500"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {isAr ? 'نسبة المخاطرة لكل صفقة (%):' : 'Risk Percentage (%):'}
              </label>
              <input
                type="number"
                step="0.1"
                value={customRiskPercent}
                onChange={(e) => setCustomRiskPercent(Number(e.target.value) || 0.1)}
                min="0.1"
                max="5.0"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          {/* Results Grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center self-center">
            <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-orange-500/30 shadow-inner">
              <div className="text-[10px] text-orange-400 uppercase tracking-tight">{isAr ? 'حجم اللوت الموصى به' : 'Recommended Lots'}</div>
              <div className="text-xl font-bold text-orange-300 mt-1 stat-value">{positionCalculation.lotSize} Lots</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Standard Contract</div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-rose-500/30">
              <div className="text-[10px] text-rose-400 uppercase tracking-tight">{isAr ? 'المبلغ المعرض للمخاطرة' : 'Max Dollar Risk'}</div>
              <div className="text-xl font-bold text-rose-400 mt-1 stat-value">${positionCalculation.riskAmount}</div>
              <div className="text-[9px] text-slate-400 mt-0.5">{customRiskPercent}% of Capital</div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase tracking-tight">{isAr ? 'قيمة النقطة (Pip Value)' : 'Pip Value'}</div>
              <div className="text-xl font-bold text-slate-200 mt-1 stat-value">${positionCalculation.pipValue}/p</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Per Pip Movement</div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase tracking-tight">{isAr ? 'الهامش المطلوب (Margin)' : 'Est. Margin'}</div>
              <div className="text-xl font-bold text-slate-200 mt-1 stat-value">${positionCalculation.marginRequired}</div>
              <div className="text-[9px] text-slate-400 mt-0.5">At 1:100 Leverage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Matrix & Anti-Overexposure Table */}
      <div className="bg-white/[0.03] backdrop-blur-md p-4 rounded-xl border border-white/10">
        <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-400" />
          <span>{isAr ? 'مصفوفة الارتباط وتحذيرات التعرض المزدوج (Correlation Matrix)' : 'Intermarket Correlation Matrix'}</span>
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          {isAr
            ? 'تنبيه الارتباطات لمنع فتح صفقات متضاربة أو مضاعفة المخاطرة على نفس العملة الأساسية'
            : 'Correlation radar to avoid conflicting positions or unintended synthetic overexposure'}
        </p>

        <div className="space-y-2 text-xs">
          {CORRELATION_MATRIX.map((item, idx) => (
            <div
              key={idx}
              className="bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-white/10 flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-bold text-slate-100 stat-value">{item.pair1}</span>
                <span className="text-slate-500">↔</span>
                <span className="font-bold text-slate-100 stat-value">{item.pair2}</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] border stat-value ${
                    item.coefficient < -0.8
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : item.coefficient > 0.8
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 text-slate-300 border-white/10'
                  }`}
                >
                  {item.coefficient > 0 ? `+${item.coefficient}` : item.coefficient}
                </span>
              </div>

              <div className="text-slate-300 text-xs flex-1 max-w-md">{item.description}</div>

              {item.warning && (
                <div className="text-[11px] text-orange-300 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/30 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{item.warning}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
