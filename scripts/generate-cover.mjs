import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>KillSwitch.swf Cover</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 1024px;
      height: 640px;
      background-color: #0b1016;
      color: #edebe4;
      font-family: 'JetBrains Mono', monospace;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }

    /* Radar / Dash Matrix Pattern */
    .bg-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    }

    /* Header Bar */
    .header-bar {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      padding: 24px 34px 0 34px;
      font-size: 10px;
      letter-spacing: 0.14em;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      white-space: nowrap;
      margin-right: 36px;
    }

    .brand-tag {
      color: #ff4733;
      font-weight: 700;
      font-size: 10px;
      letter-spacing: 0.16em;
    }

    .brand-title {
      color: #edebe4;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 900;
      font-size: 14.5px;
      letter-spacing: 0.08em;
    }

    .header-center {
      display: flex;
      align-items: center;
      gap: 22px;
      color: #7b8b99;
      font-weight: 600;
      font-size: 9.5px;
      letter-spacing: 0.12em;
      white-space: nowrap;
      flex: 1;
      justify-content: center;
    }

    .telemetry-item {
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }

    .telemetry-item .sq {
      color: #ff4733;
      font-size: 8px;
    }

    .telemetry-item b {
      color: #c9d4df;
    }

    .header-right {
      white-space: nowrap;
      margin-left: 20px;
    }

    .header-right .btn-pill {
      background: #ff4733;
      color: #edebe4;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      font-size: 10px;
      letter-spacing: 0.16em;
      padding: 7px 18px;
      border-radius: 4px;
      border: none;
      display: inline-block;
      box-shadow: 0 0 18px rgba(255, 71, 51, 0.4);
    }

    /* Main Hero Lockup */
    .hero-container {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      margin-top: -12px;
    }

    .supertitle-wrapper {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
    }

    .supertitle-line {
      width: 44px;
      height: 1.5px;
      background: #ff4733;
      opacity: 0.85;
    }

    .supertitle-text {
      color: #ff4733;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.24em;
      text-transform: uppercase;
    }

    /* Massive Typographic Lockup */
    .big-headline {
      font-family: 'Anton', 'Impact', sans-serif;
      text-transform: uppercase;
      line-height: 0.86;
      display: flex;
      flex-direction: column;
      align-items: center;
      letter-spacing: -0.018em;
    }

    .line-top {
      font-size: 130px;
      color: #edebe4;
      display: block;
      transform: scaleY(1.16);
      text-shadow: 0 6px 24px rgba(0, 0, 0, 0.65);
    }

    .line-bottom {
      font-size: 130px;
      display: flex;
      align-items: center;
      transform: scaleY(1.16);
      text-shadow: 0 6px 24px rgba(0, 0, 0, 0.65);
      margin-top: 10px;
    }

    .line-bottom .word-red {
      color: #ff4733;
    }

    .line-bottom .word-cream {
      color: #edebe4;
      margin-left: 14px;
    }

    /* Subtitle Under Headline */
    .hero-subtitle {
      margin-top: 26px;
      color: #6d7d8c;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.26em;
      text-transform: uppercase;
    }

    /* Bottom 4-Box Telemetry Bar */
    .footer-grid {
      position: relative;
      z-index: 10;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border-top: 1px solid #1a232e;
      background: rgba(11, 16, 22, 0.95);
      backdrop-filter: blur(8px);
    }

    .footer-cell {
      padding: 16px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #edebe4;
      border-right: 1px solid #1a232e;
      white-space: nowrap;
    }

    .footer-cell:last-child {
      border-right: none;
    }

    .dot-sep {
      color: #ff4733;
      margin: 0 5px;
    }
  </style>
