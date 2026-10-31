// ============================================================================
// KillSwitch.swf — Adaptive AI Stickman Controller (The Flash Ghost)
// Powered by Google Gemma 3:4B with Real-Time Move Prediction & Habit Counters
// ============================================================================

import { Stickman } from './Stickman';
import { CombatAdaptation } from '../ai/GemmaGhost';
import { TelemetryTracker } from '../ai/Telemetry';
import { BehaviorLearner } from '../ai/BehaviorLearner';
import { GameDifficulty } from './Arena';
import { sound } from './Audio';

export class AIController {
  private ghost: Stickman;
  private player: Stickman;
  private telemetry?: TelemetryTracker;

  public learner: BehaviorLearner = new BehaviorLearner();
  public useLearner: boolean = true;
  public lastStateKey: string = '';
  public lastBehavior: string = '';
  public lastReward: number = 0;
  public actionCountThisRound: number = 0;

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

  // Frame queue for tick-based delays (replacing setTimeout)
  private queue: { frames: number; fn: () => void }[] = [];

  // Callback to display tactical prediction banner in Arena
  public onTacticalRead?: (readText: string) => void;

  constructor(ghost: Stickman, player: Stickman, telemetry?: TelemetryTracker, difficulty: GameDifficulty = 'veteran') {
    this.ghost = ghost;
    this.player = player;
    this.telemetry = telemetry;
    this.difficulty = difficulty;
  }

