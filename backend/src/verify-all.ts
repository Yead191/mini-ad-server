// import { prisma } from './shared/prisma';
// import { redisClient } from './config/redis';

// const BASE_URL = 'http://localhost:5000';

// async function runVerification() {
//   console.log('====================================================');
//   console.log('🔍 MINI AD SERVER — FULL TASK SPECIFICATION AUDIT');
//   console.log('====================================================\n');

//   let passed = 0;
//   let failed = 0;

//   function assert(condition: boolean, testName: string, detail?: string) {
//     if (condition) {
//       console.log(`✅ [PASS] ${testName}`);
//       passed++;
//     } else {
//       console.error(`❌ [FAIL] ${testName}`);
//       if (detail) console.error(`   Details: ${detail}`);
//       failed++;
//     }
//   }

//   // 1. DATA MODEL VERIFICATION
//   console.log('\n--- 1. DATABASE SCHEMA & DATA MODEL ---');
//   try {
//     const campaignsCount = await prisma.campaign.count();
//     const creativesCount = await prisma.creative.count();
//     const eventsCount = await prisma.adEvent.count();

//     assert(campaignsCount > 0, 'Campaigns table exists and has records');
//     assert(creativesCount > 0, 'Creatives table exists and has records');
//     assert(eventsCount > 0, 'AdEvents table exists and has records');

//     const sampleCreative = await prisma.creative.findFirst({
//       include: { campaign: true },
//     });
//     assert(
//       !!sampleCreative &&
//         typeof sampleCreative.width === 'number' &&
//         typeof sampleCreative.height === 'number' &&
//         typeof sampleCreative.click_url === 'string',
//       'Creatives schema contains width, height, image_url, click_url, campaign_id'
//     );
//   } catch (err: any) {
//     assert(false, 'Database schema verification', err.message);
//   }

//   // 2. ENDPOINT: POST /campaigns
//   console.log('\n--- 2. POST /campaigns (Validation & Creation) ---');
//   let testCampaignId = '';
//   try {
//     // Valid creation
//     const res = await fetch(`${BASE_URL}/campaigns`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         name: 'Verification Campaign',
//         daily_impression_limit: 2500,
//       }),
//     });
//     const resJson = await res.json();
//     assert(
//       res.status === 201 || res.status === 200,
//       'POST /campaigns returns 200/201 on valid input'
//     );
//     assert(
//       resJson?.data?.status === 'active',
//       'POST /campaigns defaults status to "active"'
//     );
//     testCampaignId = resJson?.data?.id;

//     // Invalid: empty name
//     const emptyNameRes = await fetch(`${BASE_URL}/campaigns`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         name: '',
//         daily_impression_limit: 100,
//       }),
//     });
//     assert(
//       emptyNameRes.status === 400,
//       'POST /campaigns returns 400 for empty name'
//     );

//     // Invalid: negative daily_impression_limit
//     const negativeLimitRes = await fetch(`${BASE_URL}/campaigns`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         name: 'Bad Limit Campaign',
//         daily_impression_limit: -50,
//       }),
//     });
//     assert(
//       negativeLimitRes.status === 400,
//       'POST /campaigns returns 400 for non-positive daily_impression_limit'
//     );
//   } catch (err: any) {
//     assert(false, 'POST /campaigns execution', err.message);
//   }

//   // 3. ENDPOINT: PATCH /campaigns/:id
//   console.log('\n--- 3. PATCH /campaigns/:id (Status Update) ---');
//   try {
//     const pauseRes = await fetch(`${BASE_URL}/campaigns/${testCampaignId}`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ status: 'paused' }),
//     });
//     const pauseJson = await pauseRes.json();
//     assert(
//       pauseJson?.data?.status === 'paused',
//       'PATCH /campaigns/:id pauses campaign successfully'
//     );

//     const resumeRes = await fetch(`${BASE_URL}/campaigns/${testCampaignId}`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ status: 'active' }),
//     });
//     const resumeJson = await resumeRes.json();
//     assert(
//       resumeJson?.data?.status === 'active',
//       'PATCH /campaigns/:id resumes campaign successfully'
//     );
//   } catch (err: any) {
//     assert(false, 'PATCH /campaigns/:id execution', err.message);
//   }

