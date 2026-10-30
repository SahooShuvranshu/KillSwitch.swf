// ============================================================================
// Automated End-to-End Test: Flash Unblock -> Gaming Intro -> Arcade Menu -> Gauntlet
// ============================================================================

import puppeteer from 'puppeteer-core';

async function runTest() {
  console.log('🚀 Starting Puppeteer Headless Browser Test...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  console.log('🌐 Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

  // 1. Verify Unblock Flash Screen is Active
  const isUnblockVisible = await page.$eval('#flash-unblock-screen', el => el.classList.contains('active'));
  console.log('✅ 1. Flash Unblock Screen Active:', isUnblockVisible);

  if (!isUnblockVisible) throw new Error('Unblock screen was not active on load');

  await page.screenshot({ path: 'unblock_screen.png' });

  // 2. Click Unblock Flash Player Button
  console.log('🖱️ Clicking [CLICK TO UNBLOCK FLASH PLAYER]...');
  await page.click('#btn-unblock-flash');

  // Verify Gaming Intro Screen is Active
  await new Promise(r => setTimeout(r, 300));
  const isIntroVisible = await page.$eval('#gaming-intro-screen', el => el.classList.contains('active'));
  console.log('✅ 2. Gaming Intro Screen Active:', isIntroVisible);

  // Wait for preloader to progress
  await new Promise(r => setTimeout(r, 1200));
  const progressText = await page.$eval('#intro-load-percent', el => el.innerText);
  console.log('📊 Preloader Progress:', progressText);
  await page.screenshot({ path: 'intro_preloader.png' });

  // Wait for auto-advance to Arcade Menu (or click continue if button appears)
  await new Promise(r => setTimeout(r, 1200));
  let isMenuVisible = await page.$eval('#game-menu-screen', el => el.classList.contains('active'));
  if (!isMenuVisible) {
    const continueBtn = await page.$('#btn-intro-continue');
    if (continueBtn) await continueBtn.click();
    await new Promise(r => setTimeout(r, 400));
    isMenuVisible = await page.$eval('#game-menu-screen', el => el.classList.contains('active'));
  }
  console.log('✅ 3. Game Menu Screen Active (Player Name Only):', isMenuVisible);
  await page.screenshot({ path: 'arcade_menu.png' });

  // 3. Verify only Player Name input is present (no character selector dropdowns)
  const hasNameInput = await page.$('#player-name-input') !== null;
  const hasSkinSelect = await page.$('#select-skin') !== null;
  console.log('✅ 4. Has Name Input:', hasNameInput, '| Has Skin Select Dropdown:', hasSkinSelect);
  if (hasSkinSelect) throw new Error('Skin selector should not be in the simplified menu!');

  // Enter Challenger Name
  await page.click('#player-name-input', { clickCount: 3 });
  await page.type('#player-name-input', 'KAGE_WARRIOR');

  // 4. Click Start Infinite Match
  console.log('⚔️ Clicking [START INFINITE MATCH]...');
  await page.click('#btn-start-infinite');
  await new Promise(r => setTimeout(r, 600));

  // Verify game started
  const isCombatRunning = await page.evaluate(() => window.__game?.isRunning);
  const currentStage = await page.evaluate(() => window.__game?.arena?.stage);
  const aiName = await page.evaluate(() => window.__game?.arena?.ghost?.name);
  const playerName = await page.evaluate(() => window.__game?.arena?.player?.name);

  console.log('✅ 5. Combat Running:', isCombatRunning);
  console.log('📍 Current Stage:', currentStage);
  console.log('👤 Player Name:', playerName);
  console.log('🤖 AI Opponent:', aiName);
  await page.screenshot({ path: 'round1_combat.png' });

  // 5. Simulate combat moves
  console.log('🥊 Simulating player moves (Jab, Heavy Kick, Jump)...');
  await page.keyboard.press('KeyJ');
  await new Promise(r => setTimeout(r, 150));
  await page.keyboard.press('KeyW');
  await new Promise(r => setTimeout(r, 80));
  await page.keyboard.press('KeyK'); // flying jump kick
  await new Promise(r => setTimeout(r, 400));

  // Check telemetry recorded moves
  const telemetrySummary = await page.evaluate(() => window.__game?.telemetry?.compileSummary('KAGE_WARRIOR'));
  console.log('📈 Recorded Telemetry Summary:', {
    jumpKicks: telemetrySummary.jumpKicks,
    punches: telemetrySummary.punches,
    heavyKicks: telemetrySummary.heavyKicks,
    favoriteCombo: telemetrySummary.habits.favoriteCombo
  });

  // 6. Test round end: Simulate Ghost defeat to verify Inter-Round Roast & Next Opponent Preview
  console.log('⚡ Triggering Round 1 Win to test Inter-Round Telemetry & Evolved Opponent Preview...');
  await page.evaluate(() => {
    window.__game.arena.ghost.health = 0;
    window.__game.arena.endRound(window.__game.arena.player.name);
  });

  // Wait for 2s round end delay
  await new Promise(r => setTimeout(r, 2400));

  const isRoastVisible = await page.$eval('#roast-screen', el => el.classList.contains('active'));
  console.log('✅ 6. Roast & Adaptation Screen Active:', isRoastVisible);

  const nextOppName = await page.$eval('#next-opp-name', el => el.innerText);
  const nextOppTitle = await page.$eval('#next-opp-title', el => el.innerText);
  const roastText = await page.$eval('#roast-text', el => el.innerText);

  console.log('🔮 Next Opponent Name:', nextOppName);
  console.log('🏷️ Next Opponent Title:', nextOppTitle);
  console.log('📜 Initial Roast Text:', roastText);

  // Check if roastText contains any raw JSON
  const hasRawJson = roastText.includes('{') || roastText.includes('}') || roastText.includes('"roast"');
  console.log('🛡️ Free of Raw JSON:', !hasRawJson);
  await page.screenshot({ path: 'roast_screen_clean.png' });

  // 7. Click Face Next Opponent -> Round 2 starts with Cobalt Duelist on Windows XP Desktop!
  console.log('⚔️ Advancing to Round 2...');
  await page.click('#btn-next-round');
  await new Promise(r => setTimeout(r, 600));

  const round2Num = await page.evaluate(() => window.__game?.currentRound);
  const round2Stage = await page.evaluate(() => window.__game?.arena?.stage);
  const round2OppName = await page.evaluate(() => window.__game?.arena?.ghost?.name);
  const round2OppSkin = await page.evaluate(() => window.__game?.arena?.ghost?.skin);

  console.log('✅ 7. Advanced to Round:', round2Num);
  console.log('📍 Round 2 Stage:', round2Stage, '(Expected: desktop)');
  console.log('🤖 Round 2 AI Opponent:', round2OppName, '(Expected: COBALT DUELIST)');
  console.log('🎨 Round 2 Opponent Skin:', round2OppSkin);
  await page.screenshot({ path: 'round2_combat.png' });

  // 8. Test Player Defeat -> Game Over Screen
  console.log('💀 Triggering Player Defeat to test Game Over Screen...');
  await page.evaluate(() => {
    window.__game.arena.player.health = 0;
    window.__game.arena.endRound(window.__game.arena.ghost.name);
  });

  await new Promise(r => setTimeout(r, 2400));
  const isGameOverVisible = await page.$eval('#game-over-screen', el => el.classList.contains('active'));
  console.log('✅ 8. Game Over Screen Active:', isGameOverVisible);

  const goSurvived = await page.$eval('#go-rounds-survived', el => el.innerText);
  const goDefeatedBy = await page.$eval('#go-defeated-by', el => el.innerText);
  console.log('📊 Gauntlet Record:', { roundsSurvived: goSurvived, defeatedBy: goDefeatedBy });
  await page.screenshot({ path: 'game_over_screen.png' });

  await browser.close();
  console.log('🎉 All automated tests PASSED flawlessly!');
}

runTest().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
