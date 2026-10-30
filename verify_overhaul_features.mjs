import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('🚀 Starting Puppeteer Overhaul Verification...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  console.log('✅ Loaded page');

  // Start combat directly via game instance
  await page.evaluate(() => {
    const game = window.__game;
    game.arena.player.name = 'Kuro_Sensei';
    game.startCombat(1);
  });
  console.log('✅ Directly launched Combat Round 1');
  await new Promise(r => setTimeout(r, 800));

  // Step 4: Verify Arena State & Fighter Attributes
  const stateCheck = await page.evaluate(() => {
    const game = window.__game;
    const arena = game.arena;
    const player = arena.player;
    const ghost = arena.ghost;

    return {
      playerColor: player.color,
      playerSkin: player.skin,
      playerMaxHp: player.maxHealth,
      playerHp: player.health,
      ghostColor: ghost.color,
      ghostSkin: ghost.skin,
      ghostMaxHp: ghost.maxHealth,
      ghostName: ghost.name,
      obstaclesCount: arena.obstacles.length,
      stage: arena.stage
    };
  });

  console.log('📊 Fighter & Arena State:', stateCheck);

  if (stateCheck.playerColor !== '#000000') throw new Error(`Expected player to be #000000, got ${stateCheck.playerColor}`);
  if (stateCheck.ghostColor !== '#ffffff') throw new Error(`Expected ghost to be #ffffff, got ${stateCheck.ghostColor}`);
  if (stateCheck.playerMaxHp !== 180) throw new Error(`Expected 180 HP, got ${stateCheck.playerMaxHp}`);
  if (stateCheck.obstaclesCount < 1) throw new Error(`Expected stage obstacles, got ${stateCheck.obstaclesCount}`);

  // Screenshot 1: Round 1 Combat with Visible Boundaries, Obstacles & Pure Black vs Pure White
  await page.screenshot({ path: 'D:\\Projects\\Hacktober Fest 2026\\KillSwitch.swf\\screenshot_overhaul_combat.png' });
  console.log('📸 Captured screenshot_overhaul_combat.png');

  // Step 5: Test Konami Code (Up Up Down Down Left Right Left Right B A)
  console.log('🎮 Typing Konami Code...');
  const konamiKeys = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];
  for (const k of konamiKeys) {
    await page.keyboard.press(k);
    await new Promise(r => setTimeout(r, 40));
  }
  await new Promise(r => setTimeout(r, 300));

  const overclockCheck = await page.evaluate(() => {
    const p = window.__game.arena.player;
    return {
      isOverclocked: p.isOverclocked,
      timeRemaining: Math.round(p.overclockTimeRemaining),
      tacticalBanner: window.__game.arena.tacticalBannerText
    };
  });
  console.log('🔥 Konami Overclock Status:', overclockCheck);
  if (!overclockCheck.isOverclocked) throw new Error('Konami Code Overclock did not activate!');

  await page.screenshot({ path: 'D:\\Projects\\Hacktober Fest 2026\\KillSwitch.swf\\screenshot_konami_overclock.png' });
  console.log('📸 Captured screenshot_konami_overclock.png');

  // Step 6: Test Minecraft Steve Wildcard Easter Egg
  console.log('👾 Morphing AI into Steve Easter Egg in Round 4 (Kill-Switch Void)...');
  await page.evaluate(() => {
    const game = window.__game;
    game.startCombat(4); // Round 4: BLOCKY STEVE
  });
  await new Promise(r => setTimeout(r, 800));

  const steveCheck = await page.evaluate(() => {
    const ghost = window.__game.arena.ghost;
    return {
      name: ghost.name,
      skin: ghost.skin,
      color: ghost.color,
      stage: window.__game.arena.stage
    };
  });
  console.log('🧱 Steve Easter Egg Info:', steveCheck);

  await page.screenshot({ path: 'D:\\Projects\\Hacktober Fest 2026\\KillSwitch.swf\\screenshot_steve_easter_egg.png' });
  console.log('📸 Captured screenshot_steve_easter_egg.png');

  await browser.close();
  console.log('🎉 ALL OVERHAUL TESTS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
