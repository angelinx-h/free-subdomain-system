import { db } from './index';
import { domains } from './schema';

async function seed() {
  console.log('Seeding database...');

  try {
    // Insert initial parent domains
    const insertedDomains = await db.insert(domains).values([
      {
        domainName: 'example1.com',
        route53ZoneId: 'Z1234567890ABC',
        isActive: true,
      },
      {
        domainName: 'example2.com',
        route53ZoneId: 'Z0987654321XYZ',
        isActive: true,
      },
      {
        domainName: 'freesubdomain.net',
        route53ZoneId: 'Z5555555555FFF',
        isActive: true,
      },
    ]).returning();

    console.log('✅ Database seeded successfully!');
    console.log('Inserted domains:', insertedDomains);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
