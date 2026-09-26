
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_INTERNAL_URL || 'http://localhost:4000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * Server-side fetch client that runs inside Next.js Server Components and Server Actions.
 * It automatically extracts the secure HttpOnly 'tesla_token' from incoming cookies
 * and forwards it as both an Authorization header and a Cookie header to Express.
 */
export async function serverFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tesla_token')?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Forward the HttpOnly cookie token to Express backend
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['Cookie'] = `tesla_token=${token}`;
    }

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const res = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store', // Avoid caching dynamic pooling and lifecycle data
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: json.message || `Request failed with status ${res.status}`,
        status: res.status,
      };
    }

    return {
      success: true,
      data: json.data !== undefined ? json.data : json,
      status: res.status,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unable to connect to Dhaka Tesla Pool API server',
      status: 500,
    };
  }
}