'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/api-server';
import { DriverActivePoolResponse, Pool, RideStatus } from '@/types/ride.types';

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action: Fetch the driver's active vehicle, pool state, and passenger manifest.
 * Used by Jashim to view the 3-seater "Bullet" and currently assigned passengers.
 */
export async function getDriverActivePoolAction(
  driverId: string
): Promise<ActionResult<DriverActivePoolResponse>> {
  if (!driverId) {
    return { success: false, error: 'ড্রাইভার আইডি অনুপস্থিত' };
  }

  const result = await serverFetch<DriverActivePoolResponse>(
    `/driver/${driverId}/active-pool`
  );

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error || 'ড্রাইভার পুলের তথ্য লোড করা যায়নি',
    };
  }

  return { success: true, data: result.data };
}

/**
 * Server Action: Advance the ride and pool state machine.
 * Valid transitions:
 * MATCHED -> DRIVER_ARRIVED -> STARTED -> COMPLETED
 * Automatically updates associated passenger rides and frees capacity on completion.
 */
export async function updatePoolStatusAction(
  poolId: string,
  status: RideStatus
): Promise<ActionResult<Pool>> {
  if (!poolId || !status) {
    return { success: false, error: 'পুল আইডি এবং পরবর্তী স্ট্যাটাস উভয়ই আবশ্যক' };
  }

  const result = await serverFetch<Pool>(`/pools/${poolId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error || 'ট্রিপ স্ট্যাটাস আপডেট করা সম্ভব হয়নি',
    };
  }

  // Purge server caches so both driver console and passenger views update immediately
  revalidatePath('/driver');
  revalidatePath('/passenger');

  return { success: true, data: result.data };
}