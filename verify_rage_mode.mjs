import puppeteer from 'puppeteer-core';

async function testRageMode() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

  // 1. Bypass killswitch into combat
  await page.click('#btn-bypass-killswitch');
  await new Promise(r => setTimeout(r, 600));

  // 2. Reduce Ghost HP to 30% to activate Error 0x7E5 Time-Bomb Rage Mode
  await page.evaluate(() => {
    const game = window.__game;
    if (game && game.arena) {
      game.arena.ghost.health = 30; // Triggers rage mode (HP <= 35%)
    }
  });

  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'screenshot_rage_warning.png' });
  console.log('Saved screenshot_rage_warning.png');

  // 3. Trigger the triple teleport strike
  await page.evaluate(() => {
    const game = window.__game;
    if (game && game.arena && game.arena.ai) {
      game.arena.ai.executeError0x7E5TripleTeleport();
    }
  });

  // Capture during the mid-teleport glitch
  await new Promise(r => setTimeout(r, 160));
  await page.screenshot({ path: 'screenshot_rage_teleport.png' });
  console.log('Saved screenshot_rage_teleport.png');

  // Capture after the execution strike
  await new Promise(r => setTimeout(r, 350));
  await page.screenshot({ path: 'screenshot_rage_strike.png' });
  console.log('Saved screenshot_rage_strike.png');

  await browser.close();
}

testRageMode().catch(err => {
  console.error(err);
  process.exit(1);
});
