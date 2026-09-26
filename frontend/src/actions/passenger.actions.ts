// frontend/src/actions/passenger.actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/api-server';
import { FareCalculationResult } from '@/types/fare.types';
import { RideRequest } from '@/types/ride.types';

export interface EstimateFareInput {
  pickupZone: string;
  destinationZone: string;
  isPooled?: boolean;
}

export interface BookRideInput {
  passengerId: string;
  pickupZone: string;
  destinationZone: string;
  seatsRequested: number;
}

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action: Estimate fare with deterministic breakdown before booking.
 * Formula: passengerFare = baseFare + distanceCharge - poolDiscount (in Poysha)
 */
export async function estimateFareAction(
  input: EstimateFareInput
): Promise<ActionResult<FareCalculationResult>> {
  if (!input.pickupZone || !input.destinationZone) {
    return { success: false, error: 'পিকআপ এবং গন্তব্য জোন উভয়ই নির্বাচন করুন' };
  }

  if (input.pickupZone === input.destinationZone) {
    return { success: false, error: 'পিকআপ এবং গন্তব্য একই জোন হতে পারে না' };
  }

  const result = await serverFetch<FareCalculationResult>('/rides/estimate', {
    method: 'POST',
    body: JSON.stringify({
      pickupZone: input.pickupZone,
      destinationZone: input.destinationZone,
      isPooled: input.isPooled ?? true,
    }),
  });

  if (!result.success || !result.data) {
    return { success: false, error: result.error || 'ভাড়া হিসাব করা সম্ভব হয়নি' };
  }

  return { success: true, data: result.data };
}

/**
 * Server Action: Book a ride / seat in an active or new pool.
 * Sends HttpOnly cookie automatically via serverFetch.
 */
export async function bookRideAction(
  input: BookRideInput
): Promise<ActionResult<RideRequest>> {
  if (!input.passengerId) {
    return { success: false, error: 'প্যাসেঞ্জার আইডি অনুপস্থিত' };
  }

  if (!input.pickupZone || !input.destinationZone) {
    return { success: false, error: 'পিকআপ ও গন্তব্য নির্ধারণ আবশ্যক' };
  }

  if (input.seatsRequested < 1 || input.seatsRequested > 3) {
    return { success: false, error: 'আসন সংখ্যা অবশ্যই ১ থেকে ৩ এর মধ্যে হতে হবে' };
  }

  const result = await serverFetch<RideRequest>('/rides/book', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!result.success || !result.data) {
    return { success: false, error: result.error || 'রাইড বুকিং ব্যর্থ হয়েছে' };
  }

  // Refresh passenger route cache so ride list updates immediately
  revalidatePath('/passenger');
  return { success: true, data: result.data };
}

/**
 * Server Action: Fetch ride history strictly isolated to the logged-in passenger.
 */
export async function getPassengerRidesAction(
  passengerId: string
): Promise<ActionResult<RideRequest[]>> {
  if (!passengerId) {
    return { success: false, error: 'প্যাসেঞ্জার আইডি প্রয়োজন' };
  }

  const result = await serverFetch<RideRequest[]>(
    `/passengers/${passengerId}/rides`
  );

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error || 'রাইড হিস্টোরি লোড করা যায়নি',
      data: [],
    };
  }

  return { success: true, data: result.data };
}

/**
 * Server Action: Cancel a requested or matched ride before trip starts.
 */
export async function cancelRideAction(
  rideId: string,
  passengerId: string
): Promise<ActionResult<{ message: string }>> {
  if (!rideId || !passengerId) {
    return { success: false, error: 'রাইড আইডি ও প্যাসেঞ্জার আইডি আবশ্যক' };
  }

  const result = await serverFetch<{ message: string }>(
    `/rides/${rideId}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify({ passengerId }),
    }
  );

  if (!result.success) {
    return { success: false, error: result.error || 'রাইড বাতিল করা সম্ভব হয়নি' };
  }

  // Invalidate cache to reflect cancellation across the dashboard
  revalidatePath('/passenger');
  return { success: true, data: result.data };
}