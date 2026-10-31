import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const verificationDir = 'D:\\Projects\\Hacktober Fest 2026\\KillSwitch.swf\\verification';

async function run() {
  console.log('🚀 Starting Test Suite 1: Screens, HUD & Stages 1-8...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });

  // Listen to browser console
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') console.error('  [Browser Error]:', text);
  });

  // 1. Initial Page Load: Unblock Screen
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(verificationDir, '01-unblock.png') });
  console.log('📸 01-unblock.png captured');

  // Trigger bypass to preloader intro
  await page.click('#btn-unblock-flash');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(verificationDir, '02-intro-preloader.png') });
  console.log('📸 02-intro-preloader.png captured');

  // Wait for preloader or click continue to reach main menu
  await new Promise(r => setTimeout(r, 1600));
  await page.screenshot({ path: path.join(verificationDir, '03-main-menu.png') });
  console.log('📸 03-main-menu.png captured');

  // Test difficulty toggle and name input
  await page.type('#player-name-input', 'Tester_X');
  await page.click('#btn-diff-nightmare');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(verificationDir, '03b-difficulty-nightmare.png') });
  console.log('📸 03b-difficulty-nightmare.png captured');

  // Start match
  await page.click('#btn-start-infinite');
  await new Promise(r => setTimeout(r, 300));
  // Round 1 announcement banner
  await page.screenshot({ path: path.join(verificationDir, '04-round1-announcement.png') });
  console.log('📸 04-round1-announcement.png captured');

  // Wait for announcement to fade and combat HUD to activate
  await new Promise(r => setTimeout(r, 1600));
  await page.screenshot({ path: path.join(verificationDir, '04b-round1-hud.png') });
  console.log('📸 04b-round1-hud.png captured');

  // Capture Stages 1-8 via DEV round hook (?round=N)
  const stageRounds = [
    { round: 1, name: '05-stage1-animator-whiteghost.png' },
    { round: 2, name: '06-stage2-desktop-cobalt.png' },
    { round: 3, name: '07-stage3-matrix-jade.png' },
    { round: 4, name: '08-stage4-void-steve.png' },
    { round: 5, name: '09-stage5-ofrenda-crimson.png' },
    { round: 6, name: '10-stage6-plasma.png' },
    { round: 7, name: '11-stage7-calavera.png' },
    { round: 8, name: '12-stage8-flashghost.png' }
  ];

  for (const item of stageRounds) {
    await page.goto(`http://127.0.0.1:5173/?round=${item.round}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1600));
    const arch = await page.evaluate(() => {
      const g = window.__game;
      return {
        round: g.arena.roundNumber,
        stage: g.arena.stage,
        ghostName: g.arena.ghost.name,
        skin: g.arena.ghost.skin,
        maxHp: g.arena.ghost.maxHealth
      };
    });
    console.log(`  Round ${item.round}: Stage=${arch.stage}, Opponent=${arch.ghostName} (${arch.skin}), HP=${arch.maxHp}`);
    await page.screenshot({ path: path.join(verificationDir, item.name) });
    console.log(`📸 ${item.name} captured`);
  }

  await browser.close();
  console.log('✅ Suite 1 Finished cleanly. Console errors count:', consoleLogs.filter(c => c.type === 'error').length);
}

run().catch(err => {
  console.error('Suite 1 Failed:', err);
  process.exit(1);
});
