// ============================================================================
// KillSwitch.swf — Main Application Bootstrap & Controller
// Authentic Flash Unblock Gate -> Gaming Intro -> Arcade Menu -> Infinite Gauntlet
// ============================================================================

import './style.css';
import { Arena, GameDifficulty } from './engine/Arena';
import { sound } from './engine/Audio';
import { TelemetryTracker } from './ai/Telemetry';
import { gemmaGhost, CombatAdaptation } from './ai/GemmaGhost';
import { AIController } from './engine/AIController';
import { CemeteryManager } from './ofrenda/Cemetery';

export type GameFlowState = 'MENU' | 'INTRO' | 'FIGHTING' | 'ROUND_OVER' | 'ROAST' | 'GAME_OVER';

declare global {
  interface Window {
    __game?: KillSwitchGame;
    __setGhostLowHealth?: () => void;
    __trainingCompleted?: boolean;
    __exportedQTable?: Record<string, Record<string, number>>;
    __trainingStats?: any;
  }
}

class KillSwitchGame {
  private canvas: HTMLCanvasElement;
  public arena: Arena;
  public telemetry: TelemetryTracker;
  public aiController: AIController;
  private cemetery: CemeteryManager;

  public isRunning: boolean = false;
  public currentRound: number = 1;
  public flowState: GameFlowState = 'INTRO';
  private roundStarting: boolean = false;
  private lastAiUpdateMs: number = 0;
  private currentAdaptation: CombatAdaptation | null = null;
  private introAnimationActive: boolean = false;
  private showDebugOverlay: boolean = false;

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
    this.aiController.arena = this.arena;
    this.arena.aiController = this.aiController;
    this.aiController.onTacticalRead = (text) => this.arena.showTacticalBanner(text);
    this.cemetery = new CemeteryManager();

    this.setupUIEvents();
    this.setupWindowControls();
    this.setupInputListeners();
    this.setupRoundEndPipeline();
    this.loadSavedAIMemory();
    this.startRenderLoop();

    if (import.meta.env.DEV) {
      window.__game = this;
      window.__setGhostLowHealth = () => {
        if (this.arena?.ghost) {
          this.arena.ghost.health = 5;
        }
      };
    }

