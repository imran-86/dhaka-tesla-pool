// backend/src/routes/api.routes.ts
import { Router } from 'express';
import { PassengerController, bookRideSchema } from '../controllers/passenger.controller';
import { DriverController } from '../controllers/driver.controller';
import { validateRequest } from '../middlewares/validate';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ডেমো ইউজারদের তালিকা পাওয়ার জন্য হেল্পার এন্ডপয়েন্ট (ফ্রন্টএন্ডে সহজে নুসরাত/জসীম সিলেক্ট করার জন্য)
router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({ include: { vehicle: true } });
  res.json({ status: 'success', data: users });
});

// Passenger Routes
router.post('/rides/book', validateRequest(bookRideSchema), PassengerController.bookRide);
router.get('/passengers/:passengerId/rides', PassengerController.getPassengerRides);
router.post('/rides/:rideId/cancel', PassengerController.cancelRide);

// Driver Routes
router.get('/driver/:driverId/active-pool', DriverController.getActivePool);
router.patch('/pools/:poolId/status', DriverController.updateStatus);

export default router;