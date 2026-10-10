import React, { useState } from 'react';
import {
  Globe2,
  Calendar,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { EconomicNewsEvent, NewsImpact } from '../types/trading';
import { ECONOMIC_NEWS_DATA } from '../data/marketData';

interface EconomicNewsCalendarProps {
  language: 'ar' | 'en';
}

export const EconomicNewsCalendar: React.FC<EconomicNewsCalendarProps> = ({ language }) => {
  const [impactFilter, setImpactFilter] = useState<NewsImpact | 'ALL'>('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const isAr = language === 'ar';

  const filteredEvents = ECONOMIC_NEWS_DATA.filter((event) => {
    const matchImpact = impactFilter === 'ALL' || event.impact === impactFilter;
    const matchCurr = selectedCurrency === 'ALL' || event.currency === selectedCurrency;
    return matchImpact && matchCurr;
  });

  return (
    <div className="glass-panel rounded-xl p-4 shadow-2xl flex flex-col gap-4">
      {/* Header & Impact Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-bold text-white">
              {isAr ? 'الأجندة الاقتصادية الاستخباراتية (Economic Intelligence)' : 'Economic News Intelligence'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'مراقبة الأخبار عالية التأثير ومعدلات المفاجأة (Surprise Factor) وتأثيرها على الذهب والعملات'
              : 'Tracking macro releases, consensus surprises, and instant multi-asset volatility impact'}
          </p>
        </div>

        {/* Impact filter tabs */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
          {(['ALL', 'EXTREME', 'HIGH', 'MEDIUM'] as const).map((imp) => (
            <button
              key={imp}
              onClick={() => setImpactFilter(imp)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                impactFilter === imp
                  ? 'bg-orange-500 text-slate-950 font-bold border-orange-400/40 signal-glow-orange'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border-white/5'
              }`}
            >
              {imp === 'ALL' ? (isAr ? 'كل التأثيرات' : 'All') : imp}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.map((event) => {
          const isExtreme = event.impact === 'EXTREME';
          const isPositive = event.surprise === 'positive';
          const isNegative = event.surprise === 'negative';

          return (
            <div
              key={event.id}
              className={`bg-white/[0.03] backdrop-blur-md rounded-xl border p-4 transition hover:border-white/20 ${
                isExtreme ? 'border-orange-500/40 signal-glow-orange bg-orange-500/[0.03]' : 'border-white/10'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                  <span className="font-mono text-xs font-bold text-orange-400 bg-black/40 px-2.5 py-0.5 rounded-md border border-white/10 flex items-center gap-1 stat-value">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </span>
                  <span className="font-bold text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-white border border-white/10">
                    {event.currency} ({event.country})
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                      isExtreme
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : event.impact === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {event.impact} IMPACT
                  </span>
                </div>

                {/* Surprise indicator */}
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs">
                  <span className="text-slate-400">{isAr ? 'المفاجأة:' : 'Surprise:'}</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 border ${
                      isPositive
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : isNegative
                        ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                        : 'text-slate-400 bg-white/5 border-white/10'
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : isNegative ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {event.surprise ? event.surprise.toUpperCase() : 'NEUTRAL'}
                  </span>
                </div>
              </div>

              {/* Title & Numbers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2.5">
                <div className="md:col-span-1">
                  <h4 className="font-bold text-sm text-slate-100">{event.title}</h4>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {event.affectedAssets.map((asset) => (
                      <span key={asset} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-orange-300 border border-white/10 font-semibold stat-value">
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="md:col-span-2 grid grid-cols-3 gap-2 text-xs font-mono text-center">
                  <div className="bg-black/30 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">{isAr ? 'الفعلي (Actual)' : 'Actual'}</div>
                    <div className="font-bold text-white text-sm mt-0.5 stat-value">{event.actual || '--'}</div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">{isAr ? 'المتوقع (Forecast)' : 'Forecast'}</div>
                    <div className="font-semibold text-slate-300 text-sm mt-0.5 stat-value">{event.forecast || '--'}</div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">{isAr ? 'السابق (Previous)' : 'Previous'}</div>
                    <div className="font-semibold text-slate-400 text-sm mt-0.5 stat-value">{event.previous || '--'}</div>
                  </div>
                </div>
              </div>

              {/* Institutional Impact Analysis */}
              <div className="bg-black/30 backdrop-blur-sm p-2.5 rounded-lg border border-white/10 text-xs text-slate-300 leading-relaxed flex items-start gap-2 mt-2">
                <Zap className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-orange-300">{isAr ? 'التحليل الاستخباراتي المؤسسي: ' : 'Institutional Insight: '}</strong>
                  {event.analysis}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
