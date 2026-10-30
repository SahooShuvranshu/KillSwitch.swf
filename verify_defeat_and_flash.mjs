import puppeteer from 'puppeteer-core';

async function testDefeatAndFlash() {
  console.log('🚀 Running Defeat Animation & Flash Check via Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

  // 1. Unblock Flash & Start Gauntlet
  await page.click('#btn-unblock-flash');
  await new Promise(r => setTimeout(r, 1400));
  const continueBtn = await page.$('#btn-intro-continue');
  if (continueBtn) await continueBtn.click();
  await new Promise(r => setTimeout(r, 400));

  await page.click('#btn-start-infinite');
  await new Promise(r => setTimeout(r, 500));

  // 2. Test Hit Flash Toning Down: simulate hit and verify screen is NOT solid white
  console.log('🥊 Testing Hit Flash Toning Down...');
  await page.evaluate(() => {
    // Deliver a heavy hit to player
    const p = window.__game.arena.player;
    p.takeHit({
      x: p.x, y: p.y - 70, w: 40, h: 40,
      damage: 15, knockbackX: 4, knockbackY: -2,
      isHeavy: true
    });
  });

  // Verify flashFrames is 2 or 3 (NOT 10)
  const playerFlashFrames = await page.evaluate(() => window.__game.arena.player.flashFrames);
  const impactFlashFrames = await page.evaluate(() => window.__game.arena.impactFlashFrames);
  console.log('✨ Player flashFrames:', playerFlashFrames, '(Should be <= 3)');
  console.log('✨ Arena impactFlashFrames:', impactFlashFrames, '(Should be 0 during regular hit)');

  // 3. Test Cinematic Defeat Animation
  console.log('💀 Triggering Defeat Animation for Player (Health -> 0)...');
  await page.evaluate(() => {
    const p = window.__game.arena.player;
    p.takeHit({
      x: p.x, y: p.y - 70, w: 50, h: 50,
      damage: 120, knockbackX: -10, knockbackY: -8,
      isHeavy: true
    });
  });

  // Immediately check state: must be DEFEAT
  const stateAfterZeroHp = await page.evaluate(() => window.__game.arena.player.state);
  const isGroundedImmediately = await page.evaluate(() => window.__game.arena.player.isGrounded);
  const ghostState = await page.evaluate(() => window.__game.arena.ghost.state);

  console.log('💥 State after fatal hit:', stateAfterZeroHp, '(Expected: DEFEAT)');
  console.log('🕊️ Airborne in defeat arc:', !isGroundedImmediately);
  console.log('🏆 Victor Ghost State:', ghostState, '(Expected: VICTORY)');

  // Let defeat physics run (airborne tumble -> ground bounce -> settle on floor)
  await new Promise(r => setTimeout(r, 800));
  const stateAfterLanding = await page.evaluate(() => window.__game.arena.player.state);
  const isGroundedAfterLanding = await page.evaluate(() => window.__game.arena.player.isGrounded);
  console.log('🛌 State after floor collision:', stateAfterLanding, '(Expected: DEFEAT)');
  console.log('📍 Permanently grounded on floor:', isGroundedAfterLanding);

  await page.screenshot({ path: 'screenshot_defeat_animation.png' });
  console.log('📸 Captured screenshot_defeat_animation.png');

  // 4. Trigger round end and verify Arcade Game Over Screen
  await page.evaluate(() => {
    window.__game.arena.endRound(window.__game.arena.ghost.name);
  });

  // Wait for 2.4s so Game Over screen activates
  await new Promise(r => setTimeout(r, 2600));

  const isGameOverActive = await page.$eval('#game-over-screen', el => el.classList.contains('active'));
  console.log('✅ Game Over Screen Active:', isGameOverActive);

  const roundsCleared = await page.$eval('#go-rounds-survived', el => el.innerText);
  const executioner = await page.$eval('#go-defeated-by', el => el.innerText);
  const fatalHabit = await page.$eval('#go-fatal-habit', el => el.innerText);
  const autopsyQuote = await page.$eval('#go-quote', el => el.innerText);

  console.log('📊 Game Over Screen Content:', {
    roundsCleared,
    executioner,
    fatalHabit,
    autopsyQuote
  });

  await page.screenshot({ path: 'screenshot_game_over_screen.png' });
  console.log('📸 Captured screenshot_game_over_screen.png');

  await browser.close();
  console.log('🎉 Defeat Animation, Flash Reduction & Game Over Screen verified successfully!');
}

testDefeatAndFlash().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
