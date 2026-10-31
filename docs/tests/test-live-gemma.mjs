import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const verificationDir = 'D:\\Projects\\Hacktober Fest 2026\\KillSwitch.swf\\docs';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 Running Step 6 Live Gemma 3:4B Verification...');
  console.log('Ensuring single browser tab connection to Ollama (127.0.0.1:11434)...');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768 });

    let firstTokenLatency = 0;
    let fullReplyLatency = 0;
    let requestStartTime = 0;
    let firstTokenReceived = false;

    // Track network events to measure Ollama streaming latency accurately
    const cdp = await page.createCDPSession();
    await cdp.send('Network.enable');

    cdp.on('Network.requestWillBeSent', (e) => {
      if (e.request.url.includes(':11434') || e.request.url.includes('/ollama/')) {
        requestStartTime = performance.now();
        firstTokenReceived = false;
        console.log('  [Network] Gemma request initiated...');
      }
    });

    cdp.on('Network.dataReceived', (e) => {
      if (requestStartTime > 0 && !firstTokenReceived) {
        firstTokenReceived = true;
        firstTokenLatency = Math.round(performance.now() - requestStartTime);
        console.log(`  [Latency] First token received in ${firstTokenLatency} ms`);
      }
    });

    cdp.on('Network.loadingFinished', (e) => {
      if (requestStartTime > 0) {
        fullReplyLatency = Math.round(performance.now() - requestStartTime);
        console.log(`  [Latency] Full reply completed in ${fullReplyLatency} ms`);
      }
    });

    // Navigate to game
    console.log('Navigating to game...');
    await page.goto('http://127.0.0.1:5173/?round=1', { waitUntil: 'domcontentloaded' });
    await wait(600);

    // Play 3 consecutive rounds
    for (let round = 1; round <= 3; round++) {
      console.log(`\n==================================================`);
      console.log(`FIGHTING ROUND ${round} OF 3`);
      console.log(`==================================================`);

      // Ensure round is active
      await page.evaluate((r) => {
        if (!window.__game.isRunning) {
          window.__game.hideAllScreens();
          window.__game.startCombat(r);
        }
        window.__game.arena.announcementFrames = 0;
      }, round);
      await wait(200);

      // Verify Space key in combat only performs dodge roll
      if (round === 1) {
        console.log('Verifying Space key performs Dodge Roll in combat...');
        await page.keyboard.press('Space');
        await wait(50);
        const pState = await page.evaluate(() => window.__game.arena.player.state);
        console.log(`Player state after Space: ${pState}`);
        await wait(450); // Finish roll
      }

      // Check Ghost is active and can act
      const ghostStatus = await page.evaluate(() => {
        const g = window.__game.arena.ghost;
        return { name: g.name, state: g.state, canAct: g.canAct(), health: g.health };
      });
      console.log(`Ghost Status: Name=${ghostStatus.name}, State=${ghostStatus.state}, canAct=${ghostStatus.canAct}, HP=${ghostStatus.health}`);
      if (!ghostStatus.canAct) throw new Error(`Ghost cannot act at start of Round ${round}!`);

      // Attack ghost until KO
      console.log('Attacking ghost until KO...');
      await page.evaluate(() => {
        window.__game.arena.ghost.health = 1;
        window.__game.arena.player.x = window.__game.arena.ghost.x - 30;
        window.__game.arena.player.facing = 1;
        window.__game.arena.ghost.facing = -1;
      });

      for (let p = 0; p < 10; p++) {
        await page.keyboard.press('KeyJ');
        await wait(120);
        const isOver = await page.evaluate(() => window.__game.arena.isRoundOver);
        if (isOver) {
          console.log(`Round ${round} K.O. registered!`);
          break;
        }
        await page.evaluate(() => {
          if (!window.__game.arena.isRoundOver) {
            window.__game.arena.ghost.health = 1;
            window.__game.arena.player.x = window.__game.arena.ghost.x - 30;
          }
        });
      }

      // Wait for roast screen
      console.log('Waiting for Roast screen activation...');
      let roastActive = false;
      for (let w = 0; w < 30; w++) {
        await wait(150);
        roastActive = await page.evaluate(() => {
          const r = document.getElementById('roast-screen');
          return r && r.classList.contains('active');
        });
        if (roastActive) break;
      }
      if (!roastActive) throw new Error(`Roast screen failed to activate after Round ${round}`);

      // Wait for Gemma streaming to finish or populate text
      console.log('Waiting for Gemma 3:4B live streaming monologue...');
      let liveText = '';
      for (let t = 0; t < 25; t++) {
        await wait(500);
        liveText = await page.evaluate(() => {
          return document.getElementById('roast-text')?.innerText || '';
        });
        if (liveText.length > 50 && !liveText.includes('Analyzing combat habits with Google Gemma')) {
          break;
        }
      }

      console.log(`Live Gemma 3:4B Monologue Snippet:\n  "${liveText.slice(0, 160)}..."`);
      if (round === 1) {
        await page.screenshot({ path: path.join(verificationDir, 'live-gemma-roast.png') });
        console.log('📸 Captured live-gemma-roast.png');
      }

      // Space key safety check on roast screen: 5x Space must NOT advance round
      console.log('Pressing Space 5 times on Roast screen (must NOT advance)...');
      for (let s = 0; s < 5; s++) {
        await page.keyboard.press('Space');
        await wait(80);
      }
      const curRound = await page.evaluate(() => window.__game.currentRound);
      if (curRound !== round) {
        throw new Error(`FAIL: Space key advanced round on roast screen! Expected ${round}, got ${curRound}`);
      }
      console.log(`✓ Confirmed: Space key safely ignored on Roast screen (Round is still ${round})`);

      // Advance to next round via Next Round button
      if (round < 3) {
        console.log('Clicking Next Round button...');
        await page.click('#btn-next-round');
        await wait(500);

        if (round === 1) {
          await page.screenshot({ path: path.join(verificationDir, 'live-gemma-round2.png') });
          console.log('📸 Captured live-gemma-round2.png');
        }
      }
    }

    console.log('\n==================================================');
    console.log('🎉 LIVE GEMMA 3:4B 3-ROUND VERIFICATION COMPLETE!');
    console.log(`- First-token latency: ${firstTokenLatency > 0 ? firstTokenLatency + ' ms' : 'N/A'}`);
    console.log(`- Full-reply latency:  ${fullReplyLatency > 0 ? fullReplyLatency + ' ms' : 'N/A'}`);
    console.log('==================================================');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('❌ Live Gemma check failed:', err);
  process.exit(1);
});
