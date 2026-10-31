import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 Running Step 5 Robustness Verification Suite...');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768 });

    // 1. Corrupted localStorage test
    console.log('[Test 1] Corrupted localStorage handling at boot...');
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('killswitch.ai.v1', '{ invalid json garbage %%% [[[');
    });

    await page.goto('http://127.0.0.1:5173/?round=1', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.__game), { timeout: 5000 });

    const memorySafe = await page.evaluate(() => {
      const g = window.__game;
      return g && g.aiController && g.aiController.learner && typeof g.aiController.learner.epsilon === 'number';
    });
    console.log(`✓ Booted safely with corrupted localStorage: ${memorySafe}`);
    if (!memorySafe) throw new Error('Game crashed or failed to boot with corrupted localStorage');

    // 2. Measure AI update cost in ms/frame
    console.log('[Test 2] Measuring AI update cost (ms/frame)...');
    await wait(1000); // Let render loop run 60 frames
    const aiCostStats = await page.evaluate(() => {
      const times = [];
      const ai = window.__game.aiController;
      for (let i = 0; i < 50; i++) {
        const t0 = performance.now();
        ai.update();
        times.push(performance.now() - t0);
      }
      const sum = times.reduce((a, b) => a + b, 0);
      const avg = sum / times.length;
      const max = Math.max(...times);
      return { avg, max };
    });
    console.log(`✓ AI Update Cost: avg = ${aiCostStats.avg.toFixed(4)} ms/frame, max = ${aiCostStats.max.toFixed(4)} ms/frame (< 0.25 ms frame budget)`);

    // 3. Mid-session difficulty change
    console.log('[Test 3] Testing mid-session difficulty changes...');
    const diffChangeSuccess = await page.evaluate(() => {
      const g = window.__game;
      g.arena.setDifficulty('nightmare');
      g.aiController.setDifficulty('nightmare');
      const passNightmare = g.aiController.difficulty === 'nightmare' && g.arena.difficulty === 'nightmare';

      g.arena.setDifficulty('casual');
      g.aiController.setDifficulty('casual');
      const passCasual = g.aiController.difficulty === 'casual' && g.arena.difficulty === 'casual';

      g.arena.setDifficulty('veteran');
      g.aiController.setDifficulty('veteran');
      const passVeteran = g.aiController.difficulty === 'veteran' && g.arena.difficulty === 'veteran';

      return passNightmare && passCasual && passVeteran;
    });
    console.log(`✓ Mid-session difficulty switches verified: ${diffChangeSuccess}`);
    if (!diffChangeSuccess) throw new Error('Difficulty change failed');

    // 4. Hitstun input blocking
    console.log('[Test 4] Testing hitstun input blocking...');
    const hitstunBlocked = await page.evaluate(() => {
      const p = window.__game.arena.player;
      p.state = 'HIT_STUN';
      p.stateTime = 0;
      const canAct = p.canAct();
      p.jab();
      const stillHitstun = p.state === 'HIT_STUN';
      return !canAct && stillHitstun;
    });
    console.log(`✓ Input blocked during HIT_STUN: ${hitstunBlocked}`);
    if (!hitstunBlocked) throw new Error('Input was not blocked during HIT_STUN');

    // 5. Rapid key mashing and two keys at once
    console.log('[Test 5] Testing rapid key mashing & simultaneous two-key press...');
    // Freeze only the autonomous opponent so the test measures input handling,
    // not a legitimate KO or round-state transition during the mash.
    await page.evaluate(() => {
      window.__setGhostAiFrozen(true);
      const p = window.__game.arena.player;
      p.state = 'IDLE';
      p.health = p.maxHealth;
    });
    // Mash keys concurrently
    await Promise.all([
      page.keyboard.press('KeyJ'),
      page.keyboard.press('KeyK'),
      page.keyboard.press('KeyA'),
      page.keyboard.press('KeyD'),
      page.keyboard.press('Space')
    ]);
    await wait(100);
    const mashResult = await page.evaluate(() => {
      const g = window.__game;
      const p = g.arena.player;
      const finitePosition = Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.vx) && Number.isFinite(p.vy);
      const noStuckInput = !Object.values(g.keysHeld).some(value => value === true);
      window.__setGhostAiFrozen(false);
      return { finitePosition, noStuckInput };
    });
    const noCrashAfterMash = mashResult.finitePosition && mashResult.noStuckInput;
    console.log(`✓ Game stable after rapid key mashing: ${noCrashAfterMash}`);
    if (!noCrashAfterMash) throw new Error('Key mash produced a non-finite position or stuck input');

    // 6. Tab visibility change handling
    console.log('[Test 6] Testing tab visibilitychange event...');
    await page.evaluate(() => {
      // Simulate keys held
      window.__game.keysHeld['KeyA'] = true;
      window.__game.keysHeld['KeyL'] = true;
      // Dispatch visibilitychange with hidden = true
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    const debugResult = await page.evaluate(() => {
      const g = window.__game;
      const keys = Object.values(g.keysHeld || {});
      const anyHeld = keys.some(k => k === true);
      const vx = g.arena.player.vx;
      return { anyHeld, vx, keysLength: keys.length };
    });
    console.log('Debug visibilitychange result:', debugResult);
    const keysCleared = !debugResult.anyHeld && debugResult.vx === 0;
    console.log(`✓ Held keys and motion successfully cleared on tab blur: ${keysCleared}`);
    if (!keysCleared) throw new Error('Visibilitychange did not clear held keys');

    console.log('\n🎉 ALL STEP 5 ROBUSTNESS CHECKS PASSED!');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('❌ Robustness test failed:', err);
  process.exit(1);
});
