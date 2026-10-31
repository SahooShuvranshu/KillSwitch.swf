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
  public roundBonusType: 'NONE' | 'DAMAGE' | 'HP' | 'SPEED' = 'NONE';

  // Human-like limits & cooldowns
  public blockCooldownTimer: number = 0;
  public dodgeCooldownTimer: number = 0;
  public attackGapTimer: number = 0;
  public rageActiveTimer: number = 0;
  public consecutiveEvasiveCount: number = 0;
  public defenseReactionTimer: number = 0;
  public defenseCooldown: number = 0;

  // Assist tracking (hidden)
  public playerLossStreak: number = 0;
  public playerWinStreak: number = 0;
  public isAssistActive: boolean = false;

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
  public arena?: import('./Arena').Arena;

  constructor(ghost: Stickman, player: Stickman, telemetry?: TelemetryTracker, difficulty: GameDifficulty = 'veteran') {
    this.ghost = ghost;
    this.player = player;
    this.telemetry = telemetry;
    this.setDifficulty(difficulty);
  }

  public schedule(frames: number, fn: () => void) {
    this.queue.push({ frames, fn });
  }

  public setTelemetry(telemetry: TelemetryTracker) {
    this.telemetry = telemetry;
  }

  public setDifficulty(diff: GameDifficulty) {
    this.difficulty = diff;
    this.useLearner = (diff !== 'casual');
    this.learner.configureDifficulty(diff);
    if (diff === 'veteran' || diff === 'nightmare') {
      this.learner.resetToPretrained();
      this.learner.configureDifficulty(diff);
    }
  }

  public setRound(roundNum: number) {
    this.roundNumber = roundNum;
    this.isRageModeActive = false;
    this.rageAttackTimer = 0;
    this.rageActiveTimer = 0;
    this.actionCooldown = 0;
    this.decisionTimer = 0;
    this.parryCooldown = 0;
    this.blockCooldownTimer = 0;
    this.dodgeCooldownTimer = 0;
    this.attackGapTimer = 0;
    this.consecutiveEvasiveCount = 0;
    this.defenseReactionTimer = 0;
    this.defenseCooldown = 0;
    this.queue = [];
    this.lastStateKey = '';
    this.lastBehavior = '';
    this.lastReward = 0;
    this.actionCountThisRound = 0;

    if (this.arena) {
      this.roundBonusType = this.arena.roundBonusType;
    }

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
    // Clear scheduled actions and reset timers if ghost enters hitstun
    if (this.ghost.state === 'HIT_STUN') {
      this.queue = [];
      this.defenseReactionTimer = 0;
      this.actionCooldown = 0;
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
    if (this.blockCooldownTimer > 0) this.blockCooldownTimer--;
    if (this.dodgeCooldownTimer > 0) this.dodgeCooldownTimer--;
    if (this.attackGapTimer > 0) this.attackGapTimer--;
    if (this.defenseCooldown > 0) this.defenseCooldown--;

    // 6-Second Rage Mode Limit (Nightmare only)
    if (this.isRageModeActive) {
      this.rageActiveTimer++;
      if (this.rageActiveTimer >= 360) {
        this.isRageModeActive = false;
        this.ghost.auraColor = null;
        this.onTacticalRead?.('⚠️ ACTIONSCRIPT ERROR 0x7E5 EXPIRED');
      }
    }

    // Reaction frame interval & human-like limits per tier
    let baseReactionDelay = 15;
    let baseMistakeRate = 0.12;
    let baseBlockChance = 0.50;
    let dodgeCooldownMax = 100;
    let markovProb = 0.35;
    let minAttackGap = 20;

    if (this.difficulty === 'casual') {
      baseReactionDelay = 24;
      baseMistakeRate = 0.20;
      baseBlockChance = 0.35;
      dodgeCooldownMax = 150;
      markovProb = 0.15;
      minAttackGap = 26;
    } else if (this.difficulty === 'veteran') {
      baseReactionDelay = 15;
      baseMistakeRate = 0.14;
      baseBlockChance = 0.42;
      dodgeCooldownMax = 100;
      markovProb = 0.35;
      minAttackGap = 20;
    } else if (this.difficulty === 'nightmare') {
      baseReactionDelay = 10;
      baseMistakeRate = 0.05;
      baseBlockChance = 0.68;
      dodgeCooldownMax = 70;
      markovProb = 0.60;
      minAttackGap = 12;
    }

    // Only apply speed bonus if SPEED was selected for this round (never stacked with HP or DMG)
    let speedBonus = 0;
    if (this.roundBonusType === 'SPEED') {
      const scalingRate = this.difficulty === 'casual' ? 0.02 : 0.04;
      const scalingCap = this.difficulty === 'casual' ? 0.10 : 0.25;
      const roundScaling = Math.min(scalingCap, (this.roundNumber - 1) * scalingRate);
      speedBonus = Math.round(roundScaling * 5); // 0 to 1 frame
    }

    let reactionDelay = Math.max(1, baseReactionDelay - speedBonus);
    let mistakeRate = baseMistakeRate;

    // Assist: if the player lost the last 2 rounds, ease the next round (reaction delay +4 frames, mistakes +8%)
    if (this.isAssistActive) {
      reactionDelay += 4;
      mistakeRate += 0.08;
    }

    const dx = this.player.x - this.ghost.x;
    const dist = Math.abs(dx);
    const dir = dx > 0 ? 1 : -1;

    // Defensive Reaction with strict Human Reaction Delay
    // The ghost must never react on the same frame as a player input!
    // It initiates a non-zero reaction timer (at least 2 frames) before raising defense.
    const isPlayerStriking = (this.player.getHitbox() !== null) || [
      'JAB', 'CROSS_PUNCH', 'PALM_BURST', 'HEAVY_KICK', 'AXE_KICK', 'UPPERCUT', 'FLYING_KNEE', 'LOW_SWEEP', 'JUMP_KICK'
    ].includes(this.player.state);

    const defReactionFrames = this.difficulty === 'casual' ? 3 : 2;
    if (isPlayerStriking && dist < 120 && this.defenseReactionTimer === 0 && this.defenseCooldown <= 0) {
      this.defenseReactionTimer = defReactionFrames;
    }

    if (this.defenseReactionTimer > 0) {
      this.defenseReactionTimer--;
      if (this.defenseReactionTimer === 0 && this.ghost.canAct()) {
        this.defenseCooldown = 15;
        if (Math.random() < baseBlockChance) {
          if (Math.random() < 0.35 && this.dodgeCooldownTimer <= 0) {
            this.ghost.dodgeRoll();
            this.dodgeCooldownTimer = dodgeCooldownMax;
            this.actionCooldown = 12;
            return;
          } else if (this.blockCooldownTimer <= 0) {
            this.ghost.block(true);
            this.blockCooldownTimer = 25;
            this.schedule(8, () => {
              if (this.ghost.state === 'BLOCK') this.ghost.block(false);
            });
            this.actionCooldown = 8;
            return;
          }
        }
      }
    }

    if (this.actionCooldown > 0) {
      this.actionCooldown--;
      if (this.lastBehavior !== 'RETREAT' && this.lastBehavior !== 'EVADE' && dist > 70 && this.ghost.isGrounded && this.ghost.canAct()) {
        this.ghost.move(dir);
      }
      return;
    }

    this.decisionTimer++;
    if (this.decisionTimer < reactionDelay) {
      if (this.lastBehavior !== 'RETREAT' && this.lastBehavior !== 'EVADE' && dist > 70 && this.ghost.isGrounded && this.ghost.canAct()) {
        this.ghost.move(dir);
      } else if (this.lastBehavior === 'RETREAT' && this.ghost.isGrounded && this.ghost.canAct()) {
        this.ghost.move(-dir);
      }
      return;
    }
    this.decisionTimer = 0;

    // Check for mistake: random legal behavior or hesitation
    const isMistake = Math.random() < mistakeRate;
    let makeHesitation = false;
    let makeRandomAction = false;
    if (isMistake) {
      if (Math.random() < 0.5) makeHesitation = true;
      else makeRandomAction = true;
    }

    if (makeHesitation) {
      this.actionCooldown = Math.max(6, Math.floor(reactionDelay / 2));
      return;
    }

    // --- Rage Mode 0x7E5: Nightmare ONLY, 6-second limit ---
    if (this.difficulty === 'nightmare') {
      const rageThreshold = Math.min(55, 35 + (this.roundNumber - 1) * 4);
      const ghostHpPercent = (this.ghost.health / this.ghost.maxHealth) * 100;
      if (ghostHpPercent <= rageThreshold && !this.isRageModeActive && this.rageActiveTimer < 360) {
        this.isRageModeActive = true;
        this.ghost.auraColor = '#ff0033';
        this.onTacticalRead?.('⚠️ GEMMA CORE: ACTIONSCRIPT ERROR 0x7E5 TIME-BOMB!');
        sound.playBypass();
      }

      if (this.isRageModeActive) {
        this.rageAttackTimer++;
        const rageInterval = Math.max(80, 140 - (this.roundNumber - 1) * 10);
        if (this.rageAttackTimer >= rageInterval) {
          this.rageAttackTimer = 0;
          this.executeError0x7E5TripleTeleport();
          this.attackGapTimer = minAttackGap;
          return;
        }
      }
    }

    // --- 0. Corner Trap Evasion (Dodge Roll to escape corner boundaries) ---
    const isGhostCornered = this.ghost.x <= 95 || this.ghost.x >= 705;
    if (isGhostCornered && dist < 120 && Math.random() < 0.65 && this.dodgeCooldownTimer <= 0) {
      this.ghost.dodgeRoll();
      this.dodgeCooldownTimer = dodgeCooldownMax;
      this.actionCooldown = 18;
      return;
    }

    // --- 0b. Obstacle Avoidance & Unstick Logic (Leap or smash obstacles blocking path) ---
    if (this.arena && this.ghost.isGrounded) {
      for (const obs of this.arena.obstacles) {
        if (obs.isPlatform || (obs.isDestructible && obs.hp <= 0)) continue;
        const toCrate = (obs.x + obs.w / 2) - this.ghost.x;
        const crateDist = Math.abs(toCrate);
        const inFront = (toCrate * dir) > 0;
        if (inFront && crateDist < (obs.w / 2 + 38)) {
          if (Math.random() < 0.6) {
            this.ghost.move(dir);
            this.ghost.jump();
            this.actionCooldown = 18;
          } else {
            this.ghost.heavyKick();
            this.actionCooldown = 16;
            this.attackGapTimer = minAttackGap;
          }
          return;
        }
      }
    }

    // --- 1. Real-Time Move Prediction via Markov Sequence Model ---
    if (this.telemetry && Math.random() < markovProb && this.attackGapTimer <= 0) {
      const prediction = this.telemetry.predictNextMove();
      if (prediction && prediction.confidence >= 0.45 && this.parryCooldown <= 0 && this.blockCooldownTimer <= 0) {
        if (prediction.predicted === 'HEAVY_KICK' && dist < 115) {
          this.onTacticalRead?.(`⚡ GEMMA READ: PREDICTED HEAVY KICK (${Math.round(prediction.confidence * 100)}%)`);
          this.ghost.block(true);
          sound.playBlock();
          this.blockCooldownTimer = 25;
          this.parryCooldown = 70;
          this.actionCooldown = 10;

          this.schedule(8, () => {
            if (this.ghost.canAct()) {
              this.ghost.block(false);
              this.ghost.uppercut();
              this.attackGapTimer = minAttackGap;
            }
          });
          return;
        }
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

    let allowed: string[] = [];
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

    // Dodge cooldown constraint on EVADE
    if (this.dodgeCooldownTimer > 0) {
      allowed = allowed.filter(b => b !== 'EVADE');
    }

    // Minimum attack gap constraint: ghost cannot initiate new attack during gap
    if (this.attackGapTimer > 0) {
      allowed = allowed.filter(b => b === 'RETREAT' || b === 'EVADE');
      if (allowed.length === 0) {
        if (dist < 85 && this.ghost.isGrounded && this.ghost.canAct()) {
          this.ghost.move(-dir);
        }
        return;
      }
    }

    // Anti-Passivity Rule:
    // If ghost is behind or equal on HP and under 50% of round time is left (roundTime <= 49),
    // forbid RETREAT/EVADE chains (max 1 in a row)
    const isRoundTimeUnderHalf = this.arena ? (this.arena.roundTime <= 49) : false;
    const isHpBehindOrEqual = this.ghost.health <= this.player.health;
    if (isRoundTimeUnderHalf && isHpBehindOrEqual && this.consecutiveEvasiveCount >= 1) {
      allowed = allowed.filter(b => b !== 'RETREAT' && b !== 'EVADE');
      if (allowed.length === 0) {
        allowed.push('PUNCH_CHAIN', 'FLYING_KNEE', 'JUMP_IN');
      }
    }

    let choice = '';
    if (makeRandomAction && allowed.length > 0) {
      const rIdx = Math.floor(Math.random() * allowed.length);
      choice = allowed[rIdx];
    } else if (this.useLearner) {
      choice = this.learner.choose(stateKey, allowed);
    }

    if (!choice || !allowed.includes(choice)) {
      if (playerClass === 'air') {
        choice = Math.random() < 0.60 ? 'ANTI_AIR' : 'EVADE';
      } else if (playerClass === 'block') {
        choice = Math.random() < 0.50 ? 'GUARD_BREAK' : 'PUNCH_CHAIN';
      } else if (playerClass === 'attack') {
        choice = Math.random() < 0.45 ? 'WHIFF_PUNISH' : 'RETREAT';
      } else {
        if (distBucket === 'close') {
          choice = Math.random() < 0.60 ? 'PUNCH_CHAIN' : 'KICK_CHAIN';
        } else if (distBucket === 'mid') {
          choice = Math.random() < 0.55 ? 'FLYING_KNEE' : 'JUMP_IN';
        } else {
          choice = 'JUMP_IN';
        }
      }
      if (!allowed.includes(choice) && allowed.length > 0) {
        choice = allowed[0];
      }
    }

    if (choice === 'RETREAT' || choice === 'EVADE') {
      this.consecutiveEvasiveCount++;
    } else {
      this.consecutiveEvasiveCount = 0;
    }

    this.lastStateKey = stateKey;
    this.lastBehavior = choice;
    this.actionCountThisRound++;

    const isAttackBehavior = [
      'ANTI_AIR', 'WHIFF_PUNISH', 'GUARD_BREAK', 'PUNCH_CHAIN', 
      'KICK_CHAIN', 'UPPERCUT', 'FLYING_KNEE', 'JUMP_IN'
    ].includes(choice);

    if (isAttackBehavior) {
      this.attackGapTimer = minAttackGap;
    }

    if (choice === 'EVADE') {
      this.dodgeCooldownTimer = dodgeCooldownMax;
    }

    switch (choice) {
      case 'ANTI_AIR':
        this.onTacticalRead?.('⚡ AI LEARNER: ANTI-AIR COUNTER!');
        if (Math.random() < 0.60) {
          this.ghost.uppercut();
        } else {
          this.ghost.flyingKnee();
        }
        this.actionCooldown = 18;
        break;

      case 'WHIFF_PUNISH':
        this.onTacticalRead?.('⚡ AI LEARNER: WHIFF PUNISH!');
        this.ghost.flyingKnee();
        this.actionCooldown = 16;
        break;

      case 'GUARD_BREAK':
        this.onTacticalRead?.('⚡ AI LEARNER: LOW SWEEP GUARD-BREAK!');
        this.ghost.lowSweep();
        this.actionCooldown = 16;
        break;

      case 'PUNCH_CHAIN':
        this.ghost.jab();
        this.schedule(5, () => {
          if (this.ghost.canAct()) this.ghost.crossPunch();
        });
        this.schedule(11, () => {
          if (this.ghost.canAct()) this.ghost.palmBurst();
        });
        this.actionCooldown = 20;
        break;

      case 'KICK_CHAIN':
        this.ghost.heavyKick();
        this.schedule(7, () => {
          if (this.ghost.canAct()) this.ghost.axeKick();
        });
        this.actionCooldown = 20;
        break;

      case 'UPPERCUT':
        this.ghost.uppercut();
        this.actionCooldown = 22;
        break;

      case 'FLYING_KNEE':
        this.ghost.flyingKnee();
        this.actionCooldown = 24;
        break;

      case 'JUMP_IN':
        this.ghost.jump();
        this.ghost.jumpKick();
        this.actionCooldown = 26;
        break;

      case 'RETREAT':
        this.ghost.move(-dir);
        break;

      case 'EVADE':
        this.ghost.dodgeRoll();
        this.actionCooldown = 20;
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

    // Assist Tracking: if player lost last 2 rounds, ease next round; if won last 2, return to normal
    if (won) {
      this.playerLossStreak++;
      this.playerWinStreak = 0;
    } else {
      this.playerWinStreak++;
      this.playerLossStreak = 0;
    }

    if (this.playerLossStreak >= 2) {
      this.isAssistActive = true;
    } else if (this.playerWinStreak >= 2) {
      this.isAssistActive = false;
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
