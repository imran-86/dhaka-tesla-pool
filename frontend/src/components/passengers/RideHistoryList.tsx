// frontend/src/components/passenger/RideHistoryList.tsx
'use client';

import React, { useState } from 'react';
import { RideRequest, RideStatus } from '@/types/ride.types';
import { cancelRideAction } from '@/actions/passenger.actions';
import { Toast } from '@/components/shared/Toast';
import {
  Clock,
  Car,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
} from 'lucide-react';

interface RideHistoryListProps {
  rides: RideRequest[];
  passengerId: string;
}

export function RideHistoryList({ rides, passengerId }: RideHistoryListProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleCancel = async (rideId: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই রাইডটি বাতিল করতে চান?')) return;

    setCancellingId(rideId);
    setFeedback(null);

    const res = await cancelRideAction(rideId, passengerId);
    setCancellingId(null);

    if (res.success) {
      setFeedback({ message: 'রাইডটি সফলভাবে বাতিল করা হয়েছে।', type: 'success' });
    } else {
      setFeedback({
        message: res.error || 'রাইড বাতিল করা সম্ভব হয়নি। ট্রিপ শুরু হয়ে থাকতে পারে।',
        type: 'error',
      });
    }
  };

  const getStatusBadge = (status: RideStatus) => {
    const config: Record<RideStatus, { label: string; bg: string; text: string; border: string }> = {
      REQUESTED: {
        label: 'অপেক্ষমাণ (Requested)',
        bg: 'bg-amber-950/60',
        text: 'text-amber-400',
        border: 'border-amber-800',
      },
      MATCHED: {
        label: 'ম্যাচ হয়েছে (Matched)',
        bg: 'bg-sky-950/60',
        text: 'text-sky-400',
        border: 'border-sky-800',
      },
      DRIVER_ARRIVED: {
        label: 'ড্রাইভার উপস্থিত (Arrived)',
        bg: 'bg-indigo-950/60',
        text: 'text-indigo-400',
        border: 'border-indigo-800',
      },
      STARTED: {
        label: 'চলমান (On Trip)',
        bg: 'bg-emerald-950/60',
        text: 'text-emerald-400',
        border: 'border-emerald-800',
      },
      COMPLETED: {
        label: 'সম্পন্ন (Completed)',
        bg: 'bg-slate-800',
        text: 'text-slate-300',
        border: 'border-slate-700',
      },
      CANCELLED: {
        label: 'বাতিল (Cancelled)',
        bg: 'bg-rose-950/60',
        text: 'text-rose-400',
        border: 'border-rose-800',
      },
    };

    const c = config[status] || config.REQUESTED;
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
        {c.label}
      </span>
    );
  };

  if (!rides || rides.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-center text-xs text-slate-500">
        কোনো পূর্ববর্তী রাইড পাওয়া যায়নি। উপরের ফর্মটি ব্যবহার করে আপনার প্রথম রাইড বুক করুন।
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-red-400" /> আপনার রাইড সমূহ ({rides.length})
        </h3>
      </div>

      {feedback && (
        <Toast
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}

      <div className="space-y-2.5">
        {rides.map((ride) => {
          const canCancel = ride.status === 'REQUESTED' || ride.status === 'MATCHED';
          const vehicle = ride.pool?.vehicle;

          return (
            <div
              key={ride.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 text-xs shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  <span className="text-white font-bold">{ride.pickupZone}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-white font-bold">{ride.destinationZone}</span>
                </div>
                {getStatusBadge(ride.status)}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-[11px] text-slate-400">
                <div>
                  <span className="text-slate-500 block">আসন সংখ্যা</span>
                  <span className="text-slate-200 font-semibold">{ride.seatsRequested} টি</span>
                </div>
                <div>
                  <span className="text-slate-500 block">পরিশোধিত ভাড়া</span>
                  <span className="text-red-400 font-mono font-bold">
                    ৳ {ride.farePoysha ? Math.round(ride.farePoysha / 100) : '—'}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block">তারিখ ও সময়</span>
                  <span className="text-slate-300">
                    {new Date(ride.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Pool & Driver Telemetry */}
              {vehicle && (
                <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <div>
                      <span className="text-slate-200 font-medium">{vehicle.modelName}</span>
                      <span className="text-slate-500 ml-1.5">ড্রাইভার: {vehicle.driver.name}</span>
                    </div>
                  </div>
                  <span className="font-mono text-slate-400">{vehicle.driver.phone}</span>
                </div>
              )}

              {/* Cancellation Trigger */}
              {canCancel && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    disabled={cancellingId === ride.id}
                    onClick={() => handleCancel(ride.id)}
                    className="px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 text-[11px] font-semibold transition disabled:opacity-50"
                  >
                    {cancellingId === ride.id ? 'বাতিল হচ্ছে...' : 'রাইড বাতিল করুন'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}