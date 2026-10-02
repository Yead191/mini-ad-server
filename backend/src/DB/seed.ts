import { prisma } from '../shared/prisma';
import { redisClient } from '../config/redis';

export async function seedDatabase() {
  console.log('🌱 Seeding Mini Ad Server database...');

  // Clean existing events, creatives, campaigns
  await prisma.adEvent.deleteMany({});
  await prisma.creative.deleteMany({});
  await prisma.campaign.deleteMany({});

  // Flush redis cache
  try {
    await redisClient.flushdb();
    console.log('🧹 Redis cache flushed');
  } catch (err) {
    console.warn('Could not flush Redis:', err);
  }

  // 1. Create Campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      name: 'Summer Tech Deals 2026',
      status: 'active',
      daily_impression_limit: 1500,
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      name: 'Fintech Cloud Platform',
      status: 'active',
      daily_impression_limit: 800,
    },
  });

  const campaign3 = await prisma.campaign.create({
    data: {
      name: 'Autumn Fashion Showcase',
      status: 'paused',
      daily_impression_limit: 300,
    },
  });

  console.log('✅ Created 3 campaigns');

  // 2. Create Creatives
  // High quality demo banner images
  const creative1_300x250 = await prisma.creative.create({
    data: {
      campaign_id: campaign1.id,
      width: 300,
      height: 250,
      image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=250&fit=crop&q=80',
      click_url: 'https://techdeals.example.com/summer-2026',
    },
  });

  const creative1_728x90 = await prisma.creative.create({
    data: {
      campaign_id: campaign1.id,
      width: 728,
      height: 90,
      image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=728&h=90&fit=crop&q=80',
      click_url: 'https://techdeals.example.com/summer-2026-leaderboard',
    },
  });

  const creative2_300x250 = await prisma.creative.create({
    data: {
      campaign_id: campaign2.id,
      width: 300,
      height: 250,
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=250&fit=crop&q=80',
      click_url: 'https://fintechcloud.example.com/start-free',
    },
  });

  const creative2_728x90 = await prisma.creative.create({
    data: {
      campaign_id: campaign2.id,
      width: 728,
      height: 90,
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=728&h=90&fit=crop&q=80',
      click_url: 'https://fintechcloud.example.com/enterprise',
    },
  });

  const creative3_300x250 = await prisma.creative.create({
    data: {
      campaign_id: campaign3.id,
      width: 300,
      height: 250,
      image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=250&fit=crop&q=80',
      click_url: 'https://fashionhub.example.com/autumn-preview',
    },
  });

  console.log('✅ Created 5 creatives');

  // 3. Seed historical events over the last 5 days
  const events = [];
  const now = new Date();

  for (let daysAgo = 5; daysAgo >= 0; daysAgo--) {
    const eventDate = new Date(now);
    eventDate.setDate(now.getDate() - daysAgo);

    // Campaign 1: ~40 impressions, ~3 clicks per day
    for (let i = 0; i < 40; i++) {
      events.push({
        campaign_id: campaign1.id,
        creative_id: i % 2 === 0 ? creative1_300x250.id : creative1_728x90.id,
        type: 'impression',
        ip: `192.168.1.${(i % 10) + 1}`,
        user_agent: 'Mozilla/5.0 Chrome/128.0',
        created_at: eventDate,
      });
    }
    for (let i = 0; i < 3; i++) {
      events.push({
        campaign_id: campaign1.id,
        creative_id: i % 2 === 0 ? creative1_300x250.id : creative1_728x90.id,
        type: 'click',
        ip: `192.168.1.${(i % 10) + 1}`,
        user_agent: 'Mozilla/5.0 Chrome/128.0',
        created_at: eventDate,
      });
    }

    // Campaign 2: ~25 impressions, ~2 clicks per day
    for (let i = 0; i < 25; i++) {
      events.push({
        campaign_id: campaign2.id,
        creative_id: i % 2 === 0 ? creative2_300x250.id : creative2_728x90.id,
        type: 'impression',
        ip: `10.0.0.${(i % 8) + 1}`,
        user_agent: 'Mozilla/5.0 Safari/605.1',
        created_at: eventDate,
      });
    }
    for (let i = 0; i < 2; i++) {
      events.push({
        campaign_id: campaign2.id,
        creative_id: i % 2 === 0 ? creative2_300x250.id : creative2_728x90.id,
        type: 'click',
        ip: `10.0.0.${(i % 8) + 1}`,
        user_agent: 'Mozilla/5.0 Safari/605.1',
        created_at: eventDate,
      });
    }
  }

  await prisma.adEvent.createMany({
    data: events,
  });

  console.log(`✅ Seeded ${events.length} realistic ad events`);
  console.log('🚀 Database seeding completed successfully!');
}

if (require.main === module) {
  seedDatabase()
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await redisClient.quit();
    });
}
