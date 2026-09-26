// frontend/src/app/passenger/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionAction } from '@/actions/auth.actions';
// import { BookingForm } from '@/components/passenger/BookingForm';
import { ShieldAlert, History } from 'lucide-react';
import Link from 'next/link';
import { BookingForm } from '@/components/passengers/BookingForm';

export default async function PassengerDashboardPage() {
  const session = await getSessionAction();

  if (!session) {
    redirect('/');
  }

  if (session.role !== 'PASSENGER') {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
        <span>আপনি একজন ড্রাইভার হিসেবে লগইন করেছেন। আপনার কনসোলে ফিরে যান।</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">প্যাসেঞ্জার ড্যাশবোর্ড</h1>
          <p className="text-xs text-slate-400">স্বাগতম, {session.name} ({session.phone})</p>
        </div>
        <Link
          href="/passenger/history"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <History className="w-3.5 h-3.5 text-sky-400" />
          <span>সকল রাইড হিস্টোরি</span>
        </Link>
      </div>

      <BookingForm
        passengerId={session.id}
        defaultPickup="Banani"
        defaultDestination="Mohakhali"
      />
    </div>
  );
}