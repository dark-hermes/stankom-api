import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@test.dev';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User with email "${email}" already exists. Skipping seed.`);
    return;
  }

  const plainPassword = '123qweasd';
  const hashed = await bcrypt.hash(plainPassword, 10);

  await prisma.user.create({
    data: {
      email,
      name: 'Admin',
      password: hashed,
    },
  });

  console.log(`Seeded user: ${email} (password: ${plainPassword})`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
