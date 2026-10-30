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
  public roundNumber: number = 1;

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

  public setRound(roundNum: number) {
    this.roundNumber = roundNum;
    this.isRageModeActive = false;
    this.rageAttackTimer = 0;
    this.actionCooldown = 0;
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
      round: this.roundNumber,
      difficulty: this.difficulty,
      predictedOpening: this.predictedOpening,
      parryComboTrigger: this.parryComboTrigger,
      counterTactic: this.counterTactic,
      antiAir: this.antiAirPriority,
      aggression: this.aggression,
      guardBreak: this.guardBreakRate
    });

    this.onTacticalRead?.(`⚡ GEMMA 3:4B: PRIMED ${this.counterTactic} COUNTER (ROUND ${this.roundNumber})`);
  }

  public update() {
    if (!this.ghost.canAct() || this.ghost.health <= 0 || this.player.health <= 0 || this.player.state === 'DEFEAT') {
      this.ghost.stopMoving();
      if (this.ghost.health > 0 && this.ghost.state !== 'VICTORY') {
        this.ghost.setState('VICTORY');
      }
      return;
    }

    if (this.parryCooldown > 0) this.parryCooldown--;

    if (this.actionCooldown > 0) {
      this.actionCooldown--;
      return;
    }

    // Reaction frame interval scales sharper across rounds
    const roundSpeedTier = Math.floor((this.roundNumber - 1) / 2);
    const baseDelay = this.difficulty === 'casual' ? 5 : (this.difficulty === 'veteran' ? 2 : 1);
    const reactionDelay = Math.max(1, baseDelay - roundSpeedTier);
    
    this.decisionTimer++;
    if (this.decisionTimer < reactionDelay) return;
    this.decisionTimer = 0;

    const dx = this.player.x - this.ghost.x;
    const dist = Math.abs(dx);
    const dir = dx > 0 ? 1 : -1;

    // Cumulative round scaling factors
    const roundBoost = Math.min(0.35, (this.roundNumber - 1) * 0.05);
    const antiAirRate = Math.min(0.95, this.antiAirPriority + roundBoost);
    const aggRate = Math.min(0.95, this.aggression + roundBoost);
    const guardRate = Math.min(0.95, this.guardBreakRate + roundBoost);
    const cdReduction = Math.min(10, Math.floor((this.roundNumber - 1) * 1.5));

    // --- Gemma 3:4B Boss Mechanic: ActionScript Error 0x7E5 Time-Bomb ---
    const rageThreshold = Math.min(55, 35 + (this.roundNumber - 1) * 4);
    const ghostHpPercent = (this.ghost.health / this.ghost.maxHealth) * 100;
    if (ghostHpPercent <= rageThreshold && !this.isRageModeActive) {
      this.isRageModeActive = true;
      this.ghost.auraColor = '#ff0033'; // Pulsating red warning aura
      this.onTacticalRead?.('⚠️ GEMMA CORE: ACTIONSCRIPT ERROR 0x7E5 TIME-BOMB!');
      sound.playBypass();
    }

    if (this.isRageModeActive) {
      this.rageAttackTimer++;
      const rageInterval = Math.max(80, 140 - (this.roundNumber - 1) * 10);
      if (this.rageAttackTimer >= rageInterval) {
        this.rageAttackTimer = 0;
        this.executeError0x7E5TripleTeleport();
        return;
      }
    }

    // --- 0. Corner Trap Evasion (Dodge Roll to escape corner boundaries) ---
    const isGhostCornered = this.ghost.x <= 95 || this.ghost.x >= 705;
    if (isGhostCornered && dist < 120 && Math.random() < 0.65) {
      this.ghost.dodgeRoll();
      this.actionCooldown = Math.max(12, 22 - cdReduction);
      return;
    }

    // --- 1. Real-Time Move Prediction via Markov Sequence Model ---
    if (this.telemetry) {
      const prediction = this.telemetry.predictNextMove(this.player.state);
      if (prediction && prediction.confidence >= 0.45 && this.parryCooldown <= 0) {
        if (prediction.predicted === 'HEAVY_KICK' && dist < 115) {
          this.onTacticalRead?.(`⚡ GEMMA READ: PREDICTED HEAVY KICK (${Math.round(prediction.confidence * 100)}%)`);
          this.ghost.block(true);
          sound.playBlock();
          this.parryCooldown = Math.max(50, 90 - cdReduction * 3);
          this.actionCooldown = Math.max(6, 12 - cdReduction);

          setTimeout(() => {
            if (this.ghost.canAct()) {
              this.ghost.block(false);
              this.ghost.uppercut(); // Counter-launch the heavy kick!
            }
          }, 130);
          return;
        }
      }
    }

    // --- 2. Reactive Anti-Air Counter (Punishes Aerial Dive Habits) ---
    const isPlayerAirborne = this.player.state === 'JUMP' || this.player.state === 'JUMP_KICK';
    if (isPlayerAirborne && dist < 170) {
      if (Math.random() < antiAirRate) {
        if (Math.random() < 0.60) {
          // Explosive Rising Uppercut Launcher
          this.onTacticalRead?.('⚡ GEMMA READ: ANTI-AIR UPPERCUT!');
          this.ghost.uppercut();
          this.actionCooldown = Math.max(10, 22 - cdReduction);
          return;
        } else {
          // Flying Clinch Knee intercept
          this.onTacticalRead?.('⚡ GEMMA READ: FLYING KNEE INTERCEPT!');
          this.ghost.flyingKnee();
          this.actionCooldown = Math.max(10, 22 - cdReduction);
          return;
        }
      }
    }

    // --- 3. Whiff Punish: Strike when player misses attack & is recovering ---
    const isPlayerWhiffing = (this.player.state === 'JAB' && this.player.stateTime > 6) ||
                             (this.player.state === 'HEAVY_KICK' && this.player.stateTime > 12);
    if (isPlayerWhiffing && dist < 115 && Math.random() < aggRate) {
      this.onTacticalRead?.('⚡ GEMMA READ: WHIFF PUNISH!');
      this.ghost.flyingKnee();
      this.actionCooldown = Math.max(10, 20 - cdReduction);
      return;
    }

    // --- 4. Guard-Break Counter (Punishes Turtling Habits with Low Shin Sweep) ---
    if (this.player.state === 'BLOCK' && dist < 110) {
      if (Math.random() < guardRate) {
        this.onTacticalRead?.('⚡ GEMMA READ: LOW SWEEP GUARD-BREAK!');
        this.ghost.lowSweep();
        this.actionCooldown = Math.max(10, 20 - cdReduction);
        return;
      }
    }

    // --- 5. Defensive Reaction vs Incoming Attacks ---
    const playerHitbox = this.player.getHitbox();
    if (playerHitbox && dist < 100) {
      const baseBlockChance = this.difficulty === 'casual' ? 0.30 : (this.difficulty === 'veteran' ? 0.60 : 0.85);
      const blockChance = Math.min(0.92, baseBlockChance + (this.roundNumber - 1) * 0.04);
      if (Math.random() < blockChance) {
        if (Math.random() < 0.40) {
          this.ghost.dodgeRoll(); // Evasive tumble
        } else {
          this.ghost.block(true);
          setTimeout(() => this.ghost.block(false), 200);
        }
        this.actionCooldown = Math.max(8, 16 - cdReduction);
        return;
      }
    }

    // --- 6. Spacing, Pressure & Expanded Combo Strings ---
    const closeDistance = 75;
    const midDistance = 155;

    if (dist > midDistance) {
      this.ghost.move(dir);
    } else if (dist < closeDistance) {
      if (Math.random() < aggRate) {
        const roll = Math.random();
        if (roll < 0.45) {
          // 3-Hit Punch Chain (Jab -> Cross -> Palm)
          this.ghost.jab();
          setTimeout(() => {
            if (this.ghost.canAct()) this.ghost.crossPunch();
          }, 80);
          setTimeout(() => {
            if (this.ghost.canAct()) this.ghost.palmBurst();
          }, 180);
          this.actionCooldown = Math.max(12, 22 - cdReduction);
        } else if (roll < 0.70) {
          // 2-Hit Kick Chain (Roundhouse -> Axe Kick)
          this.ghost.heavyKick();
          setTimeout(() => {
            if (this.ghost.canAct()) this.ghost.axeKick();
          }, 110);
          this.actionCooldown = Math.max(12, 22 - cdReduction);
        } else if (roll < 0.88) {
          // Rising Uppercut Launcher
          this.ghost.uppercut();
          this.actionCooldown = Math.max(12, 24 - cdReduction);
        } else {
          this.ghost.flyingKnee();
          this.actionCooldown = Math.max(14, 26 - cdReduction);
        }
      } else {
        this.ghost.move(-dir);
      }
    } else {
      if (Math.random() < aggRate * 0.80) {
        if (Math.random() < 0.35) {
          this.ghost.jump();
          this.ghost.jumpKick();
          this.actionCooldown = Math.max(14, 28 - cdReduction);
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
