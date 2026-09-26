// frontend/src/types/ride.types.ts
import { User, Vehicle } from './auth.types';

export type RideStatus =
  | 'REQUESTED'
  | 'MATCHED'
  | 'DRIVER_ARRIVED'
  | 'STARTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface RideRequest {
  id: string;
  passengerId: string;
  poolId?: string | null;
  pickupZone: string;
  destinationZone: string;
  seatsRequested: number;
  farePoysha: number;
  status: RideStatus;
  createdAt: string;
  updatedAt?: string;
  passenger?: Pick<User, 'id' | 'name' | 'phone'>;
  pool?: {
    id: string;
    corridor: string;
    status: RideStatus;
    vehicle?: {
      modelName: string;
      capacity: number;
      driver: Pick<User, 'id' | 'name' | 'phone'>;
    };
  } | null;
}

export interface Pool {
  id: string;
  vehicleId: string;
  corridor: string;
  totalSeatsBooked: number;
  status: RideStatus;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle & {
    driver: Pick<User, 'id' | 'name' | 'phone'>;
  };
  rideRequests?: RideRequest[];
}

export interface DriverActivePoolResponse {
  driver: Pick<User, 'id' | 'name' | 'phone'>;
  vehicle: Vehicle | null;
  activePool: Pool | null;
}