    // DEV hook: ?train=1 fast headless training mode
    if (import.meta.env.DEV) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('train') === '1') {
        import('./ai/TrainingSession').then(async ({ TrainingSession }) => {
          this.hideAllScreens();
          const dash = document.createElement('div');
          dash.id = 'training-dashboard';
          dash.style.cssText = 'position:absolute;inset:0;background:#050508;color:#00ffcc;font-family:monospace;padding:24px;z-index:99999;display:flex;flex-direction:column;gap:12px;overflow:auto;';
          dash.innerHTML = `
            <h2 style="margin:0;color:#00ffcc;">⚡ KILLSWITCH.SWF — Q-LEARNER HEADLESS TRAINING MODE (?train=1)</h2>
            <div style="color:#aaa;">Simulating 300 rounds x 5 bot archetypes (1,500 rounds) at warp speed with Gemma stubbed...</div>
            <div id="train-status" style="font-size:14px;color:#fff;font-weight:bold;">INITIALIZING TRAINING PIPELINE...</div>
            <div style="background:#222;border:1px solid #444;height:24px;width:100%;border-radius:4px;overflow:hidden;">
              <div id="train-bar" style="width:0%;height:100%;background:#00ffcc;transition:width 0.1s;"></div>
            </div>
            <pre id="train-log" style="background:#000;border:1px solid #333;color:#aaffaa;padding:12px;height:380px;overflow-y:auto;font-size:12px;margin:0;"></pre>
          `;
          document.body.appendChild(dash);

          const logEl = document.getElementById('train-log');
          const statusEl = document.getElementById('train-status');
          const barEl = document.getElementById('train-bar');

          const log = (msg: string) => {
            if (logEl) {
              logEl.textContent += msg + '\n';
              logEl.scrollTop = logEl.scrollHeight;
            }
            console.log(msg);
          };

          log('▶ Initializing TrainingSession: 5 archetypes (JUMP_KICK, TURTLE, COMBO, HEAVY_KICK, RANDOM_MIX)...');
          const session = new TrainingSession(this.arena, this.aiController, this.telemetry);

          try {
            const exportedQ = await session.runFullTraining((p) => {
              const total = 1500;
              const pct = Math.round((session.totalRoundsCompleted / total) * 100);
              if (barEl) barEl.style.width = `${pct}%`;
              if (statusEl) statusEl.innerText = `[${pct}%] BOT: ${p.bot} | ROUND: ${p.round}/300 | WIN RATE: ${p.winRate}% | EPSILON: ${this.aiController.learner.epsilon.toFixed(2)}`;
              log(`[Round ${session.totalRoundsCompleted}/1500] Bot: ${p.bot} (Round ${p.round}) — Ghost Win Rate: ${p.winRate}% | Epsilon: ${this.aiController.learner.epsilon.toFixed(2)}`);
            });

            if (barEl) barEl.style.width = '100%';
            if (statusEl) statusEl.innerText = `✓ 1,500 ROUNDS TRAINING COMPLETE! Q-TABLE EXPORT READY.`;
            log('\n========================================================');
            log('🎉 TRAINING RUN COMPLETE: 1,500 ROUNDS FINISHED');
            log('Bot archetype breakdown:');
            for (const [bot, st] of Object.entries(session.statsByBot)) {
              log(` - ${bot.padEnd(12)}: ${st.ghostWins}/${st.rounds} wins (${st.winRate}%)`);
            }
            const qStates = Object.keys(exportedQ).length;
            log(`Exported Q-Table: ${qStates} unique states retained with >=3 visits.`);
            log('========================================================\n');

            window.__trainingCompleted = true;
            window.__exportedQTable = exportedQ;
            window.__trainingStats = session.statsByBot;
          } catch (err: any) {
            if (statusEl) statusEl.innerText = `❌ TRAINING FAILED: ${err.message}`;
            log(`\n❌ ERROR: ${err.message}`);
            console.error(err);
          }
        });
        return;
      }
    }

    // DEV hook for direct round testing: ?round=N
    if (import.meta.env.DEV) {
      const params = new URLSearchParams(window.location.search);
      const testRound = params.get('round');
      if (testRound) {
        const roundNum = parseInt(testRound, 10);
        if (!isNaN(roundNum) && roundNum >= 1) {
          setTimeout(() => {
            this.hideAllScreens();
            this.startCombat(roundNum);
          }, 200);
        }
      }
    }
  }

  // --- Persistent AI Memory (Step 5) ---
  private loadSavedAIMemory() {
    try {
      const raw = localStorage.getItem('killswitch.ai.v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.learner) {
          this.aiController.learner.fromJSON(parsed.learner);
        }
        if (parsed.transitions && typeof parsed.transitions === 'object') {
          this.telemetry.transitions = parsed.transitions;
        }
      }
    } catch (err) {
      console.warn('Failed to load AI memory from localStorage:', err);
    }
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
    // Enforce tabindex="-1" and blur on click for all buttons so Space never clicks focused buttons
    document.querySelectorAll('button').forEach(btn => {
      btn.setAttribute('tabindex', '-1');
      btn.addEventListener('click', (e) => {
        (e.currentTarget as HTMLElement)?.blur();
      });
    });

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

    const diffButtons = document.querySelectorAll('.diff-btn');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const diff = btn.getAttribute('data-diff') as GameDifficulty;
        if (diff) {
          this.arena.setDifficulty(diff);
          this.aiController.setDifficulty(diff);
        }
      });
    });

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

    // Reset AI Memory
    const btnResetAI = document.getElementById('btn-reset-ai-memory');
    btnResetAI?.addEventListener('click', () => {
      try {
        localStorage.removeItem('killswitch.ai.v1');
      } catch {}
      window.location.reload();
    });

    // 5. Inter-Round Next Opponent
    const btnNextRound = document.getElementById('btn-next-round');
    btnNextRound?.addEventListener('click', () => {
      this.advanceToNextRound();
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
    if (id === 'roast-screen') this.flowState = 'ROAST';
    else if (id === 'game-over-screen') this.flowState = 'GAME_OVER';
    else if (id === 'gaming-intro-screen') this.flowState = 'INTRO';
    else if (id === 'game-menu-screen' || id === 'cemetery-screen') this.flowState = 'MENU';

    (document.activeElement as HTMLElement)?.blur();

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
      // Always prevent browser default for Space to prevent scrolling / clicking focused elements
      if (e.code === 'Space') {
        e.preventDefault();
      }

      // Ignore auto-repeat key events
      if (e.repeat) return;

      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
        return;
      }

      // F3 Debug Overlay Toggle (Step 6)
      if (e.code === 'F3') {
        e.preventDefault();
        this.showDebugOverlay = !this.showDebugOverlay;
        return;
      }

      // Fullscreen shortcut (F key outside combat)
      if (e.code === 'KeyF' && this.flowState !== 'FIGHTING') {
        document.getElementById('flash-window')?.classList.toggle('fullscreen');
        return;
      }

      // Enter / Space during intro advances to game menu
      if ((e.code === 'Enter' || e.code === 'Space') && (this.flowState === 'INTRO' || this.introAnimationActive)) {
        this.introAnimationActive = false;
        sound.playJab();
        this.showScreen('game-menu-screen');
        return;
      }

      // In ROAST screen: ONLY Enter advances to next round; Space does nothing
      if (this.flowState === 'ROAST') {
        if (e.code === 'Enter') {
          this.advanceToNextRound();
        }
        return;
      }

      // If not in FIGHTING, ignore combat keys
      if (this.flowState !== 'FIGHTING') {
        return;
      }

      if (this.keysHeld[e.code]) return;
      this.keysHeld[e.code] = true;

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
          this.telemetry.recordPlayerMove('LOW_SWEEP');
        } else {
          p.heavyKick(); // Roundhouse -> Axe Kick
          this.telemetry.recordHeavyKick();
        }
      }

      // 3. Rising Uppercut Launcher (U)
      if (e.code === 'KeyU') {
        p.uppercut();
        sound.playHeavyHit();
        this.telemetry.recordPlayerMove('UPPERCUT');
      }

      // 4. Martial Special: Flying Clinch Knee (I)
      if (e.code === 'KeyI') {
        p.flyingKnee();
        sound.playHeavyHit();
        this.telemetry.recordPlayerMove('FLYING_KNEE');
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
      if (e.code === 'Space') {
        e.preventDefault();
      }

      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
        return;
      }

      this.keysHeld[e.code] = false;

      if (!this.isRunning || this.arena.isRoundOver || this.flowState !== 'FIGHTING') return;

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

    // Handle tab visibility change (pause input / reset held keys)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.keysHeld = {};
        if (this.arena?.player) {
          this.arena.player.stopMoving();
          this.arena.player.block(false);
          this.arena.player.unCrouch();
          this.arena.player.vx = 0;
        }
        this.lastFrameTime = performance.now();
      }
    });
  }

  private handleContinuousInput() {
    if (!this.isRunning || this.arena.isRoundOver || this.flowState !== 'FIGHTING') return;

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
  public advanceToNextRound() {
    if (this.roundStarting) return;
    this.roundStarting = true;
    setTimeout(() => {
      this.roundStarting = false;
    }, 500);

    (document.activeElement as HTMLElement)?.blur();
    sound.playBypass();
    this.hideAllScreens();
    this.currentRound++;
    this.startCombat(this.currentRound);
  }

  public startCombat(roundNum: number) {
    this.currentRound = roundNum;
    this.flowState = 'FIGHTING';
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

      // Persistence: save Q-table and Markov sequence transitions
      try {
        const payload = JSON.stringify({
          learner: this.aiController.learner.toJSON(),
          transitions: this.telemetry.transitions
        });
        localStorage.setItem('killswitch.ai.v1', payload);
      } catch (err) {
        console.warn('Failed to save AI memory to localStorage:', err);
      }

      const isPlayerVictorious = winner === this.arena.player.name;
      this.flowState = isPlayerVictorious ? 'ROAST' : 'GAME_OVER';
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
        const t0 = performance.now();
        this.aiController.update();
        this.lastAiUpdateMs = performance.now() - t0;
        this.arena.update();
      }

      this.arena.render();

      if (this.showDebugOverlay) {
        this.renderDebugOverlay();
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  // --- F3 Debug Overlay (Step 6) ---
  private renderDebugOverlay() {
    const ctx = this.arena.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.fillRect(8, 8, 210, 94);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, 210, 94);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#00ffcc';
    ctx.fillText('⚡ AI Q-LEARNER DEBUG (F3)', 14, 22);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`STATE:   ${this.aiController.lastStateKey || 'NONE'}`, 14, 36);
    ctx.fillText(`ACTION:  ${this.aiController.lastBehavior || 'NONE'}`, 14, 50);
    ctx.fillText(`EPSILON: ${this.aiController.learner.epsilon.toFixed(2)}`, 14, 64);
    ctx.fillText(`REWARD:  ${this.aiController.lastReward.toFixed(2)}`, 14, 78);
    ctx.fillText(`AI TIME: ${this.lastAiUpdateMs.toFixed(3)} ms`, 14, 92);
    ctx.restore();
  }
}

// Initialize game on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new KillSwitchGame();
});
