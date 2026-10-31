import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const verificationDir = 'D:\\Projects\\Hacktober Fest 2026\\KillSwitch.swf\\docs';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🚀 Starting Test Suite 3: Combat Feedback & Inter-Round Roast...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });

  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') console.error('  [Browser Error]:', text);
  });

  // --- PART 1: Hit sparks, damage numbers, hitstun, knockdown, block chip ---
  console.log('Navigating to round 1 for combat feedback...');
  await page.goto('http://127.0.0.1:5173/?round=1', { waitUntil: 'networkidle0' });
  await page.click('#btn-unblock-flash');
  await wait(1800);
  await page.click('#btn-start-infinite');
  await wait(2200); // Wait for announcement to finish

  // Bring fighters close
  await page.evaluate(() => {
    const p = window.__game.arena.player;
    const g = window.__game.arena.ghost;
    p.x = 450;
    g.x = 510;
  });
  await wait(50);

  // 1. Deliver heavy kick to trigger hit sparks, numbers, and camera shake
  console.log('Testing heavy hit sparks and numbers...');
  await page.keyboard.press('KeyK');
  await wait(120);
  await page.screenshot({ path: path.join(verificationDir, '28-hit-sparks-numbers.png') });
  console.log('📸 28-hit-sparks-numbers.png captured');

  // 2. Knockdown / Hitstun
  await wait(100);
  await page.screenshot({ path: path.join(verificationDir, '29-hitstun-knockdown.png') });
  console.log('📸 29-hitstun-knockdown.png captured');

  // 3. Block chip damage and guard sparks
  console.log('Testing block guard...');
  await page.evaluate(() => {
    const p = window.__game.arena.player;
    const g = window.__game.arena.ghost;
    p.x = 460;
    g.x = 510;
    g.block(true); // Ghost actively blocking
  });
  await wait(50);
  await page.keyboard.press('KeyK');
  await wait(130);
  await page.screenshot({ path: path.join(verificationDir, '30-block-chip.png') });
  console.log('📸 30-block-chip.png captured');

  // 4. KO Announcement & Slow-mo
  console.log('Testing K.O. announcement...');
  await page.evaluate(() => {
    const p = window.__game.arena.player;
    const g = window.__game.arena.ghost;
    p.x = 460;
    g.x = 510;
    g.health = 2; // Near-death
  });
  await wait(50);
  await page.keyboard.press('KeyJ');
  await wait(350); // Let KO announcement appear
  await page.screenshot({ path: path.join(verificationDir, '31-ko-announcement.png') });
  console.log('📸 31-ko-announcement.png captured');

  // 5. Inter-Round Roast Streaming with Ollama
  console.log('Waiting for Inter-Round Roast screen with Ollama...');
  // Arena delays 2200ms before showing roast-screen
  await wait(2400);

  const roastScreenVisible = await page.evaluate(() => {
    const el = document.getElementById('roast-screen');
    return el && !el.classList.contains('hidden');
  });
  console.log('  Roast screen visible:', roastScreenVisible);

  // Wait for streaming text to populate
  await wait(3000);
  const liveRoastText = await page.evaluate(() => {
    const el = document.getElementById('roast-text');
    return el ? el.innerText : '';
  });
  console.log('  Live Roast Text snippet:', liveRoastText.slice(0, 100));
  await page.screenshot({ path: path.join(verificationDir, '33-roast-streaming.png') });
  console.log('📸 33-roast-streaming.png captured');

  // 6. Test Round Timer Timeout Win Condition
  console.log('Testing Round Timer Timeout...');
  await page.goto('http://127.0.0.1:5173/?round=1', { waitUntil: 'networkidle0' });
  await page.click('#btn-unblock-flash');
  await wait(1800);
  await page.click('#btn-start-infinite');
  await wait(2200);

  await page.evaluate(() => {
    window.__game.arena.timer = 1; // 1 second left
    window.__game.arena.player.health = 150;
    window.__game.arena.ghost.health = 80;
  });
  await wait(1300); // Timer expires -> triggers TIME'S UP!
  await page.screenshot({ path: path.join(verificationDir, '32-round-timeout.png') });
  console.log('📸 32-round-timeout.png captured');

  // 7. Test Fallback Roast Screen (with Ollama network aborted)
  console.log('Testing Roast Screen Fallback when Ollama is offline...');
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('11434') || req.url().includes('/ollama/')) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // Defeat ghost to trigger roast screen with Ollama blocked
  await page.evaluate(() => {
    window.__game.arena.ghost.health = 0;
    window.__game.arena.player.health = 180;
    window.__game.arena.endRound(window.__game.arena.player.name);
  });
  await wait(2500); // 2200ms delay + fallback execution

  const fallbackText = await page.evaluate(() => {
    const el = document.getElementById('roast-text');
    return el ? el.innerText : '';
  });
  console.log('  Fallback text snippet:', fallbackText.slice(0, 100));

  await page.screenshot({ path: path.join(verificationDir, '34-roast-fallback.png') });
  console.log('📸 34-roast-fallback.png captured');

  console.log('✅ Suite 3 Finished cleanly. Error logs count:', consoleLogs.filter(l => l.type === 'error').length);
  await browser.close();
}

run().catch(err => {
  console.error('❌ Suite 3 Error:', err);
  process.exit(1);
});
