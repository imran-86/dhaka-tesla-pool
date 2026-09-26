'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { DHAKA_ZONES, DhakaZone } from '@/lib/constants';
import { estimateFareAction, bookRideAction } from '@/actions/passenger.actions';
import { FareCalculationResult } from '@/types/fare.types';
import { FareCard } from './FareCard';
import { Toast } from '@/components/shared/Toast';
import { MapPin, Navigation, Users, Car, CheckCircle } from 'lucide-react';
import { FareCardSkeleton } from './FairCardSkeleton';

interface BookingFormProps {
  passengerId: string;
  defaultPickup?: DhakaZone;
  defaultDestination?: DhakaZone;
}

export function BookingForm({
  passengerId,
  defaultPickup = 'Banani',
  defaultDestination = 'Mohakhali',
}: BookingFormProps) {
  const [pickupZone, setPickupZone] = useState<DhakaZone>(defaultPickup);
  const [destinationZone, setDestinationZone] = useState<DhakaZone>(defaultDestination);
  const [seatsRequested, setSeatsRequested] = useState<number>(1);

  const [fare, setFare] = useState<FareCalculationResult | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-estimate fare whenever route changes
  useEffect(() => {
    let isCancelled = false;

    async function fetchEstimate() {
      if (pickupZone === destinationZone) {
        setFare(null);
        return;
      }
      setLoadingEstimate(true);
      const res = await estimateFareAction({ pickupZone, destinationZone, isPooled: true });
      if (!isCancelled) {
        if (res.success && res.data) {
          setFare(res.data);
        } else {
          setFare(null);
        }
        setLoadingEstimate(false);
      }
    }

    fetchEstimate();
    return () => {
      isCancelled = true;
    };
  }, [pickupZone, destinationZone]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pickupZone === destinationZone) {
      setFeedback({ message: 'পিকআপ এবং গন্তব্য একই জোন হতে পারে না।', type: 'error' });
      return;
    }

    setBookingLoading(true);
    setFeedback(null);

    const res = await bookRideAction({
      passengerId,
      pickupZone,
      destinationZone,
      seatsRequested,
    });

    setBookingLoading(false);

    if (res.success) {
      setFeedback({
        message: 'রাইড সফলভাবে বুক করা হয়েছে! ড্রাইভার অ্যাসাইনমেন্ট চলছে...',
        type: 'success',
      });
    } else {
      setFeedback({
        message: res.error || 'বুকিং ব্যর্থ হয়েছে। আসন খালি নাও থাকতে পারে।',
        type: 'error',
      });
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">নতুন রাইড বুকিং</h2>
            <p className="text-[11px] text-slate-400">৩-সিটের ইলেকট্রিক বুলেট পুল সার্ভিস</p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
          Bullet 3-Seater
        </span>
      </div>

      {feedback && (
        <Toast
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}

      <form onSubmit={handleBooking} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pickup Selection */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> পিকআপ জোন
            </label>
            <select
              value={pickupZone}
              onChange={(e) => setPickupZone(e.target.value as DhakaZone)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-medium"
            >
              {DHAKA_ZONES.map((zone) => (
                <option key={`pickup-${zone}`} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Selection */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
              <Navigation className="w-3 h-3 text-red-400" /> গন্তব্য জোন
            </label>
            <select
              value={destinationZone}
              onChange={(e) => setDestinationZone(e.target.value as DhakaZone)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-medium"
            >
              {DHAKA_ZONES.map((zone) => (
                <option key={`dest-${zone}`} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Seat Picker (1 to 3 Seats) */}
        <div>
          <label className="block text-slate-400 mb-1.5 font-medium flex items-center gap-1">
            <Users className="w-3 h-3 text-sky-400" /> প্রয়োজনীয় আসন সংখ্যা
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((count) => (
              <button
                key={`seats-${count}`}
                type="button"
                onClick={() => setSeatsRequested(count)}
                className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition ${
                  seatsRequested === count
                    ? 'border-red-500 bg-red-600/20 text-white'
                    : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:text-white'
                }`}
              >
                {count} আসন {count === 1 && '(ডিফল্ট)'}
              </button>
            ))}
          </div>
        </div>

        {/* FareCard Live Preview */}
        <Suspense fallback={<FareCardSkeleton />}>
          <FareCard fare={fare} loading={loadingEstimate} />
        </Suspense>

        <button
          type="submit"
          disabled={bookingLoading || !fare || pickupZone === destinationZone}
          className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/20"
        >
          {bookingLoading ? (
            'বুকিং প্রক্রিয়াকরণ হচ্ছে...'
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>রাইড বুকিং নিশ্চিত করুন</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}