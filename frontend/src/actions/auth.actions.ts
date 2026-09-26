
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';
import { User, UserSession } from '@/types/auth.types';

export interface LoginActionResult {
  success: boolean;
  role?: 'PASSENGER' | 'DRIVER';
  error?: string;
}

/**
 * Server Action: Authenticate via phone and password.
 * Receives JWT from Express backend and sets secure HttpOnly cookie.
 */
export async function loginAction(
  phone: string,
  password: string
): Promise<LoginActionResult> {
  if (!phone || !password) {
    return { success: false, error: 'মোবাইল নম্বর এবং পাসওয়ার্ড উভয়ই আবশ্যক' };
  }

  const result = await serverFetch<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error || 'ভুল মোবাইল নম্বর বা পাসওয়ার্ড',
    };
  }

  const { token, user } = result.data;
  const cookieStore = await cookies();

  // 1. HttpOnly JWT token cookie (XSS-safe, never exposed to client JS)
  cookieStore.set('tesla_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // 2. Client-accessible user descriptor cookie for shell/navbar rendering
  const sessionUser: UserSession = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    vehicle: user.vehicle
      ? {
          modelName: user.vehicle.modelName,
          capacity: user.vehicle.capacity,
        }
      : null,
  };

  cookieStore.set('tesla_user', JSON.stringify(sessionUser), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true, role: user.role };
}

/**
 * Server Action: Clears all authentication cookies and redirects to landing page.
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('tesla_token');
  cookieStore.delete('tesla_user');
  redirect('/');
}

/**
 * Server Action: Reads current session user directly from cookies on the server.
 */
export async function getSessionAction(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('tesla_user');
  if (!userCookie) return null;
  try {
    return JSON.parse(userCookie.value) as UserSession;
  } catch {
    return null;
  }
}