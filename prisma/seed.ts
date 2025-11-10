import type { Prisma, SocialMediaType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@test.dev';
  // Ensure admin user exists (do not early return — keep existing user and continue seeding)
  const plainPassword = '123qweasd';
  let admin = await prisma.user.findUnique({ where: { email } });
  if (!admin) {
    const hashed = await bcrypt.hash(plainPassword, 10);
    admin = await prisma.user.create({
      data: {
        email,
        name: 'Admin',
        password: hashed,
      },
    });
    console.log(`Seeded user: ${email} (password: ${plainPassword})`);
  } else {
    console.log(
      `User with email "${email}" already exists. Keeping existing user.`,
    );
  }

  // RolesResponsibilities: set to 'dummy' if not present, otherwise leave existing values
  const rrExisting = await prisma.rolesResponsibilities.findFirst();
  if (!rrExisting) {
    await prisma.rolesResponsibilities.create({
      data: { roles: 'dummy', responsibilities: 'dummy' },
    });
    console.log('Seeded RolesResponsibilities default row.');
  }

  // Structure: ensure singleton with dummy image
  const structureExisting = await prisma.structure.findFirst();
  if (!structureExisting) {
    await prisma.structure.create({ data: { image: 'dummy' } });
    console.log('Seeded Structure default row.');
  } else if (!structureExisting.image) {
    await prisma.structure.update({
      where: { id: structureExisting.id },
      data: { image: 'dummy' },
    });
  }

  // HeroSection: ensure singleton with provided content
  const heroContent = {
    heading: 'Direktorat Bina Standarisasi Kompetensi dan Program Pelatihan',
    subHeading:
      'Membangun pelatihan untuk masa depan yang lebih baik berarti menyiapkan sumber daya manusia yang unggul dan adaptif terhadap perubahan',
    banner: 'dummy',
    pathVideo: null as string | null,
  };
  const heroExisting = await prisma.heroSection.findFirst();
  if (!heroExisting) {
    await prisma.heroSection.create({ data: heroContent });
    console.log('Seeded HeroSection default row.');
  } else {
    await prisma.heroSection.update({
      where: { id: heroExisting.id },
      data: heroContent,
    });
    console.log('Updated HeroSection default row.');
  }

  // Histories: seed provided list if entries for the years don't exist
  const histories = [
    {
      year: 1990,
      description: 'Berdirinya Stanser',
      detail:
        'Stanser didirikan dengan tujuan meningkatkan standar kompetensi kerja dan pelatihan di Indonesia.',
    },
    {
      year: 2008,
      description: 'Pergantian Nama',
      detail:
        'Stanser mengganti nama menjadi stankomlatker kemudian 2015 berganti nama lagi menjadi Stankomproglat.',
    },
    {
      year: 2020,
      description: 'Stankomproglat',
      detail:
        'Stankomproglat resmi menjadi Direktorat Bina Standardisasi Kompetensi dan Program Pelatihan di bawah Kementerian Ketenagakerjaan Republik Indonesia.',
    },
    {
      year: 2024,
      description: 'Stankomproglat',
      detail:
        'Terus berinovasi dalam memberikan layanan terbaik untuk standar kompetensi kerja dan program pelatihan di Indonesia.',
    },
  ];
  for (const h of histories) {
    const exists = await prisma.history.findFirst({ where: { year: h.year } });
    if (!exists) {
      await prisma.history.create({ data: h });
    }
  }

  // Director profiles
  const directors = [
    {
      order: 1,
      beginYear: 2025,
      endYear: null,
      name: 'Abdullah Qiqi Asmara',
      detail:
        'Latar Belakang :\nDoktor Manajemen dari Universitas Indonesia dengan pengalaman 20 tahun di bidang pengembangan SDM.\n\nPencapaian :\n• Meningkatkan anggota organisasi 300%\n• Meluncurkan program sertifikasi digital\n• Membangun kemitraan internasional',
      picture: 'url_to_picture_abdullah.jpg',
    },
    {
      order: 2,
      beginYear: 2022,
      endYear: 2025,
      name: 'Amir Syarifudin',
      detail: 'Memimpin ekspansi nasional dan digitalisasi awal',
      picture: 'url_to_picture_amir.jpg',
    },
    {
      order: 3,
      beginYear: 2010,
      endYear: 2015,
      name: 'Ir. Budi Santoso',
      detail: 'Pendiri dan perintis organisasi',
      picture: 'url_to_picture_budi.jpg',
    },
  ];
  for (const d of directors) {
    const exists = await prisma.directorProfile.findFirst({
      where: { name: d.name },
    });
    if (!exists) {
      await prisma.directorProfile.create({
        data: d as Prisma.DirectorProfileCreateInput,
      });
    }
  }

  // Announcements: create 15 dummy if none exist
  const annCount = await prisma.announcement.count();
  if (annCount === 0) {
    const items = Array.from({ length: 15 }).map((_, i) => ({
      title: `Announcement ${i + 1}`,
      description: `This is announcement ${i + 1}`,
      attachment: null,
      createdById: admin.id,
    }));
    await prisma.announcement.createMany({ data: items });
    console.log('Seeded 15 announcements.');
  }

  // News categories
  const categories = [
    { title: 'SKKNI', slug: 'skkni' },
    { title: 'Proglat', slug: 'proglat' },
    { title: 'e-Training', slug: 'e-training' },
    { title: 'InaSkills', slug: 'inaskills' },
  ];
  for (const c of categories) {
    const exist = await prisma.newsCategory.findFirst({
      where: { slug: c.slug },
    });
    if (!exist) {
      await prisma.newsCategory.create({
        data: { ...c, createdById: admin.id },
      });
    }
  }

  // News: create a small set if empty
  const newsCount = await prisma.news.count();
  if (newsCount === 0) {
    const firstCategory = await prisma.newsCategory.findFirst();
    if (firstCategory) {
      await prisma.news.createMany({
        data: [
          {
            title: 'Sample News 1',
            slug: 'sample-news-1',
            excerpt: 'Excerpt 1',
            description: 'Full description 1',
            status: 'published',
            categoryId: firstCategory.id,
            createdById: admin.id,
          },
        ],
      });
    }
  }

  // Services
  const services = ['SKKNI', 'Proglat', 'InaSkill'];
  for (const s of services) {
    const exist = await prisma.service.findFirst({ where: { title: s } });
    if (!exist) {
      await prisma.service.create({
        data: {
          title: s,
          description: `${s} service`,
          icon: '',
          link: null,
          createdById: admin.id,
        },
      });
    }
  }

  // Gallery + images (10)
  const galleryCount = await prisma.gallery.count();
  if (galleryCount === 0) {
    const gallery = await prisma.gallery.create({
      data: { title: 'Default Gallery', description: 'Seeded gallery' },
    });
    const images = Array.from({ length: 10 }).map((_, i) => ({
      galleryId: gallery.id,
      image: `gallery-image-${i + 1}.jpg`,
    }));
    await prisma.galleryImage.createMany({ data: images });
  }

  // FAQ: 5 dummy
  const faqCount = await prisma.faq.count();
  if (faqCount === 0) {
    const faqs = Array.from({ length: 5 }).map((_, i) => ({
      question: `FAQ ${i + 1}`,
      answer: `Answer for FAQ ${i + 1}`,
      createdById: admin.id,
    }));
    await prisma.faq.createMany({ data: faqs });
  }

  // SocialMedia: upsert for all enum values
  const socialMediaTypes = [
    'FACEBOOK',
    'INSTAGRAM',
    'LINKEDIN',
    'TIKTOK',
    'YOUTUBE',
  ] as const;
  for (const name of socialMediaTypes) {
    await prisma.socialMedia.upsert({
      where: { name },
      update: { link: `https://example.com/${name.toLowerCase()}` },
      create: {
        name: name as SocialMediaType,
        link: `https://example.com/${name.toLowerCase()}`,
      },
    });
  }

  // SocialMediaPost: Instagram only, 9 dummy
  const smCount = await prisma.socialMediaPost.count({
    where: { platform: 'INSTAGRAM' },
  });
  if (smCount === 0) {
    const posts = Array.from({ length: 9 }).map((_, i) => ({
      platform: 'INSTAGRAM' as SocialMediaType,
      postLink: `https://instagram.com/post${i + 1}`,
      createdById: admin.id,
    }));
    await prisma.socialMediaPost.createMany({ data: posts });
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