//   // 4. ENDPOINT: GET /ad?size=300x250
//   console.log('\n--- 4. GET /ad?size=300x250 (Ad Serving & Decisioning) ---');
//   let chosenCreativeId = '';
//   try {
//     const res = await fetch(`${BASE_URL}/ad?size=300x250`);
//     const data = await res.json();
//     assert(res.status === 200, 'GET /ad?size=300x250 returns 200 OK');
//     assert(
//       typeof data?.creative_id === 'string',
//       'Response includes creative_id'
//     );
//     assert(
//       typeof data?.html === 'string' && data.html.includes('<img'),
//       'Response includes <img> tag in html field'
//     );
//     assert(
//       data?.impression_url === `/track/impression?c=${data.creative_id}`,
//       'Response impression_url matches /track/impression?c=<creative_id>'
//     );
//     assert(
//       data?.click_url === `/track/click?c=${data.creative_id}`,
//       'Response click_url is the tracking URL (/track/click?c=<creative_id>), not the landing page'
//     );
//     chosenCreativeId = data.creative_id;

//     // Test unmatched size -> 204 No Content
//     const emptyRes = await fetch(`${BASE_URL}/ad?size=111x999`);
//     assert(
//       emptyRes.status === 204,
//       'GET /ad with unmatched size returns 204 No Content'
//     );
//   } catch (err: any) {
//     assert(false, 'GET /ad execution', err.message);
//   }

//   // 5. ENDPOINT: GET /track/impression?c=<creative_id>
//   console.log('\n--- 5. GET /track/impression (Impression Pixel) ---');
//   try {
//     const res = await fetch(
//       `${BASE_URL}/track/impression?c=${chosenCreativeId}`
//     );
//     const buffer = await res.arrayBuffer();
//     assert(
//       res.status === 200,
//       'GET /track/impression returns 200 OK for known creative'
//     );
//     assert(
//       res.headers.get('content-type') === 'image/gif',
//       'GET /track/impression returns Content-Type: image/gif'
//     );
//     assert(
//       buffer.byteLength === 42 || buffer.byteLength === 43,
//       'GET /track/impression returns valid 1x1 transparent GIF buffer'
//     );

//     // Verify 404 for unknown creative
//     const unknownRes = await fetch(
//       `${BASE_URL}/track/impression?c=unknown_nonexistent_id`
//     );
//     assert(
//       unknownRes.status === 404,
//       'GET /track/impression returns 404 for unknown creative'
//     );
//   } catch (err: any) {
//     assert(false, 'GET /track/impression execution', err.message);
//   }

//   // 6. ENDPOINT: GET /track/click?c=<creative_id>
//   console.log('\n--- 6. GET /track/click (Click Tracking & 302 Redirect) ---');
//   try {
//     const res = await fetch(`${BASE_URL}/track/click?c=${chosenCreativeId}`, {
//       redirect: 'manual',
//     });
//     assert(
//       res.status === 302,
//       'GET /track/click responds with HTTP 302 redirect'
//     );
//     const location = res.headers.get('location');
//     assert(
//       typeof location === 'string' && location.startsWith('http'),
//       `Redirect Location points to creative landing page: ${location}`
//     );

//     // Verify 404 for unknown creative
//     const unknownClickRes = await fetch(
//       `${BASE_URL}/track/click?c=unknown_creative_id`,
//       { redirect: 'manual' }
//     );
//     assert(
//       unknownClickRes.status === 404,
//       'GET /track/click returns 404 for unknown creative'
//     );
//   } catch (err: any) {
//     assert(false, 'GET /track/click execution', err.message);
//   }

//   // 7. ENDPOINT: GET /report
//   console.log('\n--- 7. GET /report (Analytics, Attribution & Validation) ---');
//   try {
//     const today = new Date().toISOString().split('T')[0];
//     const past = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

//     // group_by default (campaign)
//     const reportCampaignRes = await fetch(
//       `${BASE_URL}/report?from=${past}&to=${today}`
//     );
//     const campaignData: any = await reportCampaignRes.json();
//     assert(
//       reportCampaignRes.status === 200,
//       'GET /report returns 200 OK when group_by defaults to campaign'
//     );
//     const campaignItem = campaignData?.[0];
//     assert(
//       campaignItem &&
//         'campaign_id' in campaignItem &&
//         'impressions' in campaignItem &&
//         'clicks' in campaignItem &&
//         'ctr' in campaignItem,
//       'Campaign report contains campaign_id, impressions, clicks, ctr (%)'
//     );

