import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log('⏱️ Starting 60-Second Real-Time Headless FPS & AI Frame Cost Benchmark...');
  console.log('Target Stage: Stage 5 (Ofrenda - heavy particles, dual animated flames, 3-layer parallax, 3D obstacles)');

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

    await page.goto('http://127.0.0.1:5173/?round=5', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    console.log('Initiating 60-second real-time combat stress test...');

    const metrics = await page.evaluate(async () => {
      const arena = window.__game.arena;
      const ai = window.__game.aiController;
      const p = arena.player;
      const g = arena.ghost;

      arena.announcementFrames = 0;
      // Keep health high so fighters stay active for full 60s
      p.health = 99999;
      g.health = 99999;

      const frameTimes = [];
      const aiCosts = [];
      const renderCosts = [];

      let frameCount = 0;
      const startTime = performance.now();
      const testDurationMs = 60000; // 60 seconds
      let lastFrameTime = performance.now();

      return new Promise((resolve) => {
        const step = () => {
          const now = performance.now();
          const dt = now - lastFrameTime;
          lastFrameTime = now;

          if (frameCount > 0) { // Skip 1st frame warmup
            frameTimes.push(dt);
          }

          // Active combat sparring simulation
          const dir = g.x > p.x ? 1 : -1;
          const dist = Math.abs(g.x - p.x);
          p.move(dir);

          if (dist < 90) {
            if (frameCount % 20 === 0) p.jab();
            else if (frameCount % 45 === 0) p.heavyKick();
            else if (frameCount % 70 === 0) p.uppercut();
          } else if (dist < 180 && frameCount % 60 === 0) {
            p.jump();
            p.jumpKick();
          }

          // Measure AI Cost
          const tAiStart = performance.now();
          ai.update();
          const tAiEnd = performance.now();
          aiCosts.push(tAiEnd - tAiStart);

          // Update Arena
          arena.update();

          // Measure Render Cost
          const tRenderStart = performance.now();
          arena.render();
          const tRenderEnd = performance.now();
          renderCosts.push(tRenderEnd - tRenderStart);

          frameCount++;

          if (performance.now() - startTime < testDurationMs) {
            requestAnimationFrame(step);
          } else {
            // Compute statistical metrics
            frameTimes.sort((a, b) => a - b);
            aiCosts.sort((a, b) => a - b);
            renderCosts.sort((a, b) => a - b);

            const totalTime = performance.now() - startTime;
            const avgDt = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const avgFps = 1000 / avgDt;

            // 1% Low is the 99th percentile frame duration
            const p99Index = Math.floor(frameTimes.length * 0.99);
            const p99FrameTime = frameTimes[p99Index];
            const onePercentLowFps = 1000 / p99FrameTime;

            const p999Index = Math.floor(frameTimes.length * 0.999);
            const p999FrameTime = frameTimes[p999Index];
            const pointOnePercentLowFps = 1000 / p999FrameTime;

            const avgAi = aiCosts.reduce((a, b) => a + b, 0) / aiCosts.length;
            const p99Ai = aiCosts[Math.floor(aiCosts.length * 0.99)];
            const maxAi = aiCosts[aiCosts.length - 1];

            const avgRender = renderCosts.reduce((a, b) => a + b, 0) / renderCosts.length;
            const p99Render = renderCosts[Math.floor(renderCosts.length * 0.99)];
            const maxRender = renderCosts[renderCosts.length - 1];

            resolve({
              totalFrames: frameCount,
              durationSeconds: Math.round(totalTime / 1000 * 10) / 10,
              avgFps: Math.round(avgFps * 10) / 10,
              avgFrameTimeMs: Math.round(avgDt * 100) / 100,
              onePercentLowFps: Math.round(onePercentLowFps * 10) / 10,
              pointOnePercentLowFps: Math.round(pointOnePercentLowFps * 10) / 10,
              aiCost: {
                avgMs: Math.round(avgAi * 10000) / 10000,
                p99Ms: Math.round(p99Ai * 10000) / 10000,
                maxMs: Math.round(maxAi * 10000) / 10000
              },
              renderCost: {
                avgMs: Math.round(avgRender * 100) / 100,
                p99Ms: Math.round(p99Render * 100) / 100,
                maxMs: Math.round(maxRender * 100) / 100
              }
            });
          }
        };

        requestAnimationFrame(step);
      });
    });

    console.log('\n==================================================');
    console.log('60-SECOND PERFORMANCE BENCHMARK REPORT:');
    console.log('==================================================');
    console.log(`Duration:            ${metrics.durationSeconds} s (${metrics.totalFrames} frames)`);
    console.log(`Average FPS:         ${metrics.avgFps} FPS (Avg Frame Time: ${metrics.avgFrameTimeMs} ms)`);
    console.log(`1% Low FPS:          ${metrics.onePercentLowFps} FPS`);
    console.log(`0.1% Low FPS:        ${metrics.pointOnePercentLowFps} FPS`);
    console.log('--------------------------------------------------');
    console.log(`AI Cost (ms/frame):  Avg: ${metrics.aiCost.avgMs} ms | 99th%: ${metrics.aiCost.p99Ms} ms | Max: ${metrics.aiCost.maxMs} ms`);
    console.log(`Render Cost (ms):    Avg: ${metrics.renderCost.avgMs} ms | 99th%: ${metrics.renderCost.p99Ms} ms | Max: ${metrics.renderCost.maxMs} ms`);
    console.log('==================================================');

    if (metrics.avgFps >= 58.0 && metrics.aiCost.avgMs < 0.25) {
      console.log('🎉 60 FPS TARGET & AI FRAME BUDGET VERIFIED UNDER SUSTAINED LOAD!');
    } else {
      console.warn('⚠️ Performance fell below optimal targets.');
    }

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('❌ Performance test failed:', err);
  process.exit(1);
});
