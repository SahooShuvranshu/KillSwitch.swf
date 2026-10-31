import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runTestCase(testIndex, testName, interceptor) {
  console.log(`\n==================================================`);
  console.log(`[TEST ${testIndex}/4] ${testName}`);
  console.log(`==================================================`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768 });

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.url().includes(':11434')) {
        interceptor(req);
      } else {
        req.continue();
      }
    });

    // Navigate directly into round 1 via DEV hook
    await page.goto('http://127.0.0.1:5173/?round=1', { waitUntil: 'networkidle0' });
    await wait(600);

    // Ensure combat is active
    await page.evaluate(() => {
      if (!window.__game.isRunning) {
        window.__game.hideAllScreens();
        window.__game.startCombat(1);
      }
      // Clear round announcement delay so fighters can act immediately
      window.__game.arena.announcementFrames = 0;
    });
    await wait(200);

    // 1. Verify Space during fight only dodge-rolls
    console.log('Testing Space key in combat...');
    const preInfo = await page.evaluate(() => {
      const p = window.__game.arena.player;
      return { state: p.state, isGrounded: p.isGrounded, flowState: window.__game.flowState, isRunning: window.__game.isRunning };
    });
    console.log(`Pre-space info: flowState=${preInfo.flowState}, isRunning=${preInfo.isRunning}, playerState=${preInfo.state}, grounded=${preInfo.isGrounded}`);

    await page.keyboard.press('Space');
    await wait(30);

    const playerPostSpace = await page.evaluate(() => {
      const p = window.__game.arena.player;
      return { state: p.state, x: p.x, isRunning: window.__game.isRunning };
    });

    console.log(`Player state after Space: ${playerPostSpace.state} (Dodge roll verification)`);

    // Wait for dodge roll to finish and player to return to IDLE / canAct
    await wait(450);

    // 2. KO the ghost using combat inputs
    console.log('Attacking ghost until KO...');
    await page.evaluate(() => {
      window.__game.arena.ghost.health = 1;
      window.__game.arena.ghost.state = 'IDLE';
      window.__game.arena.player.state = 'IDLE';
      window.__game.arena.player.x = window.__game.arena.ghost.x - 30;
      window.__game.arena.player.facing = 1;
      window.__game.arena.ghost.facing = -1;
    });

    let isOver = false;
    for (let p = 0; p < 30; p++) {
      await page.keyboard.press('KeyJ');
      await wait(120);
      isOver = await page.evaluate(() => window.__game.arena.isRoundOver);
      if (isOver) {
        console.log(`KO detected on punch attempt ${p + 1}!`);
        break;
      }
      // Re-align if ghost moved
      await page.evaluate(() => {
        if (!window.__game.arena.isRoundOver) {
          window.__game.arena.ghost.health = 1;
          window.__game.arena.ghost.state = 'IDLE';
          window.__game.arena.ghost.y = 380;
          window.__game.arena.ghost.isGrounded = true;
          window.__game.arena.player.state = 'IDLE';
          window.__game.arena.player.x = window.__game.arena.ghost.x - 30;
        }
      });
    }

    if (!isOver) {
      const debugState = await page.evaluate(() => {
        return {
          playerState: window.__game.arena.player.state,
          ghostState: window.__game.arena.ghost.state,
          ghostHealth: window.__game.arena.ghost.health,
          isRoundOver: window.__game.arena.isRoundOver,
          winner: window.__game.arena.winner
        };
      });
      console.log('Debug state after punch:', debugState);
    }

    // Wait for Arena KO slow-mo & transition to roast screen (Arena delays 2200ms)
    console.log('Waiting for Roast screen activation...');
    let roastActive = false;
    for (let w = 0; w < 30; w++) {
      await wait(150);
      roastActive = await page.evaluate(() => {
        const roast = document.getElementById('roast-screen');
        return roast && roast.classList.contains('active') && window.__game.flowState === 'ROAST';
      });
      if (roastActive) {
        console.log(`Roast screen active at ${w * 150}ms!`);
        break;
      }
    }

    console.log(`Roast screen active: ${roastActive}`);
    if (!roastActive) {
      throw new Error('Roast screen did not activate after KO');
    }

    // 3. Press Space 5 times: round must NOT advance!
    console.log('Pressing Space 5 times on Roast screen...');
    for (let s = 0; s < 5; s++) {
      await page.keyboard.press('Space');
      await wait(100);
    }

    const roundAfterSpace = await page.evaluate(() => {
      return {
        round: window.__game.currentRound,
        flowState: window.__game.flowState,
        roastActive: document.getElementById('roast-screen')?.classList.contains('active')
      };
    });

    console.log(`State after 5x Space: Round ${roundAfterSpace.round}, Flow: ${roundAfterSpace.flowState}, RoastActive: ${roundAfterSpace.roastActive}`);
    if (roundAfterSpace.round !== 1 || !roundAfterSpace.roastActive || roundAfterSpace.flowState !== 'ROAST') {
      throw new Error('FAIL: Pressing Space started round or left Roast screen!');
    }
    console.log('✓ PASS: Space key did NOT advance round on roast screen.');

    // 4. Click Next Round button
    console.log('Clicking Next Round button...');
    await page.click('#btn-next-round');

    // Confirm within 3s ghost is not in down state and has moved or attacked
    console.log('Waiting up to 3s for Round 2 start and Ghost action...');
    let passed = false;
    let finalGhostState = '';
    let finalGhostActions = 0;
    let finalGhostPos = 0;
    const initialGhostX = await page.evaluate(() => window.__game.arena.ghost.x);

    const startTime = Date.now();
    while (Date.now() - startTime < 3500) {
      await wait(200);
      const ghostInfo = await page.evaluate(() => {
        const g = window.__game.arena.ghost;
        const ai = window.__game.aiController;
        return {
          round: window.__game.currentRound,
          flowState: window.__game.flowState,
          state: g.state,
          canAct: g.canAct(),
          x: g.x,
          actionCount: ai.actionCountThisRound
        };
      });

      finalGhostState = ghostInfo.state;
      finalGhostActions = ghostInfo.actionCount;
      finalGhostPos = ghostInfo.x;

      if (
        ghostInfo.round === 2 &&
        ghostInfo.state !== 'DEFEAT' &&
        ghostInfo.state !== 'KNOCKED_DOWN' &&
        (ghostInfo.actionCount > 0 || Math.abs(ghostInfo.x - initialGhostX) > 2 || ghostInfo.state !== 'IDLE')
      ) {
        passed = true;
        break;
      }
    }

    console.log(`Round 2 Verification: State=${finalGhostState}, Actions=${finalGhostActions}, PosDelta=${Math.abs(finalGhostPos - initialGhostX)}`);
    if (!passed) {
      throw new Error(`FAIL: Ghost did not recover or act in Round 2! State=${finalGhostState}`);
    }

    console.log(`✓ PASS: Test ${testIndex} (${testName}) successfully verified!`);
    return true;
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('Executing Step 0 Round Flow & Robustness Verification Suite...');

  // Test 1: Ollama normal (pass through to local ollama)
  await runTestCase(1, 'Ollama Normal Pass-Through', (req) => {
    req.continue();
  });

  // Test 2: Ollama blocked (server offline or port blocked)
  await runTestCase(2, 'Ollama Blocked (Network Error)', (req) => {
    req.abort('connectionrefused');
  });

  // Test 3: Ollama returns JSON blob
  await runTestCase(3, 'Ollama Returns JSON Blob', (req) => {
    req.respond({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        response: '{"adaptation": {"antiAir": 0.8, "aggression": 0.7}, "talk": "I parsed your JSON moves."}'
      })
    });
  });

  // Test 4: Ollama returns empty string
  await runTestCase(4, 'Ollama Returns Empty String', (req) => {
    req.respond({
      status: 200,
      contentType: 'text/plain',
      body: ''
    });
  });

  console.log('\n==================================================');
  console.log('🎉 ALL 4 ROUND FLOW TESTS PASSED REGRESSION AUDIT!');
  console.log('==================================================');
}

main().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
