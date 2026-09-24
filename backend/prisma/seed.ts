import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Clearing existing database records...');
  // Delete in reverse order of dependencies to respect foreign key constraints
  await prisma.rideRequest.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  console.log('🚗 Seeding driver and Tesla vehicle (Bullet)...');
  // 1. Create Driver: Jashim
  const jashim = await prisma.user.create({
    data: {
      name: 'Jashim',
      phone: '01710000001',
      role: Role.DRIVER,
      vehicle: {
        create: {
          modelName: 'Bullet',
          capacity: 3, // Hard ceiling: exactly 3 seats
          isOnline: true,
        },
      },
    },
    include: {
      vehicle: true,
    },
  });

  console.log('👥 Seeding passengers: Nusrat, Rafiq, Shirin...');
  // 2. Create Passenger: Nusrat
  const nusrat = await prisma.user.create({
    data: {
      name: 'Nusrat',
      phone: '01810000001',
      role: Role.PASSENGER,
    },
  });

  // 3. Create Passenger: Rafiq
  const rafiq = await prisma.user.create({
    data: {
      name: 'Rafiq',
      phone: '01910000001',
      role: Role.PASSENGER,
    },
  });

  // 4. Create Passenger: Shirin
  const shirin = await prisma.user.create({
    data: {
      name: 'Shirin',
      phone: '01610000001',
      role: Role.PASSENGER,
    },
  });

  console.log('✅ Seeding complete!');
  console.log({
    driver: { name: jashim.name, vehicle: jashim.vehicle?.modelName, capacity: jashim.vehicle?.capacity },
    passengers: [nusrat.name, rafiq.name, shirin.name],
  });
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });