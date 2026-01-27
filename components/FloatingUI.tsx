
import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, X, ChevronRight, TrendingUp } from 'lucide-react';

export const CurrencyWidget = () => {
  const [rates, setRates] = useState({ blue: 1100, official: 850 });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
      >
        <DollarSign className="text-emerald-400" />
        <span className="text-sm font-bold">Cotización</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-64 bg-black/80 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Dólar Hoy</h3>
            <button onClick={() => setIsOpen(false)}><X size={18} /></button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-400">Dólar Blue</span>
              <span className="font-mono font-bold text-emerald-400">${rates.blue}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-400">Dólar Oficial</span>
              <span className="font-mono font-bold text-sky-400">${rates.official}</span>
            </div>
            <p className="text-[10px] text-gray-500 italic text-center">Datos referenciales para Salta Capital</p>
          </div>
        </div>
      )}
    </div>
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
    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="text-emerald-500" />
        <h3 className="text-2xl font-bold">Cotizador de Cuotas</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Entrega Inicial (USD)</label>
          <input 
            type="range" min="0" max={price} step="5000"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between mt-2 font-mono font-bold">
            <span>$0</span>
            <span className="text-emerald-400">${downPayment.toLocaleString()}</span>
            <span>${price.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Plazo (Años)</label>
            <select 
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:outline-none"
            >
              {[5, 10, 15, 20, 25, 30].map(y => <option key={y} value={y} className="bg-gray-900">{y} Años</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Interés Anual (%)</label>
            <input 
              type="number" 
              value={interest}
              onChange={(e) => setInterest(Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-400">Cuota Mensual Estimada</p>
              <h4 className="text-4xl font-black text-emerald-400">${monthlyPayment.toFixed(2)}</h4>
            </div>
            <button className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 group">
              Me interesa
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
