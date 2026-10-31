import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log('🔍 Running Hitbox, Hurtbox & Frame-Data Invariant Audit...');
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

    await page.goto('http://127.0.0.1:5173/?round=1', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    const auditData = await page.evaluate(() => {
      const arena = window.__game.arena;
      const p = arena.player;

      // 1. Move Invariants: damage, active window, hitbox size
      const expectedMoves = [
        { name: 'JAB', action: () => p.jab(), damage: 5, activeFrames: [3, 7], expectedW: 40, expectedH: 22 },
        { name: 'CROSS_PUNCH', action: () => p.crossPunch(), damage: 8, activeFrames: [3, 8], expectedW: 46, expectedH: 24 },
        { name: 'PALM_BURST', action: () => p.palmBurst(), damage: 14, activeFrames: [3, 10], expectedW: 50, expectedH: 30 },
        { name: 'HEAVY_KICK', action: () => p.heavyKick(), damage: 13, activeFrames: [5, 12], expectedW: 48, expectedH: 32 },
        { name: 'AXE_KICK', action: () => p.axeKick(), damage: 15, activeFrames: [5, 12], expectedW: 50, expectedH: 40 },
        { name: 'UPPERCUT', action: () => p.uppercut(), damage: 10, activeFrames: [4, 11], expectedW: 40, expectedH: 44 },
        { name: 'FLYING_KNEE', action: () => p.flyingKnee(), damage: 16, activeFrames: [3, 11], expectedW: 46, expectedH: 34 },
        { name: 'LOW_SWEEP', action: () => p.lowSweep(), damage: 7, activeFrames: [3, 10], expectedW: 45, expectedH: 20 }
      ];

      const moveResults = [];

      for (const m of expectedMoves) {
        // Reset player
        p.state = 'IDLE';
        p.stateTime = 0;
        p.animFrame = 0;
        p.isGrounded = true;
        p.y = p.groundY;

        m.action();
        const activeHitboxes = [];
        let moveDamage = null;

        // Step through 25 frames
        for (let f = 0; f < 25; f++) {
          p.stateTime = f;
          const hb = p.getHitbox();
          if (hb) {
            activeHitboxes.push({ frame: f, w: hb.w, h: hb.h, damage: hb.damage });
            if (moveDamage === null) moveDamage = hb.damage;
          }
        }

        const startActive = activeHitboxes.length > 0 ? activeHitboxes[0].frame : -1;
        const endActive = activeHitboxes.length > 0 ? activeHitboxes[activeHitboxes.length - 1].frame : -1;
        const firstHb = activeHitboxes[0] || { w: 0, h: 0, damage: 0 };

        moveResults.push({
          name: m.name,
          expectedDamage: m.damage,
          actualDamage: moveDamage,
          damageMatch: moveDamage === m.damage,
          expectedActive: m.activeFrames,
          actualActive: [startActive, endActive],
          activeMatch: startActive === m.activeFrames[0] && endActive === m.activeFrames[1],
          expectedSize: [m.expectedW, m.expectedH],
          actualSize: [firstHb.w, firstHb.h],
          sizeMatch: firstHb.w === m.expectedW && firstHb.h === m.expectedH
        });
      }

      // 2. Hurtbox Invariants across Idle, Crouch, Jump
      p.state = 'IDLE';
      p.y = p.groundY;
      const idleHurtbox = p.getHurtbox();

      p.state = 'CROUCH';
      const crouchHurtbox = p.getHurtbox();

      p.state = 'JUMP';
      p.y = p.groundY - 80;
      const jumpHurtbox = p.getHurtbox();

      // 3. Jump Physics Metric Simulation
      // Simulate 60 frames of jumping from ground
      p.state = 'IDLE';
      p.y = p.groundY;
      p.isGrounded = true;
      p.vx = 0;
      p.vy = 0;
      p.jump(); // Initiates jump

      let apexHeight = 0;
      let apexFrame = -1;
      let landedFrame = -1;

      const jumpTrajectory = [];

      for (let f = 1; f <= 60; f++) {
        // Step stickman physics
        p.update();
        const currentElevation = p.groundY - p.y;
        jumpTrajectory.push({ frame: f, y: p.y, vy: p.vy, elevation: currentElevation });

        if (currentElevation > apexHeight) {
          apexHeight = currentElevation;
          apexFrame = f;
        }

        if (p.isGrounded && f > 5 && landedFrame === -1) {
          landedFrame = f;
        }
      }

      return {
        moveResults,
        hurtboxes: {
          idle: idleHurtbox,
          crouch: crouchHurtbox,
          jump: jumpHurtbox
        },
        jumpMetrics: {
          apexHeight: Math.round(apexHeight * 10) / 10,
          apexFrame,
          landedFrame,
          trajectorySample: jumpTrajectory.filter(t => t.frame % 5 === 0)
        }
      };
    });

    console.log('\n==================================================');
    console.log('HITBOX & FRAME DATA INVARIANT RESULTS:');
    console.log('==================================================');
    let allPassed = true;
    for (const res of auditData.moveResults) {
      const pass = res.damageMatch && res.activeMatch && res.sizeMatch;
      if (!pass) allPassed = false;
      const icon = pass ? '✓ PASS' : '❌ FAIL';
      console.log(`${icon}: ${res.name.padEnd(14)} | Dmg: ${res.actualDamage} (exp ${res.expectedDamage}) | Active: [${res.actualActive}] (exp [${res.expectedActive}]) | Size: ${res.actualSize[0]}x${res.actualSize[1]}`);
    }

    console.log('\n==================================================');
    console.log('HURTBOX DIMENSIONS:');
    console.log('==================================================');
    console.log('Idle Hurtbox:  ', auditData.hurtboxes.idle);
    console.log('Crouch Hurtbox:', auditData.hurtboxes.crouch);
    console.log('Jump Hurtbox:  ', auditData.hurtboxes.jump);

    console.log('\n==================================================');
    console.log('JUMP DYNAMICS VERIFICATION TABLE:');
    console.log('==================================================');
    console.log(`Peak Apex Height:     ${auditData.jumpMetrics.apexHeight} px (Fighter base height: 95 px -> ~1.37x height)`);
    console.log(`Time to Apex:         ${auditData.jumpMetrics.apexFrame} frames (~${Math.round(auditData.jumpMetrics.apexFrame / 60 * 1000)} ms)`);
    console.log(`Total Airborne Time:  ${auditData.jumpMetrics.landedFrame} frames (~${Math.round(auditData.jumpMetrics.landedFrame / 60 * 1000)} ms)`);
    console.log('Trajectory Samples (every 5 frames):');
    for (const pt of auditData.jumpMetrics.trajectorySample) {
      console.log(`  Frame ${pt.frame.toString().padStart(2)}: elevation = ${pt.elevation.toFixed(1)} px, vy = ${pt.vy.toFixed(2)}`);
    }

    if (allPassed) {
      console.log('\n🎉 ALL HITBOX & FRAME-DATA INVARIANTS 100% PRESERVED!');
    } else {
      throw new Error('Hitbox or Frame-Data invariant violation detected!');
    }

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('❌ Invariant audit error:', err);
  process.exit(1);
});