  public schedule(frames: number, fn: () => void) {
    this.queue.push({ frames, fn });
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
    this.decisionTimer = 0;
    this.parryCooldown = 0;
    this.queue = [];
    this.lastStateKey = '';
    this.lastBehavior = '';
    this.lastReward = 0;
    this.actionCountThisRound = 0;

    if (!this.ghost.canAct()) {
      this.ghost.state = 'IDLE';
      this.ghost.stateTime = 0;
      this.ghost.hitStunFrames = 0;
      this.ghost.blockStunFrames = 0;
    }
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
    // Clear scheduled actions if ghost enters hitstun
    if (this.ghost.state === 'HIT_STUN') {
      this.queue = [];
    }

    // Tick frame queue (decrements each item and runs due ones)
    for (let i = this.queue.length - 1; i >= 0; i--) {
      this.queue[i].frames--;
      if (this.queue[i].frames <= 0) {
        const item = this.queue.splice(i, 1)[0];
        item.fn();
      }
    }

    if (this.player.health <= 0 || this.player.state === 'DEFEAT') {
      this.ghost.stopMoving();
      if (this.ghost.health > 0 && this.ghost.state !== 'VICTORY') {
        this.ghost.setState('VICTORY');
      }
      return;
    }

    if (!this.ghost.canAct() || this.ghost.health <= 0) {
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
      const prediction = this.telemetry.predictNextMove();
      if (prediction && prediction.confidence >= 0.45 && this.parryCooldown <= 0) {
        if (prediction.predicted === 'HEAVY_KICK' && dist < 115) {
          this.onTacticalRead?.(`⚡ GEMMA READ: PREDICTED HEAVY KICK (${Math.round(prediction.confidence * 100)}%)`);
          this.ghost.block(true);
          sound.playBlock();
          this.parryCooldown = Math.max(50, 90 - cdReduction * 3);
          this.actionCooldown = Math.max(6, 12 - cdReduction);

          this.schedule(8, () => {
            if (this.ghost.canAct()) {
              this.ghost.block(false);
              this.ghost.uppercut(); // Counter-launch the heavy kick!
            }
          });
          return;
        }
      }
    }

    // --- 2. Defensive Reaction vs Incoming Attacks ---
    const playerHitbox = this.player.getHitbox();
    if (playerHitbox && dist < 100) {
      const baseBlockChance = this.difficulty === 'casual' ? 0.30 : (this.difficulty === 'veteran' ? 0.60 : 0.85);
      const blockChance = Math.min(0.92, baseBlockChance + (this.roundNumber - 1) * 0.04);
      if (Math.random() < blockChance) {
        if (Math.random() < 0.40) {
          this.ghost.dodgeRoll(); // Evasive tumble
        } else {
          this.ghost.block(true);
          this.schedule(12, () => this.ghost.block(false));
        }
        this.actionCooldown = Math.max(8, 16 - cdReduction);
        return;
      }
    }

    // --- 3. Q-Learning Behavior Selection (State Key & Decision) ---
    const distBucket = dist < 75 ? 'close' : (dist <= 155 ? 'mid' : 'far');
    let playerClass = 'idle';
    if (this.player.state === 'JUMP' || this.player.state === 'JUMP_KICK') {
      playerClass = 'air';
    } else if (this.player.state === 'BLOCK') {
      playerClass = 'block';
    } else if (
      this.player.state === 'JAB' || 
      this.player.state === 'CROSS_PUNCH' || 
      this.player.state === 'PALM_BURST' || 
      this.player.state === 'HEAVY_KICK' || 
      this.player.state === 'AXE_KICK' || 
      this.player.state === 'UPPERCUT' || 
      this.player.state === 'FLYING_KNEE' || 
      this.player.state === 'LOW_SWEEP'
    ) {
      playerClass = 'attack';
    }

    const cornered = (this.ghost.x <= 95 || this.ghost.x >= 705) ? '1' : '0';
    const stateKey = `${distBucket}_${playerClass}_${cornered}`;

    const allowed: string[] = [];
    if (playerClass === 'air') {
      allowed.push('ANTI_AIR', 'UPPERCUT', 'FLYING_KNEE', 'EVADE', 'RETREAT');
    } else if (playerClass === 'block') {
      allowed.push('GUARD_BREAK', 'PUNCH_CHAIN', 'KICK_CHAIN', 'EVADE', 'RETREAT');
    } else if (playerClass === 'attack') {
      allowed.push('WHIFF_PUNISH', 'FLYING_KNEE', 'EVADE', 'RETREAT');
    } else {
      if (distBucket === 'close') {
        allowed.push('PUNCH_CHAIN', 'KICK_CHAIN', 'UPPERCUT', 'FLYING_KNEE', 'GUARD_BREAK', 'EVADE', 'RETREAT');
      } else if (distBucket === 'mid') {
        allowed.push('JUMP_IN', 'FLYING_KNEE', 'KICK_CHAIN', 'EVADE', 'RETREAT');
      } else {
        allowed.push('JUMP_IN', 'FLYING_KNEE', 'RETREAT', 'EVADE');
      }
    }

    let choice = this.useLearner ? this.learner.choose(stateKey, allowed) : '';
    if (!choice || !allowed.includes(choice)) {
      if (playerClass === 'air') {
        choice = Math.random() < antiAirRate ? 'ANTI_AIR' : 'EVADE';
      } else if (playerClass === 'block') {
        choice = Math.random() < guardRate ? 'GUARD_BREAK' : 'PUNCH_CHAIN';
      } else if (playerClass === 'attack') {
        choice = Math.random() < 0.5 ? 'WHIFF_PUNISH' : 'EVADE';
      } else {
        if (distBucket === 'close') {
          choice = Math.random() < aggRate ? 'PUNCH_CHAIN' : 'KICK_CHAIN';
        } else if (distBucket === 'mid') {
          choice = Math.random() < 0.6 ? 'FLYING_KNEE' : 'JUMP_IN';
        } else {
          choice = 'JUMP_IN';
        }
      }
    }

    this.lastStateKey = stateKey;
    this.lastBehavior = choice;
    this.actionCountThisRound++;

    switch (choice) {
      case 'ANTI_AIR':
        this.onTacticalRead?.('⚡ AI LEARNER: ANTI-AIR COUNTER!');
        if (Math.random() < 0.60) {
          this.ghost.uppercut();
        } else {
          this.ghost.flyingKnee();
        }
        this.actionCooldown = Math.max(10, 22 - cdReduction);
        break;

      case 'WHIFF_PUNISH':
        this.onTacticalRead?.('⚡ AI LEARNER: WHIFF PUNISH!');
        this.ghost.flyingKnee();
        this.actionCooldown = Math.max(10, 20 - cdReduction);
        break;

      case 'GUARD_BREAK':
        this.onTacticalRead?.('⚡ AI LEARNER: LOW SWEEP GUARD-BREAK!');
        this.ghost.lowSweep();
        this.actionCooldown = Math.max(10, 20 - cdReduction);
        break;

      case 'PUNCH_CHAIN':
        this.ghost.jab();
        this.schedule(5, () => {
          if (this.ghost.canAct()) this.ghost.crossPunch();
        });
        this.schedule(11, () => {
          if (this.ghost.canAct()) this.ghost.palmBurst();
        });
        this.actionCooldown = Math.max(12, 22 - cdReduction);
        break;

      case 'KICK_CHAIN':
        this.ghost.heavyKick();
        this.schedule(7, () => {
          if (this.ghost.canAct()) this.ghost.axeKick();
        });
        this.actionCooldown = Math.max(12, 22 - cdReduction);
        break;

      case 'UPPERCUT':
        this.ghost.uppercut();
        this.actionCooldown = Math.max(12, 24 - cdReduction);
        break;

      case 'FLYING_KNEE':
        this.ghost.flyingKnee();
        this.actionCooldown = Math.max(14, 26 - cdReduction);
        break;

      case 'JUMP_IN':
        this.ghost.jump();
        this.ghost.jumpKick();
        this.actionCooldown = Math.max(14, 28 - cdReduction);
        break;

      case 'RETREAT':
        this.ghost.move(-dir);
        break;

      case 'EVADE':
        this.ghost.dodgeRoll();
        this.actionCooldown = Math.max(12, 22 - cdReduction);
        break;
    }

    if (dist > 75 && choice !== 'RETREAT' && choice !== 'EVADE') {
      this.ghost.move(dir);
    }
  }

  public onHitResult(dealt: number, taken: number): void {
    if (!this.lastStateKey || !this.lastBehavior) return;
    const reward = (dealt - taken) / 10;
    this.lastReward = reward;
    if (this.useLearner) {
      this.learner.update(this.lastStateKey, this.lastBehavior, reward);
    }
  }

  public onRoundEnd(won: boolean): void {
    if (this.lastStateKey && this.lastBehavior) {
      const reward = won ? 5 : -5;
      this.lastReward = reward;
      if (this.useLearner) {
        this.learner.update(this.lastStateKey, this.lastBehavior, reward);
      }
    }
    if (this.useLearner) {
      this.learner.endRound();
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

    // Step 2: Glitch Phase Overhead (140ms -> 8 frames)
    this.schedule(8, () => {
      if (!this.ghost.canAct() || this.ghost.health <= 0) return;
      this.onTacticalRead?.('⚠️ 0x7E5: TELEPORT [2/3] STACK CORRUPTION');
      this.ghost.flashFrames = 10;
      this.ghost.glitchOffset = -28;
      sound.playJump();
      this.ghost.x = this.player.x;
      this.ghost.y = this.ghost.groundY - 120;
      this.ghost.isGrounded = false;
    });

    // Step 3: Surprise Drop & Heavy Kick / Claw Strike Behind Player (280ms -> 17 frames)
    this.schedule(17, () => {
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
    });
  }
}
