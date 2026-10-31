import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>KillSwitch.swf New Cover</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,500;0,700;0,800;1,700&family=JetBrains+Mono:wght@400;600;700;800&family=Space+Grotesk:wght@600;700;900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 1200px;
      height: 630px;
      background: #06090e;
      color: #e6edf3;
      font-family: 'JetBrains Mono', monospace;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }

    /* CRT Scanline Overlay */
    .crt-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        rgba(18, 24, 38, 0) 50%,
        rgba(0, 0, 0, 0.28) 50%
      );
      background-size: 100% 4px;
      pointer-events: none;
      z-index: 50;
      opacity: 0.75;
    }

    /* Background Ambient Gradients */
    .bg-glow-orange {
      position: absolute;
      top: 15%;
      left: -8%;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(255, 68, 0, 0.16) 0%, rgba(255, 68, 0, 0) 70%);
      filter: blur(40px);
      z-index: 1;
    }

    .bg-glow-cyan {
      position: absolute;
      bottom: 5%;
      right: 5%;
      width: 550px;
      height: 550px;
      background: radial-gradient(circle, rgba(0, 240, 255, 0.14) 0%, rgba(0, 240, 255, 0) 70%);
      filter: blur(50px);
      z-index: 1;
    }

    /* Background ActionScript Hex Grid */
    .hex-bg {
      position: absolute;
      top: 35px;
      left: 0;
      width: 100%;
      height: 100%;
      font-size: 11px;
      line-height: 1.6;
      color: rgba(75, 95, 120, 0.12);
      font-family: 'JetBrains Mono', monospace;
      padding: 30px;
      overflow: hidden;
      z-index: 2;
      pointer-events: none;
    }

    /* Macromedia Flash Player 10.3 Window Titlebar */
    .window-titlebar {
      position: relative;
      z-index: 20;
      height: 34px;
      background: linear-gradient(180deg, #1c2430 0%, #101620 100%);
      border-bottom: 1px solid #283548;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      font-size: 11.5px;
    }

    .titlebar-left {
      display: flex;
      align-items: center;
      gap: 9px;
      font-weight: 700;
      color: #cfd8e3;
    }

    .flash-logo-badge {
      width: 17px;
      height: 17px;
      background: #ff2a00;
      color: #ffffff;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 900;
      box-shadow: 0 0 8px rgba(255, 42, 0, 0.5);
    }

    .titlebar-center {
      color: #64748b;
      font-size: 10.5px;
      display: flex;
      gap: 16px;
    }

    .titlebar-center span {
      color: #00f0ff;
      font-weight: 600;
    }

    .titlebar-controls {
      display: flex;
      gap: 8px;
    }

    .window-btn {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      background: #2a374a;
      display: inline-block;
      border: 1px solid #3c4f6b;
    }

    .window-btn.close {
      background: #d9383a;
      border-color: #ff5252;
    }

    /* Sub-timeline strip */
    .timeline-strip {
      position: relative;
      z-index: 20;
      height: 24px;
      background: #0b0f16;
      border-bottom: 1px solid #192230;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      font-size: 10px;
      color: #64748b;
    }

    .timeline-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #00ff88;
      font-weight: 700;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #00ff88;
      box-shadow: 0 0 8px #00ff88;
    }

    /* Main Container (Asymmetric Split) */
    .main-body {
      position: relative;
      z-index: 20;
      flex: 1;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      padding: 24px 32px 18px 32px;
      gap: 20px;
      align-items: center;
    }

    /* Left Column */
    .left-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .protocol-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 68, 0, 0.12);
      border: 1px solid rgba(255, 68, 0, 0.4);
      color: #ff6a3d;
      padding: 4px 12px;
      border-radius: 3px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.15em;
      margin-bottom: 12px;
      width: fit-content;
    }

    .headline-block {
      margin-bottom: 12px;
    }

    .headline-main {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 900;
      font-size: 64px;
      line-height: 0.95;
      text-transform: uppercase;
      letter-spacing: -0.03em;
      color: #ffffff;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: baseline;
      gap: 10px;
    }

    .headline-swf {
      font-family: 'Chakra Petch', sans-serif;
      font-weight: 800;
      font-style: italic;
      color: transparent;
      background: linear-gradient(135deg, #ff4500 0%, #ff8c00 100%);
      -webkit-background-clip: text;
      text-shadow: 0 0 25px rgba(255, 69, 0, 0.45);
    }

    .headline-sub {
      font-family: 'Chakra Petch', sans-serif;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.22em;
      color: #00f0ff;
      text-transform: uppercase;
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .headline-sub::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, #00f0ff 0%, rgba(0, 240, 255, 0) 100%);
    }

    .concept-blurb {
      font-size: 11.5px;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 18px;
      max-width: 580px;
    }

    .concept-blurb b {
      color: #f1f5f9;
    }

    /* Telemetry HUD Box */
    .hud-box {
      background: rgba(13, 20, 30, 0.75);
      border: 1px solid #1e2c40;
      border-left: 3px solid #ff4500;
      border-radius: 4px;
      padding: 12px 16px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    }

    .hud-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #ff6a3d;
      font-weight: 800;
      letter-spacing: 0.16em;
      border-bottom: 1px solid #1c2635;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }

    .hud-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10.5px;
      margin-bottom: 5px;
    }

    .hud-row:last-child {
      margin-bottom: 0;
    }

    .hud-label {
      color: #64748b;
      font-weight: 600;
    }

    .hud-val {
      font-weight: 700;
      color: #e2e8f0;
    }

    .hud-val.cyan {
      color: #00f0ff;
    }

    .hud-val.green {
      color: #00ff88;
    }

    .hud-val.orange {
      color: #ff8c00;
    }

    /* Right Column: Dynamic Combat Clash Illustration */
    .right-col {
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .combat-stage {
      position: relative;
      width: 100%;
      height: 380px;
    }

    /* Radial holographic arena circle */
    .arena-halo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 320px;
      height: 320px;
      border: 1px dashed rgba(0, 240, 255, 0.25);
      border-radius: 50%;
      animation: rotate 60s linear infinite;
    }

    .arena-halo-inner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 240px;
      height: 240px;
      border: 1px solid rgba(255, 69, 0, 0.2);
      border-radius: 50%;
    }

    /* Impact Burst */
    .impact-burst {
      position: absolute;
      top: 48%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 140px;
      height: 140px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 69, 0, 0.7) 35%, rgba(0, 240, 255, 0) 70%);
      border-radius: 50%;
      filter: blur(12px);
      z-index: 5;
    }

    /* Clash SVG */
    .clash-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
    }

    /* Floating Alert Badge */
    .floating-read-alert {
      position: absolute;
      top: 38px;
      right: 20px;
      background: rgba(0, 0, 0, 0.85);
      border: 1px solid #00f0ff;
      color: #00f0ff;
      font-size: 10.5px;
      font-weight: 800;
      padding: 6px 12px;
      border-radius: 3px;
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.4);
      display: flex;
      align-items: center;
      gap: 6px;
      z-index: 15;
    }

    .floating-rage-alert {
      position: absolute;
      bottom: 40px;
      right: 30px;
      background: rgba(0, 0, 0, 0.85);
      border: 1px solid #ff0033;
      color: #ff3355;
      font-size: 10px;
      font-weight: 800;
      padding: 5px 10px;
      border-radius: 3px;
      box-shadow: 0 0 16px rgba(255, 0, 51, 0.4);
      z-index: 15;
    }

    /* Bottom Technical Bar */
    .bottom-bar {
      position: relative;
      z-index: 20;
      height: 38px;
      background: #080c12;
      border-top: 1px solid #1a2536;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      font-size: 10px;
      color: #7d8ea3;
    }

    .bottom-left {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      color: #cfd8e3;
    }

    .bottom-left span {
      color: #ff4500;
    }

    .team-badge {
      color: #cbd5e1;
      font-weight: 600;
    }

    .bottom-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .badge-item {
      background: #111a26;
      border: 1px solid #223247;
      padding: 3px 10px;
      border-radius: 3px;
      color: #94a3b8;
      font-weight: 600;
    }

    .badge-item b {
      color: #00ff88;
    }
  </style>