</head>
<body>
  <!-- Canvas for subtle radar vector dashes matching user reference image -->
  <canvas id="radar" class="bg-canvas" width="1024" height="640"></canvas>

  <!-- Top Header -->
  <div class="header-bar">
    <div class="header-left">
      <span class="brand-tag">FLASH ARCHIVE</span>
      <span class="brand-title">KILLSWITCH.SWF</span>
    </div>
    <div class="header-center">
      <div class="telemetry-item"><span class="sq">■</span> THEATRE: <b>2021 DIGITAL VOID</b></div>
      <div class="telemetry-item">MODEL: <b>GEMMA-3-4B-IT</b></div>
      <div class="telemetry-item">INCIDENTS LOGGED: <b>0x7E5</b></div>
    </div>
    <div class="header-right">
      <span class="btn-pill">BYPASS KILLSWITCH</span>
    </div>
  </div>

  <!-- Center Hero -->
  <div class="hero-container">
    <div class="supertitle-wrapper">
      <div class="supertitle-line"></div>
      <div class="supertitle-text">Macromedia Flash Preservation • Stickman Combat Engine</div>
      <div class="supertitle-line"></div>
    </div>
    
    <div class="big-headline">
      <span class="line-top">KILLSWITCH</span>
      <div class="line-bottom">
        <span class="word-red">CANVAS</span>
        <span class="word-cream">GHOST</span>
      </div>
    </div>

    <div class="hero-subtitle">
      Dual-Layer Adaptive AI • Google Gemma 3:4B + Q-Learning Matrix
    </div>
  </div>

  <!-- Bottom 4-Box Telemetry Bar -->
  <div class="footer-grid">
    <div class="footer-cell">
      <span>JAN 12, 2021 <span class="dot-sep">•</span> FLASH MX 2004</span>
    </div>
    <div class="footer-cell">
      <span>GOOGLE GEMMA 3 (4B-IT OLLAMA)</span>
    </div>
    <div class="footer-cell">
      <span>900-ROUND CALIBRATION <span class="dot-sep">•</span> 65.7%</span>
    </div>
    <div class="footer-cell">
      <span>DATRIX LABS <span class="dot-sep">•</span> MLH HACKTOBERFEST</span>
    </div>
  </div>

  <script>
    // Draw subtle radar dashes matching user reference image
    const canvas = document.getElementById('radar');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const spacingX = 26;
    const spacingY = 26;
    const len = 6.5;
    const angle = -0.36;

    for (let x = 12; x < w; x += spacingX) {
      for (let y = 12; y < h; y += spacingY) {
        const dx = x - w * 0.5;
        const dy = y - h * 0.48;
        const dist = Math.sqrt(dx * dx + dy * dy);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Subtle arc rings of red dashes like radar waves
        const isArc1 = Math.abs(dist - 210) < 18 && (x + y) % 3 === 0;
        const isArc2 = Math.abs(dist - 380) < 22 && (x + y) % 4 === 0;
        const isCornerCluster = (x < 180 && y > 460) || (x > 840 && y < 220);

        ctx.beginPath();
        ctx.moveTo(-len / 2, 0);
        ctx.lineTo(len / 2, 0);

        if ((isArc1 || isArc2 || (isCornerCluster && Math.random() > 0.6)) && Math.random() > 0.3) {
          ctx.strokeStyle = 'rgba(255, 71, 51, 0.28)';
          ctx.lineWidth = 1.3;
        } else {
          ctx.strokeStyle = 'rgba(100, 130, 155, 0.085)';
          ctx.lineWidth = 1.0;
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  </script>
</body>
</html>
`;

async function generate() {
  const tempHtmlPath = path.resolve('public/cover-temp.html');
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1024,
    height: 640,
    deviceScaleFactor: 2
  });

  await page.goto('file:///' + tempHtmlPath.replace(/\\\\/g, '/'), {
    waitUntil: 'networkidle0'
  });

  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));

  const outPath1 = path.resolve('public/docs/cover-image.png');
  const outPath2 = path.resolve('docs/cover-image.png');

  await page.screenshot({
    path: outPath1,
    type: 'png'
  });

  fs.copyFileSync(outPath1, outPath2);
  console.log('Saved cover image to:', outPath1, 'and', outPath2);

  await browser.close();
  fs.unlinkSync(tempHtmlPath);
}

generate().catch(err => {
  console.error('Error generating cover image:', err);
  process.exit(1);
});
