import React, { useState } from 'react';
import {
  Zap,
  Send,
  Sparkles,
  Bot,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  FileDown,
  Copy,
} from 'lucide-react';
import { AssetInfo, TradeSignal } from '../types/trading';

interface AiAdvisorPanelProps {
  selectedAsset: AssetInfo;
  activeSignal: TradeSignal | null;
  language: 'ar' | 'en';
  onExecutePaperTrade: (signal: TradeSignal) => void;
}

export const AiAdvisorPanel: React.FC<AiAdvisorPanelProps> = ({
  selectedAsset,
  activeSignal,
  language,
  onExecutePaperTrade,
}) => {
  const [messages, setMessages] = useState<
    { id: string; sender: 'user' | 'ai'; text: string; timestamp: string; signal?: TradeSignal | null }[]
  >([
    {
      id: 'welcome',
      sender: 'ai',
      text:
        language === 'ar'
          ? `مرحباً بك. أنا **Smart AI Trading Agent (v1.0 Institutional Intelligence)**. جاهز لتقديم التحليل الكمي، واكتشاف فرص الذهب والعملات، ومراقبة المخاطر وفق النظام المؤسسي. اختر أمراً سريعاً أو اسأل مباشرة.`
          : `Welcome. I am **Smart AI Trading Agent (v1.0 Institutional Intelligence)**. Ready to deliver quantitative confluence, market structure analysis, and risk-adjusted opportunities for Forex and Precious Metals.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isAr = language === 'ar';

  const quickCommands = isAr
    ? [
        { label: '🔥 أفضل الفرص الآن', prompt: 'ما هي أفضل الفرص المتاحة حالياً وفق أعلى Trade Score؟' },
        { label: '🏆 حلل الذهب XAU/USD', prompt: 'حلل الذهب XAU/USD تحليلاً مؤسسياً شاملاً مع مناطق الدخول والوقف والأهداف' },
        { label: '⚡ فرص السكالبينج', prompt: 'أعطني فرص السكالبينج السريعة اللحظية المتاحة الآن مع شروط التنفيذ' },
        { label: '💵 ما اتجاه الدولار DXY؟', prompt: 'ما هو اتجاه الدولار DXY وتأثيره على أزواج العملات والذهب؟' },
        { label: '🎯 أين أفضل دخول وSL/TP؟', prompt: `أين أفضل نطاق دخول ومستويات الوقف والأهداف لـ ${selectedAsset.symbol}؟` },
        { label: '📊 حلل السوق الآن', prompt: 'أجرِ مسحاً شاملاً للسوق وحدد اتجاهات العملات الرئيسية والمعادن' },
      ]
    : [
        { label: '🔥 Top Opportunities', prompt: 'What are the highest Trade Score opportunities right now?' },
        { label: '🏆 Analyze Gold XAU/USD', prompt: 'Provide full institutional analysis for Gold XAU/USD with Entry, SL, and TPs' },
        { label: '⚡ Scalping Setups', prompt: 'Scan for immediate high-probability scalping opportunities' },
        { label: '💵 Dollar Index (DXY)', prompt: 'What is the current macro trend for USD / DXY and its correlation impact?' },
        { label: '🎯 Optimal Entry & SL/TP', prompt: `What is the optimal entry zone, stop loss, and targets for ${selectedAsset.symbol}?` },
        { label: '📊 Analyze Market Now', prompt: 'Run complete market scan for Majors and Precious Metals' },
      ];

  const handleSendMessage = async (promptToSend?: string) => {
    const prompt = promptToSend || inputText;
    if (!prompt.trim() || isLoading) return;

    const userMessageId = Date.now().toString();
    const userMsg = {
      id: userMessageId,
      sender: 'user' as const,
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/trading/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          selectedAsset: selectedAsset.symbol,
          currentMarket: {
            price: selectedAsset.price,
            bid: selectedAsset.bid,
            ask: selectedAsset.ask,
            spread: selectedAsset.spread,
            high24h: selectedAsset.high24h,
            low24h: selectedAsset.low24h,
            change24h: selectedAsset.change24h,
            atr: selectedAsset.technicals.atr,
            rsi: selectedAsset.technicals.rsi,
            macd: selectedAsset.technicals.macd,
            ema9: selectedAsset.technicals.ema9,
            ema20: selectedAsset.technicals.ema20,
            ema50: selectedAsset.technicals.ema50,
            ema200: selectedAsset.technicals.ema200,
            regime: selectedAsset.regime,
            supportZones: selectedAsset.supportZones,
            resistanceZones: selectedAsset.resistanceZones,
            orderBlocks: selectedAsset.orderBlocks,
          },
          language,
        }),
      });

      const data = await response.json();

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai' as const,
        text: data.analysisText || 'تم إنشاء التحليل بنجاح.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        signal: activeSignal,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai' as const,
          text: isAr
            ? `⚠️ حدث خطأ في الاتصال بالوكيل الذكي: ${err.message}. يرجى المحاولة مرة أخرى.`
            : `⚠️ AI Advisor connection error: ${err.message}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="p-3 bg-white/[0.03] backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>Smart AI Trading Advisor</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold">
                Gemini 3.7 Flash
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              {isAr ? 'مستشار التداول المؤسسي وإصدار التقارير' : 'Institutional Advisory & Strategy Formulation'}
            </p>
          </div>
        </div>

        {activeSignal && (
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                activeSignal.direction === 'BUY'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : activeSignal.direction === 'SELL'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}
            >
              {activeSignal.direction} {activeSignal.asset}
            </span>
          </div>
        )}
      </div>

      {/* Active Signal Institutional Card (If Available) */}
      {activeSignal && (
        <div className="p-3 bg-black/25 backdrop-blur-md border-b border-white/10">
          <div className="bg-white/[0.03] backdrop-blur-md p-3.5 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white stat-value">{activeSignal.asset}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold">
                  {activeSignal.strategy}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-400">{isAr ? 'التقييم:' : 'Score:'}</span>
                <span className="font-bold text-orange-400 text-sm stat-value">{activeSignal.tradeScore}/100</span>
                <span className="text-emerald-400 font-semibold">({activeSignal.confidenceLevel} Conf.)</span>
              </div>
            </div>

            {/* Price Levels Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono my-2.5">
              <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase tracking-tight">{isAr ? 'سعر الدخول' : 'Entry Price'}</div>
                <div className="font-bold text-cyan-300 text-sm stat-value">${activeSignal.entryPrice}</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-rose-500/30">
                <div className="text-[10px] text-rose-400 uppercase tracking-tight">{isAr ? 'وقف الخسارة (SL)' : 'Stop Loss'}</div>
                <div className="font-bold text-rose-400 text-sm stat-value">${activeSignal.stopLoss.price}</div>
                <div className="text-[9px] text-slate-400">-{activeSignal.stopLoss.pips} pips (1% Risk)</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-emerald-500/30">
                <div className="text-[10px] text-emerald-400 uppercase tracking-tight">{isAr ? 'الهدف TP1 (50%)' : 'Target TP1'}</div>
                <div className="font-bold text-emerald-400 text-sm stat-value">${activeSignal.takeProfits.tp1.price}</div>
                <div className="text-[9px] text-slate-400">+{activeSignal.takeProfits.tp1.pips} pips (1:1.5)</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-emerald-500/30">
                <div className="text-[10px] text-emerald-300 uppercase tracking-tight">{isAr ? 'الهدف TP2 (30%)' : 'Target TP2'}</div>
                <div className="font-bold text-emerald-300 text-sm stat-value">${activeSignal.takeProfits.tp2.price}</div>
                <div className="text-[9px] text-slate-400">+{activeSignal.takeProfits.tp2.pips} pips (1:2.5)</div>
              </div>
            </div>

            {/* Invalidation condition */}
            <div className="text-[11px] text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/10 flex items-start gap-2 my-2">
              <ShieldCheck className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-orange-300">{isAr ? 'شرط الإلغاء (Invalidation): ' : 'Invalidation Trigger: '}</strong>
                {activeSignal.invalidatingCondition}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
              <div className="text-[11px] text-slate-400 font-mono">
                {isAr ? 'صالح حتى: ' : 'Valid until: '} {activeSignal.expiryTime}
              </div>
              <button
                onClick={() => onExecutePaperTrade(activeSignal)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-emerald-500/20 transition active:scale-95 flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{isAr ? 'تنفيذ في الحساب التجريبي' : 'Execute Paper Order'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Command Pills */}
      <div className="p-2.5 bg-black/20 border-b border-white/5 overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse whitespace-nowrap">
          {quickCommands.map((cmd, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendMessage(cmd.prompt)}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-semibold border border-white/10 transition active:scale-95 disabled:opacity-50"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 max-h-[380px] scrollbar-thin scrollbar-thumb-white/10 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-xl p-3.5 shadow-lg whitespace-pre-wrap leading-relaxed border ${
                msg.sender === 'user'
                  ? 'bg-orange-500 text-slate-950 font-semibold border-orange-400/40 rounded-br-none rtl:rounded-bl-none rtl:rounded-br-xl'
                  : 'bg-white/[0.04] backdrop-blur-md text-slate-200 border-white/10 rounded-bl-none rtl:rounded-br-none rtl:rounded-bl-xl'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-orange-400 p-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span className="text-xs font-semibold">{isAr ? 'جاري التحليل واستخلاص البيانات المؤسسية...' : 'Computing institutional quantitative confluence...'}</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-black/30 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={
              isAr
                ? 'اسأل الوكيل الذكي (مثال: "ما سبب صعود الذهب؟", "أين الدخول الآمن؟")...'
                : 'Ask Smart AI Trading Agent...'
            }
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-orange-500 hover:bg-orange-400 disabled:bg-white/5 text-slate-950 disabled:text-slate-600 rounded-lg transition active:scale-95 border border-orange-400/40"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
