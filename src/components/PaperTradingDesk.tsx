import React from 'react';
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  XSquare,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Flame,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { PaperPosition, TradeSignal, AssetInfo } from '../types/trading';

interface PaperTradingDeskProps {
  positions: PaperPosition[];
  assets: AssetInfo[];
  accountBalance: number;
  onClosePosition: (id: string) => void;
  onPartialClose: (id: string, ratio: number) => void;
  onCloseAll: () => void;
  language: 'ar' | 'en';
}

export const PaperTradingDesk: React.FC<PaperTradingDeskProps> = ({
  positions,
  assets,
  accountBalance,
  onClosePosition,
  onPartialClose,
  onCloseAll,
  language,
}) => {
  const isAr = language === 'ar';

  // Calculate live floating PnL across all open positions
  const enrichedPositions = positions.map((pos) => {
    const liveAsset = assets.find((a) => a.symbol === pos.asset);
    const currentPrice = liveAsset ? liveAsset.price : pos.entryPrice;
    const isBuy = pos.direction === 'BUY';
    const isGold = pos.asset.includes('XAU');
    const pipSize = liveAsset?.pipSize || (isGold ? 0.01 : 0.0001);

    const priceDiff = isBuy ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
    const pips = Math.round(priceDiff / pipSize);
    const pipValuePerLot = isGold ? 10.0 : 10.0;
    const pnl = Number((pips * pipValuePerLot * pos.lotSize).toFixed(2));

    return {
      ...pos,
      currentPrice,
      pnl,
      pips,
    };
  });

  const totalFloatingPnl = enrichedPositions.reduce((acc, p) => acc + p.pnl, 0);
  const totalLots = enrichedPositions.reduce((acc, p) => acc + p.lotSize, 0);

  return (
    <div className="glass-panel rounded-xl p-4 shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              {isAr ? 'مكتب التداول التجريبي الحي (Live Paper Trading Desk)' : 'Live Paper Trading Desk'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'متابعة الصفقات المفتوحة اللحظية، الأرباح العائمة، وإدارة العقود الجزئية ونقل الوقف للدخول (Break-Even)'
              : 'Live paper portfolio tracking, floating P&L, and 1-click partial take profits'}
          </p>
        </div>

        {positions.length > 0 && (
          <button
            onClick={onCloseAll}
            className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-xs font-bold transition active:scale-95 flex items-center gap-1.5 shadow-md shadow-rose-500/20"
          >
            <XSquare className="w-4 h-4" />
            <span>{isAr ? 'إغلاق كافة الصفقات (Emergency Close All)' : 'Close All Positions'}</span>
          </button>
        )}
      </div>

      {/* Account Equity & Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="bg-white/[0.03] backdrop-blur-md p-3.5 rounded-xl border border-white/10">
          <div className="text-slate-400 text-[10px] uppercase tracking-tight">{isAr ? 'رصيد الحساب المتاح' : 'Account Balance'}</div>
          <div className="text-xl font-bold text-slate-100 mt-1 stat-value">${accountBalance.toLocaleString()}</div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md p-3.5 rounded-xl border border-white/10">
          <div className="text-slate-400 text-[10px] uppercase tracking-tight">{isAr ? 'الأرباح/الخسائر العائمة (Floating P&L)' : 'Floating P&L'}</div>
          <div
            className={`text-xl font-bold mt-1 stat-value ${
              totalFloatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalFloatingPnl >= 0 ? '+' : ''}${totalFloatingPnl.toFixed(2)}
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md p-3.5 rounded-xl border border-white/10">
          <div className="text-slate-400 text-[10px] uppercase tracking-tight">{isAr ? 'إجمالي العقود المفتوحة (Total Lots)' : 'Total Exposure'}</div>
          <div className="text-xl font-bold text-orange-300 mt-1 stat-value">{totalLots.toFixed(2)} Lots</div>
          <div className="text-[9px] text-slate-400 mt-0.5">{positions.length} Active Positions</div>
        </div>
      </div>

      {/* Open Positions Table */}
      {enrichedPositions.length === 0 ? (
        <div className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center text-slate-400 text-xs">
          <CheckCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="font-semibold text-slate-300">
            {isAr ? 'لا توجد صفقات مفتوحة حالياً في الحساب التجريبي' : 'No active open paper trades'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isAr
              ? 'قم باختيار إشارة من "مصفوفة الفرص" أو "رادار السكالبينج" واضغط "تنفيذ تجريبي" لبدء الاختبار.'
              : 'Select a signal from the Opportunity Matrix or Scalping Radar to simulate institutional execution.'}
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 overflow-x-auto text-xs">
          <table className="w-full text-left rtl:text-right border-collapse font-mono">
            <thead className="bg-black/30 text-slate-400 text-[10px] uppercase border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">{isAr ? 'الأصل / النوع' : 'Asset / Type'}</th>
                <th className="py-2.5 px-2 text-center">{isAr ? 'اللوت' : 'Lots'}</th>
                <th className="py-2.5 px-2 text-right rtl:text-left">{isAr ? 'سعر الدخول' : 'Entry'}</th>
                <th className="py-2.5 px-2 text-right rtl:text-left">{isAr ? 'السعر الحالي' : 'Current'}</th>
                <th className="py-2.5 px-2 text-right rtl:text-left">{isAr ? 'SL / TP' : 'SL / TP'}</th>
                <th className="py-2.5 px-2 text-right rtl:text-left">{isAr ? 'الربح اللحظي' : 'Floating PnL'}</th>
                <th className="py-2.5 px-2 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {enrichedPositions.map((pos) => {
                const isBuy = pos.direction === 'BUY';
                return (
                  <tr key={pos.id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-sm stat-value">{pos.asset}</div>
                      <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                        <span className={isBuy ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {pos.direction}
                        </span>
                        <span className="text-slate-400">• {pos.strategy}</span>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center text-orange-300 font-bold stat-value">
                      {pos.lotSize}
                    </td>

                    <td className="py-3 px-2 text-right rtl:text-left text-slate-300 stat-value">
                      ${pos.entryPrice}
                    </td>

                    <td className="py-3 px-2 text-right rtl:text-left text-white font-bold stat-value">
                      ${pos.currentPrice}
                    </td>

                    <td className="py-3 px-2 text-right rtl:text-left text-[11px] stat-value">
                      <div className="text-rose-400">SL: ${pos.stopLoss}</div>
                      <div className="text-emerald-400">TP: ${pos.takeProfit}</div>
                    </td>

                    <td className="py-3 px-2 text-right rtl:text-left">
                      <div
                        className={`text-sm font-bold stat-value ${
                          pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pos.pnl >= 0 ? '+' : ''}${pos.pnl}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal stat-value">
                        {pos.pips >= 0 ? '+' : ''}{pos.pips} pips
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPartialClose(pos.id, 0.5)}
                          className="px-2 py-1 bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-slate-950 rounded-md text-[10px] font-bold border border-orange-500/40 transition shadow-sm"
                          title={isAr ? 'إغلاق 50% وتأمين الدخول' : 'Partial Close 50%'}
                        >
                          {isAr ? 'حجز 50%' : 'TP 50%'}
                        </button>
                        <button
                          onClick={() => onClosePosition(pos.id)}
                          className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-md text-[10px] font-bold border border-rose-500/40 transition shadow-sm"
                          title={isAr ? 'إغلاق كامل' : 'Close Position'}
                        >
                          {isAr ? 'إغلاق' : 'Close'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
