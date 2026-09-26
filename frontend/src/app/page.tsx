// frontend/src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/actions/auth.actions';
import { DEMO_CREDENTIALS } from '@/lib/constants';
import { Toast } from '@/components/shared/Toast';
import { Zap, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
const [phone, setPhone] = useState<string>('01810000001'); // Default: Nusrat
const [password, setPassword] = useState<string>(DEMO_CREDENTIALS.DEFAULT_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (targetPhone?: string) => {
    setLoading(true);
    setError(null);

    const activePhone = targetPhone || phone;
    const result = await loginAction(activePhone, password);

    if (!result.success) {
      setError(result.error || 'লগইন ব্যর্থ হয়েছে। নম্বর বা পাসওয়ার্ড যাচাই করুন।');
      setLoading(false);
      return;
    }

    // Role-based routing
    if (result.role === 'DRIVER') {
      router.push('/driver');
    } else {
      router.push('/passenger');
    }
  };

  const handlePersonaClick = (personaPhone: string) => {
    setPhone(personaPhone);
    handleLogin(personaPhone);
  };

  return (
    <div className="max-w-xl mx-auto w-full my-auto space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" /> ঢাকা ইলেকট্রিক রাইড পুলিং
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Dhaka Tesla Pool
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          সিট শেয়ার করুন, খরচ কমান, যানজট মুক্ত ঢাকা গড়ুন। ৩-সিটের বুলেট ইলেকট্রিক কার।
        </p>
      </div>

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      {/* Demo Persona Quick-Login Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            মূল্যায়নকারী ডেমো অ্যাকাউন্ট (এক ক্লিকে লগইন):
          </label>
          <span className="text-[10px] text-slate-500 font-mono">Password: Tesla@123</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DEMO_CREDENTIALS.PERSONAS.map((p) => {
            const isDriver = p.role === 'DRIVER';
            return (
              <button
                key={p.phone}
                type="button"
                disabled={loading}
                onClick={() => handlePersonaClick(p.phone)}
                className="text-left p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700 transition disabled:opacity-50 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-red-400 transition-colors">
                    {p.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isDriver
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {isDriver ? '🚗 ড্রাইভার (Bullet)' : '👤 যাত্রী'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {p.description}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {p.phone}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Login Form */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block text-slate-400 mb-1 font-medium">মোবাইল নম্বর</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="01810000001"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">পাসওয়ার্ড</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition text-xs font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/20"
          >
            {loading ? (
              'যাচাই করা হচ্ছে...'
            ) : (
              <>
                <span>লগইন করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        সব অ্যাকাউন্টের ডিফল্ট পাসওয়ার্ড: <code className="text-slate-300 font-mono">Tesla@123</code>
      </div>
    </div>
  );
}