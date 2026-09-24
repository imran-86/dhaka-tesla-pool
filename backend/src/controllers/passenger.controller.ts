import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { PoolService } from '../services/pool.services';

const prisma = new PrismaClient();

// বুকিংয়ের জন্য Zod স্কিমা
export const bookRideSchema = z.object({
  passengerId: z.string().uuid({ message: 'সঠিক প্যাসেঞ্জার আইডি প্রয়োজন' }),
  pickupZone: z.string().min(1, { message: 'পিকআপ জোন আবশ্যক' }),
  destinationZone: z.string().min(1, { message: 'গন্তব্য জোন আবশ্যক' }),
  seatsRequested: z.number().int().min(1).max(3).default(1),
});

export class PassengerController {
  // ১. রাইড বুক ও পুলে জয়েন করার রিকোয়েস্ট
  static async bookRide(req: Request, res: Response) {
    try {
      const result = await PoolService.requestAndJoinPool(req.body);
      res.status(201).json({
        status: 'success',
        message: 'রাইড সফলভাবে ম্যাচ ও বুক করা হয়েছে',
        data: result,
      });
    } catch (error: any) {
      const status = error.message.includes('CAPACITY_EXCEEDED') ? 409 : 400;
      res.status(status).json({
        status: 'fail',
        message: error.message,
      });
    }
  }

  // ২. নির্দিষ্ট যাত্রীর রাইড হিস্টোরি ও স্ট্যাটাস দেখা (আইসোলেশন নিশ্চিত করে)
  static async getPassengerRides(req: Request, res: Response) {
    try {
      const { passengerId } = req.params;
      const rides = await prisma.rideRequest.findMany({
        where: { passengerId },
        orderBy: { createdAt: 'desc' },
        include: {
          pool: {
            select: {
              status: true,
              corridor: true,
              vehicle: {
                select: {
                  modelName: true,
                  driver: { select: { name: true, phone: true } },
                },
              },
            },
          },
        },
      });

      res.status(200).json({ status: 'success', data: rides });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // ৩. রাইড বাতিল করা
  static async cancelRide(req: Request, res: Response) {
    try {
      const { rideId } = req.params;
      const { passengerId } = req.body;

      const cancelledRide = await PoolService.cancelRide(rideId, passengerId);
      res.status(200).json({
        status: 'success',
        message: 'রাইড সফলভাবে বাতিল করা হয়েছে',
        data: cancelledRide,
      });
    } catch (error: any) {
      const status = error.message.includes('UNAUTHORIZED') ? 403 : 400;
      res.status(status).json({ status: 'fail', message: error.message });
    }
  }
}