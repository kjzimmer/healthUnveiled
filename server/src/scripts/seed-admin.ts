import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

(async () => {
  const [,, email, password] = process.argv;

  if (!email || !password) {
    console.error('Usage: npm run seed:admin <email> <password>');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const person = await prisma.person.upsert({
    where: { email: email.toLowerCase() },
    update: { isAdmin: true, passwordHash },
    create: { email: email.toLowerCase(), isAdmin: true, passwordHash },
  });

  console.log(`[seed-admin] Admin upserted: ${person.email} (id: ${person.id})`);
  await prisma.$disconnect();
})();
