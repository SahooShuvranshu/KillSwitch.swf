import puppeteer from 'puppeteer-core';

async function testMoveLearning() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

  // 1. Start combat
  await page.click('#btn-bypass-killswitch');
  await new Promise(r => setTimeout(r, 600));

  // 2. Perform habitual player moves:
  // JUMP + JUMP_KICK, and JAB + HEAVY_KICK repeatedly
  for (let i = 0; i < 4; i++) {
    // Jump-kick combo
    await page.keyboard.press('KeyW');
    await new Promise(r => setTimeout(r, 60));
    await page.keyboard.press('KeyK');
    await new Promise(r => setTimeout(r, 300));

    // Jab to Heavy Kick combo cancel
    await page.keyboard.press('KeyJ');
    await new Promise(r => setTimeout(r, 120));
    await page.keyboard.press('KeyK');
    await new Promise(r => setTimeout(r, 300));
  }

  // 3. End round 1 by defeating the ghost
  await page.evaluate(() => {
    const game = window.__game;
    if (game) {
      game.arena.ghost.health = 0;
      game.arena.onRoundEnd('The Second Coming');
    }
  });

  // 4. Wait for Gemma streaming analysis to complete
  await new Promise(r => setTimeout(r, 8000));
  await page.screenshot({ path: 'screenshot_learned_habits.png' });
  console.log('Saved screenshot_learned_habits.png');

  // 5. Resume combat into Round 2 to see the Ghost's learned adaptation in action!
  await page.click('#btn-next-round');
  await new Promise(r => setTimeout(r, 1200));

  // Player jumps to test the Ghost's anti-air read
  await page.keyboard.press('KeyW');
  await new Promise(r => setTimeout(r, 200));

  await page.screenshot({ path: 'screenshot_round2_counter.png' });
  console.log('Saved screenshot_round2_counter.png');

  await browser.close();
}

testMoveLearning().catch(err => {
  console.error(err);
  process.exit(1);
});
