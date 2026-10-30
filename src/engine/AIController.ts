// ============================================================================
// KillSwitch.swf — Adaptive AI Stickman Controller (The Flash Ghost)
// Powered by Google Gemma 3:4B with Real-Time Move Prediction & Habit Counters
// ============================================================================

import { Stickman } from './Stickman';
import { CombatAdaptation } from '../ai/GemmaGhost';
import { TelemetryTracker } from '../ai/Telemetry';
import { GameDifficulty } from './Arena';
import { sound } from './Audio';

export class AIController {
  private ghost: Stickman;
  private player: Stickman;
  private telemetry?: TelemetryTracker;

  public difficulty: GameDifficulty = 'veteran';

  // Gemma-tuned adaptation parameters
  public antiAirPriority: number = 0.45;
  public aggression: number = 0.60;
  public guardBreakRate: number = 0.40;

  // Real-time Learned Habits & Counter Tactics
  public predictedOpening: string = 'JUMP_KICK';
  public parryComboTrigger: string = 'JAB';
  public counterTactic: string = 'ANTI_AIR';
  public tacticalAnalysis: string = 'Analyzing combat habits...';

  // Gemma 3:4B Designed Boss Mechanic: ActionScript Error 0x7E5 Time-Bomb
  public isRageModeActive: boolean = false;
  private rageAttackTimer: number = 0;

  private actionCooldown: number = 0;
  private decisionTimer: number = 0;
  private parryCooldown: number = 0;

  // Callback to display tactical prediction banner in Arena
  public onTacticalRead?: (readText: string) => void;

  constructor(ghost: Stickman, player: Stickman, telemetry?: TelemetryTracker, difficulty: GameDifficulty = 'veteran') {
    this.ghost = ghost;
    this.player = player;
    this.telemetry = telemetry;
    this.difficulty = difficulty;
  }

  public setTelemetry(telemetry: TelemetryTracker) {
    this.telemetry = telemetry;
  }

  public setDifficulty(diff: GameDifficulty) {
    this.difficulty = diff;
  }

  // Update dynamic weights & learned counters from Gemma 3:4B analysis
  public applyAdaptation(adaptation: CombatAdaptation) {
    let multiplier = 1.0;
    if (this.difficulty === 'casual') multiplier = 0.75;
    else if (this.difficulty === 'nightmare') multiplier = 1.25;

    this.antiAirPriority = Math.min(0.95, adaptation.antiAirPriority * multiplier);
    this.aggression = Math.min(0.95, adaptation.aggression * multiplier);
    this.guardBreakRate = Math.min(0.95, adaptation.guardBreakRate * multiplier);

    this.predictedOpening = adaptation.predictedOpening || 'JUMP_KICK';
    this.parryComboTrigger = adaptation.parryComboTrigger || 'JAB';
    this.counterTactic = adaptation.counterTactic || 'ANTI_AIR';
    this.tacticalAnalysis = adaptation.tacticalAnalysis || 'Analyzing player rhythm.';

    console.log('[AI Controller] Applied Gemma 3:4B Move Learning:', {
      difficulty: this.difficulty,
      predictedOpening: this.predictedOpening,
      parryComboTrigger: this.parryComboTrigger,
      counterTactic: this.counterTactic,
      antiAir: this.antiAirPriority,
      aggression: this.aggression,
      guardBreak: this.guardBreakRate
    });

    this.onTacticalRead?.(`⚡ GEMMA 3:4B: PRIMED ${this.counterTactic} COUNTER`);
  }

