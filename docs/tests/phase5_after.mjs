import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const afterDir = 'D:\\Projects\\Hacktober Fest 2026\\KillSwitch.swf\\verification\\phase5_after';

if (!fs.existsSync(afterDir)) {
  fs.mkdirSync(afterDir, { recursive: true });
}

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('📸 Starting Phase 5 After Comprehensive Visual Capture...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768 });

    // Block any external requests
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.url().includes('11434')) req.abort('blockedbyclient');
      else req.continue();
    });

    console.log('1. Capturing 5 Stages at 3 Camera Zooms (In=1.35x, Default=1.0x, Out=0.75x)...');
    const stages = [
      { round: 1, name: 'animator' },
      { round: 2, name: 'desktop' },
      { round: 3, name: 'matrix' },
      { round: 4, name: 'void' },
      { round: 5, name: 'ofrenda' }
    ];

    for (const stg of stages) {
      await page.goto(`http://127.0.0.1:5173/?round=${stg.round}`, { waitUntil: 'domcontentloaded' });
      await wait(500);

      await page.evaluate(() => {
        window.__game.arena.announcementFrames = 0;
        window.__game.arena.player.x = 360;
        window.__game.arena.ghost.x = 640;
      });

      // Zoom: Default (1.0x)
      await page.evaluate(() => { window.__game.arena.cameraZoom = 1.0; });
      await wait(100);
      await page.screenshot({ path: path.join(afterDir, `stage_${stg.name}_zoom_default.png`) });

      // Zoom: Zoomed In (1.35x)
      await page.evaluate(() => { window.__game.arena.cameraZoom = 1.35; });
      await wait(100);
      await page.screenshot({ path: path.join(afterDir, `stage_${stg.name}_zoom_in.png`) });

      // Zoom: Fully Zoomed Out (0.75x)
      await page.evaluate(() => { window.__game.arena.cameraZoom = 0.75; });
      await wait(100);
      await page.screenshot({ path: path.join(afterDir, `stage_${stg.name}_zoom_out.png`) });

      // Fight action on this stage
      await page.evaluate(() => {
        window.__game.arena.cameraZoom = 1.05;
        window.__game.arena.player.x = 470;
        window.__game.arena.ghost.x = 520;
        window.__game.arena.player.jab();
      });
      await wait(60);
      await page.screenshot({ path: path.join(afterDir, `fight_stage_${stg.name}.png`) });

      console.log(`  ✓ Stage ${stg.name} captured (default, in, out, fight)`);
    }

    console.log('2. Capturing All 8 Opponent Archetypes...');
    const archetypes = [
      { round: 1, name: 'white_ghost' },
      { round: 2, name: 'cobalt_duelist' },
      { round: 3, name: 'jade_grandmaster' },
      { round: 4, name: 'blocky_steve' },
      { round: 5, name: 'crimson_titan' },
      { round: 6, name: 'plasma_ascetic' },
      { round: 7, name: 'calavera_phantom' },
      { round: 8, name: 'flash_ghost_prime' }
    ];

    for (const arch of archetypes) {
      await page.goto(`http://127.0.0.1:5173/?round=${arch.round}`, { waitUntil: 'domcontentloaded' });
      await wait(500);

      await page.evaluate(() => {
        window.__game.arena.announcementFrames = 0;
        window.__game.arena.cameraZoom = 1.25;
        window.__game.arena.player.x = 200; // Keep player off to side
        window.__game.arena.ghost.x = 512;
      });
      await wait(150);
      await page.screenshot({ path: path.join(afterDir, `archetype_${arch.round}_${arch.name}.png`) });
      console.log(`  ✓ Archetype ${arch.name} captured`);
    }

    console.log('3. Capturing Each Player Move Silhouette & Pose...');
    await page.goto('http://127.0.0.1:5173/?round=1', { waitUntil: 'domcontentloaded' });
    await wait(500);

    const captureMove = async (moveName, setupFn) => {
      await page.evaluate(setupFn);
      await wait(80);
      await page.screenshot({ path: path.join(afterDir, `move_${moveName}.png`) });
      console.log(`  ✓ Move: ${moveName}`);
    };

    // Stance / Idle
    await captureMove('idle', () => {
      window.__game.arena.announcementFrames = 0;
      window.__game.arena.cameraZoom = 1.35;
      const p = window.__game.arena.player;
      p.x = 450;
      p.state = 'IDLE';
    });

    // Walk Forward
    await captureMove('walk', () => {
      const p = window.__game.arena.player;
      p.x = 450;
      p.state = 'WALK_FORWARD';
      p.animFrame = 8;
    });

    // Jump
    await captureMove('jump', () => {
      const p = window.__game.arena.player;
      p.x = 450;
      p.y = p.groundY - 70;
      p.state = 'JUMP';
      p.isGrounded = false;
    });

    // Crouch
    await captureMove('crouch', () => {
      const p = window.__game.arena.player;
      p.y = p.groundY;
      p.isGrounded = true;
      p.state = 'CROUCH';
    });

    // Jab
    await captureMove('jab', () => {
      const p = window.__game.arena.player;
      p.state = 'JAB';
      p.animFrame = 4;
    });

    // Cross Punch
    await captureMove('cross_punch', () => {
      const p = window.__game.arena.player;
      p.state = 'CROSS_PUNCH';
      p.animFrame = 5;
    });

    // Palm Burst
    await captureMove('palm_burst', () => {
      const p = window.__game.arena.player;
      p.state = 'PALM_BURST';
      p.animFrame = 6;
    });

    // Heavy Kick
    await captureMove('heavy_kick', () => {
      const p = window.__game.arena.player;
      p.state = 'HEAVY_KICK';
      p.animFrame = 6;
    });

    // Jump Kick
    await captureMove('jump_kick', () => {
      const p = window.__game.arena.player;
      p.y = p.groundY - 60;
      p.isGrounded = false;
      p.state = 'JUMP_KICK';
    });

    // Rising Uppercut
    await captureMove('uppercut', () => {
      const p = window.__game.arena.player;
      p.state = 'UPPERCUT';
      p.animFrame = 5;
    });

    // Flying Knee
    await captureMove('flying_knee', () => {
      const p = window.__game.arena.player;
      p.y = p.groundY - 30;
      p.state = 'FLYING_KNEE';
      p.animFrame = 5;
    });

    // Low Sweep
    await captureMove('low_sweep', () => {
      const p = window.__game.arena.player;
      p.y = p.groundY;
      p.isGrounded = true;
      p.state = 'LOW_SWEEP';
      p.animFrame = 4;
    });

    // Block
    await captureMove('block', () => {
      const p = window.__game.arena.player;
      p.state = 'BLOCK';
      p.animFrame = 4;
    });

    // Dodge Roll
    await captureMove('dodge_roll', () => {
      const p = window.__game.arena.player;
      p.state = 'DODGE_ROLL';
      p.animFrame = 8;
    });

    // Hit Stun
    await captureMove('hit_stun', () => {
      const p = window.__game.arena.player;
      p.state = 'HIT_STUN';
      p.animFrame = 4;
    });

    // Knockdown
    await captureMove('knockdown', () => {
      const p = window.__game.arena.player;
      p.state = 'KNOCKDOWN';
      p.animFrame = 10;
    });

    // Victory
    await captureMove('victory', () => {
      const p = window.__game.arena.player;
      p.state = 'VICTORY';
      p.animFrame = 12;
    });

    console.log('\n🎉 Phase 5 Visual Captures complete! All captures saved to docs/phase5_after/');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('❌ Phase 5 capture failed:', err);
  process.exit(1);
});
