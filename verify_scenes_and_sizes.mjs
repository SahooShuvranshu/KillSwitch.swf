import puppeteer from 'puppeteer-core';

async function testScenesAndSizes() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

  // 1. Capture Menu with new Archetypes & Sizes
  await page.screenshot({ path: 'screenshot_menu_archetypes_sizes.png' });
  console.log('Saved screenshot_menu_archetypes_sizes.png');

  // Select Titan Colossus (1.30) and Crimson Titan archetype
  await page.select('#select-skin', 'darklord');
  await page.select('#select-size', '1.30');

  // 2. Start Round 1: Flash Studio Canvas
  await page.click('#btn-bypass-killswitch');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshot_round1_studio.png' });
  console.log('Saved screenshot_round1_studio.png');

  // 3. Advance to Round 2: Scene should automatically transition to Windows XP Bliss Desktop!
  await page.evaluate(() => {
    const game = window.__game;
    if (game && game.arena) {
      game.arena.startRound(2);
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshot_round2_desktop.png' });
  console.log('Saved screenshot_round2_desktop.png');

  // 4. Advance to Round 3: Scene should automatically transition to ActionScript Matrix!
  await page.evaluate(() => {
    const game = window.__game;
    if (game && game.arena) {
      game.arena.startRound(3);
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshot_round3_matrix.png' });
  console.log('Saved screenshot_round3_matrix.png');

  await browser.close();
}

testScenesAndSizes().catch(err => {
  console.error(err);
  process.exit(1);
});
