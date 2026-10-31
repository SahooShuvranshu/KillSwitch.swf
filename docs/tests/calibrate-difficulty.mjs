import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const roundsPerBot = parseInt(process.argv[2] || '10', 10);
  console.log(`================================================================================`);
  console.log(`⚡ KILLSWITCH.SWF — DIFFICULTY CALIBRATION WITH HUMAN-PROXY BOTS`);
  console.log(`================================================================================`);
  console.log(`Rounds per Bot per Tier: ${roundsPerBot} (Total: ${roundsPerBot * 3 * 3} rounds)`);
  console.log(`Human Proxy: 15-frame Reaction Delay, 10% Mistake Rate, Real Round Timer\n`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 960 });

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.url().includes('11434')) req.abort('blockedbyclient');
      else req.continue();
    });

    await page.goto('http://127.0.0.1:5173/?round=1', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    console.log('Running simulation in browser context...');

    const results = await page.evaluate(async (numRounds) => {
      const arena = window.__game.arena;
      const ai = window.__game.aiController;
      const telemetry = window.__game.telemetry;

      // Stub gemma
      const gemma = (await import('./src/ai/GemmaGhost')).gemmaGhost;
      gemma.streamCombatAnalysis = async (_summary, _chunk, done) => {
        done(gemma.generateProceduralFallback(_summary));
      };

      class HumanProxy {
        constructor(style) {
          this.style = style;
          this.decisionTimer = 0;
          this.hesitateFrames = 0;
          this.defenseReactionTimer = 0;
          this.defenseCooldown = 0;
          this.blockHoldTimer = 0;
        }

        reset() {
          this.decisionTimer = 0;
          this.hesitateFrames = 0;
          this.defenseReactionTimer = 0;
          this.defenseCooldown = 0;
          this.blockHoldTimer = 0;
        }

        update(player, ghost, tick) {
          if (!player.canAct() || player.health <= 0) return;

          const dir = ghost.x > player.x ? 1 : -1;
          const dist = Math.abs(ghost.x - player.x);
          const ghostHitbox = ghost.getHitbox();
          const isGhostAttacking = ghostHitbox !== null || [
            'JAB', 'CROSS_PUNCH', 'PALM_BURST', 'HEAVY_KICK', 'AXE_KICK', 'UPPERCUT', 'FLYING_KNEE', 'LOW_SWEEP', 'JUMP_KICK'
          ].includes(ghost.state);
          const isGhostBlocking = ghost.state === 'BLOCK';

          if (this.hesitateFrames > 0) {
            this.hesitateFrames--;
            player.block(false);
            return;
          }

          if (this.defenseCooldown > 0) this.defenseCooldown--;

          if (this.blockHoldTimer > 0) {
            this.blockHoldTimer--;
            if (this.blockHoldTimer === 0) player.block(false);
            return;
          }

          // Human-proxy 15-frame reaction delay on defending incoming attacks
          if (isGhostAttacking && dist < 110 && this.defenseReactionTimer === 0 && this.defenseCooldown <= 0) {
            this.defenseReactionTimer = 15;
          }

          if (this.defenseReactionTimer > 0) {
            this.defenseReactionTimer--;
            if (this.defenseReactionTimer === 0 && player.canAct()) {
              this.defenseCooldown = 25;
              if (Math.random() < 0.65) {
                if (Math.random() < 0.35) {
                  player.dodgeRoll();
                  return;
                } else {
                  player.block(true);
                  this.blockHoldTimer = 12;
                  return;
                }
              }
            }
          }

          // 15-frame human reaction delay on tactical evaluations
          this.decisionTimer++;
          if (this.decisionTimer < 15) {
            if (player.isGrounded && dist > 65) {
              player.move(dir);
            }
            return;
          }
          this.decisionTimer = 0;

          // 10% mistake rate per decision (hesitation or random legal action)
          if (Math.random() < 0.10) {
            if (Math.random() < 0.50) {
              this.hesitateFrames = 12; // Hesitate / pause
              player.block(false);
              return;
            } else {
              // Random action
              const r = Math.random();
              if (r < 0.30) player.jab();
              else if (r < 0.60) player.heavyKick();
              else if (r < 0.80) player.jump();
              else player.dodgeRoll();
              return;
            }
          }

          if (this.style === 'JUMP_KICK') {
            if (player.isGrounded) {
              player.block(false);
              player.move(dir);
              if (dist > 90 && dist < 220 && Math.random() < 0.40) {
                player.jump();
              } else if (dist <= 60 && player.canAct()) {
                player.jab();
              }
            } else {
              player.jumpKick();
            }
          } else if (this.style === 'COMBO') {
            if (player.isGrounded) {
              if (dist > 55) {
                player.block(false);
                player.move(dir);
              } else if (player.canAct()) {
                player.block(false);
                if (isGhostBlocking) {
                  player.lowSweep();
                } else {
                  player.jab();
                }
              }
            } else {
              player.jumpKick();
            }
          } else if (this.style === 'MIXED') {
            if (player.isGrounded) {
              player.block(false);
              if (dist > 140) {
                player.move(dir);
                if (dist < 220 && Math.random() < 0.20) player.jump();
              } else if (dist > 70) {
                if (Math.random() < 0.40) player.move(dir);
                else if (player.canAct()) {
                  const r = Math.random();
                  if (r < 0.35) player.heavyKick();
                  else if (r < 0.70) player.flyingKnee();
                  else player.jump();
                }
              } else {
                if (player.canAct()) {
                  const r = Math.random();
                  if (r < 0.40) player.jab();
                  else if (r < 0.70) player.lowSweep();
                  else if (r < 0.85) player.uppercut();
                  else player.dodgeRoll();
                }
              }
            } else {
              player.jumpKick();
            }
          }
        }
      }

      const tiers = ['casual', 'veteran', 'nightmare'];
      const botStyles = ['JUMP_KICK', 'COMBO', 'MIXED'];
      const rawRows = [];

      for (const tier of tiers) {
        arena.setDifficulty(tier);
        ai.setDifficulty(tier);

        for (const style of botStyles) {
          const proxy = new HumanProxy(style);

          for (let r = 1; r <= numRounds; r++) {
            arena.startRound(r);
            ai.setRound(r);
            telemetry.startRound(r);
            arena.announcementFrames = 0;
            proxy.reset();

            let ticks = 0;
            const maxTicks = 5940;

            while (!arena.isRoundOver && ticks < maxTicks) {
              proxy.update(arena.player, arena.ghost, ticks);
              ai.update();
              arena.update();
              ticks++;
            }

            const isTimeout = arena.roundTime <= 0;
            const ghostWon = arena.winner === arena.ghost.name;
            const ghostHpLeft = Math.max(0, Math.round(arena.ghost.health));
            const playerHpLeft = Math.max(0, Math.round(arena.player.health));
            const damageTaken = Math.max(0, arena.ghost.maxHealth - ghostHpLeft);
            const durationSec = Math.round((ticks / 60) * 10) / 10;

            rawRows.push({
              tier,
              bot_style: style,
              round: r,
              ghost_won: ghostWon ? 1 : 0,
              ghost_hp_left: ghostHpLeft,
              player_hp_left: playerHpLeft,
              damage_taken: damageTaken,
              duration_seconds: durationSec,
              is_timeout: isTimeout ? 1 : 0
            });
          }
        }
      }

      return rawRows;
    }, roundsPerBot);

    console.log(`Simulation finished! Processed ${results.length} total rounds.`);

    const tiers = ['casual', 'veteran', 'nightmare'];
    const botStyles = ['JUMP_KICK', 'COMBO', 'MIXED'];
    const summary = {};

    for (const t of tiers) {
      const tierRows = results.filter(r => r.tier === t);
      const wins = tierRows.filter(r => r.ghost_won === 1).length;
      const total = tierRows.length;
      const winRate = (wins / total) * 100;
      const avgDmg = tierRows.reduce((a, b) => a + b.damage_taken, 0) / total;
      const winRows = tierRows.filter(r => r.ghost_won === 1);
      const avgWinDmg = winRows.length > 0 ? (winRows.reduce((a, b) => a + b.damage_taken, 0) / winRows.length) : 0;
      const avgDur = tierRows.reduce((a, b) => a + b.duration_seconds, 0) / total;
      const timeouts = tierRows.filter(r => r.is_timeout === 1).length;
      const timeoutRate = (timeouts / total) * 100;

      // Standard error computation
      const seWinRate = Math.sqrt((winRate / 100) * (1 - winRate / 100) / total) * 100;
      const varianceDmg = tierRows.reduce((a, b) => a + Math.pow(b.damage_taken - avgDmg, 2), 0) / (total - 1 || 1);
      const seDmg = Math.sqrt(varianceDmg / total);
      const varianceDur = tierRows.reduce((a, b) => a + Math.pow(b.duration_seconds - avgDur, 2), 0) / (total - 1 || 1);
      const seDur = Math.sqrt(varianceDur / total);

      summary[t] = {
        total,
        wins,
        winRate: winRate.toFixed(1),
        seWinRate: seWinRate.toFixed(1),
        avgDmg: avgDmg.toFixed(1),
        seDmg: seDmg.toFixed(1),
        avgWinDmg: avgWinDmg.toFixed(1),
        avgDur: avgDur.toFixed(1),
        seDur: seDur.toFixed(1),
        timeouts,
        timeoutRate: timeoutRate.toFixed(1)
      };

      console.log(`\n--- [Tier: ${t.toUpperCase()}] ---`);
      console.log(`Win Rate: ${winRate.toFixed(1)}% ± ${seWinRate.toFixed(1)}% (Target: ${t === 'casual' ? '25-35%' : (t === 'veteran' ? '45-55%' : '60-70%')})`);
      console.log(`Avg Ghost Dmg Taken (All): ${avgDmg.toFixed(1)} ± ${seDmg.toFixed(1)} HP`);
      console.log(`Avg Ghost Dmg Taken (Wins Only): ${avgWinDmg.toFixed(1)} HP (Target: ${t === 'casual' ? '80+ HP' : (t === 'veteran' ? '50-80 HP' : '30-50 HP')})`);
      console.log(`Avg Duration: ${avgDur.toFixed(1)} ± ${seDur.toFixed(1)}s (Target: 20-60s)`);
      console.log(`Timeouts: ${timeouts}/${total} (${timeoutRate.toFixed(1)}%) (Target: <= 20%)`);

      // Print per-bot breakdown
      for (const b of botStyles) {
        const bRows = tierRows.filter(r => r.bot_style === b);
        const bWins = bRows.filter(r => r.ghost_won === 1).length;
        const bWinRate = (bWins / bRows.length) * 100;
        const bAvgDmg = bRows.reduce((a, b) => a + b.damage_taken, 0) / bRows.length;
        const bWinRows = bRows.filter(r => r.ghost_won === 1);
        const bWinDmg = bWinRows.length > 0 ? (bWinRows.reduce((a, b) => a + b.damage_taken, 0) / bWinRows.length) : 0;
        const bAvgDur = bRows.reduce((a, b) => a + b.duration_seconds, 0) / bRows.length;
        console.log(`  > ${b.padEnd(10)}: WinRate=${bWinRate.toFixed(0)}% | AvgDmg=${bAvgDmg.toFixed(1)} HP | WinDmg=${bWinDmg.toFixed(1)} HP | Dur=${bAvgDur.toFixed(1)}s`);
      }
    }

    // Save raw per-round data to docs/difficulty-raw.csv
    const csvHeader = 'tier,bot_style,round,ghost_won,ghost_hp_left,player_hp_left,damage_taken,duration_seconds,is_timeout\n';
    const csvRows = results.map(r => `${r.tier},${r.bot_style},${r.round},${r.ghost_won},${r.ghost_hp_left},${r.player_hp_left},${r.damage_taken},${r.duration_seconds},${r.is_timeout}`).join('\n');
    const csvPath = path.resolve(process.cwd(), 'docs', 'difficulty-raw.csv');
    fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf8');
    console.log(`\n✓ Raw per-round data successfully written to ${csvPath}`);

    return { results, summary };
  } finally {
    await browser.close();
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
