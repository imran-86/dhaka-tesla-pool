// frontend/src/types/auth.types.ts

export type UserRole = 'PASSENGER' | 'DRIVER';

export interface Vehicle {
  id: string;
  modelName: string; // "Bullet"
  capacity: number;  // 3
  isOnline: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  createdAt?: string;
  vehicle?: Vehicle | null;
}

export interface UserSession {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  vehicle?: {
    modelName: string;
    capacity: number;
  } | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}