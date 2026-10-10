import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { InteractiveChart } from './components/InteractiveChart';
import { LiveMarketWatch } from './components/LiveMarketWatch';
import { AiAdvisorPanel } from './components/AiAdvisorPanel';
import { OpportunityMatrix } from './components/OpportunityMatrix';
import { EconomicNewsCalendar } from './components/EconomicNewsCalendar';
import { RiskManagementDashboard } from './components/RiskManagementDashboard';
import { ScalpingTerminal } from './components/ScalpingTerminal';
import { BacktestTerminal } from './components/BacktestTerminal';
import { PaperTradingDesk } from './components/PaperTradingDesk';
import { DailyReportModal } from './components/DailyReportModal';
import { INITIAL_ASSETS } from './data/marketData';
import { simulateMarketTick } from './services/marketEngine';
import { generateTradeSignal } from './services/scoringEngine';
import { DEFAULT_RISK_SETTINGS, calculatePositionSize } from './services/riskEngine';
import {
  AssetInfo,
  OperatingMode,
  Timeframe,
  TradeSignal,
  RiskSettings,
  PaperPosition,
} from './types/trading';

export default function App() {
  const [assets, setAssets] = useState<AssetInfo[]>(INITIAL_ASSETS);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>('XAU/USD');
  const [currentMode, setCurrentMode] = useState<OperatingMode>('MONITORING');
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('15M');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [accountBalance, setAccountBalance] = useState<number>(25000);
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(DEFAULT_RISK_SETTINGS);
  const [tradingHalt, setTradingHalt] = useState<boolean>(false);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Paper Trading Open Positions
  const [paperPositions, setPaperPositions] = useState<PaperPosition[]>([
    {
      id: 'pos-xau-initial',
      asset: 'XAU/USD',
      direction: 'BUY',
      lotSize: 0.5,
      entryPrice: 2885.2,
      currentPrice: 2894.4,
      stopLoss: 2865.0,
      takeProfit: 2925.0,
      openTime: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pnl: 460.0,
      pips: 92,
      strategy: 'Gold Momentum',
      status: 'OPEN',
    },
  ]);

  const isAr = language === 'ar';

  // Get current selected asset
  const selectedAsset = useMemo(() => {
    return assets.find((a) => a.symbol === selectedAssetSymbol) || assets[0];
  }, [assets, selectedAssetSymbol]);

  // Compute live trade signal for selected asset
  const activeSignal = useMemo(() => {
    return generateTradeSignal(selectedAsset, language);
  }, [selectedAsset, language]);

  // All signals across all assets
  const allSignals = useMemo(() => {
    return assets.map((a) => generateTradeSignal(a, language));
  }, [assets, language]);

  // Live Market Tick Simulator Engine (ticks every 2.5s)
  useEffect(() => {
    if (tradingHalt) return;

    const interval = setInterval(() => {
      setAssets((prevAssets) => {
        return prevAssets.map((asset) => {
          // Add micro fluctuation
          return simulateMarketTick(asset);
        });
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [tradingHalt]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Paper trade executor
  const handleExecutePaperTrade = (signal: TradeSignal) => {
    const calc = calculatePositionSize(
      accountBalance,
      riskSettings.riskPercentage,
      signal.stopLoss.pips,
      selectedAsset
    );

    const newPos: PaperPosition = {
      id: `pos-${signal.asset}-${Date.now()}`,
      asset: signal.asset,
      direction: signal.direction === 'BUY' ? 'BUY' : 'SELL',
      lotSize: calc.lotSize,
      entryPrice: signal.entryPrice,
      currentPrice: signal.entryPrice,
      stopLoss: signal.stopLoss.price,
      takeProfit: signal.takeProfits.tp1.price,
      openTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pnl: 0,
      pips: 0,
      strategy: signal.strategy,
      status: 'OPEN',
    };

    setPaperPositions((prev) => [newPos, ...prev]);
    showToast(
      isAr
        ? `✅ تم تنفيذ الصفقة التجريبية على ${signal.asset} بحجم ${calc.lotSize} لوت بنجاح!`
        : `✅ Executed ${calc.lotSize} lot paper trade on ${signal.asset}!`
    );
  };

  const handleClosePosition = (id: string) => {
    const pos = paperPositions.find((p) => p.id === id);
    if (!pos) return;

    const liveAsset = assets.find((a) => a.symbol === pos.asset);
    const currentPrice = liveAsset ? liveAsset.price : pos.entryPrice;
    const isBuy = pos.direction === 'BUY';
    const isGold = pos.asset.includes('XAU');
    const pipSize = liveAsset?.pipSize || (isGold ? 0.01 : 0.0001);
    const pips = Math.round((isBuy ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice) / pipSize);
    const pnl = Number((pips * 10 * pos.lotSize).toFixed(2));

    setAccountBalance((prev) => Number((prev + pnl).toFixed(2)));
    setPaperPositions((prev) => prev.filter((p) => p.id !== id));
    showToast(
      isAr
        ? `تم إغلاق صفقة ${pos.asset} بنتيجة ${pnl >= 0 ? '+' : ''}$${pnl} (${pips} نقطة)`
        : `Closed ${pos.asset} position: ${pnl >= 0 ? '+' : ''}$${pnl} (${pips} pips)`
    );
  };

  const handlePartialClose = (id: string, ratio = 0.5) => {
    const pos = paperPositions.find((p) => p.id === id);
    if (!pos) return;

    const liveAsset = assets.find((a) => a.symbol === pos.asset);
    const currentPrice = liveAsset ? liveAsset.price : pos.entryPrice;
    const isBuy = pos.direction === 'BUY';
    const isGold = pos.asset.includes('XAU');
    const pipSize = liveAsset?.pipSize || (isGold ? 0.01 : 0.0001);
    const pips = Math.round((isBuy ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice) / pipSize);
    const closedLots = Number((pos.lotSize * ratio).toFixed(2));
    const pnl = Number((pips * 10 * closedLots).toFixed(2));

    setAccountBalance((prev) => Number((prev + pnl).toFixed(2)));
    setPaperPositions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              lotSize: Number((p.lotSize - closedLots).toFixed(2)),
              stopLoss: p.entryPrice, // move SL to break-even!
            }
          : p
      )
    );

    showToast(
      isAr
        ? `✅ تم حجز 50% من الأرباح (${closedLots} لوت) ونقل الوقف لنقطة الدخول (Break-Even)!`
        : `✅ Secured 50% profits (${closedLots} lots) and moved SL to Break-Even!`
    );
  };

  const handleCloseAllPositions = () => {
    let totalPnl = 0;
    paperPositions.forEach((pos) => {
      const liveAsset = assets.find((a) => a.symbol === pos.asset);
      const currentPrice = liveAsset ? liveAsset.price : pos.entryPrice;
      const isBuy = pos.direction === 'BUY';
      const isGold = pos.asset.includes('XAU');
      const pipSize = liveAsset?.pipSize || (isGold ? 0.01 : 0.0001);
      const pips = Math.round((isBuy ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice) / pipSize);
      totalPnl += pips * 10 * pos.lotSize;
    });

    setAccountBalance((prev) => Number((prev + totalPnl).toFixed(2)));
    setPaperPositions([]);
    showToast(
      isAr
        ? `🛑 تم إغلاق كافة الصفقات المفتوحة بنجاح. صافي التغيير: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`
        : `🛑 Closed all open positions. Net change: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`
    );
  };

  return (
    <div
      className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200 relative overflow-x-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Frosted Glass Mesh Background */}
      <div className="mesh-bg"></div>

      {/* Institutional App Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        accountBalance={accountBalance}
        tradingHalt={tradingHalt}
        onToggleTradingHalt={() => {
          setTradingHalt(!tradingHalt);
          showToast(
            !tradingHalt
              ? (isAr ? '🛑 تم تفعيل إيقاف التداول الطارئ (Trading Halt Active)' : '🛑 Emergency Trading Halt Activated')
              : (isAr ? '🟢 تم استئناف مراقبة السوق اللحظية' : '🟢 Live Market Stream Resumed')
          );
        }}
        onOpenDailyReport={() => setIsDailyReportOpen(true)}
        onQuickAnalyze={() => {
          setCurrentMode('ANALYSIS');
        }}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">
        {/* Mode 1: MONITORING (Default Full Cockpit View) */}
        {currentMode === 'MONITORING' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left/Main Column: Interactive Candlestick Chart & Deep AI Panel */}
            <div className="lg:col-span-8 space-y-4">
              <InteractiveChart
                asset={selectedAsset}
                activeSignal={activeSignal}
                timeframe={activeTimeframe}
                onSelectTimeframe={setActiveTimeframe}
                language={language}
              />

              <AiAdvisorPanel
                selectedAsset={selectedAsset}
                activeSignal={activeSignal}
                language={language}
                onExecutePaperTrade={handleExecutePaperTrade}
              />
            </div>

            {/* Right Column: Live Market Watch Matrix & Quick Opportunities */}
            <div className="lg:col-span-4 space-y-4">
              <LiveMarketWatch
                assets={assets}
                selectedAsset={selectedAsset}
                onSelectAsset={(a) => setSelectedAssetSymbol(a.symbol)}
                onAnalyzeAsset={(a) => {
                  setSelectedAssetSymbol(a.symbol);
                  setCurrentMode('ANALYSIS');
                }}
                language={language}
              />

              {/* Quick Paper Trading Widget */}
              <div className="glass-panel rounded-xl p-3.5 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">
                    {isAr ? 'الصفقات المفتوحة اللحظية' : 'Open Paper Positions'}
                  </span>
                  <button
                    onClick={() => setCurrentMode('PAPER_TRADING')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                  >
                    {isAr ? 'عرض الكل' : 'View All'} ({paperPositions.length})
                  </button>
                </div>
                {paperPositions.length > 0 ? (
                  <div className="space-y-2 text-xs font-mono">
                    {paperPositions.slice(0, 2).map((p) => (
                      <div
                        key={p.id}
                        className="bg-white/[0.03] backdrop-blur-md p-2.5 rounded-lg border border-white/10 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{p.asset}</span>
                            <span className={p.direction === 'BUY' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {p.direction}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">({p.lotSize}L)</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Entry: ${p.entryPrice}</div>
                        </div>

                        <div className="text-right rtl:text-left">
                          <button
                            onClick={() => handleClosePosition(p.id)}
                            className="px-2.5 py-1 bg-white/10 hover:bg-rose-500 text-slate-200 hover:text-white rounded text-[10px] font-semibold border border-white/10 transition"
                          >
                            {isAr ? 'إغلاق' : 'Close'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 py-3 text-center">
                    {isAr ? 'لا توجد صفقات مفتوحة حالياً' : 'No active positions'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: ANALYSIS (Full Screen AI Terminal) */}
        {currentMode === 'ANALYSIS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <LiveMarketWatch
                assets={assets}
                selectedAsset={selectedAsset}
                onSelectAsset={(a) => setSelectedAssetSymbol(a.symbol)}
                onAnalyzeAsset={(a) => setSelectedAssetSymbol(a.symbol)}
                language={language}
              />
            </div>
            <div className="lg:col-span-7">
              <AiAdvisorPanel
                selectedAsset={selectedAsset}
                activeSignal={activeSignal}
                language={language}
                onExecutePaperTrade={handleExecutePaperTrade}
              />
            </div>
          </div>
        )}

        {/* Mode 3: SIGNAL (Opportunity Matrix) */}
        {currentMode === 'SIGNAL' && (
          <OpportunityMatrix
            assets={assets}
            onSelectAsset={(a) => {
              setSelectedAssetSymbol(a.symbol);
              setCurrentMode('MONITORING');
            }}
            onExecuteTrade={handleExecutePaperTrade}
            language={language}
          />
        )}

        {/* Mode 4: SCALPING (High-Speed Scalping Desk) */}
        {currentMode === 'SCALPING' && (
          <ScalpingTerminal
            assets={assets}
            onSelectAsset={(a) => {
              setSelectedAssetSymbol(a.symbol);
              setCurrentMode('MONITORING');
            }}
            onExecuteTrade={handleExecutePaperTrade}
            language={language}
          />
        )}

        {/* Mode 5: NEWS (Economic News Intelligence) */}
        {currentMode === 'NEWS' && <EconomicNewsCalendar language={language} />}

        {/* Mode 6: RISK (Risk Management & Lot Sizer) */}
        {currentMode === 'RISK' && (
          <RiskManagementDashboard
            assets={assets}
            selectedAsset={selectedAsset}
            riskSettings={riskSettings}
            onUpdateRiskSettings={setRiskSettings}
            language={language}
          />
        )}

        {/* Mode 7: BACKTEST (Strategy Backtest Engine) */}
        {currentMode === 'BACKTEST' && <BacktestTerminal assets={assets} language={language} />}

        {/* Mode 8: PAPER_TRADING (Execution Desk) */}
        {currentMode === 'PAPER_TRADING' && (
          <PaperTradingDesk
            positions={paperPositions}
            assets={assets}
            accountBalance={accountBalance}
            onClosePosition={handleClosePosition}
            onPartialClose={handlePartialClose}
            onCloseAll={handleCloseAllPositions}
            language={language}
          />
        )}
      </main>

      {/* Floating Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 rtl:left-5 rtl:right-auto z-50 glass-panel-elevated text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-fade-in border border-cyan-500/30">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Institutional Daily Briefing Modal */}
      <DailyReportModal
        isOpen={isDailyReportOpen}
        onClose={() => setIsDailyReportOpen(false)}
        assets={assets}
        signals={allSignals}
        language={language}
      />
    </div>
  );
}
