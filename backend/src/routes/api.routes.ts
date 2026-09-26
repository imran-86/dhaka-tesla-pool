// backend/src/routes/api.routes.ts
import { Router } from 'express';
import { PassengerController, bookRideSchema, estimateFareSchema } from '../controllers/passenger.controller';
import { DriverController } from '../controllers/driver.controller';
import { validateRequest } from '../middlewares/validate';
import { PrismaClient } from '@prisma/client';
import { AuthController, loginSchema, registerSchema } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

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
// ২. প্যাসেঞ্জার এন্ডপয়েন্ট (ভাড়া এস্টিমেশন, বুকিং, হিস্টোরি, ক্যান্সেলেশন)
router.post(
  '/rides/estimate',
  validateRequest(estimateFareSchema),
  PassengerController.estimateFare
);

// Driver Routes
router.get('/driver/:driverId/active-pool', DriverController.getActivePool);
router.patch('/pools/:poolId/status', DriverController.updateStatus);

router.post('/auth/login', validateRequest(loginSchema), AuthController.login);
router.post('/auth/register', validateRequest(registerSchema), AuthController.register);
router.get('/auth/me', authenticateToken as any, AuthController.getMe);

export default router;