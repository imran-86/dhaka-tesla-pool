// frontend/src/app/passenger/history/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionAction } from '@/actions/auth.actions';
import { getPassengerRidesAction } from '@/actions/passenger.actions';
// import { RideHistoryList } from '@/components/passenger/RideHistoryList';
import { RideHistoryList } from '@/components/passengers/RideHistoryList';
import { ArrowLeft, History, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default async function PassengerHistoryPage() {
  const session = await getSessionAction();

  if (!session) {
    redirect('/');
  }

  if (session.role !== 'PASSENGER') {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
        <span>আপনি ড্রাইভার হিসেবে লগইন করেছেন।</span>
      </div>
    );
  }

  // Fetch full ride history isolated to this passenger
  const ridesRes = await getPassengerRidesAction(session.id);
  const rides = ridesRes.success && ridesRes.data ? ridesRes.data : [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/passenger"
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="বুকিং পেজে ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-sky-400" />
              আপনার সকল রাইড হিস্টোরি
            </h1>
            <p className="text-xs text-slate-400">
              {session.name} &bull; সর্বমোট {rides.length}টি রাইড সম্পন্ন বা রেকর্ডকৃত
            </p>
          </div>
        </div>
      </div>

      <RideHistoryList rides={rides} passengerId={session.id} />
    </div>
  );
}