import { PrismaClient, RideStatus } from '@prisma/client';
import {PoolService} from '../src/services/pool.services';

const prisma = new PrismaClient();

describe('Pool Service & Concurrency Protection', () => {
  let nusratId: string;
  let rafiqId: string;
  let shirinId: string;

  beforeAll(async () => {
    // টেস্ট রান করার আগে ডেটাবেজ প্রস্তুত করা
    const users = await prisma.user.findMany();
    nusratId = users.find((u) => u.name === 'Nusrat')!.id;
    rafiqId = users.find((u) => u.name === 'Rafiq')!.id;
    shirinId = users.find((u) => u.name === 'Shirin')!.id;
  });

  beforeEach(async () => {
    // প্রতি টেস্টের আগে পূর্বের রাইড ডাটা পরিষ্কার করা
    await prisma.rideRequest.deleteMany();
    await prisma.pool.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // টেস্ট ১: নুসরাত এবং রফিক একই পুলে শেয়ার করতে পারে
  it('should allow Nusrat and Rafiq to share Bullet without exceeding capacity', async () => {
    const ride1 = await PoolService.requestAndJoinPool({
      passengerId: nusratId,
      pickupZone: 'Banani',
      destinationZone: 'Mohakhali',
      seatsRequested: 1,
    });

    const ride2 = await PoolService.requestAndJoinPool({
      passengerId: rafiqId,
      pickupZone: 'Banani',
      destinationZone: 'Gulshan 1',
      seatsRequested: 1,
    });

    // উভয় রাইড একই পুলে শেয়ার করবে
    expect(ride1.rideRequest.poolId).toBe(ride2.rideRequest.poolId);

    const pool = await prisma.pool.findUnique({
      where: { id: ride1.rideRequest.poolId! },
    });
    expect(pool?.totalSeatsBooked).toBe(2);
  });

  // টেস্ট ২: ৩ সিটের বেশি বুকিং আটকাতে হবে (Capacity Guard)
  it('should reject booking if requested seats exceed Bullet\'s remaining capacity', async () => {
    // নুসরাত নিল ২টি সিট
    await PoolService.requestAndJoinPool({
      passengerId: nusratId,
      pickupZone: 'Banani',
      destinationZone: 'Mohakhali',
      seatsRequested: 2,
    });

    // রফিক আরও ২টি সিট চাইলে রিজেক্ট হবে (কারণ মোট ৪ সিট হয়ে যাবে, কিন্তু ক্ষমতা ৩)
    await expect(
      PoolService.requestAndJoinPool({
        passengerId: rafiqId,
        pickupZone: 'Banani',
        destinationZone: 'Gulshan 1',
        seatsRequested: 2,
      })
    ).rejects.toThrow('CAPACITY_EXCEEDED');
  });

  // টেস্ট ৩: অবৈধ স্টেট ট্রানজিশন রিজেক্ট করা
  it('should reject invalid state transitions from the driver', async () => {
    const ride = await PoolService.requestAndJoinPool({
      passengerId: nusratId,
      pickupZone: 'Banani',
      destinationZone: 'Mohakhali',
      seatsRequested: 1,
    });

    const poolId = ride.rideRequest.poolId!;

    // REQUESTED/MATCHED থেকে সরাসরি COMPLETED দেওয়া যাবে না (অবশ্যই DRIVER_ARRIVED -> STARTED হতে হবে)
    await expect(
      PoolService.updatePoolStatus(poolId, RideStatus.COMPLETED)
    ).rejects.toThrow('INVALID_STATE_TRANSITION');
  });

  // টেস্ট ৪: The Concurrency Race Condition Test (Section 12)
  it('should handle simultaneous bookings for the last seat safely without overbooking', async () => {
    // নুসরাত প্রথমে ২টি সিট দখল করল (বুলেটে বাকি আছে মাত্র ১টি সিট)
    await PoolService.requestAndJoinPool({
      passengerId: nusratId,
      pickupZone: 'Banani',
      destinationZone: 'Mohakhali',
      seatsRequested: 2,
    });

    // রফিক এবং শিরিন একই সময়ে ১টি মাত্র সিটের জন্য রিকোয়েস্ট পাঠাল
    const concurrentBookings = await Promise.allSettled([
      PoolService.requestAndJoinPool({
        passengerId: rafiqId,
        pickupZone: 'Banani',
        destinationZone: 'Gulshan 1',
        seatsRequested: 1,
      }),
      PoolService.requestAndJoinPool({
        passengerId: shirinId,
        pickupZone: 'Banani',
        destinationZone: 'Gulshan 1',
        seatsRequested: 1,
      }),
    ]);

    const succeeded = concurrentBookings.filter((b) => b.status === 'fulfilled');
    const rejected = concurrentBookings.filter((b) => b.status === 'rejected');

    // কনকারেন্সির ফলাফল: একজন সফল হবে, অপরজন রিজেক্ট খাবে
    expect(succeeded.length).toBe(1);
    expect(rejected.length).toBe(1);

    // পুলে মোট সিট ৩-এর বেশি কখনোই হবে না
    const pools = await prisma.pool.findMany();
    expect(pools[0]?.totalSeatsBooked).toBe(3);
  });
});