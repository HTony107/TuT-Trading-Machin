import React, { useState, useRef, useMemo } from 'react';
import {
  Maximize2,
  TrendingUp,
  Layers,
  Eye,
  Sliders,
  Crosshair,
  BarChart3,
  Activity,
  Zap,
} from 'lucide-react';
import { AssetInfo, Timeframe, TradeSignal } from '../types/trading';

interface InteractiveChartProps {
  asset: AssetInfo;
  activeSignal?: TradeSignal | null;
  timeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  language: 'ar' | 'en';
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  asset,
  activeSignal,
  timeframe,
  onSelectTimeframe,
  language,
}) => {
  const [showEmas, setShowEmas] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVwap, setShowVwap] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showSignalLines, setShowSignalLines] = useState(true);
  const [activeSubChart, setActiveSubChart] = useState<'RSI' | 'MACD' | 'VOLUME'>('RSI');
  const [hoveredCandle, setHoveredCandle] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isAr = language === 'ar';

  const timeframes: Timeframe[] = ['1M', '5M', '15M', '30M', '1H', '4H', '1D'];

  const candles = asset.candles;
  const candleCount = candles.length;

  // Compute scale boundaries
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (candles.length === 0) return { minPrice: 0, maxPrice: 1, priceRange: 1 };
    let min = Infinity;
    let max = -Infinity;
    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    });

    // Also include active signal targets in scale if shown
    if (activeSignal && showSignalLines) {
      min = Math.min(min, activeSignal.stopLoss.price, activeSignal.takeProfits.tp1.price);
      max = Math.max(max, activeSignal.stopLoss.price, activeSignal.takeProfits.tp3.price);
    }

    const padding = (max - min) * 0.08 || min * 0.01;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      priceRange: max - min + padding * 2 || 1,
    };
  }, [candles, activeSignal, showSignalLines]);

  const svgWidth = 800;
  const mainChartHeight = 320;
  const subChartHeight = 90;
  const totalSvgHeight = mainChartHeight + subChartHeight + 30;

  const candleWidth = Math.max(3, (svgWidth - 100) / Math.max(candleCount, 1));

  const getY = (price: number) => {
    return mainChartHeight - ((price - minPrice) / priceRange) * (mainChartHeight - 20) - 10;
  };

  const getSubY = (val: number, minVal: number, maxVal: number) => {
    const range = maxVal - minVal || 1;
    return mainChartHeight + 20 + subChartHeight - ((val - minVal) / range) * (subChartHeight - 15) - 5;
  };

  const latestCandle = hoveredCandle !== null ? candles[hoveredCandle] : candles[candles.length - 1];

  return (
    <div className="glass-panel rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Chart Top Header & Controls */}
      <div className="p-3 bg-white/[0.03] backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Asset Title & Live Price */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white tracking-wide stat-value">{asset.symbol}</span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">{asset.name}</span>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse font-mono">
            <span className="text-base font-bold text-white stat-value">${asset.price.toFixed(asset.digits)}</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                asset.change24h >= 0
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              {asset.change24h >= 0 ? '+' : ''}
              {asset.change24h}%
            </span>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center bg-black/30 rounded-lg p-0.5 border border-white/10">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onSelectTimeframe(tf)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                timeframe === tf
                  ? 'bg-orange-500 text-slate-950 font-bold shadow-sm signal-glow-orange'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Indicators Overlay Toggles */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
          <button
            onClick={() => setShowEmas(!showEmas)}
            className={`px-2 py-1 rounded-md border text-[10px] font-semibold transition ${
              showEmas ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            EMA (9/20/50/200)
          </button>
          <button
            onClick={() => setShowVwap(!showVwap)}
            className={`px-2 py-1 rounded-md border text-[10px] font-semibold transition ${
              showVwap ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            VWAP
          </button>
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2 py-1 rounded-md border text-[10px] font-semibold transition ${
              showZones ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            {isAr ? 'مناطق السيولة / S&R' : 'S&R & OBs'}
          </button>
          {activeSignal && (
            <button
              onClick={() => setShowSignalLines(!showSignalLines)}
              className={`px-2 py-1 rounded-md border text-[10px] font-bold transition ${
                showSignalLines
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse signal-glow-emerald'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
            >
              {isAr ? 'أهداف الصفقة (Entry/SL/TP)' : 'Signal Overlay'}
            </button>
          )}
        </div>
      </div>

      {/* OHLC Bar Stats */}
      {latestCandle && (
        <div className="px-4 py-1.5 bg-black/25 backdrop-blur-md border-b border-white/5 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span>O: <span className="text-slate-200 stat-value">{latestCandle.open.toFixed(asset.digits)}</span></span>
            <span>H: <span className="text-slate-200 stat-value">{latestCandle.high.toFixed(asset.digits)}</span></span>
            <span>L: <span className="text-slate-200 stat-value">{latestCandle.low.toFixed(asset.digits)}</span></span>
            <span>C: <span className={`stat-value font-bold ${latestCandle.close >= latestCandle.open ? 'text-emerald-400' : 'text-rose-400'}`}>{latestCandle.close.toFixed(asset.digits)}</span></span>
            <span>Vol: <span className="text-slate-200 stat-value">{latestCandle.volume}</span></span>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse text-[10px]">
            <span className="text-indigo-400">EMA20: {asset.technicals.ema20.toFixed(asset.digits)}</span>
            <span className="text-blue-400">EMA50: {asset.technicals.ema50.toFixed(asset.digits)}</span>
            <span className="text-amber-400">VWAP: {asset.technicals.vwap.toFixed(asset.digits)}</span>
            <span className="text-cyan-400">ATR(14): {asset.technicals.atr.toFixed(asset.digits)}</span>
          </div>
        </div>
      )}

      {/* Interactive Candlestick SVG Stage */}
      <div ref={containerRef} className="relative w-full h-[440px] bg-black/40 overflow-hidden cursor-crosshair">
        <svg
          viewBox={`0 0 ${svgWidth} ${totalSvgHeight}`}
          className="w-full h-full select-none"
          preserveAspectRatio="none"
        >
          {/* Horizontal Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
            const p = minPrice + priceRange * ratio;
            const y = getY(p);
            return (
              <g key={idx}>
                <line x1={0} y1={y} x2={svgWidth - 65} y2={y} stroke="#ffffff" strokeDasharray="3 3" strokeWidth={0.6} opacity={0.1} />
                <text x={svgWidth - 60} y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace">
                  {p.toFixed(asset.digits)}
                </text>
              </g>
            );
          })}

          {/* Support & Resistance Highlight Zones */}
          {showZones && (
            <>
              {asset.supportZones.map((zone, idx) => {
                const y = getY(zone.price);
                return (
                  <g key={`supp-${idx}`}>
                    <rect x={0} y={y - 8} width={svgWidth - 65} height={16} fill="#059669" fillOpacity={0.15} />
                    <line x1={0} y1={y} x2={svgWidth - 65} y2={y} stroke="#10b981" strokeWidth={1} strokeDasharray="4 2" opacity={0.8} />
                    <text x={10} y={y - 2} fill="#34d399" fontSize="8" fontWeight="bold">
                      SUPPORT {zone.price.toFixed(asset.digits)} (Str: {zone.strength}%)
                    </text>
                  </g>
                );
              })}

              {asset.resistanceZones.map((zone, idx) => {
                const y = getY(zone.price);
                return (
                  <g key={`res-${idx}`}>
                    <rect x={0} y={y - 8} width={svgWidth - 65} height={16} fill="#e11d48" fillOpacity={0.15} />
                    <line x1={0} y1={y} x2={svgWidth - 65} y2={y} stroke="#f43f5e" strokeWidth={1} strokeDasharray="4 2" opacity={0.8} />
                    <text x={10} y={y - 2} fill="#fb7185" fontSize="8" fontWeight="bold">
                      SUPPLY/RES {zone.price.toFixed(asset.digits)} (Str: {zone.strength}%)
                    </text>
                  </g>
                );
              })}

              {/* Order Blocks */}
              {asset.orderBlocks.map((ob, idx) => {
                const yTop = getY(ob.top);
                const yBottom = getY(ob.bottom);
                const isBullish = ob.type.includes('bullish');
                return (
                  <g key={`ob-${idx}`}>
                    <rect
                      x={svgWidth * 0.4}
                      y={Math.min(yTop, yBottom)}
                      width={svgWidth * 0.6 - 65}
                      height={Math.max(4, Math.abs(yBottom - yTop))}
                      fill={isBullish ? '#06b6d4' : '#f59e0b'}
                      fillOpacity={0.25}
                      stroke={isBullish ? '#22d3ee' : '#fbbf24'}
                      strokeWidth={0.8}
                    />
                    <text x={svgWidth * 0.42} y={Math.min(yTop, yBottom) + 9} fill={isBullish ? '#67e8f9' : '#fde68a'} fontSize="8" fontWeight="bold">
                      {ob.type.toUpperCase()} ({ob.timeframe})
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* Indicators Overlays (EMA Lines & VWAP) */}
          {showVwap && (
            <line
              x1={0}
              y1={getY(asset.technicals.vwap)}
              x2={svgWidth - 65}
              y2={getY(asset.technicals.vwap)}
              stroke="#f59e0b"
              strokeWidth={1.5}
              opacity={0.85}
            />
          )}

          {showEmas && (
            <>
              <line
                x1={0}
                y1={getY(asset.technicals.ema20)}
                x2={svgWidth - 65}
                y2={getY(asset.technicals.ema20)}
                stroke="#818cf8"
                strokeWidth={1.2}
                opacity={0.8}
              />
              <line
                x1={0}
                y1={getY(asset.technicals.ema50)}
                x2={svgWidth - 65}
                y2={getY(asset.technicals.ema50)}
                stroke="#38bdf8"
                strokeWidth={1.2}
                opacity={0.7}
              />
              <line
                x1={0}
                y1={getY(asset.technicals.ema200)}
                x2={svgWidth - 65}
                y2={getY(asset.technicals.ema200)}
                stroke="#ec4899"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                opacity={0.75}
              />
            </>
          )}

          {/* Active Trade Signal Target Lines Overlay */}
          {activeSignal && showSignalLines && (
            <g className="transition-all">
              {/* Entry Line */}
              <line
                x1={0}
                y1={getY(activeSignal.entryPrice)}
                x2={svgWidth - 65}
                y2={getY(activeSignal.entryPrice)}
                stroke="#38bdf8"
                strokeWidth={1.8}
                strokeDasharray="5 3"
              />
              <rect x={svgWidth - 65} y={getY(activeSignal.entryPrice) - 7} width={60} height={14} fill="#0284c7" rx={2} />
              <text x={svgWidth - 35} y={getY(activeSignal.entryPrice) + 3} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                ENTRY {activeSignal.entryPrice.toFixed(asset.digits)}
              </text>

              {/* Stop Loss Line */}
              <line
                x1={0}
                y1={getY(activeSignal.stopLoss.price)}
                x2={svgWidth - 65}
                y2={getY(activeSignal.stopLoss.price)}
                stroke="#ef4444"
                strokeWidth={1.8}
              />
              <rect x={svgWidth - 65} y={getY(activeSignal.stopLoss.price) - 7} width={60} height={14} fill="#dc2626" rx={2} />
              <text x={svgWidth - 35} y={getY(activeSignal.stopLoss.price) + 3} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                SL -{activeSignal.stopLoss.pips}p
              </text>

              {/* Take Profit 1 */}
              <line
                x1={0}
                y1={getY(activeSignal.takeProfits.tp1.price)}
                x2={svgWidth - 65}
                y2={getY(activeSignal.takeProfits.tp1.price)}
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 2"
              />
              <rect x={svgWidth - 65} y={getY(activeSignal.takeProfits.tp1.price) - 7} width={60} height={14} fill="#059669" rx={2} />
              <text x={svgWidth - 35} y={getY(activeSignal.takeProfits.tp1.price) + 3} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                TP1 +{activeSignal.takeProfits.tp1.pips}p
              </text>

              {/* Take Profit 2 */}
              <line
                x1={0}
                y1={getY(activeSignal.takeProfits.tp2.price)}
                x2={svgWidth - 65}
                y2={getY(activeSignal.takeProfits.tp2.price)}
                stroke="#059669"
                strokeWidth={1.5}
                strokeDasharray="4 2"
              />
              <rect x={svgWidth - 65} y={getY(activeSignal.takeProfits.tp2.price) - 7} width={60} height={14} fill="#047857" rx={2} />
              <text x={svgWidth - 35} y={getY(activeSignal.takeProfits.tp2.price) + 3} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                TP2 +{activeSignal.takeProfits.tp2.pips}p
              </text>
            </g>
          )}

          {/* Candlesticks rendering */}
          {candles.map((candle, idx) => {
            const x = idx * candleWidth + 15;
            const yOpen = getY(candle.open);
            const yClose = getY(candle.close);
            const yHigh = getY(candle.high);
            const yLow = getY(candle.low);
            const isBullish = candle.close >= candle.open;
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));
            const isHovered = hoveredCandle === idx;

            return (
              <g
                key={candle.time || idx}
                onMouseEnter={() => setHoveredCandle(idx)}
                onMouseLeave={() => setHoveredCandle(null)}
                className="cursor-pointer"
              >
                {/* Wick */}
                <line
                  x1={x + candleWidth / 2}
                  y1={yHigh}
                  x2={x + candleWidth / 2}
                  y2={yLow}
                  stroke={isBullish ? '#10b981' : '#f43f5e'}
                  strokeWidth={1.2}
                />
                {/* Body */}
                <rect
                  x={x + 1}
                  y={bodyTop}
                  width={Math.max(2, candleWidth - 2)}
                  height={bodyHeight}
                  fill={isBullish ? '#10b981' : '#f43f5e'}
                  rx={0.5}
                  stroke={isHovered ? '#ffffff' : 'none'}
                  strokeWidth={isHovered ? 1 : 0}
                />
              </g>
            );
          })}

          {/* Current Live Price Horizontal Marker */}
          <line
            x1={0}
            y1={getY(asset.price)}
            x2={svgWidth - 65}
            y2={getY(asset.price)}
            stroke="#f27d26"
            strokeWidth={1.2}
            strokeDasharray="3 2"
          />
          <rect x={svgWidth - 65} y={getY(asset.price) - 8} width={65} height={16} fill="#f27d26" rx={2} />
          <text x={svgWidth - 32} y={getY(asset.price) + 3} fill="#05070a" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="monospace">
            {asset.price.toFixed(asset.digits)}
          </text>

          {/* Divider between Main and Sub-Chart */}
          <line x1={0} y1={mainChartHeight + 15} x2={svgWidth} y2={mainChartHeight + 15} stroke="#ffffff" strokeOpacity={0.08} strokeWidth={1} />

          {/* Sub-Chart Indicator (RSI / MACD / Volume) */}
          {activeSubChart === 'RSI' && (
            <g>
              {/* RSI Boundaries */}
              <line x1={0} y1={getSubY(70, 0, 100)} x2={svgWidth - 65} y2={getSubY(70, 0, 100)} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.5} />
              <line x1={0} y1={getSubY(50, 0, 100)} x2={svgWidth - 65} y2={getSubY(50, 0, 100)} stroke="#64748b" strokeDasharray="2 2" opacity={0.3} />
              <line x1={0} y1={getSubY(30, 0, 100)} x2={svgWidth - 65} y2={getSubY(30, 0, 100)} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />

              <text x={10} y={mainChartHeight + 30} fill="#f27d26" fontSize="10" fontWeight="bold">
                RSI (14): {asset.technicals.rsi}
              </text>
              <text x={svgWidth - 55} y={getSubY(70, 0, 100) + 3} fill="#f43f5e" fontSize="8">70</text>
              <text x={svgWidth - 55} y={getSubY(30, 0, 100) + 3} fill="#10b981" fontSize="8">30</text>

              {/* Dynamic RSI simulated trajectory */}
              <polyline
                points={candles.map((c, i) => `${i * candleWidth + 15},${getSubY(50 + (c.close - asset.candles[0].open) * (asset.symbol.includes('XAU') ? 1.2 : 400), 0, 100)}`).join(' ')}
                fill="none"
                stroke="#f27d26"
                strokeWidth={1.8}
              />
            </g>
          )}

          {activeSubChart === 'VOLUME' && (
            <g>
              <text x={10} y={mainChartHeight + 30} fill="#38bdf8" fontSize="10" fontWeight="bold">
                Volume Delta / Tick Flow
              </text>
              {candles.map((c, i) => {
                const h = (c.volume / 3000) * (subChartHeight - 20);
                const x = i * candleWidth + 15;
                const isBull = c.close >= c.open;
                return (
                  <rect
                    key={i}
                    x={x + 1}
                    y={mainChartHeight + 20 + subChartHeight - h}
                    width={Math.max(2, candleWidth - 2)}
                    height={h}
                    fill={isBull ? '#10b981' : '#f43f5e'}
                    fillOpacity={0.6}
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Sub-Chart Selector Tabs */}
        <div className="absolute bottom-2 left-3 flex items-center bg-black/40 backdrop-blur-md rounded-md border border-white/10 p-0.5 text-[10px]">
          {(['RSI', 'VOLUME'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubChart(tab)}
              className={`px-2.5 py-0.5 rounded font-bold transition ${
                activeSubChart === tab ? 'bg-orange-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
