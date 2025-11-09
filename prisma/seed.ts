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

  // Ensure RolesResponsibilities singleton exists
  const rrExisting = await prisma.rolesResponsibilities.findFirst();
  if (!rrExisting) {
    await prisma.rolesResponsibilities.create({
      data: {
        roles: 'Initial roles description',
        responsibilities: 'Initial responsibilities description',
      },
    });
    console.log('Seeded RolesResponsibilities default row.');
  }

  // Ensure Structure singleton exists
  const structureExisting = await prisma.structure.findFirst();
  if (!structureExisting) {
    await prisma.structure.create({ data: { image: '' } });
    console.log('Seeded Structure default row.');
  }

  // Ensure HeroSection singleton exists
  const heroExisting = await prisma.heroSection.findFirst();
  if (!heroExisting) {
    await prisma.heroSection.create({
      data: {
        heading: 'Initial Heading',
        subHeading: 'Initial Sub Heading',
        banner: '',
        pathVideo: null,
      },
    });
    console.log('Seeded HeroSection default row.');
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
