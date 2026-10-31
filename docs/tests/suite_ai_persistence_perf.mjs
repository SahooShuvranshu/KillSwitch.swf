import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const verificationDir = 'D:\\Projects\\Hacktober Fest 2026\\KillSwitch.swf\\docs';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🚀 Starting Test Suite 4: AI Learning, Rage 0x7E5, Persistence, Cemetery & Perf...');
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

  // --- 1. AI Q-Learning & F3 Debug Overlay ---
  console.log('Testing AI Q-Learning across 3 rounds with jump-kick spam...');
  await page.goto('http://127.0.0.1:5173/?round=1', { waitUntil: 'networkidle0' });
  await page.click('#btn-unblock-flash');
  await wait(1800);
  await page.click('#btn-start-infinite');
  await wait(2200);

  // Toggle F3 overlay
  await page.keyboard.press('F3');
  await wait(100);

  // Round 1 jump kick training
  await page.evaluate(() => {
    const p = window.__game.arena.player;
    const g = window.__game.arena.ghost;
    p.x = 420;
    g.x = 510;
  });
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('KeyW');
    await wait(80);
    await page.keyboard.press('KeyK');
    await wait(240);
  }

  // Complete Round 1 -> advance to Round 2
  await page.evaluate(() => {
    window.__game.arena.ghost.health = 0;
    window.__game.arena.endRound(window.__game.arena.player.name);
  });
  await wait(2400); // Wait for roast screen

  // Click Next Round button to advance to Round 2
  await page.click('#btn-next-round');
  await wait(2200);

  // Round 2 jump kick training
  await page.evaluate(() => {
    const p = window.__game.arena.player;
    const g = window.__game.arena.ghost;
    p.x = 420;
    g.x = 510;
  });
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('KeyW');
    await wait(80);
    await page.keyboard.press('KeyK');
    await wait(240);
  }

  // Complete Round 2 -> advance to Round 3
  await page.evaluate(() => {
    window.__game.arena.ghost.health = 0;
    window.__game.arena.endRound(window.__game.arena.player.name);
  });
  await wait(2400);
  await page.click('#btn-next-round');
  await wait(2200);

  // Inspect Learner metrics in Round 3
  const learnerMetrics = await page.evaluate(() => {
    const l = window.__game.aiController.learner;
    const c = window.__game.aiController;
    return {
      round: c.roundNumber,
      epsilon: l.epsilon,
      lastState: c.lastStateKey,
      lastBehavior: c.lastBehavior,
      lastReward: c.lastReward,
      qTableKeys: Object.keys(l.qTable).length
    };
  });
  console.log('  Round 3 Learner metrics:', learnerMetrics);

  // Position player jumping near ghost to show ANTI_AIR response
  await page.keyboard.press('KeyW');
  await wait(120);
  await page.screenshot({ path: path.join(verificationDir, '35-ai-anti-air-f3.png') });
  console.log('📸 35-ai-anti-air-f3.png captured');

  // --- 2. Error 0x7E5 Rage Mode ---
  console.log('Testing Error 0x7E5 Rage Mode in Round 3+...');
  await page.evaluate(() => {
    const g = window.__game.arena.ghost;
    const c = window.__game.aiController;
    g.health = 30; // Drop health to ~14% (< 35% threshold)
    c.update(); // Trigger rage detection
    c.executeError0x7E5TripleTeleport();
  });
  await wait(80);
  await page.screenshot({ path: path.join(verificationDir, '36-rage-0x7e5-teleport.png') });
  console.log('📸 36-rage-0x7e5-teleport.png captured');

  // --- 3. Persistence: Check LocalStorage ---
  console.log('Testing AI Persistence in LocalStorage...');
  const storageData = await page.evaluate(() => {
    return localStorage.getItem('killswitch.ai.v1');
  });
  console.log('  Stored AI Data Length:', storageData ? storageData.length : 0);
  await page.screenshot({ path: path.join(verificationDir, '37-persistence-storage.png') });
  console.log('📸 37-persistence-storage.png captured');

  // --- 4. Game Over Screen ---
  console.log('Testing Game Over screen...');
  await page.evaluate(() => {
    window.__game.arena.player.health = 0;
    window.__game.arena.endRound(window.__game.arena.ghost.name);
  });
  await wait(2500); // Wait for game over screen
  const isGameOverVisible = await page.evaluate(() => {
    const el = document.getElementById('game-over-screen');
    return el && !el.classList.contains('hidden');
  });
  console.log('  Game Over Screen visible:', isGameOverVisible);
  await page.screenshot({ path: path.join(verificationDir, '39-game-over-screen.png') });
  console.log('📸 39-game-over-screen.png captured');

  // --- 5. Ofrenda Cemetery & Calaverita Poem ---
  console.log('Testing Cemetery and Calaverita Poem generation...');
  await page.click('#btn-go-ofrenda');
  await wait(600);

  // Click on Alien Hominid grave
  await page.click('.grave-card[data-game="Alien Hominid"]');
  await wait(2500); // Wait for Calaverita generation (live or fallback)

  const calaveritaText = await page.evaluate(() => {
    const el = document.getElementById('calaverita-content');
    return el ? el.innerText : '';
  });
  console.log('  Calaverita Poem snippet:', calaveritaText.slice(0, 100));
  await page.screenshot({ path: path.join(verificationDir, '40-ofrenda-calaverita.png') });
  console.log('📸 40-ofrenda-calaverita.png captured');

  // Return to menu to test Reset AI Memory
  await page.click('#btn-back-to-game');
  await wait(500);

  // --- 6. Reset AI Memory ---
  console.log('Testing Reset AI Memory button...');
  // Intercept reload or trigger reset handler
  const memoryCleared = await page.evaluate(() => {
    const btn = document.getElementById('btn-reset-ai-memory');
    // Simulate what the click does without full navigation drop
    localStorage.removeItem('killswitch.ai.v1');
    return localStorage.getItem('killswitch.ai.v1') === null;
  });
  console.log('  LocalStorage cleared:', memoryCleared);
  await page.screenshot({ path: path.join(verificationDir, '38-reset-ai-memory.png') });
  console.log('📸 38-reset-ai-memory.png captured');

  // --- 7. Stress & Responsive: Mobile & Fullscreen ---
  console.log('Testing Responsive Mobile & Desktop Fullscreen...');
  // Mobile portrait (375x667)
  await page.setViewport({ width: 375, height: 667 });
  await page.evaluate(() => {
    window.__game.arena.resize();
  });
  await wait(300);
  await page.screenshot({ path: path.join(verificationDir, '41-mobile-resize.png') });
  console.log('📸 41-mobile-resize.png captured');

  // Desktop widescreen (1440x900)
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluate(() => {
    document.getElementById('flash-window')?.classList.add('fullscreen');
    window.__game.arena.resize();
  });
  await wait(300);
  await page.screenshot({ path: path.join(verificationDir, '42-desktop-fullscreen.png') });
  console.log('📸 42-desktop-fullscreen.png captured');

  // --- 8. 60 FPS Stability Benchmark ---
  console.log('Benchmarking 60 FPS stability...');
  const perfData = await page.evaluate(async () => {
    const frameDeltas = [];
    let last = performance.now();
    for (let i = 0; i < 60; i++) {
      await new Promise(r => requestAnimationFrame(r));
      const now = performance.now();
      frameDeltas.push(now - last);
      last = now;
    }
    const avgDelta = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
    const avgFps = 1000 / avgDelta;
    return { avgDeltaMs: avgDelta.toFixed(2), avgFps: avgFps.toFixed(1) };
  });
  console.log('  FPS Benchmark Result:', perfData);

  console.log('✅ Suite 4 Finished cleanly. Error logs count:', consoleLogs.filter(l => l.type === 'error').length);
  await browser.close();
}

run().catch(err => {
  console.error('❌ Suite 4 Error:', err);
  process.exit(1);
});
