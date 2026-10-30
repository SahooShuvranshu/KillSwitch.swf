import puppeteer from 'puppeteer-core';

async function captureAll() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

  // 1. Menu
  await page.screenshot({ path: 'screenshot_menu.png' });
  console.log('Saved screenshot_menu.png');

  // 2. Open Ofrenda Cemetery
  await page.click('#btn-open-ofrenda');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshot_cemetery.png' });
  console.log('Saved screenshot_cemetery.png');

  // 3. Click back to game, then bypass kill-switch
  await page.click('#btn-back-to-game');
  await new Promise(r => setTimeout(r, 400));
  await page.click('#btn-bypass-killswitch');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'screenshot_combat.png' });
  console.log('Saved screenshot_combat.png');

  await browser.close();
}

captureAll().catch(err => {
  console.error(err);
  process.exit(1);
});
