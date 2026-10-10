import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BarChart2,
} from 'lucide-react';
import { AssetInfo, AssetCategory } from '../types/trading';

interface LiveMarketWatchProps {
  assets: AssetInfo[];
  selectedAsset: AssetInfo;
  onSelectAsset: (asset: AssetInfo) => void;
  onAnalyzeAsset: (asset: AssetInfo) => void;
  language: 'ar' | 'en';
}

export const LiveMarketWatch: React.FC<LiveMarketWatchProps> = ({
  assets,
  selectedAsset,
  onSelectAsset,
  onAnalyzeAsset,
  language,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const isAr = language === 'ar';

  const categories: { id: AssetCategory | 'all'; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All Assets' },
    { id: 'metals', labelAr: 'المعادن الثمينة (Gold/Silver)', labelEn: 'Metals' },
    { id: 'majors', labelAr: 'العملات الرئيسية (Majors)', labelEn: 'Forex Majors' },
    { id: 'crosses', labelAr: 'العملات التقاطعية (Crosses)', labelEn: 'Crosses' },
    { id: 'indices', labelAr: 'المؤشرات (Indices)', labelEn: 'Indices' },
    { id: 'crypto', labelAr: 'العملات الرقمية', labelEn: 'Crypto' },
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    const matchesSearch =
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="glass-panel rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Header & Filter Controls */}
      <div className="p-3 bg-white/[0.03] backdrop-blur-md border-b border-white/10 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>{isAr ? 'مراقبة السوق اللحظية (Market Watch)' : 'Live Market Monitor'}</span>
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 stat-value">
            {filteredAssets.length} {isAr ? 'أصل متاح' : 'Instruments'}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 rtl:right-3 rtl:left-auto top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث عن زوج (EUR/USD, Gold, JPY...)' : 'Search asset symbol...'}
            className="w-full bg-black/30 border border-white/10 rounded-lg pl-8 pr-3 rtl:pr-8 rtl:pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse overflow-x-auto scrollbar-none pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition border ${
                categoryFilter === cat.id
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 signal-glow-orange'
                  : 'bg-white/5 text-slate-400 hover:text-slate-100 hover:bg-white/10 border-white/5'
              }`}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table List */}
      <div className="overflow-y-auto flex-1 max-h-[520px] scrollbar-thin scrollbar-thumb-white/10">
        <table className="w-full text-left rtl:text-right border-collapse text-xs">
          <thead className="bg-black/40 backdrop-blur-md text-slate-400 text-[10px] uppercase font-bold sticky top-0 border-b border-white/10 z-10">
            <tr>
              <th className="py-2.5 px-3">{isAr ? 'الأصل / الرمز' : 'Asset'}</th>
              <th className="py-2.5 px-2 text-right rtl:text-left">{isAr ? 'السعر' : 'Price'}</th>
              <th className="py-2.5 px-2 text-right rtl:text-left">{isAr ? 'الفارق' : 'Spread'}</th>
              <th className="py-2.5 px-2 text-center">{isAr ? 'الاتجاه' : 'Trend'}</th>
              <th className="py-2.5 px-2 text-center">{isAr ? 'التقييم' : 'Score'}</th>
              <th className="py-2.5 px-2 text-center">{isAr ? 'إجراء' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAsset.symbol === asset.symbol;
              const isBullish = asset.primaryTrend.includes('Bullish');
              const isGold = asset.symbol.includes('XAU');

              return (
                <tr
                  key={asset.symbol}
                  onClick={() => onSelectAsset(asset)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected ? 'bg-orange-500/10 border-l-2 rtl:border-r-2 rtl:border-l-0 border-orange-500' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Symbol & Name */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {isGold && <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 animate-bounce" />}
                      <div>
                        <div className="font-bold text-slate-100 group-hover:text-orange-300 transition stat-value">
                          {asset.symbol}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{asset.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* Price & 24h Change */}
                  <td className="py-3 px-2 text-right rtl:text-left font-mono">
                    <div className="font-bold text-slate-200 stat-value">${asset.price.toFixed(asset.digits)}</div>
                    <div
                      className={`text-[10px] font-semibold flex items-center justify-end rtl:justify-start gap-0.5 ${
                        asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{asset.change24h >= 0 ? '+' : ''}{asset.change24h}%</span>
                    </div>
                  </td>

                  {/* Spread */}
                  <td className="py-3 px-2 text-right rtl:text-left font-mono text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] border border-white/10 stat-value font-medium">
                      {asset.spread} p
                    </span>
                  </td>

                  {/* Trend / Direction */}
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold inline-block border ${
                        asset.direction === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : asset.direction === 'SELL'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-white/5 text-slate-400 border-white/10'
                      }`}
                    >
                      {asset.direction}
                    </span>
                  </td>

                  {/* Score */}
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] border stat-value ${
                        asset.tradeScore >= 90
                          ? 'text-orange-300 bg-orange-500/20 border-orange-500/40 signal-glow-orange'
                          : asset.tradeScore >= 80
                          ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
                          : asset.tradeScore >= 70
                          ? 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30'
                          : 'text-slate-400 bg-white/5 border-white/10'
                      }`}
                    >
                      {asset.tradeScore}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnalyzeAsset(asset);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-orange-500 hover:text-slate-950 text-orange-400 border border-white/10 transition"
                      title={isAr ? 'تحليل ذكي فوري' : 'AI Deep Analysis'}
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
