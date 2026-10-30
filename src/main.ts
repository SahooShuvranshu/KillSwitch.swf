// ============================================================================
// KillSwitch.swf — Main Application Bootstrap & Controller
// ============================================================================

import './style.css';
import { Arena } from './engine/Arena';
import { sound } from './engine/Audio';
import { TelemetryTracker } from './ai/Telemetry';
import { gemmaGhost, CombatAdaptation } from './ai/GemmaGhost';
import { AIController } from './engine/AIController';
import { CemeteryManager } from './ofrenda/Cemetery';

class KillSwitchGame {
  private canvas: HTMLCanvasElement;
  private arena: Arena;
  private telemetry: TelemetryTracker;
  private aiController: AIController;
  private cemetery: CemeteryManager;

  private isRunning: boolean = false;
  private currentRound: number = 1;
  private currentAdaptation: CombatAdaptation | null = null;

  // Key tracking
  private keysHeld: Record<string, boolean> = {};

  // FPS calculation
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;
  private currentFps: number = 60.0;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!this.canvas) throw new Error('Game canvas element not found');

    const defaultName = (document.getElementById('player-name-input') as HTMLInputElement)?.value || 'XiaoXiao_04';
    this.arena = new Arena(this.canvas, defaultName);
    this.telemetry = new TelemetryTracker(defaultName);
    this.aiController = new AIController(this.arena.ghost, this.arena.player);
    this.cemetery = new CemeteryManager();

    this.setupUIEvents();
    this.setupInputListeners();
    this.setupRoundEndPipeline();
    this.startRenderLoop();
  }

  // --- UI Event Listeners ---
  private setupUIEvents() {
    const btnBypass = document.getElementById('btn-bypass-killswitch');
    const btnOfrenda = document.getElementById('btn-open-ofrenda');
    const btnBackToGame = document.getElementById('btn-back-to-game');
    const btnNextRound = document.getElementById('btn-next-round');
    const menuOfrenda = document.getElementById('menu-ofrenda');
    const nameInput = document.getElementById('player-name-input') as HTMLInputElement;

    btnBypass?.addEventListener('click', () => {
      const name = nameInput.value.trim() || 'XiaoXiao_04';
      this.arena.player.name = name;
      this.telemetry.setPlayerName(name);

      sound.playBypass();
      this.hideAllScreens();
      this.startCombat(1);
    });

    btnOfrenda?.addEventListener('click', () => {
      this.showScreen('cemetery-screen');
    });

    menuOfrenda?.addEventListener('click', () => {
      this.showScreen('cemetery-screen');
    });

    btnBackToGame?.addEventListener('click', () => {
      this.showScreen('killswitch-screen');
    });

    btnNextRound?.addEventListener('click', () => {
      sound.playBypass();
      this.hideAllScreens();
      this.currentRound++;
      this.startCombat(this.currentRound);
    });

    // Menubar interactive placeholders
    document.getElementById('menu-file')?.addEventListener('click', () => {
      alert('Macromedia Flash Player 10.3\nFile: KillSwitch.swf\nStatus: RESURRECTED FROM 2021 TIME-BOMB');
    });
    document.getElementById('menu-view')?.addEventListener('click', () => {
      alert('View Mode: 100% Vector Canvas (60.0 FPS Standard)');
    });
    document.getElementById('menu-control')?.addEventListener('click', () => {
      alert('Control: Rewind [Ctrl+R] | Play [Enter] | Step [Ctrl+Right]');
    });
    document.getElementById('menu-gemma')?.addEventListener('click', () => {
      alert('Gemma 3:4B Status:\nEndpoint: 127.0.0.1:11434\nModel: gemma3:4b\nRole: Vengeful Flash Player Ghost & Combat Memory Tuner');
    });
    document.getElementById('menu-help')?.addEventListener('click', () => {
      alert('KillSwitch.swf Help:\nUse [A/D] to move, [W] to jump, [S] to crouch.\n[J] Light Jab, [K] Heavy Kick, [W+K] Flying Jump-Kick, [L] Guard.\nPowered by Google Gemma 3:4B.');
    });
  }

  private showScreen(id: string) {
    document.querySelectorAll('.retro-screen').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
    }
  }

  private hideAllScreens() {
    document.querySelectorAll('.retro-screen').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
  }

  // --- Keyboard Input Handling ---
  private setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      if (this.keysHeld[e.code]) return; // prevent duplicate auto-repeat
      this.keysHeld[e.code] = true;

      if (!this.isRunning || this.arena.isRoundOver) return;

      const p = this.arena.player;

      // 1. Light Jab (J or Z)
      if (e.code === 'KeyJ' || e.code === 'KeyZ') {
        p.jab();
        this.telemetry.recordPunch();
      }

      // 2. Heavy Kick / Flying Jump-Kick (K or X)
      if (e.code === 'KeyK' || e.code === 'KeyX') {
        if (!p.isGrounded) {
          // Flying Jump Kick (Xiao Xiao style)
          p.jumpKick();
          this.telemetry.recordJumpKick();
        } else {
          // Ground heavy roundhouse
          p.heavyKick();
          this.telemetry.recordHeavyKick();
        }
      }

      // 3. Jump (W or ArrowUp)
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (p.isGrounded) {
          p.jump();
          sound.playJump();
        }
      }

      // 4. Crouch (S or ArrowDown)
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        p.crouch();
      }

      // 5. Block Shield (L or C)
      if (e.code === 'KeyL' || e.code === 'KeyC') {
        p.block(true);
        this.telemetry.recordBlock();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld[e.code] = false;

      if (!this.isRunning || this.arena.isRoundOver) return;

      const p = this.arena.player;

      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        p.unCrouch();
      }

      if (e.code === 'KeyL' || e.code === 'KeyC') {
        p.block(false);
      }

      // Check horizontal movement release
      const isMovingLeft = this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft'];
      const isMovingRight = this.keysHeld['KeyD'] || this.keysHeld['ArrowRight'];
      if (!isMovingLeft && !isMovingRight) {
        p.stopMoving();
      }
    });
  }

  private handleContinuousInput() {
    if (!this.isRunning || this.arena.isRoundOver) return;

    const p = this.arena.player;

    const isMovingLeft = this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft'];
    const isMovingRight = this.keysHeld['KeyD'] || this.keysHeld['ArrowRight'];

    if (isMovingLeft && !isMovingRight) {
      p.move(-1);
    } else if (isMovingRight && !isMovingLeft) {
      p.move(1);
    }

    if (p.state === 'BLOCK') {
      this.telemetry.updateBlockHolding();
    }
  }

  // --- Combat Pipeline ---
  public startCombat(roundNum: number) {
    this.currentRound = roundNum;
    this.isRunning = true;
    this.arena.startRound(roundNum);
    this.telemetry.startRound(roundNum);

    if (this.currentAdaptation) {
      this.aiController.applyAdaptation(this.currentAdaptation);
    }
  }

  private setupRoundEndPipeline() {
    this.arena.onRoundEnd = (winner: string) => {
      this.isRunning = false;

      // Compile telemetry stats
      const summary = this.telemetry.compileSummary(winner);

      // Display Inter-Round Roast & Adaptation Screen
      this.showScreen('roast-screen');

      const roastRoundTag = document.getElementById('roast-round-tag');
      const roastText = document.getElementById('roast-text');
      const meterAntiAir = document.getElementById('meter-anti-air');
      const meterAggression = document.getElementById('meter-aggression');
      const meterGuardBreak = document.getElementById('meter-guard-break');

      if (roastRoundTag) {
        roastRoundTag.innerText = `ROUND ${this.currentRound} STATS: ${summary.dominantStyle.toUpperCase()}`;
      }

      if (roastText) {
        roastText.innerText = 'Extracting ActionScript 2.0 bytecode... Sending telemetry to Google Gemma 3:4B...';
      }

      // Call streaming Gemma 3:4B inference
      gemmaGhost.streamCombatAnalysis(
        summary,
        (textChunk) => {
          if (roastText) {
            roastText.innerText = textChunk;
          }
        },
        (adaptation) => {
          this.currentAdaptation = adaptation;

          // Animate UI adaptation meters
          if (meterAntiAir) {
            meterAntiAir.style.width = `${Math.round(adaptation.antiAirPriority * 100)}%`;
          }
          if (meterAggression) {
            meterAggression.style.width = `${Math.round(adaptation.aggression * 100)}%`;
          }
          if (meterGuardBreak) {
            meterGuardBreak.style.width = `${Math.round(adaptation.guardBreakRate * 100)}%`;
          }
        }
      );
    };
  }

  // --- Main 60 FPS Loop ---
  private startRenderLoop() {
    const loop = (currentTime: number) => {
      // Calculate FPS
      this.frameCount++;
      if (currentTime - this.lastFrameTime >= 1000) {
        this.currentFps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
        const fpsEl = document.getElementById('status-fps');
        if (fpsEl) fpsEl.innerText = `FPS: ${this.currentFps}.0`;
      }

      if (this.isRunning) {
        this.handleContinuousInput();
        this.aiController.update();
        this.arena.update();
      }

      this.arena.render();
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Initialize game on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new KillSwitchGame();
});
