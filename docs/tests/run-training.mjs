import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const pretrainedQPath = 'D:\\Projects\\Hacktober Fest 2026\\KillSwitch.swf\\src\\ai\\pretrained-q.json';
const verificationDir = 'D:\\Projects\\Hacktober Fest 2026\\KillSwitch.swf\\docs';

async function main() {
  console.log('🚀 Launching Chrome to execute Headless Training Mode (?train=1)...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768 });

    // Block any outbound Ollama requests as an extra safeguard
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.url().includes('11434')) {
        console.error('CRITICAL: Blocked unexpected Ollama request during training!');
        req.abort('blockedbyclient');
      } else {
        req.continue();
      }
    });

    page.on('console', (msg) => {
      const text = msg.text();
      if (!text.includes('AudioContext') && !text.includes('[vite]')) {
        console.log(' [TRAIN]:', text);
      }
    });

    console.log('Navigating to http://127.0.0.1:5173/?train=1 ...');
    await page.goto('http://127.0.0.1:5173/?train=1', { waitUntil: 'domcontentloaded' });

    // Wait for training completion flag
    console.log('Waiting for training session to simulate 1,500 rounds...');
    const startTime = Date.now();
    await page.waitForFunction(() => window.__trainingCompleted === true, {
      timeout: 120000,
      polling: 500
    });
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`✓ Training finished in ${elapsed}s!`);

    await page.screenshot({ path: path.join(verificationDir, 'train-dashboard.png') });
    console.log('📸 Captured train-dashboard.png');

    const exportedQ = await page.evaluate(() => window.__exportedQTable);
    const stats = await page.evaluate(() => window.__trainingStats);

    if (!exportedQ || Object.keys(exportedQ).length === 0) {
      throw new Error('Exported Q-table is empty!');
    }

    const jsonString = JSON.stringify(exportedQ, null, 2);
    const byteSize = Buffer.byteLength(jsonString, 'utf8');
    const sizeKB = Math.round((byteSize / 1024) * 10) / 10;
    console.log(`Exported Q-Table: ${Object.keys(exportedQ).length} states, ${sizeKB} KB (Target < 200 KB)`);

    if (byteSize > 200 * 1024) {
      throw new Error(`Exported Q-Table exceeded 200 KB limit: ${sizeKB} KB`);
    }

    fs.writeFileSync(pretrainedQPath, jsonString, 'utf8');
    console.log(`✓ Successfully saved pruned & formatted Q-table to ${pretrainedQPath}`);
    console.log('Archetype results:', stats);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('❌ Training Runner Error:', err);
  process.exit(1);
});
