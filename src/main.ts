// ============================================================================
// KillSwitch.swf — Main Application Bootstrap & Controller
// Authentic Flash Unblock Gate -> Gaming Intro -> Arcade Menu -> Infinite Gauntlet
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
  private introAnimationActive: boolean = false;

  // Key tracking
  private keysHeld: Record<string, boolean> = {};

  // Konami Code Sequence: Up Up Down Down Left Right Left Right B A
  private konamiSequence: string[] = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];
  private konamiIndex: number = 0;

  // FPS calculation
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;
  private currentFps: number = 60.0;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!this.canvas) throw new Error('Game canvas element not found');

    const defaultName = (document.getElementById('player-name-input') as HTMLInputElement)?.value || 'Challenger_04';
    this.arena = new Arena(this.canvas, defaultName, 'black');
    this.telemetry = new TelemetryTracker(defaultName);
    this.aiController = new AIController(this.arena.ghost, this.arena.player, this.telemetry);
    this.aiController.onTacticalRead = (text) => this.arena.showTacticalBanner(text);
    this.cemetery = new CemeteryManager();

    this.setupUIEvents();
    this.setupWindowControls();
    this.setupInputListeners();
    this.setupRoundEndPipeline();
    this.startRenderLoop();
    (window as any).__game = this;
  }

  // --- Window Titlebar Controls (Maximize, Close, Minimize) ---
  private setupWindowControls() {
    const flashWindow = document.getElementById('flash-window');
    const btnMax = document.getElementById('btn-win-max');
    const btnClose = document.getElementById('btn-win-close');
    const btnMin = document.getElementById('btn-win-min');

    btnMax?.addEventListener('click', () => {
      if (flashWindow) {
        flashWindow.classList.toggle('fullscreen');
        const isFull = flashWindow.classList.contains('fullscreen');
        btnMax.innerText = isFull ? '❐' : '□';
        btnMax.title = isFull ? 'Restore Window' : 'Maximize Fullscreen';
      }
    });

    btnClose?.addEventListener('click', () => {
      this.showScreen('game-menu-screen');
      this.isRunning = false;
      this.arena.startRound(1);
    });

    btnMin?.addEventListener('click', () => {
      if (flashWindow?.classList.contains('fullscreen')) {
        flashWindow.classList.remove('fullscreen');
        if (btnMax) btnMax.innerText = '□';
      }
    });
  }

  // --- UI Event Listeners ---
  private setupUIEvents() {
    // 1. Unblock Flash Triggers
    const btnUnblockFlash = document.getElementById('btn-unblock-flash');
    const unblockTrigger = document.getElementById('unblock-box-trigger');
    const btnAllowPlugin = document.getElementById('btn-allow-plugin');
    const btnBlockPlugin = document.getElementById('btn-block-plugin');

    const triggerUnblock = () => {
      sound.playBypass();
      this.playGamingIntro();
    };

    btnUnblockFlash?.addEventListener('click', triggerUnblock);
    unblockTrigger?.addEventListener('click', triggerUnblock);
    btnAllowPlugin?.addEventListener('click', triggerUnblock);
    btnBlockPlugin?.addEventListener('click', () => {
      alert('ActionScript Error: Flash Player cannot run without permission. Click Allow to proceed.');
    });

    // 2. Gaming Intro Continue
    const btnIntroContinue = document.getElementById('btn-intro-continue');
    btnIntroContinue?.addEventListener('click', () => {
      this.introAnimationActive = false;
      sound.playJab();
      this.showScreen('game-menu-screen');
    });

    // 3. Arcade Menu: Start Infinite Match
    const btnStartInfinite = document.getElementById('btn-start-infinite');
    const nameInput = document.getElementById('player-name-input') as HTMLInputElement;

    const startMatch = () => {
      const name = nameInput.value.trim() || 'Challenger_04';
      this.arena.player.name = name;
      this.arena.player.applySkin('black', 1.0); // 100% Pure Pitch-Black Stickman Hero!
      this.telemetry.setPlayerName(name);
      gemmaGhost.resetMemory();

      sound.playBypass();
      this.hideAllScreens();
      this.startCombat(1);
    };

    btnStartInfinite?.addEventListener('click', startMatch);
    nameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        startMatch();
      }
    });

    // 4. Ofrenda & Memorial navigation
    const btnOpenOfrenda = document.getElementById('btn-open-ofrenda');
    const btnGoOfrenda = document.getElementById('btn-go-ofrenda');
    const menuOfrenda = document.getElementById('menu-ofrenda');
    const btnBackToGame = document.getElementById('btn-back-to-game');

    const openOfrenda = () => {
      this.showScreen('cemetery-screen');
    };

    btnOpenOfrenda?.addEventListener('click', openOfrenda);
    btnGoOfrenda?.addEventListener('click', openOfrenda);
    menuOfrenda?.addEventListener('click', openOfrenda);

    btnBackToGame?.addEventListener('click', () => {
      this.showScreen('game-menu-screen');
    });

    // 5. Inter-Round Next Opponent
    const btnNextRound = document.getElementById('btn-next-round');
    btnNextRound?.addEventListener('click', () => {
      sound.playBypass();
      this.hideAllScreens();
      this.currentRound++;
      this.startCombat(this.currentRound);
    });

    // 6. Game Over Retry & Navigation
    const btnRestartGauntlet = document.getElementById('btn-restart-gauntlet');
    const btnGoMenu = document.getElementById('btn-go-menu');

    btnRestartGauntlet?.addEventListener('click', () => {
      sound.playBypass();
      gemmaGhost.resetMemory();
      this.arena.playerTotalDamage = 0;
      this.hideAllScreens();
      this.startCombat(1);
    });

    btnGoMenu?.addEventListener('click', () => {
      this.showScreen('game-menu-screen');
    });

    // Menubar interactive features
    document.getElementById('menu-file')?.addEventListener('click', () => {
      alert('Macromedia Flash Player 10.3\nFile: KillSwitch.swf\nMode: Infinite Adaptive Stickman Gauntlet\nEngine: Local Google Gemma 3:4B');
    });
    document.getElementById('menu-view')?.addEventListener('click', () => {
      const flashWindow = document.getElementById('flash-window');
      flashWindow?.classList.toggle('fullscreen');
    });
    document.getElementById('menu-control')?.addEventListener('click', () => {
      alert('Controls:\n[A/D] Move | [W] Jump | [S] Crouch\n[J] Jab | [K] Heavy Kick | [W+K] Flying Jump-Kick | [L] Guard\nFullscreen: Press [F] or [□] button');
    });
    document.getElementById('menu-gemma')?.addEventListener('click', () => {
      alert('Google Gemma 3:4B Status:\nEndpoint: 127.0.0.1:11434 (Local Ollama)\nModel: gemma3:4b\nRole: Continuous Player Pattern Learning & Multi-Round Move Counters');
    });
    document.getElementById('menu-help')?.addEventListener('click', () => {
      alert('KillSwitch.swf Help:\nSurvive the endless gauntlet!\nAfter every round, the AI Stickman morphs into a brand new archetype with escalating health, damage, and Gemma-adapted counter tactics.');
    });
  }

  // --- Retro Gaming Intro Sequence with ActionScript Preloader ---
  private playGamingIntro() {
    this.showScreen('gaming-intro-screen');
    this.introAnimationActive = true;

    const progressBar = document.getElementById('intro-progress-bar');
    const percentLabel = document.getElementById('intro-load-percent');
    const logLabel = document.getElementById('intro-load-log');
    const continueBtn = document.getElementById('btn-intro-continue');

    if (continueBtn) continueBtn.classList.add('hidden');

    let progress = 0;
    const interval = setInterval(() => {
      if (!this.introAnimationActive) {
        clearInterval(interval);
        return;
      }

      progress += Math.floor(Math.random() * 8) + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        if (progressBar) progressBar.style.width = '100%';
        if (percentLabel) percentLabel.innerText = 'LOADED 100%';
        if (logLabel) logLabel.innerText = '[STATUS: BYPASS COMPLETE • READY FOR COMBAT]';
        sound.playKO();

        if (continueBtn) {
          continueBtn.classList.remove('hidden');
        }

        // Auto transition after 1.4s if user doesn't click
        setTimeout(() => {
          if (this.introAnimationActive) {
            this.introAnimationActive = false;
            this.showScreen('game-menu-screen');
          }
        }, 1400);
        return;
      }

      if (progressBar) progressBar.style.width = `${progress}%`;
      if (percentLabel) percentLabel.innerText = `LOADING ${progress}%`;

      if (logLabel) {
        if (progress < 25) {
          logLabel.innerText = '[INITIALIZING ACTIONSCRIPT 2.0 VIRTUAL MACHINE...]';
        } else if (progress < 55) {
          logLabel.innerText = '[LOADING SWF SKELETAL KEYFRAME TABLES...]';
        } else if (progress < 80) {
          logLabel.innerText = '[CONNECTING TO LOCAL GEMMA 3:4B NEURAL WEIGHTS...]';
        } else {
          logLabel.innerText = '[NEUTRALIZING 2021 TIME-BOMB KILL-SWITCH...]';
        }
      }
    }, 60);
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
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
        return;
      }

      if (this.keysHeld[e.code]) return;
      this.keysHeld[e.code] = true;

      // Fullscreen shortcut (F key outside combat)
      if (e.code === 'KeyF' && !this.isRunning) {
        document.getElementById('flash-window')?.classList.toggle('fullscreen');
        return;
      }

      // Enter / Space during intro advances to game menu
      if ((e.code === 'Enter' || e.code === 'Space') && this.introAnimationActive) {
        this.introAnimationActive = false;
        sound.playJab();
        this.showScreen('game-menu-screen');
        return;
      }

      // Konami Code Sequence: Up Up Down Down Left Right Left Right B A
      if (e.code === this.konamiSequence[this.konamiIndex]) {
        this.konamiIndex++;
        if (this.konamiIndex >= this.konamiSequence.length) {
          this.konamiIndex = 0;
          this.arena.player.activateOverclock(60);
          sound.playKO();
          this.arena.showTacticalBanner('⚡ KONAMI CODE UNLOCKED: 60s OVERCLOCK BOOST!');
        }
      } else {
        this.konamiIndex = e.code === this.konamiSequence[0] ? 1 : 0;
      }

      if (!this.isRunning || this.arena.isRoundOver) return;

      const p = this.arena.player;

      // 1. Light Punch Combo (J or Z): Jab -> Cross -> Palm Burst
      if (e.code === 'KeyJ' || e.code === 'KeyZ') {
        p.jab();
        this.telemetry.recordPunch();
      }

      // 2. Heavy Kick / Low Sweep / Flying Jump-Kick (K or X)
      if (e.code === 'KeyK' || e.code === 'KeyX') {
        if (!p.isGrounded) {
          p.jumpKick();
          this.telemetry.recordJumpKick();
        } else if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) {
          p.lowSweep(); // Crouching leg trip sweep
          this.telemetry.recordHeavyKick();
        } else {
          p.heavyKick(); // Roundhouse -> Axe Kick
          this.telemetry.recordHeavyKick();
        }
      }

      // 3. Rising Uppercut Launcher (U)
      if (e.code === 'KeyU') {
        p.uppercut();
        sound.playHeavyHit();
        this.telemetry.recordPunch();
      }

      // 4. Martial Special: Flying Clinch Knee (I)
      if (e.code === 'KeyI') {
        p.flyingKnee();
        sound.playHeavyHit();
        this.telemetry.recordHeavyKick();
      }

      // 5. Evasive Dodge Roll (Space)
      if (e.code === 'Space') {
        p.dodgeRoll();
        sound.playJump();
      }

      // 6. Jump & Platform Drop-Through (W or ArrowUp)
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) {
          p.dropThroughPlatform(); // S + W = Drop through platform!
        } else if (p.isGrounded) {
          p.jump();
          this.telemetry.recordJump();
          sound.playJump();
        }
      }

      // 7. Crouch (S or ArrowDown)
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        p.crouch();
      }

      // 8. Block & Parry (L or C)
      if (e.code === 'KeyL' || e.code === 'KeyC') {
        p.block(true);
        this.telemetry.recordBlock();
      }
    });

    window.addEventListener('keyup', (e) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
        return;
      }

      this.keysHeld[e.code] = false;

      if (!this.isRunning || this.arena.isRoundOver) return;

      const p = this.arena.player;

      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        p.unCrouch();
      }

      if (e.code === 'KeyL' || e.code === 'KeyC') {
        p.block(false);
      }

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
    this.hideAllScreens();
    this.arena.startRound(roundNum);
    this.aiController.setRound(roundNum);
    this.telemetry.startRound(roundNum);

    if (this.currentAdaptation) {
      this.aiController.applyAdaptation(this.currentAdaptation);
    }
  }

  private setupRoundEndPipeline() {
    this.arena.onRoundEnd = (winner: string) => {
      this.isRunning = false;

      const isPlayerVictorious = winner === this.arena.player.name;
      const summary = this.telemetry.compileSummary(winner);

      if (isPlayerVictorious) {
        // --- Player Won: Show Inter-Round Adaptation Screen ---
        this.showScreen('roast-screen');

        const nextRound = this.currentRound + 1;
        const nextArchetype = this.arena.getArchetypeForRound(nextRound);

        const roastRoundTag = document.getElementById('roast-round-tag');
        const roastText = document.getElementById('roast-text');
        const nextOppName = document.getElementById('next-opp-name');
        const nextOppTitle = document.getElementById('next-opp-title');
        const nextOppIcon = document.getElementById('next-opp-icon');
        const btnNextRound = document.getElementById('btn-next-round');

        const meterAntiAir = document.getElementById('meter-anti-air');
        const meterAggression = document.getElementById('meter-aggression');
        const meterGuardBreak = document.getElementById('meter-guard-break');
        const valCombo = document.getElementById('val-habit-combo');
        const valTactic = document.getElementById('val-habit-tactic');

        if (roastRoundTag) {
          roastRoundTag.innerText = `ROUND ${this.currentRound} CLEARED • TELEMETRY DECODED`;
        }

        if (nextOppName) nextOppName.innerText = nextArchetype.name;
        if (nextOppTitle) nextOppTitle.innerText = `${nextArchetype.title} • ${nextArchetype.description}`;
        if (nextOppIcon) {
          if (nextArchetype.skin === 'blue') nextOppIcon.innerText = '⚡';
          else if (nextArchetype.skin === 'green') nextOppIcon.innerText = '🥋';
          else if (nextArchetype.skin === 'darklord') nextOppIcon.innerText = '⚔️';
          else if (nextArchetype.skin === 'chosen') nextOppIcon.innerText = '🌀';
          else if (nextArchetype.skin === 'calavera') nextOppIcon.innerText = '💀';
          else if (nextArchetype.skin === 'yellow') nextOppIcon.innerText = '⚡';
          else if (nextArchetype.skin === 'ghost') nextOppIcon.innerText = '👻';
          else nextOppIcon.innerText = '🥋';
        }

        if (btnNextRound) {
          btnNextRound.innerText = `⚔️ FACE ROUND ${nextRound}: ${nextArchetype.name} ▶`;
        }

        if (roastText) {
          roastText.innerText = 'Analyzing combat habits with Google Gemma 3:4B...';
        }

        if (valCombo) {
          valCombo.innerText = summary.habits.favoriteCombo !== 'None'
            ? `${summary.habits.favoriteCombo} (${summary.habits.topComboCount}x)`
            : (summary.habits.aerialRatio > 0.4 ? 'SPAMMING JUMP-KICKS' : 'BALANCED FOOSTEPS');
        }

        // Call streaming Gemma 3:4B inference (Clean spoken monologue, ZERO JSON!)
        gemmaGhost.streamCombatAnalysis(
          summary,
          (speechChunk) => {
            if (roastText) {
              roastText.innerText = speechChunk;
            }
          },
          (adaptation) => {
            this.currentAdaptation = adaptation;

            if (valTactic) {
              valTactic.innerText = `${adaptation.counterTactic} (VS ${adaptation.predictedOpening})`;
            }

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
      } else {
        // --- AI Defeated Player: Show Game Over Screen ---
        this.showScreen('game-over-screen');

        const goRounds = document.getElementById('go-rounds-survived');
        const goDefeatedBy = document.getElementById('go-defeated-by');
        const goTotalDamage = document.getElementById('go-total-damage');
        const goFatalHabit = document.getElementById('go-fatal-habit');
        const goQuote = document.getElementById('go-quote');
        const goSummary = document.getElementById('game-over-summary');

        if (goRounds) goRounds.innerText = `${this.currentRound - 1}`;
        if (goDefeatedBy) goDefeatedBy.innerText = `${this.arena.ghost.name} (Round ${this.currentRound})`;
        if (goTotalDamage) goTotalDamage.innerText = `${this.arena.playerTotalDamage} HP`;
        if (goFatalHabit) {
          goFatalHabit.innerText = summary.habits.aerialRatio > 0.4
            ? `AERIAL DIVE SPAM (${Math.round(summary.habits.aerialRatio * 100)}%)`
            : (summary.habits.favoriteCombo !== 'None' ? summary.habits.favoriteCombo : 'PREDICTABLE OPENINGS');
        }

        if (goSummary) {
          goSummary.innerText = `You conquered ${this.currentRound - 1} round(s). ${this.arena.ghost.name} adapted to your combat rhythm and executed the final strike.`;
        }

        if (goQuote) {
          const opponentName = this.arena.ghost.name;
          const opening = summary.habits.openingMove;
          const combo = summary.habits.favoriteCombo !== 'None' ? summary.habits.favoriteCombo : 'dive-kick approaches';
          const quotes = [
            `"${opponentName} detected your ${opening} opening and timed a lethal counter. The Ghost now possesses your ActionScript bytecode." — Gemma 3:4B`,
            `"Your reliance on ${combo} became your tombstone. In the 2021 time-bomb, predictable fighters get garbage-collected." — Gemma 3:4B`,
            `"Even classic martial artists cannot survive an evolving neural adversary. Insert coin and try again." — Gemma 3:4B`
          ];
          goQuote.innerText = quotes[(this.currentRound) % quotes.length];
        }
      }
    };
  }

  // --- Main 60 FPS Loop ---
  private startRenderLoop() {
    const loop = (currentTime: number) => {
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
