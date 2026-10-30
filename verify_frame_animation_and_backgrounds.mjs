import puppeteer from 'puppeteer-core';

async function testFrameAnimAndBackgrounds() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

  // 1. Bypass into Combat - Round 1 (Flash Studio Canvas)
  await page.click('#btn-bypass-killswitch');
  await new Promise(r => setTimeout(r, 600));

  // Perform jab attack to test frame animation
  await page.keyboard.press('KeyJ');
  await new Promise(r => setTimeout(r, 60));
  await page.screenshot({ path: 'screenshot_frame_anim_jab.png' });
  console.log('Saved screenshot_frame_anim_jab.png');

  // Perform heavy kick to test frame animation
  await page.keyboard.press('KeyK');
  await new Promise(r => setTimeout(r, 120));
  await page.screenshot({ path: 'screenshot_frame_anim_heavykick.png' });
  console.log('Saved screenshot_frame_anim_heavykick.png');

  // 2. Round 1 Background: Flash Studio
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'screenshot_bg_round1_studio.png' });
  console.log('Saved screenshot_bg_round1_studio.png');

  // 3. Round 2 Background: Windows XP Bliss Desktop
  await page.evaluate(() => {
    window.__game.arena.startRound(2);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshot_bg_round2_xp_bliss.png' });
  console.log('Saved screenshot_bg_round2_xp_bliss.png');

  // 4. Round 3 Background: Cyber Matrix
  await page.evaluate(() => {
    window.__game.arena.startRound(3);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshot_bg_round3_cyber_matrix.png' });
  console.log('Saved screenshot_bg_round3_cyber_matrix.png');

  // 5. Round 4 Background: 2021 Kill-Switch Void
  await page.evaluate(() => {
    window.__game.arena.startRound(4);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshot_bg_round4_void.png' });
  console.log('Saved screenshot_bg_round4_void.png');

  // 6. Round 5 Background: Día de los Muertos Altar
  await page.evaluate(() => {
    window.__game.arena.startRound(5);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshot_bg_round5_ofrenda.png' });
  console.log('Saved screenshot_bg_round5_ofrenda.png');

  await browser.close();
}

testFrameAnimAndBackgrounds().catch(err => {
  console.error(err);
  process.exit(1);
});
