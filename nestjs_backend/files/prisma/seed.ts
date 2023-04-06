// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
// create 2 tests
  const post1 = await prisma.test.upsert({
    where: { title: '1'},
    update: {},
    create: {
	  title: '1',
      test: false,
    },
  });

  const post2 = await prisma.test.upsert({
    where: { title: '2'},
    update: {},
    create: {
	  title: '2',
      test: true,
    },
  });

  console.log({ post1, post2 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