</head>
<body>
  <div class="crt-overlay"></div>
  <div class="bg-glow-orange"></div>
  <div class="bg-glow-cyan"></div>

  <!-- Background Bytecode / ActionScript Dump -->
  <div class="hex-bg">
    0x00A1: import flash.display.MovieClip;<br>
    0x00A2: _root.onEnterFrame = function() { ghost.updateKinematics(60); };<br>
    0x7E50: ERROR_TIME_BOMB_OVERFLOW -> BYPASS_SECURITY_SANDBOX();<br>
    0x7E51: GEMMA_3_4B_OLLAMA_STREAM_ACTIVE [VULKAN_INFERENCE_READY]<br>
    0x7E52: Q_MATRIX_BELLMAN_UPDATE(s, a, r, s_prime);<br>
    0x7E53: MARKOV_PREDICTOR: P(KICK | JUMP) = 0.942; ANTI_AIR_ENGAGED;<br>
    0x7E54: MACROMEDIA_FLASH_MX_2004_RESURRECTION_COMPLETE;
  </div>

  <!-- Macromedia Flash 10.3 Window Titlebar -->
  <div class="window-titlebar">
    <div class="titlebar-left">
      <div class="flash-logo-badge">f</div>
      <span>Macromedia Flash Player 10.3 — [KillSwitch.swf // Error 0x7E5 Bypassed]</span>
    </div>
    <div class="titlebar-center">
      <div>FPS: <span>60.0 LOCKED</span></div>
      <div>CORE: <span>GEMMA 3:4B + Q-LEARN</span></div>
      <div>RENDERER: <span>HTML5 VECTOR CANVAS</span></div>
    </div>
    <div class="titlebar-controls">
      <div class="window-btn"></div>
      <div class="window-btn"></div>
      <div class="window-btn close"></div>
    </div>
  </div>

  <!-- Sub-Timeline Strip -->
  <div class="timeline-strip">
    <div class="timeline-left">
      <div class="status-pill"><div class="status-dot"></div> SÉANCE PROTOCOL LOADED</div>
      <div>TIMELINE: FRAME 060 / 060</div>
      <div>TIME-BOMB: JAN 12, 2021 [BYPASSED]</div>
    </div>
    <div>MLH HACKTOBERFEST 2026 // WEEK 4: GHOST IN THE MACHINE</div>
  </div>

  <!-- Main Asymmetric Content -->
  <div class="main-body">
    <!-- Left Column: Typography, Story & AI Telemetry -->
    <div class="left-col">
      <div class="protocol-tag">
        <span>⚡ DIGITAL SÉANCE INITIATED</span>
        <span>•</span>
        <span>ERROR 0x7E5 OVERRIDE</span>
      </div>

      <div class="headline-block">
        <div class="headline-main">
          <span>KILLSWITCH</span>
          <span class="headline-swf">.SWF</span>
        </div>
        <div class="headline-sub">THE GHOST IN THE CANVAS</div>
      </div>

      <div class="concept-blurb">
        When Adobe bricked 25 years of Flash history on Jan 12, 2021, we brought its digital soul back. 
        A <b>60 FPS stickman combat resurrection</b> where you duel a vengeful Flash Ghost powered by 
        <b>Real-Time Q-Learning</b> and <b>Offline Google Gemma 3:4B</b>.
      </div>

      <!-- Telemetry Box -->
      <div class="hud-box">
        <div class="hud-header">
          <span>// LIVE AI COMBAT TELEMETRY READOUT</span>
          <span style="color: #00ff88;">60 FPS ACTIVE</span>
        </div>
        <div class="hud-row">
          <span class="hud-label">LAYER 1 (FRAME-BY-FRAME)</span>
          <span class="hud-val cyan">Q-LEARNING MATRIX + MARKOV HABIT TRACKER</span>
        </div>
        <div class="hud-row">
          <span class="hud-label">LAYER 2 (INTER-ROUND BRAIN)</span>
          <span class="hud-val orange">LOCAL GOOGLE GEMMA 3:4B (OLLAMA / VULKAN)</span>
        </div>
        <div class="hud-row">
          <span class="hud-label">CALIBRATED DIFFICULTY TIERS</span>
          <span class="hud-val green">CASUAL (26.7%) • VETERAN (47.3%) • NIGHTMARE (65.7%)</span>
        </div>
        <div class="hud-row">
          <span class="hud-label">ASSET & NETWORK OVERHEAD</span>
          <span class="hud-val">0 SPRITES • 0 AUDIO FILES • 100% OFFLINE</span>
        </div>
      </div>
    </div>

    <!-- Right Column: Stickman Duel Graphic -->
    <div class="right-col">
      <div class="combat-stage">
        <!-- Floating HUD Alerts -->
        <div class="floating-read-alert">
          <span>⚡ GEMMA READ:</span>
          <span>ANTI-AIR INTERCEPT (100%)</span>
        </div>

        <div class="floating-rage-alert">
          <span>⚠️ 0x7E5 TIME-BOMB RAGE</span>
        </div>

        <!-- Arena Rings -->
        <div class="arena-halo"></div>
        <div class="arena-halo-inner"></div>
        <div class="impact-burst"></div>

        <!-- High-Impact Vector Stickman Clash -->
        <svg class="clash-svg" viewBox="0 0 460 380" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Player Ink Trail Gradient -->
            <linearGradient id="inkGrad" x1="60" y1="90" x2="230" y2="190" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ff4500" stop-opacity="0.9" />
              <stop offset="50%" stop-color="#ff8c00" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
            </linearGradient>

            <!-- Ghost Energy Aura -->
            <radialGradient id="ghostGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.8" />
              <stop offset="70%" stop-color="#00f0ff" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#00f0ff" stop-opacity="0" />
            </radialGradient>

            <!-- Shield Gradient -->
            <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.8" />
              <stop offset="50%" stop-color="#ffffff" stop-opacity="1" />
              <stop offset="100%" stop-color="#00f0ff" stop-opacity="0.8" />
            </linearGradient>
          </defs>

          <!-- Dynamic Calligraphy Ink Slash Trail -->
          <path d="M 60 70 Q 140 100 220 185 Q 160 170 80 120 Z" fill="url(#inkGrad)" />

          <!-- ================= PLAYER (FLYING DRAGON KICK) ================= -->
          <g transform="translate(10, 20)">
            <!-- Headband streaming ribbons -->
            <path d="M 125 105 Q 85 90 40 100" stroke="#ff4500" stroke-width="4.5" stroke-linecap="round" fill="none" />
            <path d="M 125 108 Q 90 100 50 115" stroke="#ff8c00" stroke-width="3" stroke-linecap="round" fill="none" />

            <!-- Head -->
            <circle cx="138" cy="112" r="15" fill="#f8fafc" stroke="#ff4500" stroke-width="3" />
            <!-- Fierce Eye -->
            <line x1="144" y1="110" x2="151" y2="114" stroke="#ff2200" stroke-width="3" stroke-linecap="round" />

            <!-- Torso (Angled airborne) -->
            <line x1="140" y1="126" x2="175" y2="175" stroke="#f8fafc" stroke-width="6.5" stroke-linecap="round" />

            <!-- Back Leg (Chambered / Tucked) -->
            <polyline points="175,175 145,190 130,225" stroke="#f8fafc" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Kicking Leg (Extended directly into clash) -->
            <polyline points="175,175 200,182 235,188" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Stylus Weapon in Hand -->
            <line x1="150" y1="145" x2="185" y2="135" stroke="#ff6a3d" stroke-width="4" stroke-linecap="round" />
            <line x1="185" y1="135" x2="195" y2="132" stroke="#ff8c00" stroke-width="2.5" />

            <!-- Front Arm (Punch Guard) -->
            <polyline points="146,140 170,148 188,135" stroke="#f8fafc" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
          </g>

          <!-- ================= CLASH IMPACT SPARKS ================= -->
          <!-- Hexagonal Shockwave rings -->
          <circle cx="245" cy="208" r="42" stroke="url(#shieldGrad)" stroke-width="2.5" stroke-dasharray="8 4" fill="none" />
          <circle cx="245" cy="208" r="68" stroke="rgba(0, 240, 255, 0.4)" stroke-width="1.5" stroke-dasharray="14 6" fill="none" />

          <!-- High-velocity sparks -->
          <line x1="245" y1="208" x2="215" y2="160" stroke="#ff8c00" stroke-width="3" stroke-linecap="round" />
          <line x1="245" y1="208" x2="220" y2="255" stroke="#ff4500" stroke-width="3.5" stroke-linecap="round" />
          <line x1="245" y1="208" x2="285" y2="170" stroke="#00f0ff" stroke-width="3.5" stroke-linecap="round" />
          <line x1="245" y1="208" x2="295" y2="245" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
          <line x1="245" y1="208" x2="270" y2="208" stroke="#00ff88" stroke-width="2.5" stroke-linecap="round" />

          <!-- ================= GHOST (THE FLASH GHOST PRIME) ================= -->
          <g transform="translate(100, 20)">
            <!-- Ethereal Ghost Halo / Glitch Aura -->
            <ellipse cx="230" cy="180" rx="45" ry="75" fill="url(#ghostGlow)" />

            <!-- Broken Flash Puzzle Piece hovering behind -->
            <path d="M 270 95 L 295 95 L 295 110 A 10 10 0 0 1 310 120 L 310 135 L 270 135 Z" fill="rgba(255, 42, 0, 0.25)" stroke="#ff2a00" stroke-width="1.5" stroke-dasharray="4 3" />

            <!-- Head (Hollow ring with glowing cyan core) -->
            <circle cx="225" cy="115" r="16" fill="#08101a" stroke="#00f0ff" stroke-width="4" />
            <!-- Glowing Eyes -->
            <circle cx="218" cy="114" r="3" fill="#00f0ff" />
            <circle cx="228" cy="114" r="3" fill="#00f0ff" />
            <line x1="218" y1="114" x2="210" y2="110" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" />

            <!-- Torso (Braced counter stance) -->
            <line x1="225" y1="131" x2="218" y2="195" stroke="#00f0ff" stroke-width="6.5" stroke-linecap="round" />

            <!-- Ghost Parrying Forearm (Intercepting player foot) -->
            <polyline points="222,150 180,180 148,206" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Energy Blade / Parry Barrier -->
            <line x1="145" y1="180" x2="148" y2="235" stroke="#00f0ff" stroke-width="4" stroke-linecap="round" />

            <!-- Secondary Arm (Counter Strike Prepped) -->
            <polyline points="222,150 250,165 272,150" stroke="#00f0ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="272" cy="150" r="5" fill="#ff0033" />

            <!-- Legs (Deep rooted martial arts horse stance) -->
            <polyline points="218,195 245,230 255,275" stroke="#00f0ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="218,195 195,225 180,270" stroke="#00f0ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  </div>

  <!-- Bottom Technical Attribution Bar -->
  <div class="bottom-bar">
    <div class="bottom-left">
      <span>■</span>
      <div class="team-badge">DATRIXLABS HACK DAY • SHUVRANSHU SEKHAR SAHOO • PRUTHIRAJ LENKA • SUHANI PRIYADARSHINI</div>
    </div>
    <div class="bottom-right">
      <div class="badge-item">WIN RATE: <b>26.7% - 65.7%</b></div>
      <div class="badge-item">FRAME BUDGET: <b>0.006 ms</b></div>
      <div class="badge-item">GITHUB: <b>SahooShuvranshu/KillSwitch.swf</b></div>
    </div>
  </div>
</body>
</html>
`;

async function generate() {
  const tempHtmlPath = path.resolve('public/cover-v2-temp.html');
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  console.log('Rendering new original cover design with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1200,
    height: 630,
    deviceScaleFactor: 2 // 2400x1260 crystal-clear retina resolution
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
  console.log('Saved new cover image to:', outPath1, 'and', outPath2);

  await browser.close();
  fs.unlinkSync(tempHtmlPath);
}

generate().catch(err => {
  console.error('Error rendering cover image:', err);
  process.exit(1);
});
