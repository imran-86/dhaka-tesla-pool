import { PrismaClient, RideStatus } from '@prisma/client';
import { FareService } from './fair.service';


const prisma = new PrismaClient();

export interface BookRideInput {
  passengerId: string;
  pickupZone: string;
  destinationZone: string;
  seatsRequested?: number;
}

export class PoolService {
  /**
   * Concurrency-Safe Pool Assignment
   * Uses an atomic database transaction with row-level locking (Pessimistic Locking)
   * to guarantee that Bullet's capacity (3 seats) is NEVER breached.
   */
  static async requestAndJoinPool(input: BookRideInput) {
    const { passengerId, pickupZone, destinationZone, seatsRequested = 1 } = input;

    // 1. Calculate fare using transparent formula
    const fareInfo = FareService.calculateFare(pickupZone, destinationZone, true);

    // 2. Execute within an ACID transaction
    return await prisma.$transaction(async (tx) => {
      // Find active online Tesla vehicle (Jashim's Bullet)
      const vehicle = await tx.vehicle.findFirst({
        where: { isOnline: true },
        include: { driver: true },
      });

      if (!vehicle) {
        throw new Error('NO_TESLA_AVAILABLE: No active driver/Tesla found online.');
      }

      // Check if there is an active pool in the same corridor that hasn't started yet
      // We lock this pool row using raw SQL to prevent race condition when 2 passengers book at once
      const activePools = await tx.$queryRaw<Array<{ id: string; totalSeatsBooked: number; status: string }>>`
        SELECT id, "totalSeatsBooked", status 
        FROM "pools"
        WHERE "vehicleId" = ${vehicle.id} 
          AND status IN ('REQUESTED', 'MATCHED', 'DRIVER_ARRIVED')
        FOR UPDATE
      `;

      let targetPoolId: string;

      if (activePools.length > 0 && activePools[0]) {
        const pool = activePools[0];

        // STRICT CONCURRENCY GUARD:
        // Check if adding these seats breaches Bullet's maximum capacity (3)
        if (pool.totalSeatsBooked + seatsRequested > vehicle.capacity) {
          throw new Error(
            `CAPACITY_EXCEEDED: Bullet only has ${vehicle.capacity - pool.totalSeatsBooked} seat(s) remaining.`
          );
        }

        // Increment booked seat counter atomically inside the transaction
        await tx.pool.update({
          where: { id: pool.id },
          data: {
            totalSeatsBooked: { increment: seatsRequested },
            status: RideStatus.MATCHED,
          },
        });

        targetPoolId = pool.id;
      } else {
        // No active pool exists for this corridor -> Create a brand new pool
        if (seatsRequested > vehicle.capacity) {
          throw new Error(`CAPACITY_EXCEEDED: Requested seats exceed Tesla's maximum capacity.`);
        }

        const newPool = await tx.pool.create({
          data: {
            vehicleId: vehicle.id,
            pickupZone,
            corridor: `${pickupZone} Corridor`,
            totalSeatsBooked: seatsRequested,
            status: RideStatus.REQUESTED,
          },
        });

        targetPoolId = newPool.id;
      }

      // 3. Create passenger's individual ride request ticket
      const rideRequest = await tx.rideRequest.create({
        data: {
          passengerId,
          poolId: targetPoolId,
          pickupZone,
          destinationZone,
          seatsRequested,
          farePoysha: fareInfo.farePoysha,
          status: RideStatus.MATCHED,
        },
        include: {
          passenger: true,
          pool: {
            include: {
              vehicle: {
                include: { driver: true },
              },
            },
          },
        },
      });

      return {
        rideRequest,
        fareBreakdown: fareInfo,
      };
    });
  }

  /**
   * Driver lifecycle state transitions with strict ordering
   * Allowed transitions:
   * REQUESTED/MATCHED -> DRIVER_ARRIVED -> STARTED -> COMPLETED
   */
  static async updatePoolStatus(poolId: string, nextStatus: RideStatus) {
    return await prisma.$transaction(async (tx) => {
      const pool = await tx.pool.findUnique({
        where: { id: poolId },
        include: { rideRequests: true },
      });

      if (!pool) {
        throw new Error('POOL_NOT_FOUND: The requested pool does not exist.');
      }

      // State machine validation
      const validTransitions: Record<RideStatus, RideStatus[]> = {
        REQUESTED: [RideStatus.MATCHED, RideStatus.DRIVER_ARRIVED, RideStatus.CANCELLED],
        MATCHED: [RideStatus.DRIVER_ARRIVED, RideStatus.CANCELLED],
        DRIVER_ARRIVED: [RideStatus.STARTED, RideStatus.CANCELLED],
        STARTED: [RideStatus.COMPLETED],
        COMPLETED: [],
        CANCELLED: [],
      };

      const allowedNextStates = validTransitions[pool.status];
      if (!allowedNextStates.includes(nextStatus)) {
        throw new Error(
          `INVALID_STATE_TRANSITION: Cannot transition pool from ${pool.status} to ${nextStatus}.`
        );
      }

      // Update pool and cascade update all individual passenger rides inside this pool
      const updatedPool = await tx.pool.update({
        where: { id: poolId },
        data: { status: nextStatus },
      });

      await tx.rideRequest.updateMany({
        where: { poolId: poolId, status: { not: RideStatus.CANCELLED } },
        data: { status: nextStatus },
      });

      return updatedPool;
    });
  }

  /**
   * Passenger Ride Cancellation
   * Passenger can only cancel if trip has NOT started yet.
   */
  static async cancelRide(rideRequestId: string, passengerId: string) {
    return await prisma.$transaction(async (tx) => {
      const ride = await tx.rideRequest.findUnique({
        where: { id: rideRequestId },
      });

      if (!ride) {
        throw new Error('RIDE_NOT_FOUND: Ride request does not exist.');
      }

      // Authorization guard: A passenger can never cancel another passenger's ride
      if (ride.passengerId !== passengerId) {
        throw new Error('UNAUTHORIZED: You cannot modify another passenger\'s ride.');
      }

      // Cancellation validity rule: Cannot cancel if already started or completed
      if (ride.status === RideStatus.STARTED || ride.status === RideStatus.COMPLETED) {
        throw new Error('CANCELLATION_FORBIDDEN: Cannot cancel a ride that is already in progress or completed.');
      }

      // Mark ride as cancelled
      const cancelledRide = await tx.rideRequest.update({
        where: { id: rideRequestId },
        data: { status: RideStatus.CANCELLED },
      });

      // Free up seats in the associated pool
      if (ride.poolId) {
        await tx.pool.update({
          where: { id: ride.poolId },
          data: {
            totalSeatsBooked: { decrement: ride.seatsRequested },
          },
        });
      }

      return cancelledRide;
    });
  }
}