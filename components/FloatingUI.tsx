
import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, X, ChevronRight, ArrowRightLeft, RefreshCw, Sparkles } from 'lucide-react';
import { getPropertyAdvice } from '../services/geminiService';

export const CurrencyWidget = ({ view = 'HOME' }: { view?: string }) => {
  const [rates, setRates] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number>(1);
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('ARS');
  const [result, setResult] = useState<number | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const currencies = [
    { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
    { code: 'USD', name: 'Dólar', symbol: 'US$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'CLP', name: 'Peso Chileno', symbol: 'CLP$' },
    { code: 'CNY', name: 'Yuan Chino', symbol: '¥' },
  ];

  const fetchRates = async () => {
    setLoading(true);
    try {
      // Fetch ARS specific rates (Blue and Official)
      const resBlue = await fetch('https://dolarapi.com/v1/dolares/blue');
      const resOfic = await fetch('https://dolarapi.com/v1/dolares/oficial');
      const resEur = await fetch('https://dolarapi.com/v1/cotizaciones/eur');
      const resClp = await fetch('https://dolarapi.com/v1/cotizaciones/clp');

      const blue = await resBlue.json();
      const ofic = await resOfic.json();
      const eur = await resEur.json();
      const clp = await resClp.json();

      // For CNY and others, we might need a general API or fixed approximation if API fails
      // Using exchangerate-api as secondary
      const resGeneral = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const generalData = await resGeneral.json();

      setRates({
        USD_ARS_BLUE: blue.venta,
        USD_ARS_OFIC: ofic.venta,
        EUR_ARS: eur.venta,
        CLP_ARS: clp.venta,
        USD_CNY: generalData.rates.CNY,
        USD_EUR: generalData.rates.EUR,
        baseUSD: generalData.rates
      });
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAiMarketInsight = async () => {
    setAiLoading(true);
    try {
      const insight = await getPropertyAdvice(
        "Como experto financiero en Salta, dame un breve comentario (2 lineas) sobre la situación del dólar blue vs oficial hoy y su impacto en el mercado inmobiliario local.",
        `Cotización Blue: ${rates?.USD_ARS_BLUE}, Cotización Oficial: ${rates?.USD_ARS_OFIC}`
      );
      setAiInsight(insight);
    } catch (e) {
      setAiInsight("Sin análisis disponible en este momento.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    if (!rates) return;

    const convert = () => {
      let valueInUSD = 1;

      // Convert from source to USD base
      if (fromCurr === 'ARS') valueInUSD = amount / rates.USD_ARS_BLUE;
      else if (fromCurr === 'USD') valueInUSD = amount;
      else if (fromCurr === 'EUR') valueInUSD = amount / rates.USD_EUR;
      else if (fromCurr === 'CLP') valueInUSD = (amount * rates.CLP_ARS) / rates.USD_ARS_BLUE;
      else if (fromCurr === 'CNY') valueInUSD = amount / rates.USD_CNY;

      // Convert from USD base to target
      let final = 0;
      if (toCurr === 'ARS') final = valueInUSD * rates.USD_ARS_BLUE;
      else if (toCurr === 'USD') final = valueInUSD;
      else if (toCurr === 'EUR') final = valueInUSD * rates.USD_EUR;
      else if (toCurr === 'CLP') final = (valueInUSD * rates.USD_ARS_BLUE) / rates.CLP_ARS;
      else if (toCurr === 'CNY') final = valueInUSD * rates.USD_CNY;

      setResult(final);
    };

    convert();
  }, [fromCurr, toCurr, amount, rates]);

  const isHome = view === 'HOME';

  return (
    <>
      {/* Overlay para cerrar en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[49] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all flex items-center justify-center group ${isHome ? 'px-5 md:px-6 py-3 md:py-4 gap-2 md:gap-3 hover:scale-105' : 'w-12 h-12 md:w-14 md:h-14 hover:scale-110'}`}
        >
          <div className={`${isHome ? 'w-7 h-7 md:w-8 md:h-8' : 'w-8 h-8 md:w-10 md:h-10'} bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors`}>
            <DollarSign className="text-emerald-400" size={isHome ? 16 : 20} />
          </div>
          {isHome && <span className="text-xs md:text-sm font-black uppercase tracking-widest text-white/80">Cotización</span>}
        </button>

        {isOpen && (
          <div className="fixed bottom-0 left-0 right-0 lg:absolute lg:bottom-20 lg:right-0 lg:left-auto w-full lg:w-[380px] bg-[#0a0a0a] backdrop-blur-3xl border-t lg:border border-white/10 p-6 md:p-8 rounded-t-[2rem] lg:rounded-[2.5rem] shadow-3xl animate-in slide-in-from-bottom lg:slide-in-from-top-2 lg:zoom-in-95 duration-300 overflow-hidden z-50 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Mercado de Divisas</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Quick Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Dólar Blue</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] text-emerald-500/50 italic">$</span>
                    <p className="text-xl font-black text-emerald-400 italic tracking-tighter">{rates?.USD_ARS_BLUE || '...'}</p>
                  </div>
                </div>
                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Dólar Oficial</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] text-sky-500/50 italic">$</span>
                    <p className="text-xl font-black text-sky-400 italic tracking-tighter">{rates?.USD_ARS_OFIC || '...'}</p>
                  </div>
                </div>
              </div>

              {/* Converter Section */}
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 block mb-2 px-1">De</label>
                    <select
                      value={fromCurr}
                      onChange={(e) => setFromCurr(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-emerald-500/50 cursor-pointer"
                    >
                      {currencies.map(c => <option key={c.code} value={c.code} className="bg-black">{c.code} - {c.name}</option>)}
                    </select>
                  </div>
                  <div className="pt-6">
                    <button
                      onClick={() => { const tmp = fromCurr; setFromCurr(toCurr); setToCurr(tmp); }}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-emerald-400 transition-all hover:rotate-180 duration-500"
                    >
                      <ArrowRightLeft size={16} />
                    </button>
                  </div>
                  <div className="flex-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 block mb-2 px-1">A</label>
                    <select
                      value={toCurr}
                      onChange={(e) => setToCurr(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-emerald-500/50 cursor-pointer"
                    >
                      {currencies.map(c => <option key={c.code} value={c.code} className="bg-black">{c.code} - {c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 block mb-2 px-1">Cantidad</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xl font-black outline-none focus:border-emerald-500/50 text-white italic tracking-tighter"
                  />
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">Resultado Estimado</p>
                  <div className="text-3xl font-black text-white italic tracking-tighter flex items-baseline gap-2">
                    {loading ? '...' : (
                      <>
                        <span className="text-sm text-emerald-500/50">{currencies.find(c => c.code === toCurr)?.symbol}</span>
                        {result?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Insight Section */}
              <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-3xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-orange-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">IA Insight Mercado</span>
                  </div>
                  {!aiInsight && (
                    <button
                      onClick={getAiMarketInsight}
                      disabled={aiLoading}
                      className="text-[8px] font-black uppercase bg-orange-500 text-white px-2 py-1 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      {aiLoading ? 'Analizando...' : 'Analizar'}
                    </button>
                  )}
                </div>
                {aiInsight ? (
                  <p className="text-[10px] text-gray-300 italic leading-relaxed">{aiInsight}</p>
                ) : (
                  <p className="text-[10px] text-gray-500 italic">Haz clic para analizar el mercado hoy con Gemini AI.</p>
                )}
              </div>

              <button
                onClick={fetchRates}
                className="w-full flex items-center justify-center gap-2 py-2 text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                Datos oficiales de hoy
              </button>

              {/* Espacio adicional en móvil para evitar que el contenido quede detrás del botón de cerrar */}
              <div className="h-4 lg:hidden" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export const MortgageCalculator = ({ price }: { price: number }) => {
  const [years, setYears] = useState(15);
  const [downPayment, setDownPayment] = useState(price * 0.3);
  const [interest, setInterest] = useState(7.5);

  const loanAmount = price - downPayment;
  const monthlyInterest = interest / 100 / 12;
  const numberOfPayments = years * 12;
  const monthlyPayment = (loanAmount * monthlyInterest) / (1 - Math.pow(1 + monthlyInterest, -numberOfPayments));

  return (
    <div className="bg-white/[0.02] border border-white/5 p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] backdrop-blur-md">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
          <Calculator className="text-emerald-500" />
        </div>
        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Simulador de Cuotas</h3>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex justify-between mb-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Entrega Inicial (USD)</label>
            <span className="text-emerald-400 font-black italic">USD {downPayment.toLocaleString()}</span>
          </div>
          <input
            type="range" min="0" max={price} step="5000"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Plazo</label>
            <select
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm outline-none focus:border-emerald-500/50 appearance-none"
            >
              {[5, 10, 15, 20, 25, 30].map(y => <option key={y} value={y} className="bg-black">{y} Años</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">TASA ANUAL (%)</label>
            <input
              type="number"
              value={interest}
              onChange={(e) => setInterest(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="pt-10 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Cuota Mensual Estimada</p>
              <h4 className="text-5xl font-black text-white italic tracking-tighter">USD {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
            </div>
            <button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 md:px-10 md:py-5 rounded-[1.2rem] md:rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 active:scale-95">
              Consultar
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
