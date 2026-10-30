import puppeteer from 'puppeteer-core';
import path from 'path';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

  // 1. Capture Menu
  await page.screenshot({ path: 'screenshot_menu.png' });
  console.log('Saved screenshot_menu.png');

  // 2. Click Bypass Kill-Switch to start combat
  await page.click('#btn-bypass-killswitch');
  // Wait 1.5s for round start announcement and fighters to appear
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: 'screenshot_combat.png' });
  console.log('Saved screenshot_combat.png');

  await browser.close();
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
