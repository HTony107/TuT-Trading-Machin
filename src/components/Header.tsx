import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Clock,
  Globe2,
  Zap,
  TrendingUp,
  Activity,
  AlertTriangle,
  FileText,
  Volume2,
  Radio,
  BarChart2,
  Sliders,
  BookOpen,
} from 'lucide-react';
import { OperatingMode, TradingSessionName } from '../types/trading';
import { getCurrentTradingSession } from '../services/marketEngine';

interface HeaderProps {
  currentMode: OperatingMode;
  onSelectMode: (mode: OperatingMode) => void;
  language: 'ar' | 'en';
  onToggleLanguage: () => void;
  accountBalance: number;
  tradingHalt: boolean;
  onToggleTradingHalt: () => void;
  onOpenDailyReport: () => void;
  onQuickAnalyze: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  language,
  onToggleLanguage,
  accountBalance,
  tradingHalt,
  onToggleTradingHalt,
  onOpenDailyReport,
  onQuickAnalyze,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [sessionInfo, setSessionInfo] = useState<{
    session: TradingSessionName;
    description: string;
    isLondonNYOverlap: boolean;
    volatilityExpectation: string;
  }>({
    session: 'London/NY Overlap',
    description: '',
    isLondonNYOverlap: true,
    volatilityExpectation: 'HIGH',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
      setSessionInfo(getCurrentTradingSession(now.getUTCHours()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAr = language === 'ar';

  const modes: { id: OperatingMode; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'MONITORING', labelAr: 'مراقبة السوق', labelEn: 'Market Monitor', icon: <Radio className="w-4 h-4" /> },
    { id: 'ANALYSIS', labelAr: 'تحليل شامل (AI)', labelEn: 'AI Advisor', icon: <Zap className="w-4 h-4" /> },
    { id: 'SIGNAL', labelAr: 'مصفوفة الفرص', labelEn: 'Signal Matrix', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'SCALPING', labelAr: 'رادار السكالبينج', labelEn: 'Scalping Desk', icon: <Activity className="w-4 h-4" /> },
    { id: 'NEWS', labelAr: 'الأخبار الاقتصادية', labelEn: 'Economic News', icon: <Globe2 className="w-4 h-4" /> },
    { id: 'RISK', labelAr: 'إدارة المخاطر', labelEn: 'Risk Monitor', icon: <Sliders className="w-4 h-4" /> },
    { id: 'BACKTEST', labelAr: 'الاختبار التاريخي', labelEn: 'Backtest Engine', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'PAPER_TRADING', labelAr: 'التداول التجريبي', labelEn: 'Paper Desk', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="glass-panel sticky top-0 z-50 transition-all border-b border-white/10 rounded-b-xl shadow-2xl">
      {/* Top Utility Ticker Bar */}
      <div className="bg-black/30 backdrop-blur-md px-4 py-1.5 border-b border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="stat-value text-[11px] font-medium text-slate-200">{utcTime || '00:00:00 UTC'}</span>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">{isAr ? 'الجلسة الحالية:' : 'Active Session:'}</span>
            <span
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1.5 border ${
                sessionInfo.isLondonNYOverlap
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 signal-glow-orange'
                  : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {sessionInfo.session}
            </span>
          </div>

          <span className="hidden md:inline-block text-slate-400 text-[11px] truncate max-w-xs opacity-80">
            {sessionInfo.description}
          </span>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Trading Halt Indicator */}
          <button
            onClick={onToggleTradingHalt}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all border ${
              tradingHalt
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 signal-glow-emerald'
            }`}
            title={isAr ? 'إيقاف/تفعيل التداول في ظروف المخاطر القصوى' : 'Toggle emergency trading halt'}
          >
            {tradingHalt ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>{isAr ? '🛑 TRADING HALT (توقف الأمان مفعل)' : '🛑 TRADING HALT (Active)'}</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{isAr ? 'حالة السوق: نشط (Data Verified)' : 'SYSTEM: NOMINAL (99.8%)'}</span>
              </>
            )}
          </button>

          {/* Account Balance */}
          <div className="bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10 font-mono text-slate-200">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider me-1">{isAr ? 'رأس المال:' : 'Balance:'}</span>
            <span className="stat-value text-emerald-400 font-bold">${accountBalance.toLocaleString()}</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-medium flex items-center gap-1 border border-white/10 transition"
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Main App Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-9 h-9 rounded-lg bg-orange-500 shadow-lg shadow-orange-500/25 flex items-center justify-center font-black text-slate-950 text-xs tracking-wider border border-orange-400/40">
            SAI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold tracking-wider uppercase text-white flex items-center gap-1.5">
                <span>Smart AI Trading Agent</span>
              </h1>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full font-bold">
                Institutional v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-tight">
              {isAr
                ? 'وكيل الذكاء الاصطناعي المؤسسي لأسواق العملات والمعادن الثمينة • بث مباشر'
                : 'Institutional Intelligence • Live Market Confluence Feed'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button
            onClick={onQuickAnalyze}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-orange-500/25 flex items-center gap-1.5 transition active:scale-95 border border-orange-300/30"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>{isAr ? 'تحليل ذكي فوري' : 'Instant AI Analysis'}</span>
          </button>

          <button
            onClick={onOpenDailyReport}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-lg border border-white/10 flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5 text-orange-400" />
            <span>{isAr ? 'التقرير اليومي' : 'Daily Intelligence'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Modes Bar */}
      <div className="bg-black/20 border-t border-white/5 px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center space-x-1.5 rtl:space-x-reverse py-1.5">
          {modes.map((mode) => {
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white/10 text-orange-300 border border-orange-500/40 shadow-sm signal-glow-orange'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-orange-400' : 'text-slate-400'}>{mode.icon}</span>
                <span>{isAr ? mode.labelAr : mode.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