  public update() {
    if (!this.ghost.canAct() || this.ghost.health <= 0) return;

    if (this.parryCooldown > 0) this.parryCooldown--;

    if (this.actionCooldown > 0) {
      this.actionCooldown--;
      return;
    }

    // Reaction frame interval based on difficulty
    const reactionDelay = this.difficulty === 'casual' ? 6 : (this.difficulty === 'veteran' ? 3 : 1);
    this.decisionTimer++;
    if (this.decisionTimer < reactionDelay) return;
    this.decisionTimer = 0;

    const dx = this.player.x - this.ghost.x;
    const dist = Math.abs(dx);
    const dir = dx > 0 ? 1 : -1;

    // --- Gemma 3:4B Designed Boss Mechanic: ActionScript Error 0x7E5 Time-Bomb ---
    const ghostHpPercent = (this.ghost.health / this.ghost.maxHealth) * 100;
    if (ghostHpPercent <= 35 && !this.isRageModeActive) {
      this.isRageModeActive = true;
      this.ghost.auraColor = '#ff0033'; // Pulsating red warning aura
      this.onTacticalRead?.('⚠️ GEMMA CORE: ACTIONSCRIPT ERROR 0x7E5 TIME-BOMB!');
      sound.playBypass();
    }

    if (this.isRageModeActive) {
      this.rageAttackTimer++;
      if (this.rageAttackTimer >= 140) {
        this.rageAttackTimer = 0;
        this.executeError0x7E5TripleTeleport();
        return;
      }
    }

    // --- 1. Real-Time Move Prediction via Markov Sequence Model ---
    if (this.telemetry) {
      const prediction = this.telemetry.predictNextMove(this.player.state);
      if (prediction && prediction.confidence >= 0.50 && this.parryCooldown <= 0) {
        // Player is about to chain into their favorite move!
        if (prediction.predicted === 'HEAVY_KICK' && dist < 110) {
          // Anticipate heavy sweep: execute Matrix Parry & Slide Counter!
          this.onTacticalRead?.(`⚡ GEMMA READ: PREDICTED HEAVY KICK (${Math.round(prediction.confidence * 100)}%)`);
          this.ghost.block(true);
          sound.playBlock();
          this.parryCooldown = 90;
          this.actionCooldown = 12;

          setTimeout(() => {
            if (this.ghost.canAct()) {
              this.ghost.block(false);
              // Slide counter-attack
              this.ghost.heavyKick();
            }
          }, 180);
          return;
        }
      }
    }

    // --- 2. Reactive Anti-Air Counter (Punishes Aerial Dive Habits) ---
    const isPlayerAirborne = this.player.state === 'JUMP' || this.player.state === 'JUMP_KICK';
    if (isPlayerAirborne && dist < 170) {
      if (Math.random() < this.antiAirPriority) {
        if (Math.random() < 0.70) {
          // Dragon rising uppercut kick
          this.onTacticalRead?.('⚡ GEMMA READ: ANTI-AIR INTERCEPT!');
          this.ghost.heavyKick();
          this.actionCooldown = this.difficulty === 'nightmare' ? 14 : 22;
          return;
        } else {
          // Duck under flying kick, counter with snappy jab
          this.ghost.crouch();
          setTimeout(() => {
            if (this.ghost.canAct()) {
              this.ghost.unCrouch();
              this.ghost.jab();
            }
          }, 240);
          this.actionCooldown = this.difficulty === 'nightmare' ? 18 : 28;
          return;
        }
      }
    }

    // --- 3. Guard-Break Counter (Punishes Turtling Habits) ---
    if (this.player.state === 'BLOCK' && dist < 100) {
      if (Math.random() < this.guardBreakRate) {
        this.onTacticalRead?.('⚡ GEMMA READ: GUARD-BREAK COUNTER!');
        this.ghost.heavyKick();
        this.actionCooldown = this.difficulty === 'nightmare' ? 16 : 24;
        return;
      }
    }

    // --- 4. Defensive Reaction vs Incoming Attacks ---
    const playerHitbox = this.player.getHitbox();
    if (playerHitbox && dist < 95) {
      const blockChance = this.difficulty === 'casual' ? 0.25 : (this.difficulty === 'veteran' ? 0.50 : 0.75);
      if (Math.random() < blockChance) {
        this.ghost.block(true);
        setTimeout(() => this.ghost.block(false), 220);
        this.actionCooldown = 16;
        return;
      }
    }

    // --- 5. Spacing, Footsies & Aggressive Combat Chains ---
    const closeDistance = 65;
    const midDistance = 145;

    if (dist > midDistance) {
      this.ghost.move(dir);
    } else if (dist < closeDistance) {
      if (Math.random() < this.aggression) {
        const roll = Math.random();
        if (roll < 0.50) {
          this.ghost.jab();
          // Frame-trap cancel into heavy kick
          if (this.difficulty === 'nightmare' || Math.random() < 0.6) {
            setTimeout(() => {
              if (this.ghost.canAct()) this.ghost.heavyKick();
            }, 100);
          }
          this.actionCooldown = 18;
        } else if (roll < 0.88) {
          this.ghost.heavyKick();
          this.actionCooldown = 24;
        } else {
          this.ghost.jump();
          this.ghost.jumpKick();
          this.actionCooldown = 30;
        }
      } else {
        this.ghost.move(-dir);
      }
    } else {
      if (Math.random() < this.aggression * 0.75) {
        if (Math.random() < 0.35) {
          this.ghost.jump();
          this.ghost.jumpKick();
          this.actionCooldown = 32;
        } else {
          this.ghost.move(dir);
        }
      } else {
        this.ghost.stopMoving();
      }
    }
  }

  /**
   * ActionScript Error 0x7E5: Time-Bomb Triple Teleport
   * Designed by Google Gemma 3:4B as the signature rage mechanic for Flash Ghost (HP <= 35%)
   */
  public executeError0x7E5TripleTeleport() {
    if (!this.ghost.canAct() || this.ghost.health <= 0) return;

    this.actionCooldown = 40;
    this.ghost.stopMoving();

    // Step 1: Glitch Phase Behind (0ms)
    this.onTacticalRead?.('⚠️ 0x7E5: TELEPORT [1/3] MEMORY OVERFLOW');
    this.ghost.flashFrames = 10;
    this.ghost.glitchOffset = 24;
    sound.playBypass();
    this.ghost.x = this.player.x - 110 * this.player.facing;
    this.ghost.facing = this.player.facing;

    // Step 2: Glitch Phase Overhead (140ms)
    setTimeout(() => {
      if (!this.ghost.canAct() || this.ghost.health <= 0) return;
      this.onTacticalRead?.('⚠️ 0x7E5: TELEPORT [2/3] STACK CORRUPTION');
      this.ghost.flashFrames = 10;
      this.ghost.glitchOffset = -28;
      sound.playJump();
      this.ghost.x = this.player.x;
      this.ghost.y = this.ghost.groundY - 120;
      this.ghost.isGrounded = false;
    }, 140);

    // Step 3: Surprise Drop & Heavy Kick / Claw Strike Behind Player (280ms)
    setTimeout(() => {
      if (!this.ghost.canAct() || this.ghost.health <= 0) return;
      this.onTacticalRead?.('⚠️ 0x7E5: TIME-BOMB SURPRISE CLAW EXECUTION!');
      this.ghost.flashFrames = 14;
      this.ghost.glitchOffset = 0;
      this.ghost.y = this.ghost.groundY;
      this.ghost.isGrounded = true;
      this.ghost.x = this.player.x - 65 * this.player.facing;
      this.ghost.facing = this.player.facing;
      sound.playBypass();
      this.ghost.heavyKick();
    }, 280);
  }
}
