import puppeteer from 'puppeteer-core';

async function testRoastScreen() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

  // Start combat
  await page.click('#btn-bypass-killswitch');
  await new Promise(r => setTimeout(r, 800));

  // Trigger round end
  await page.evaluate(() => {
    const game = window.__game;
    if (game) {
      game.arena.ghost.health = 0;
      game.arena.onRoundEnd('The Second Coming');
    }
  });

  // Wait 9s for Gemma streaming response
  await new Promise(r => setTimeout(r, 9000));

  await page.screenshot({ path: 'screenshot_roast.png' });
  console.log('Saved screenshot_roast.png');

  await browser.close();
}

testRoastScreen().catch(err => {
  console.error(err);
  process.exit(1);
});