//     // group_by = day
//     const reportDayRes = await fetch(
//       `${BASE_URL}/report?from=${past}&to=${today}&group_by=day`
//     );
//     const dayData: any = await reportDayRes.json();
//     assert(reportDayRes.status === 200, 'GET /report?group_by=day returns 200 OK');
//     const dayItem = dayData?.[0];
//     assert(
//       dayItem && 'date' in dayItem && 'impressions' in dayItem && 'ctr' in dayItem,
//       'Day report contains date, impressions, clicks, ctr (%)'
//     );

//     // Invalid: from after to -> 400
//     const invalidDateRes = await fetch(
//       `${BASE_URL}/report?from=2026-10-10&to=2026-10-01`
//     );
//     assert(
//       invalidDateRes.status === 400,
//       'GET /report returns 400 for "from" after "to"'
//     );

//     // Invalid: unknown group_by -> 400
//     const invalidGroupRes = await fetch(
//       `${BASE_URL}/report?from=${past}&to=${today}&group_by=invalid_group`
//     );
//     assert(
//       invalidGroupRes.status === 400,
//       'GET /report returns 400 for unknown group_by'
//     );
//   } catch (err: any) {
//     assert(false, 'GET /report execution', err.message);
//   }

//   // 8. BONUS FEATURES AUDIT
//   console.log('\n--- 8. BONUS FEATURES VERIFICATION ---');
//   try {
//     // Bonus 1: Redis Candidate Caching
//     const cachedCandidates = await redisClient.get('ad_candidates:300x250');
//     const ttl = await redisClient.ttl('ad_candidates:300x250');
//     assert(
//       !!cachedCandidates,
//       'Bonus 1: Candidate list cached in Redis under ad_candidates:300x250'
//     );
//     assert(
//       ttl > 0 && ttl <= 60,
//       `Bonus 1: Candidate cache has active TTL (${ttl}s remaining)`
//     );

//     // Bonus 2: Frequency Capping
//     const testIp = '123.45.67.89';
//     const capCreative = await prisma.creative.findFirst();
//     if (capCreative) {
//       // Simulate 3 impressions
//       for (let i = 0; i < 3; i++) {
//         await fetch(`${BASE_URL}/track/impression?c=${capCreative.id}`, {
//           headers: { 'x-forwarded-for': testIp },
//         });
//       }
//       const todayKey = new Date().toISOString().split('T')[0];
//       const count = await redisClient.get(
//         `freq:${capCreative.id}:${testIp}:${todayKey}`
//       );
//       assert(
//         Number(count) >= 3,
//         `Bonus 2: Frequency cap counter in Redis reached ${count} for IP ${testIp}`
//       );
//     }

//     // Bonus 3: Daily Impression Limit
//     const activeCamp = await prisma.campaign.findFirst({
//       where: { status: 'active' },
//     });
//     if (activeCamp) {
//       assert(
//         typeof activeCamp.daily_impression_limit === 'number' &&
//           activeCamp.daily_impression_limit > 0,
//         `Bonus 3: Campaign has daily_impression_limit configured (${activeCamp.daily_impression_limit})`
//       );
//     }
//   } catch (err: any) {
//     assert(false, 'Bonus features verification', err.message);
//   }

//   // 9. DEMO PUBLISHER PAGE
//   console.log('\n--- 9. DEMO PUBLISHER PAGE (publisher.html) ---');
//   try {
//     const pubRes = await fetch(`${BASE_URL}/demo`);
//     const pubHtml = await pubRes.text();
//     assert(pubRes.status === 200, 'GET /demo serves publisher.html (200 OK)');
//     assert(
//       pubHtml.includes('data-ad-size="300x250"') &&
//         pubHtml.includes('data-ad-size="728x90"'),
//       'publisher.html contains two ad slots (300x250 and 728x90)'
//     );
//     assert(
//       pubHtml.includes('fireImpressionOnce') &&
//         pubHtml.includes('/track/click'),
//       'publisher.html includes ad tag script firing impression once on load and wrapping in tracking link'
//     );
//   } catch (err: any) {
//     assert(false, 'Demo publisher page verification', err.message);
//   }

//   console.log('\n====================================================');
//   console.log(`📊 FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
//   console.log('====================================================');

//   await prisma.$disconnect();
//   await redisClient.quit();
//   process.exit(failed > 0 ? 1 : 0);
// }

// runVerification();
