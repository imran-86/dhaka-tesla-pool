import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionAction } from '@/actions/auth.actions';
import { BookingForm } from '@/components/passengers/BookingForm';

import { ShieldAlert } from 'lucide-react';

export default async function PassengerDashboardPage() {
  const session = await getSessionAction();

  // Route protection
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
      </div>

      {/* The interactive booking form containing FareCard */}
      <BookingForm passengerId={session.id} defaultPickup="Banani" defaultDestination="Mohakhali" />
    </div>
  );
}