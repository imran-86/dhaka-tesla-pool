'use client';

import React from 'react';
import { FareCalculationResult } from '@/types/fare.types';
import { Calculator, ArrowRight, Sparkles } from 'lucide-react';

interface FareCardProps {
  fare: FareCalculationResult | null;
  loading?: boolean;
}

export function FareCard({ fare, loading }: FareCardProps) {
  if (loading) {
    return (
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 animate-pulse text-xs text-slate-400">
        ভাড়া গণনা করা হচ্ছে...
      </div>
    );
  }

  if (!fare) return null;

  return (
    <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Calculator className="w-3.5 h-3.5 text-red-400" />
          <span>ভাড়ার পূর্বরূপ (Fare Breakdown)</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> ২০% পুল ছাড় প্রযোজ্য
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
        <span className="text-white">{fare.pickupZone}</span>
        <ArrowRight className="w-3 h-3 text-slate-500" />
        <span className="text-white">{fare.destinationZone}</span>
        <span className="text-slate-500 font-normal">({fare.distanceKm} কি.মি.)</span>
      </div>

      {/* Itemized Calculation */}
      <div className="space-y-1.5 text-xs text-slate-400 pt-1">
        <div className="flex justify-between">
          <span>বেস ফেয়ার (Base Fare)</span>
          <span className="text-slate-200 font-mono">৳ {fare.baseFareTaka}</span>
        </div>
        <div className="flex justify-between">
          <span>দূরত্ব চার্জ (৳১৫ × {fare.distanceKm} কি.মি.)</span>
          <span className="text-slate-200 font-mono">৳ {fare.distanceChargeTaka}</span>
        </div>
        <div className="flex justify-between text-emerald-400">
          <span>পুল ডিসকাউন্ট (২০%)</span>
          <span className="font-mono">- ৳ {fare.poolDiscountTaka}</span>
        </div>
      </div>

      {/* Total Fare */}
      <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white">সর্বমোট ভাড়া</span>
          <span className="text-[10px] text-slate-500">পয়সা সমতুল্য: {fare.farePoysha} পয়সা</span>
        </div>
        <div className="text-xl font-extrabold text-red-500 font-mono">
          ৳ {fare.totalFareTaka}
        </div>
      </div>
    </div>
  );
}