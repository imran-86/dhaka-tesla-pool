'use client';

import React from 'react';
import { UserSession } from '@/types/auth.types';
import { PersonaBadge } from './PersonaBadge';
import { logoutAction } from '@/actions/auth.actions';
import { Zap, LogOut, History, Car } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  user?: UserSession | null;
}

export function Navbar({ user }: NavbarProps) {
  const isPassenger = user?.role === 'PASSENGER';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <Link
          href={user ? (user.role === 'DRIVER' ? '/driver' : '/passenger') : '/'}
          className="flex items-center gap-2 group transition"
        >
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
              Dhaka Tesla Pool
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950/80 text-red-400 border border-red-800 font-mono">
                BULLET
              </span>
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              স্মার্ট রাইড শেয়ারিং ড্যাশবোর্ড
            </span>
          </div>
        </Link>

        {/* User state and actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Passenger Navigation Links */}
              {isPassenger && (
                <div className="flex items-center gap-1.5 mr-1">
                  <Link
                    href="/passenger"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition"
                  >
                    <Car className="w-3.5 h-3.5 text-red-400" />
                    <span className="hidden md:inline">নতুন বুকিং</span>
                  </Link>

                  <Link
                    href="/passenger/history"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition"
                  >
                    <History className="w-3.5 h-3.5 text-sky-400" />
                    <span>রাইড হিস্টোরি</span>
                  </Link>
                </div>
              )}

              <PersonaBadge
                name={user.name}
                role={user.role}
                phone={user.phone}
                vehicleModel={user.vehicle?.modelName}
                capacity={user.vehicle?.capacity}
              />

              <button
                type="button"
                onClick={() => logoutAction()}
                aria-label="লগআউট করুন"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-red-400 hover:border-red-900 hover:bg-red-950/30 transition shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            </>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              সিস্টেম সচল
            </div>
          )}
        </div>
      </div>
    </header>
  );
}