// frontend/src/components/shared/PersonaBadge.tsx
'use client';

import React from 'react';
import { UserRole } from '@/types/auth.types';
import { Car, ShieldCheck, UserCheck } from 'lucide-react';

interface PersonaBadgeProps {
  name: string;
  role: UserRole;
  phone?: string;
  vehicleModel?: string | null;
  capacity?: number | null;
}

export function PersonaBadge({
  name,
  role,
  phone,
  vehicleModel,
  capacity,
}: PersonaBadgeProps) {
  const isDriver = role === 'DRIVER';

  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/90 text-xs shadow-sm">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
          isDriver
            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
        }`}
      >
        {isDriver ? (
          <Car className="w-3.5 h-3.5" />
        ) : (
          <UserCheck className="w-3.5 h-3.5" />
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-semibold text-slate-100">{name}</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase ${
              isDriver
                ? 'bg-red-950 text-red-300 border border-red-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}
          >
            {isDriver ? 'ড্রাইভার' : 'যাত্রী'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 leading-none">
          {phone && <span>{phone}</span>}
          {isDriver && vehicleModel && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-red-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {vehicleModel} ({capacity ?? 3} আসন)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}