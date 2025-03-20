const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  
  const user = await prisma.user.create({
    data: {
      email: 'tes12t@example.com',
      password: 'hashedpassword', 
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Software Developer',
        },
      },
    },
  });
  console.log('Created user:', user);

  
  const project = await prisma.project.create({
    data: {
      name: 'Echo Project',
      description: 'A project for the Echo ecosystem',
      userId: user.id,
    },
  });
  console.log('Created project:', project);

  
  const log = await prisma.log.create({
    data: {
      message: 'Initial project setup',
      projectId: project.id,
    },
  });
  console.log('Created log:', log);

  // Fetch all users with their profiles and projects
  const users = await prisma.user.findMany({
    include: {
      profile: true,
      projects: true,
    },
  });
  console.log('All users:', JSON.stringify(users, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });