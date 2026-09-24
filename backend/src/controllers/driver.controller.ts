// backend/src/controllers/driver.controller.ts
import { Request, Response } from 'express';
import { PrismaClient, RideStatus } from '@prisma/client';
import { PoolService } from '../services/pool.services';

const prisma = new PrismaClient();

export class DriverController {
  // ১. জসীমের গাড়ির সক্রিয় পুল এবং যাত্রীদের তালিকা দেখা
  static async getActivePool(req: Request, res: Response) {
    try {
      const { driverId } = req.params;

      const vehicle = await prisma.vehicle.findUnique({
        where: { driverId },
      });

      if (!vehicle) {
        res.status(404).json({ status: 'fail', message: 'কোনো টেসলা গাড়ি পাওয়া যায়নি' });
        return;
      }

      const activePool = await prisma.pool.findFirst({
        where: {
          vehicleId: vehicle.id,
          status: { in: [RideStatus.REQUESTED, RideStatus.MATCHED, RideStatus.DRIVER_ARRIVED, RideStatus.STARTED] },
        },
        include: {
          rideRequests: {
            where: { status: { not: RideStatus.CANCELLED } },
            include: { passenger: { select: { id: true, name: true, phone: true } } },
          },
        },
      });

      res.status(200).json({
        status: 'success',
        data: {
          vehicle,
          activePool,
        },
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // ২. ট্রিপের লাইফসাইকেল পরিবর্তন (DRIVER_ARRIVED -> STARTED -> COMPLETED)
  static async updateStatus(req: Request, res: Response) {
    try {
      const { poolId } = req.params;
      const { status } = req.body;

      const updatedPool = await PoolService.updatePoolStatus(poolId, status as RideStatus);
      res.status(200).json({
        status: 'success',
        message: `পুল স্ট্যাটাস সফলভাবে ${status}-এ আপডেট করা হয়েছে`,
        data: updatedPool,
      });
    } catch (error: any) {
      res.status(400).json({ status: 'fail', message: error.message });
    }
  }
}