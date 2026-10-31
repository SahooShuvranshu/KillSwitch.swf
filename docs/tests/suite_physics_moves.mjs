import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const verificationDir = 'D:\\Projects\\Hacktober Fest 2026\\KillSwitch.swf\\docs';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🚀 Starting Test Suite 2: Platforms, Crates & Combat Moves...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });

  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') console.error('  [Browser Error]:', text);
  });

  // Start game at Round 1
  await page.goto('http://127.0.0.1:5173/?round=1', { waitUntil: 'networkidle0' });
  await page.click('#btn-unblock-flash');
  await wait(1800);
  await page.click('#btn-start-infinite');
  await wait(600); // Announcement active

  // Wait for round announcement to finish and fighters to be active
  await wait(1500);

  // 1. Move to Destructible Crate at x=170 and smash it
  console.log('Testing crate collision and destruction...');
  await page.evaluate(() => {
    const p = window.__game.arena.player;
    p.x = 135; // Stand to the left of crate (crate is 170..220)
    p.vx = 0;
  });
  await wait(100);

  // Execute heavy kicks against crate
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('KeyK');
    await wait(220);
  }
  await page.screenshot({ path: path.join(verificationDir, '13-crate-collision.png') });
  console.log('📸 13-crate-collision.png captured');

  const crateHp = await page.evaluate(() => {
    const crate = window.__game.arena.obstacles.find(o => o.id === 'pencil_crate');
    return crate ? crate.hp : null;
  });
  console.log(`  Pencil crate HP after hitting: ${crateHp} (was 40)`);

  // 2. Jump onto Platform Shelf
  console.log('Testing platform landing...');
  await page.evaluate(() => {
    const p = window.__game.arena.player;
    const shelf = window.__game.arena.obstacles.find(o => o.isPlatform);
    if (shelf) {
      p.x = shelf.x + shelf.w / 2; // Directly below platform center
      p.y = p.groundY;
      p.vx = 0;
      p.vy = -16; // Jump high up
      p.isGrounded = false;
    }
  });
  await wait(350); // Let player reach peak and land on shelf top
  const onShelf = await page.evaluate(() => {
    const p = window.__game.arena.player;
    return { y: p.y, groundY: p.groundY, isGrounded: p.isGrounded };
  });
  console.log('  Player position on platform:', onShelf);
  await page.screenshot({ path: path.join(verificationDir, '14-platform-jump.png') });
  console.log('📸 14-platform-jump.png captured');

  // 3. Drop through Platform with S + W
  console.log('Testing platform drop-through with S+W...');
  await page.keyboard.down('KeyS');
  await wait(50);
  await page.keyboard.press('KeyW');
  await wait(100);
  await page.keyboard.up('KeyS');
  await page.screenshot({ path: path.join(verificationDir, '15-platform-dropthrough.png') });
  console.log('📸 15-platform-dropthrough.png captured');
  await wait(300); // Land back on floor

  // 4. Test Player Controls: Walk A/D
  console.log('Testing player walk...');
  await page.keyboard.down('KeyD');
  await wait(200);
  await page.screenshot({ path: path.join(verificationDir, '16-move-walk.png') });
  console.log('📸 16-move-walk.png captured');
  await page.keyboard.up('KeyD');
  await wait(100);

  // 5. Test Crouch S
  console.log('Testing player crouch...');
  await page.keyboard.down('KeyS');
  await wait(100);
  await page.screenshot({ path: path.join(verificationDir, '17-jump-crouch.png') });
  console.log('📸 17-jump-crouch.png captured');
  await page.keyboard.up('KeyS');
  await wait(100);

  // 6. Test Punch Combo (3-hit chain: Jab -> Cross -> Palm)
  console.log('Testing 3-hit punch chain...');
  await page.keyboard.press('KeyJ');
  await wait(90);
  await page.keyboard.press('KeyJ');
  await wait(90);
  await page.keyboard.press('KeyJ');
  await wait(50);
  await page.screenshot({ path: path.join(verificationDir, '18-punch-chain.png') });
  console.log('📸 18-punch-chain.png captured');
  await wait(250);

  // 7. Test Kick Combo (2-hit chain: Heavy Kick -> Axe Kick)
  console.log('Testing kick combo...');
  await page.keyboard.press('KeyK');
  await wait(110);
  await page.keyboard.press('KeyK');
  await wait(60);
  await page.screenshot({ path: path.join(verificationDir, '19-kick-chain.png') });
  console.log('📸 19-kick-chain.png captured');
  await wait(300);

  // 8. Test Jump Kick (W then K in air)
  console.log('Testing jump kick in air...');
  await page.keyboard.press('KeyW');
  await wait(120);
  await page.keyboard.press('KeyK');
  await wait(80);
  await page.screenshot({ path: path.join(verificationDir, '20-jump-kick.png') });
  console.log('📸 20-jump-kick.png captured');
  await wait(350);

  // 9. Test Uppercut (U)
  console.log('Testing uppercut...');
  await page.keyboard.press('KeyU');
  await wait(100);
  await page.screenshot({ path: path.join(verificationDir, '21-uppercut.png') });
  console.log('📸 21-uppercut.png captured');
  await wait(300);

  // 10. Test Flying Knee (I)
  console.log('Testing flying knee...');
  await page.keyboard.press('KeyI');
  await wait(100);
  await page.screenshot({ path: path.join(verificationDir, '22-flying-knee.png') });
  console.log('📸 22-flying-knee.png captured');
  await wait(300);

  // 11. Test Low Sweep (S + K)
  console.log('Testing low sweep...');
  await page.keyboard.down('KeyS');
  await wait(50);
  await page.keyboard.press('KeyK');
  await wait(80);
  await page.screenshot({ path: path.join(verificationDir, '23-low-sweep.png') });
  console.log('📸 23-low-sweep.png captured');
  await page.keyboard.up('KeyS');
  await wait(300);

  // 12. Test Block (L)
  console.log('Testing guard block...');
  await page.keyboard.down('KeyL');
  await wait(100);
  await page.screenshot({ path: path.join(verificationDir, '24-block.png') });
  console.log('📸 24-block.png captured');
  await page.keyboard.up('KeyL');
  await wait(200);

  // 13. Test Dodge Roll (Space)
  console.log('Testing dodge roll...');
  await page.keyboard.press('Space');
  await wait(100);
  await page.screenshot({ path: path.join(verificationDir, '25-dodge-roll.png') });
  console.log('📸 25-dodge-roll.png captured');
  await wait(350);

  // 14. Test Konami Code Overclock
  console.log('Testing Konami Code (Up Up Down Down Left Right Left Right B A)...');
  const konamiKeys = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];
  for (const k of konamiKeys) {
    await page.keyboard.press(k);
    await wait(70);
  }
  await wait(200);

  const isOverclocked = await page.evaluate(() => {
    return {
      overclocked: window.__game.arena.player.isOverclocked,
      remaining: window.__game.arena.player.overclockTimeRemaining
    };
  });
  console.log('  Player Overclock Status:', isOverclocked);

  await page.screenshot({ path: path.join(verificationDir, '26-konami-overclock.png') });
  console.log('📸 26-konami-overclock.png captured');

  console.log('✅ Suite 2 Finished cleanly. Error logs count:', consoleLogs.filter(l => l.type === 'error').length);
  await browser.close();
}

run().catch(err => {
  console.error('❌ Suite 2 Error:', err);
  process.exit(1);
});
