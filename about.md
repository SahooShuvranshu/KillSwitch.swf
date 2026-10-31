# KillSwitch.swf — Technical Architecture & Combat Systems Report

> **SECURITY AUDIT NOTICE**: Zero secrets, private tokens, cloud credentials, or API keys are stored in this repository. Local Google Gemma 3:4B runs via offline local Ollama at `http://127.0.0.1:11434/api/generate` with zero authorization tokens or external cloud dependencies.

---

## A. FULL FILES (VERBATIM)

### 1. `src/engine/AIController.ts`

```typescript
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
```

---

### 2. `src/ai/Telemetry.ts`

```typescript
// ============================================================================
// KillSwitch.swf — Player Combat Telemetry & Move Habit Learning Engine
// Real-time Markov sequence tracking & player behavioral fingerprinting
// ============================================================================

export interface PlayerHabits {
  openingMove: string;
  favoriteCombo: string;
  topComboCount: number;
  aerialRatio: number;
  turtleRatio: number;
  predictiveConfidence: number;
  predictiveRead: string;
}

export interface RoundTelemetry {
  round: number;
  playerName: string;
  jumpKicks: number;
  punches: number;
  heavyKicks: number;
  blocksHeldFrames: number;
  blocksCount: number;
  damageDealt: number;
  damageTaken: number;
  hitsLanded: number;
  hitsWhiffed: number;
  winner: string;
  durationSeconds: number;
  dominantStyle: string;
  habits: PlayerHabits;
}

export class TelemetryTracker {
  private currentRound: number = 1;
  private playerName: string = 'XiaoXiao_04';

  public jumpKicks: number = 0;
  public punches: number = 0;
  public heavyKicks: number = 0;
  public blocksHeldFrames: number = 0;
  public blocksCount: number = 0;
  public damageDealt: number = 0;
  public damageTaken: number = 0;
  public hitsLanded: number = 0;
  public hitsWhiffed: number = 0;

  // Real-time Move History & Transition Matrix (Markov sequence learning)
  public moveHistory: string[] = [];
  public transitions: Record<string, Record<string, number>> = {};
  public openingMove: string = 'NONE';
  private startTime: number = Date.now();

  constructor(playerName: string = 'XiaoXiao_04') {
    this.playerName = playerName;
  }

  public setPlayerName(name: string) {
    this.playerName = name;
  }

  public startRound(roundNum: number) {
    this.currentRound = roundNum;
    this.jumpKicks = 0;
    this.punches = 0;
    this.heavyKicks = 0;
    this.blocksHeldFrames = 0;
    this.blocksCount = 0;
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.hitsLanded = 0;
    this.hitsWhiffed = 0;
    this.openingMove = 'NONE';
    this.startTime = Date.now();
  }

  // Record player action and update learned transition probabilities
  public recordPlayerMove(move: 'JAB' | 'HEAVY_KICK' | 'JUMP_KICK' | 'BLOCK' | 'JUMP') {
    // 1. Detect opening move within first 2.5 seconds
    if (this.openingMove === 'NONE' && (Date.now() - this.startTime) < 2500) {
      this.openingMove = move;
    }

    // 2. Update sequence transition frequencies (Bigram learning)
    if (this.moveHistory.length > 0) {
      const prev = this.moveHistory[this.moveHistory.length - 1];
      if (!this.transitions[prev]) {
        this.transitions[prev] = {};
      }
      this.transitions[prev][move] = (this.transitions[prev][move] || 0) + 1;
    }

    this.moveHistory.push(move);
    if (this.moveHistory.length > 40) {
      this.moveHistory.shift();
    }

    // Increment raw stats
    if (move === 'JUMP_KICK') this.jumpKicks++;
    else if (move === 'JAB') this.punches++;
    else if (move === 'HEAVY_KICK') this.heavyKicks++;
    else if (move === 'BLOCK') this.blocksCount++;
  }

  public recordJumpKick() {
    this.recordPlayerMove('JUMP_KICK');
  }

  public recordPunch() {
    this.recordPlayerMove('JAB');
  }

  public recordHeavyKick() {
    this.recordPlayerMove('HEAVY_KICK');
  }

  public recordBlock() {
    this.recordPlayerMove('BLOCK');
  }

  public recordJump() {
    this.recordPlayerMove('JUMP');
  }

  // Real-time Next-Move Predictor: predicts what the player will do next
  public predictNextMove(currentMove: string): { predicted: string; confidence: number } | null {
    const nextTransitions = this.transitions[currentMove];
    if (!nextTransitions) return null;

    let total = 0;
    let highestCount = 0;
    let mostLikely = '';

    for (const [next, count] of Object.entries(nextTransitions)) {
      total += count;
      if (count > highestCount) {
        highestCount = count;
        mostLikely = next;
      }
    }

    if (total >= 2 && highestCount / total >= 0.45) {
      return { predicted: mostLikely, confidence: highestCount / total };
    }
    return null;
  }

  public updateBlockHolding() {
    this.blocksHeldFrames++;
  }

  public recordDamageDealt(dmg: number) {
    this.damageDealt += dmg;
    this.hitsLanded++;
  }

  public recordDamageTaken(dmg: number) {
    this.damageTaken += dmg;
  }

  public recordWhiff() {
    this.hitsWhiffed++;
  }

  public compileSummary(winner: string): RoundTelemetry {
    const elapsed = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

    // Find the player's favorite combo chain
    let favoriteCombo = 'None';
    let topComboCount = 0;

    for (const [firstMove, targets] of Object.entries(this.transitions)) {
      for (const [secondMove, count] of Object.entries(targets)) {
        if (count > topComboCount) {
          topComboCount = count;
          favoriteCombo = `${firstMove} -> ${secondMove}`;
        }
      }
    }

    const totalAttacks = Math.max(1, this.jumpKicks + this.punches + this.heavyKicks);
    const aerialRatio = this.jumpKicks / totalAttacks;
    const turtleRatio = Math.min(1.0, this.blocksHeldFrames / (elapsed * 60 * 0.4));

    let predictiveRead = 'Balanced brawler without obvious habit patterns.';
    let predictiveConfidence = 0.5;

    if (aerialRatio >= 0.5) {
      predictiveRead = `Habitual Aerial Diver: ${Math.round(aerialRatio * 100)}% of attacks are jump-kicks. Highly vulnerable to rising anti-air.`;
      predictiveConfidence = Math.min(0.95, 0.5 + aerialRatio * 0.4);
    } else if (topComboCount >= 4) {
      predictiveRead = `Combo Repeater: Frequently chains ${favoriteCombo} (${topComboCount} times). Vulnerable to frame-trap parry.`;
      predictiveConfidence = 0.85;
    } else if (turtleRatio >= 0.45) {
      predictiveRead = `Defensive Turtle: Relies on guarding after attacks. Vulnerable to guard-breaking heavy sweep.`;
      predictiveConfidence = 0.88;
    }

    // Determine dominant playstyle
    let dominantStyle = 'Balanced Brawler';
    if (this.jumpKicks > this.punches && this.jumpKicks > this.heavyKicks && this.jumpKicks >= 4) {
      dominantStyle = 'Xiao Xiao Aerial Diver';
    } else if (this.blocksHeldFrames > 120 || this.blocksCount > 6) {
      dominantStyle = 'Turtle Defensive Camper';
    } else if (this.punches >= 10 && this.heavyKicks < 3) {
      dominantStyle = 'Button-Mashing Jab Masher';
    } else if (this.heavyKicks >= 6) {
      dominantStyle = 'Heavy Roundhouse Aggressor';
    }

    return {
      round: this.currentRound,
      playerName: this.playerName,
      jumpKicks: this.jumpKicks,
      punches: this.punches,
      heavyKicks: this.heavyKicks,
      blocksHeldFrames: this.blocksHeldFrames,
      blocksCount: this.blocksCount,
      damageDealt: this.damageDealt,
      damageTaken: this.damageTaken,
      hitsLanded: this.hitsLanded,
      hitsWhiffed: this.hitsWhiffed,
      winner,
      durationSeconds: elapsed,
      dominantStyle,
      habits: {
        openingMove: this.openingMove !== 'NONE' ? this.openingMove : 'CAUTIOUS_APPROACH',
        favoriteCombo,
        topComboCount,
        aerialRatio,
        turtleRatio,
        predictiveConfidence,
        predictiveRead
      }
    };
  }
}
```

---

### 3. `src/ai/GemmaGhost.ts` (Exported Signatures, Prompt Building & Response Parsing)

#### Exported Signatures

```typescript
export interface CombatAdaptation {
  roast: string;
  predictedOpening: string;
  parryComboTrigger: string;
  counterTactic: 'ANTI_AIR' | 'PARRY_PUNISH' | 'GUARD_SHATTER' | 'RUSHDOWN';
  antiAirPriority: number;
  aggression: number;
  guardBreakRate: number;
  tacticalAnalysis: string;
}

export class GemmaGhostBridge {
  public resetMemory(): void;
  public async streamCombatAnalysis(
    currentTelemetry: RoundTelemetry,
    onSpeechChunk: (cleanSpeech: string) => void,
    onAdaptation: (adaptation: CombatAdaptation) => void
  ): Promise<void>;
  public async generateCalaverita(
    gameTitle: string,
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void
  ): Promise<void>;
}

export const gemmaGhost: GemmaGhostBridge;
```

#### Prompt-Building Logic (Verbatim from `streamCombatAnalysis`)

```typescript
    // Build cumulative evolutionary history prompt
    let historyContext = '';
    if (this.matchHistory.length > 1) {
      historyContext = `\nPREVIOUS ROUNDS RECAP:\n` + this.matchHistory.slice(0, -1).map(h => 
        `- Round ${h.round}: Winner=${h.winner}, Style='${h.dominantStyle}', JumpKicks=${h.jumpKicks}, Blocks=${h.blocksCount}, FavoriteCombo='${h.habits?.favoriteCombo || "none"}'`
      ).join('\n') + `\nNotice if the player adapted or changed habits between rounds!`;
    }

    const systemPrompt = `You are the Ghost of Adobe Flash Player (executed in 2021 by Adobe's time-bomb kill switch).
You are an ActionScript 2.0 martial arts commentator dueling a stickman player.
Task: Roast the player's fighting habits in 2 short, witty sentences of pure natural speech.
CRITICAL FORMAT RULES:
- DO NOT OUTPUT ANY JSON.
- DO NOT OUTPUT BRACKETS, BRACES { }, OR CODE BLOCKS.
- Speak in nostalgic 2000s Newgrounds / Flash slang (mention dial-up lag, preloader bars, Xiao Xiao, or 2021 time-bombs).

Reply in EXACTLY this format:
TALK: <Your 2-sentence sarcastic taunt calling out their habits or dive-kick spam>
TACTICS: opening=JUMP_KICK; counter=ANTI_AIR; antiAir=0.85; aggression=0.75; guardBreak=0.55; reason=Countering aerial dive kicks with rising dragon sweep.`;

    const userPrompt = `Round ${currentTelemetry.round} Just Ended:
Player "${currentTelemetry.playerName}":
- Winner: ${currentTelemetry.winner}
- Dominant Style: ${currentTelemetry.dominantStyle}
- Opening Move Used: ${currentTelemetry.habits.openingMove}
- Favorite Move Combo: ${currentTelemetry.habits.favoriteCombo} (used ${currentTelemetry.habits.topComboCount} times)
- Aerial Dive Rate: ${Math.round(currentTelemetry.habits.aerialRatio * 100)}% of attacks
- Turtle Rate: ${Math.round(currentTelemetry.habits.turtleRatio * 100)}%
- Predictive Habit: ${currentTelemetry.habits.predictiveRead}
- Jump-Kicks: ${currentTelemetry.jumpKicks} | Punches: ${currentTelemetry.punches} | Kicks: ${currentTelemetry.heavyKicks} | Blocks: ${currentTelemetry.blocksCount}
${historyContext}

Formulate your spoken taunt and tactical adaptation:`;
```

#### Response-Parsing Methods (Verbatim from `GemmaGhost.ts`)

```typescript
  // Extracts pure dialogue without JSON braces or keys
  private extractCleanDialogue(raw: string): string {
    let text = raw;

    // 1. If TALK: or SPEECH: header is found, extract only the natural speech
    const talkMatch = text.match(/(?:TALK|SPEECH):\s*([\s\S]*?)(?=(?:TACTICS:|ADAPTATION:|```|\{|$))/i);
    if (talkMatch && talkMatch[1].trim()) {
      return talkMatch[1].replace(/["*{}\[\]]/g, '').replace(/\r?\n+/g, ' ').trim();
    }

    // 2. If model output JSON like {"roast": "..."} or {"speech": "..."}
    const jsonFieldMatch = text.match(/"(?:roast|speech|dialogue|text)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/i);
    if (jsonFieldMatch && jsonFieldMatch[1].trim()) {
      return jsonFieldMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').trim();
    }

    // 3. Cut off everything starting at TACTICS:, ADAPTATION:, ```, or {
    const cutIndex = text.search(/(?:TACTICS:|ADAPTATION:|```|\{)/i);
    if (cutIndex !== -1) {
      text = text.substring(0, cutIndex);
    }

    // 4. Clean remaining punctuation / noise
    text = text
      .replace(/^[\s"':{}[\],]+/, '')
      .replace(/["*{}\[\]]/g, '')
      .replace(/antiAirPriority|aggression|guardBreakRate|counterTactic|roast/gi, '')
      .replace(/\r?\n+/g, ' ')
      .trim();

    return text || 'ActionScript 2.0 telemetry analyzing...';
  }

  private extractAdaptation(text: string, telemetry: RoundTelemetry): CombatAdaptation {
    // 1. Try key-value TACTICS: line
    const tacticsMatch = text.match(/TACTICS:\s*([^\r\n]+)/i);
    if (tacticsMatch) {
      const line = tacticsMatch[1];
      const getVal = (key: string, def: string) => {
        const m = line.match(new RegExp(`${key}=([^;\\s]+)`, 'i'));
        return m ? m[1].trim() : def;
      };
      const getNum = (key: string, def: number) => {
        const m = line.match(new RegExp(`${key}=([0-9.]+)`, 'i'));
        return m ? parseFloat(m[1]) : def;
      };

      const opening = getVal('opening', telemetry.habits?.openingMove || 'JUMP_KICK');
      const counterRaw = getVal('counter', 'ANTI_AIR').toUpperCase();
      const validCounters = ['ANTI_AIR', 'PARRY_PUNISH', 'GUARD_SHATTER', 'RUSHDOWN'];
      const counter = (validCounters.includes(counterRaw) ? counterRaw : 'ANTI_AIR') as any;

      const antiAir = Math.min(0.95, Math.max(0.1, getNum('antiAir', 0.65)));
      const aggression = Math.min(0.95, Math.max(0.2, getNum('aggression', 0.70)));
      const guardBreak = Math.min(0.95, Math.max(0.1, getNum('guardBreak', 0.45)));

      const reasonMatch = line.match(/reason=([^;\r\n]+)/i);
      const reason = reasonMatch ? reasonMatch[1].trim() : 'Analyzing combat habits.';

      const cleanRoast = this.extractCleanDialogue(text);
      return {
        roast: cleanRoast || this.generateProceduralFallback(telemetry).roast,
        predictedOpening: opening,
        parryComboTrigger: telemetry.habits?.favoriteCombo?.split(' -> ')[0] || 'JAB',
        counterTactic: counter,
        antiAirPriority: antiAir,
        aggression: aggression,
        guardBreakRate: guardBreak,
        tacticalAnalysis: reason
      };
    }

    // 2. Try JSON parsing fallback if Gemma output JSON format
    try {
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const cleanRoast = this.extractCleanDialogue(text);
        return {
          roast: cleanRoast || parsed.roast || this.generateProceduralFallback(telemetry).roast,
          predictedOpening: parsed.predictedOpening || telemetry.habits?.openingMove || 'JUMP_KICK',
          parryComboTrigger: parsed.parryComboTrigger || (telemetry.habits?.favoriteCombo?.split(' -> ')[0] || 'JAB'),
          counterTactic: parsed.counterTactic || (telemetry.habits?.aerialRatio > 0.4 ? 'ANTI_AIR' : 'PARRY_PUNISH'),
          antiAirPriority: Math.min(0.95, Math.max(0.1, Number(parsed.antiAirPriority) || 0.65)),
          aggression: Math.min(0.95, Math.max(0.2, Number(parsed.aggression) || 0.70)),
          guardBreakRate: Math.min(0.95, Math.max(0.1, Number(parsed.guardBreakRate) || 0.45)),
          tacticalAnalysis: parsed.tacticalAnalysis || telemetry.habits?.predictiveRead || 'Combat rhythm analyzed.'
        };
      }
    } catch {
      // fallback
    }

    return this.generateProceduralFallback(telemetry);
  }
```

---

## B. FIGHTER API AND FRAME DATA

### 4. The `FighterState` Type/Enum: Every Value (20 States Total)

Defined in `src/engine/Stickman.ts`:

```typescript
export type FighterState = 
  | 'IDLE' 
  | 'WALK_FORWARD' 
  | 'WALK_BACK' 
  | 'JUMP' 
  | 'CROUCH' 
  | 'JAB' 
  | 'CROSS_PUNCH'
  | 'PALM_BURST'
  | 'HEAVY_KICK' 
  | 'AXE_KICK'
  | 'UPPERCUT'
  | 'FLYING_KNEE'
  | 'LOW_SWEEP'
  | 'DODGE_ROLL'
  | 'JUMP_KICK' 
  | 'BLOCK' 
  | 'HIT_STUN' 
  | 'KNOCKDOWN' 
  | 'DEFEAT'
  | 'VICTORY';
```

---

### 5. Combat Action Frame Data Table

| Action Method | Startup Frames | Active Frames | Recovery Frames | Base Damage | Hitstun | Blockstun / Chip | Hitbox Size ($w \times h$) & Offsets | Cancel Windows & Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`jab()`** | 2 frames (`0..2`) | 5 frames (`3..7`) | 5 frames (`8..12`) | 5 HP | 10 frames | 15% chip (1 HP), $0.35\times$ knockback | $40s \times 22s$<br>$x: +8s / -48s$<br>$y: -74s$ | Cancels into `crossPunch()` on frames 3–10. |
| **`crossPunch()`** | 2 frames (`0..2`) | 6 frames (`3..8`) | 6 frames (`9..14`) | 8 HP | 10 frames | 15% chip (1 HP), $0.35\times$ knockback | $46s \times 24s$<br>$x: +10s / -56s$<br>$y: -74s$ | Cancels into `palmBurst()` on frames 3–10. |
| **`palmBurst()`** | 2 frames (`0..2`) | 8 frames (`3..10`) | 8 frames (`11..18`) | 14 HP | 18 frames (`isHeavy`, airborne) | 15% chip (2 HP), $0.35\times$ knockback | $50s \times 30s$<br>$x: +12s / -62s$<br>$y: -72s$ | Chain finisher. Cannot be cancelled. |
| **`heavyKick()`** | 4 frames (`0..4`) | 8 frames (`5..12`) | 4 frames (`13..16`) | 13 HP | 18 frames (`isHeavy`, airborne) | 15% chip (2 HP), $0.35\times$ knockback | $48s \times 32s$<br>$x: +12s / -60s$<br>$y: -80s$ | Cancels into `axeKick()` on frames 5–14. |
| **`axeKick()`** | 4 frames (`0..4`) | 8 frames (`5..12`) | 6 frames (`13..18`) | 15 HP | 18 frames (`isHeavy`, airborne) | 15% chip (2 HP), $0.35\times$ knockback | $50s \times 40s$<br>$x: +14s / -64s$<br>$y: -60s$ | Chain finisher. Downward knockback ($vy = -6s$). |
| **`jumpKick()`** | 1 frame (`0..1`) | Active from frame 2 until landing | 0 frames (recovers to `IDLE` on ground touch) | 12 HP | 18 frames (`isHeavy`, airborne) | 15% chip (2 HP), $0.35\times$ knockback | $46s \times 36s$<br>$x: +12s / -58s$<br>$y: -68s$ | Requires `!isGrounded`. Active dive descent ($vy = +4.2$). |
| **`uppercut()`** | 3 frames (`0..3`) | 8 frames (`4..11`) | 7 frames (`12..18` or until landing) | 10 HP | 26 frames (`isLauncher`, airborne) | 15% chip (2 HP), $0.35\times$ knockback | $40s \times 44s$<br>$x: +6s / -46s$<br>$y: -100s$ | Skyward launcher ($vy = -7.5$, knockback $vy = -10.5s$). |
| **`flyingKnee()`** | 2 frames (`0..2`) | 9 frames (`3..11`) | 5 frames (`12..16` or until landing) | 16 HP | 18 frames (`isHeavy`, airborne) | 15% chip (2 HP), $0.35\times$ knockback | $46s \times 34s$<br>$x: +12s / -58s$<br>$y: -74s$ | Horizontal gap-closer ($vx = 7.5s$, or $9.5s$ if overclocked). |
| **`lowSweep()`** | 2 frames (`0..2`) | 8 frames (`3..10`) | 6 frames (`11..16`) | 7 HP | 32 frames (`KNOCKDOWN` state lock) | 15% chip (1 HP), $0.35\times$ knockback | $45s \times 20s$<br>$x: +10s / -55s$<br>$y: -18s$ | Low ground sweep (`isSweep: true`). Shrinks defender hurtbox to $52s$. |
| **`dodgeRoll()`** | 1 frame (`0..1`) | 12 frames Invulnerable (`2..13`) | 3 frames vulnerable recovery (`14..16`) | 0 HP (No Hitbox) | N/A | N/A | Hurtbox: $32s \times 52s$ (Crouch profile) | Full strike invulnerability on frames 2–13. Forward burst ($vx = 8.5s$). |
| **`block()`** | 0 frames (Instant) | Continuous while held | 0 frames on release | 0 HP (Defensive) | N/A | Absorbs 85% damage; 15% chip damage | Body Hurtbox: $32s \times 94s$ | Can be toggled on/off instantly. Sets $vx = 0$. |

#### `canAct()` Condition

```typescript
public canAct(): boolean {
  return this.state !== 'HIT_STUN' && 
         this.state !== 'KNOCKDOWN' && 
         this.state !== 'DEFEAT' && 
         this.state !== 'VICTORY';
}
```

---

### 6. Public Methods and Properties of `Stickman`

#### Properties
- `x`, `y`: World spatial position (px). Floor line is at `groundY` (410px default).
- `vx`, `vy`: Instantaneous horizontal and vertical velocities.
- `groundY`: Ground surface level (default 410px; dynamic based on canvas height).
- `currentSurfaceY`: Current landed surface (either floor or platform obstacle).
- `facing`: Facing direction: `1` (facing right) or `-1` (facing left).
- `isAI`: Flag indicating whether this stickman is AI-driven.
- `name`: Display name of the fighter.
- `skin`: Active skin archetype identifier (`'black'`, `'ghost_white'`, `'steve'`, etc.).
- `color`: Hex or CSS stroke color for limbs and torso.
- `auraColor`: Radiated glow aura color (e.g. `'#ff0033'` for Error 0x7E5).
- `isHollowHead`: Whether head renders as an empty torus/ring.
- `health`: Current hit point pool (0 to `maxHealth`).
- `maxHealth`: Maximum health pool (180 HP baseline + archetype bonus).
- `damageMultiplier`: Outgoing damage multiplier (default 1.0; 1.25 when overclocked).
- `scale`: Proportional stature scale (e.g. 1.0 for player, 1.25 for Titan).
- `thickness`: Skeletal stroke weight (e.g. 4.4px normal, 5.6px heavy).
- `headScale`: Head diameter ratio.
- `sizeMultiplier`: Custom multiplier applied to archetype scale.
- `state`: Active animation / combat state.
- `stateTime`: Ticks/frames elapsed in the current state.
- `animFrame`: Global running animation tick counter.
- `isGrounded`: True if fighter is standing on the floor or an obstacle platform.
- `hitStunFrames`: Remaining ticks in hitstun.
- `blockStunFrames`: Remaining ticks in blockstun.
- `comboStep`: Chain step (1 = Jab/HeavyKick, 2 = Cross/Axe, 3 = Palm).
- `cancelWindowOpen`: Whether move cancellation is currently permitted.
- `dropThroughTimer`: Ticks remaining where platform tops are ignored (for dropping down).
- `isOverclocked`: Whether Konami 60s boost is currently running.
- `overclockTimeRemaining`: Seconds remaining on Konami boost.
- `flashFrames`: Visual white hit flash duration in ticks.
- `glitchOffset`: Horizontal render offset for glitch teleport effects.

#### Methods
- `canAct(): boolean`
- `applySkin(skin: CharacterSkin, customSizeMultiplier?: number): void`
- `activateOverclock(seconds?: number): void`
- `reset(x: number): void`
- `setState(newState: FighterState): void`
- `jab(): void`
- `crossPunch(): void`
- `palmBurst(): void`
- `heavyKick(): void`
- `axeKick(): void`
- `uppercut(): void`
- `flyingKnee(): void`
- `lowSweep(): void`
- `dodgeRoll(): void`
- `jumpKick(): void`
- `jump(): void`
- `dropThroughPlatform(): void`
- `crouch(): void`
- `unCrouch(): void`
- `block(isBlocking: boolean): void`
- `move(dir: number): void`
- `stopMoving(): void`
- `update(arenaWidth: number, obstacles?: ArenaObstacle[]): void`
- `getHurtbox(): Hurtbox`
- `getHitbox(): Hitbox | null`
- `takeHit(hitbox: Hitbox): { damageDealt: number; blocked: boolean; isInvulnerable?: boolean }`
- `render(ctx: CanvasRenderingContext2D): void`

---

## C. HOW IT'S WIRED

### 7. Lifecycle, Instantiation, and Input Recording

#### Instantiation in `main.ts` (Lines 48–52)

```typescript
const defaultName = (document.getElementById('player-name-input') as HTMLInputElement)?.value || 'Challenger_04';
this.arena = new Arena(this.canvas, defaultName, 'black');
this.telemetry = new TelemetryTracker(defaultName);
this.aiController = new AIController(this.arena.ghost, this.arena.player, this.telemetry);
this.aiController.onTacticalRead = (text) => this.arena.showTacticalBanner(text);
```

#### Update Loop Frequency in `main.ts` (Lines 575–597)

Driven by `requestAnimationFrame(loop)` locked at 60 FPS:

```typescript
private startRenderLoop() {
  const loop = (currentTime: number) => {
    if (this.isRunning) {
      this.handleContinuousInput(); // Continuous key sampling (A/D movement, L block hold)
      this.aiController.update();    // AI decision tick (60 FPS)
      this.arena.update();           // Physics, hit collision, camera tick (60 FPS)
    }
    this.arena.render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
```

#### Where Player Inputs Are Recorded into Telemetry in `main.ts`

- **Line 330**: `p.jab(); this.telemetry.recordPunch();` (`KeyJ` or `KeyZ`)
- **Line 337**: `p.jumpKick(); this.telemetry.recordJumpKick();` (`KeyK` or `KeyX` while airborne `!p.isGrounded`)
- **Line 340**: `p.lowSweep(); this.telemetry.recordHeavyKick();` (`KeyK` or `KeyX` while crouching)
- **Line 343**: `p.heavyKick(); this.telemetry.recordHeavyKick();` (`KeyK` or `KeyX` grounded)
- **Line 351**: `p.uppercut(); sound.playHeavyHit(); this.telemetry.recordPunch();` (`KeyU`)
- **Line 358**: `p.flyingKnee(); sound.playHeavyHit(); this.telemetry.recordHeavyKick();` (`KeyI`)
- **Line 373**: `p.jump(); this.telemetry.recordJump(); sound.playJump();` (`KeyW` or `ArrowUp` grounded)
- **Line 386**: `p.block(true); this.telemetry.recordBlock();` (`KeyL` or `KeyC`)
- **Line 433**: In `handleContinuousInput()`: `if (p.state === 'BLOCK') { this.telemetry.updateBlockHolding(); }`

---

### 8. `Arena.ts` Lifecycle, Gauntlet Roster, and Hit Detection

#### `startRound(roundNum: number)` (Lines 345–388)

```typescript
  public startRound(roundNum: number) {
    this.roundNumber = roundNum;
    this.roundTime = 99;
    this.timerFrames = 0;
    this.isRoundOver = false;
    this.winner = null;

    // 1. SCENE AUTOMATICALLY ADVANCES IN EACH ROUND!
    const roundStages: ArenaStage[] = ['animator', 'desktop', 'matrix', 'void', 'ofrenda'];
    this.stage = roundStages[(roundNum - 1) % roundStages.length];
    this.initStageObstacles(this.stage);

    // 2. AI STICKMAN OPPONENT MORPHS INTO A NEW VARIATION & ARCHETYPE!
    const archetype = this.getArchetypeForRound(roundNum);
    this.ghost.name = archetype.name;
    this.ghost.applySkin(archetype.skin);
    if (archetype.color) this.ghost.color = archetype.color;
    if (archetype.auraColor !== undefined) this.ghost.auraColor = archetype.auraColor;
    if (archetype.isHollowHead !== undefined) this.ghost.isHollowHead = archetype.isHollowHead;
    this.ghost.scale = archetype.scale;
    this.ghost.thickness = archetype.thickness;
    this.ghost.damageMultiplier = archetype.damageMultiplier;
    this.ghost.maxHealth = 180 + archetype.bonusMaxHealth;

    // 3. Reset player & ghost positions and health (180 HP Rebalanced Pool)
    this.player.maxHealth = 180;
    this.player.health = 180;
    this.player.applySkin('black');
    this.player.reset(220);
    this.ghost.reset(580);
    this.ghost.health = this.ghost.maxHealth;
    this.player.facing = 1;
    this.ghost.facing = -1;

    this.sparks = [];
    this.damageNumbers = [];
    this.afterimages = [];
    this.playerCombo = 0;
    this.ghostCombo = 0;

    this.announcementText = `ROUND ${roundNum}`;
    this.announcementSub = `VS ${archetype.name} • ${this.getStageDisplayName(this.stage)}`;
    this.announcementFrames = 90;
  }
```

#### `endRound(winnerName: string)` and `onRoundEnd` (Lines 670–688)

- **Callback Signature**:
  ```typescript
  public onRoundEnd?: (winner: string) => void;
  ```
- **Implementation**:
  ```typescript
  private endRound(winnerName: string) {
    if (this.isRoundOver) return;
    this.isRoundOver = true;
    this.winner = winnerName;
    sound.playKO();
    this.screenShake = 16;
    this.freezeFrames = 12;
    this.impactFlashFrames = 2;

    this.announcementText = 'K.O.!';
    this.announcementSub = `${winnerName.toUpperCase()} WINS`;
    this.announcementFrames = 140;

    if (this.onRoundEnd) {
      setTimeout(() => {
        this.onRoundEnd?.(winnerName);
      }, 2200);
    }
  }
  ```

#### `AI_GAUNTLET_ROSTER` Full Contents (Lines 59–158)

```typescript
export const AI_GAUNTLET_ROSTER: AIStickmanArchetype[] = [
  {
    name: 'WHITE GHOST',
    title: 'Round 1: The White Stickman (Pure Minimalist)',
    skin: 'ghost_white',
    color: '#ffffff',
    auraColor: 'rgba(255, 255, 255, 0.4)',
    scale: 1.00,
    thickness: 4.2,
    damageMultiplier: 1.0,
    bonusMaxHealth: 0,
    description: 'The pure white minimalist prototype ghost'
  },
  {
    name: 'COBALT DUELIST',
    title: 'Round 2: Swift Kickboxer',
    skin: 'orange',
    color: '#00e5ff',
    auraColor: '#80d8ff',
    scale: 1.04,
    thickness: 4.2,
    damageMultiplier: 1.15,
    bonusMaxHealth: 20,
    description: 'Armed with lightning arcs and anti-air interceptors'
  },
  {
    name: 'JADE GRANDMASTER',
    title: 'Round 3: Acrobatic Martial Artist',
    skin: 'green',
    color: '#00e676',
    auraColor: '#69f0ae',
    scale: 0.98,
    thickness: 4.0,
    damageMultiplier: 1.25,
    bonusMaxHealth: 35,
    description: 'Nimble martial artist with rapid sweep counters'
  },
  {
    name: 'BLOCKY STEVE',
    title: 'Round 4: Voxel Brawler (Wildcard Easter Egg)',
    skin: 'steve',
    color: '#00a8a8',
    auraColor: '#ffd700',
    scale: 1.15,
    thickness: 4.5,
    damageMultiplier: 1.35,
    bonusMaxHealth: 50,
    description: 'The legendary blocky brawler with massive voxel boxing fists!'
  },
  {
    name: 'CRIMSON TITAN',
    title: 'Round 5: Bare-Knuckle Heavyweight Colossus',
    skin: 'darklord',
    color: '#ee1133',
    auraColor: '#ff0044',
    isHollowHead: true,
    scale: 1.25,
    thickness: 5.6,
    damageMultiplier: 1.45,
    bonusMaxHealth: 65,
    description: 'Towering bare-knuckle colossus with guard-crush sweeps'
  },
  {
    name: 'PLASMA ASCETIC',
    title: 'Round 6: Void Halo Monk',
    skin: 'chosen',
    color: '#111111',
    auraColor: '#00ffff',
    isHollowHead: true,
    scale: 1.14,
    thickness: 4.2,
    damageMultiplier: 1.60,
    bonusMaxHealth: 80,
    description: 'Pure obsidian speedster with cyan halo and frame-trap punches'
  },
  {
    name: 'CALAVERA PHANTOM',
    title: 'Round 7: Day of the Dead Sugar Skull Warrior',
    skin: 'calavera',
    color: '#f5f5f5',
    auraColor: '#ffaa00',
    scale: 1.18,
    thickness: 4.8,
    damageMultiplier: 1.75,
    bonusMaxHealth: 100,
    description: 'Resurrected warrior shrouded in golden marigolds and ghostly fury'
  },
  {
    name: 'FLASH GHOST PRIME',
    title: 'Round 8: Corrupted Bytecode Overlord',
    skin: 'ghost',
    color: '#ff00aa',
    auraColor: '#d175ff',
    scale: 1.24,
    thickness: 5.2,
    damageMultiplier: 1.95,
    bonusMaxHealth: 120,
    description: 'The ancient ghost of 2021 with Error 0x7E5 time-bomb teleports'
  }
];
```

#### How Hit Detection Reports Damage Dealt/Taken (Lines 615–668)

In `Arena.ts`, `checkHit(attacker, defender, isPlayerAttacker)`:
1. Queries `attacker.getHitbox()` and `defender.getHurtbox()`.
2. Evaluates AABB intersection:
   ```typescript
   const isIntersecting = 
     hitbox.x < hurtbox.x + hurtbox.w &&
     hitbox.x + hitbox.w > hurtbox.x &&
     hitbox.y < hurtbox.y + hurtbox.h &&
     hitbox.y + hitbox.h > hurtbox.y;
   ```
3. If intersecting and defender is not in `HIT_STUN`, `KNOCKDOWN`, or `DEFEAT`:
   - Calls `result = defender.takeHit(hitbox)`.
   - Returns `{ damageDealt: number; blocked: boolean; isInvulnerable?: boolean }`.
   - If `isPlayerAttacker`: increments `this.playerCombo++`; adds `this.playerTotalDamage += result.damageDealt`.
   - If not `isPlayerAttacker`: increments `this.ghostCombo++`.
   - Spawns sparks (`spawnHitSparks`) and floating damage text (`spawnDamageNumber`).
   - If `defender.health <= 0`: triggers `attacker.setState('VICTORY')` and `endRound()`.

---

### 9. All Telemetry Data Read Call Sites

| Call Site | File & Line | Code Snippet | Purpose |
| :--- | :--- | :--- | :--- |
| **Call Site 1** | `src/engine/AIController.ts`: 159 | `const prediction = this.telemetry.predictNextMove(this.player.state);` | Real-time AI prediction. When player's prior state transitions into `HEAVY_KICK` with $\ge 45\%$ confidence, AI blocks and counter-launches. |
| **Call Site 2** | `src/main.ts`: 456 | `const summary = this.telemetry.compileSummary(winner);` | Compiles the round's habit matrix, ratios, and summary when `arena.onRoundEnd` fires. |
| **Call Site 3** | `src/main.ts`: 504–506 | `valCombo.innerText = summary.habits.favoriteCombo !== 'None' ? ...` | Populates the favorite combo HUD chip on the Inter-Round Roast screen. |
| **Call Site 4** | `src/main.ts`: 510 | `gemmaGhost.streamCombatAnalysis(summary, ...)` | Transmits compiled telemetry to Gemma 3:4B via Ollama streaming. |
| **Call Site 5** | `src/main.ts`: 550–553 | `goFatalHabit.innerText = summary.habits.aerialRatio > 0.4 ? ...` | Displays the player's fatal habit on the Game Over screen. |
| **Call Site 6** | `src/main.ts`: 561–563 | `const opening = summary.habits.openingMove; const combo = summary.habits.favoriteCombo;` | Interpolates player habits into the Game Over post-mortem taunts. |

---

## D. TELEMETRY DETAILS

### 10. Exact Data Structures & Model Storage

#### 1. Per-Frame / Per-Event Logging

- **Per-Event (`recordPlayerMove`)**:
  - **Opening Move**: Captured during the first 2.5 seconds of combat ($t < 2500\text{ ms}$ from `startTime`).
  - **Action Rolling Window**: Pushed to `moveHistory: string[]` (capped at the last 40 actions with `.shift()`).
  - **Raw Metrics**: Increments `jumpKicks`, `punches`, `heavyKicks`, `blocksCount`.
- **Per-Frame (`updateBlockHolding`)**:
  - Called inside `handleContinuousInput()` every frame that `player.state === 'BLOCK'`.
  - Increments `blocksHeldFrames` to measure total defensive guarding duration.

#### 2. Markov Bigram Sequence Model Storage & Updates

The transition model is stored as an adjacency frequency table:
```typescript
public transitions: Record<string, Record<string, number>> = {};
```
- **Update Formula (Online Bigram Learning)**:
  On every recorded action $M_t$:
  $$N(M_{t-1} \to M_t) \leftarrow N(M_{t-1} \to M_t) + 1$$
  Implemented as:
  ```typescript
  if (this.moveHistory.length > 0) {
    const prev = this.moveHistory[this.moveHistory.length - 1];
    if (!this.transitions[prev]) this.transitions[prev] = {};
    this.transitions[prev][move] = (this.transitions[prev][move] || 0) + 1;
  }
  ```
- **Prediction Query (`predictNextMove(currentMove)`)**:
  Calculates maximum-likelihood next state:
  $$\hat{M}_{t+1} = \arg\max_{m'} N(M_t \to m')$$
  $$\text{Confidence} = \frac{\max_{m'} N(M_t \to m')}{\sum_{m} N(M_t \to m)}$$
  **Threshold**: Returns prediction only when total occurrences $\ge 2$ and confidence $\ge 0.45$ (45%).

#### 3. Summary Statistics Generated (`compileSummary`)

- `durationSeconds`: Total round elapsed time in seconds.
- `favoriteCombo`: Bigram pair $(M_a \to M_b)$ with the absolute highest frequency count `topComboCount`.
- `aerialRatio`: Ratio of aerial dive kicks relative to all attacks:
  $$\text{aerialRatio} = \frac{\text{jumpKicks}}{\max(1, \text{jumpKicks} + \text{punches} + \text{heavyKicks})}$$
- `turtleRatio`: Fraction of combat spent holding guard:
  $$\text{turtleRatio} = \min\left(1.0, \frac{\text{blocksHeldFrames}}{\text{durationSeconds} \times 60 \times 0.4}\right)$$
- `predictiveRead`: Natural language classification:
  - If `aerialRatio >= 0.5`: *"Habitual Aerial Diver... Highly vulnerable to rising anti-air."*
  - Else if `topComboCount >= 4`: *"Combo Repeater: Frequently chains [combo]... Vulnerable to frame-trap parry."*
  - Else if `turtleRatio >= 0.45`: *"Defensive Turtle: Relies on guarding... Vulnerable to guard-breaking heavy sweep."*
  - Else: *"Balanced brawler without obvious habit patterns."*
- `dominantStyle`: Playstyle label (`'Xiao Xiao Aerial Diver'`, `'Turtle Defensive Camper'`, `'Button-Mashing Jab Masher'`, `'Heavy Roundhouse Aggressor'`, or `'Balanced Brawler'`).

---

## E. PROJECT SETUP

### 11. `package.json`, `tsconfig.json`, and Test Setup

#### `package.json` (Verbatim)

```json
{
  "name": "killswitch.swf",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "puppeteer-core": "^25.16.0",
    "typescript": "^5.6.3",
    "vite": "^5.4.10"
  }
}
```

#### `tsconfig.json` Strictness Flags

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

#### Lint & Test Setup

- **Linting**: No separate ESLint/Prettier configuration is present; TypeScript compiler (`tsc`) runs with strict mode enabled (`"strict": true`).
- **Testing**: End-to-end verification is automated via standalone Node.js Puppeteer scripts (`puppeteer-core` driving local Chrome) that inspect canvas pixel rendering and runtime states.

---

### 12. Headless & Deterministic Stepping Analysis

**Can the game state be stepped without rendering?**  
**Yes.** The physics and combat simulation logic (`Stickman.update()`, `Arena.update()`, `AIController.update()`) are decoupled from the canvas drawing routines (`Stickman.render()`, `StickmanAnatomy.renderFighter()`, `Arena.render()`).

However, running the simulation fully **headless** or **100% deterministically** is currently blocked by seven specific dependencies:

1. **DOM Canvas Context Coupling in `Arena.ts`**:
   The `Arena` constructor expects `canvas: HTMLCanvasElement` and calls `canvas.getContext('2d')`. `Arena.resize()` references `window.innerWidth` and `this.canvas.parentElement`.
2. **Synchronous Web Audio Calls**:
   Calls to `sound.playJab()`, `sound.playHeavyHit()`, `sound.playKO()`, `sound.playBypass()`, `sound.playBlock()` are invoked directly inside `Arena.ts`, `Stickman.ts`, and `AIController.ts`. In Node.js, `window.AudioContext` does not exist without a mock.
3. **DOM Element Lookups in `main.ts`**:
   `main.ts` relies on `document.getElementById` for HUD meters, modal screens, and FPS counters.
4. **Wall-Clock Timers (`Date.now()`)**:
   `TelemetryTracker.ts` relies on `Date.now()` to measure round elapsed seconds (`compileSummary`) and the 2.5-second opening move cutoff.
5. **Asynchronous `setTimeout` in Action Chains**:
   `AIController.ts` uses `setTimeout(..., ms)` for multi-hit combos (e.g. lines 248, 258) and Error 0x7E5 teleports (lines 307, 319). `Arena.ts` uses `setTimeout` on round end (line 684). In a stepped simulation, wall-clock timers fire outside the step loop.
6. **Browser `requestAnimationFrame`**:
   `main.ts` relies on `requestAnimationFrame` to drive ticks. Headless stepping requires a discrete `step(deltaTime)` loop.
7. **Unseeded `Math.random()` Calls**:
   Non-deterministic RNG is used for AI decision rolls, spark angles, and screen shake. Must be replaced by a seeded PRNG (e.g. Mulberry32, Xorshift128+, or PCG32).

---

### 13. Exhaustive Audit: Every `Math.random` Call in `src/engine` and `src/ai`

*Total calls found: **35** (35 in `src/engine`, 0 in `src/ai`).*

#### In `src/engine/AIController.ts` (11 calls)

| Line | Code | Usage |
| :--- | :--- | :--- |
| **151** | `if (isGhostCornered && dist < 120 && Math.random() < 0.65) {` | Corner trap escape dodge roll probability |
| **182** | `if (Math.random() < antiAirRate) {` | Anti-air reaction threshold check |
| **183** | `if (Math.random() < 0.60) {` | Anti-air move selection (uppercut vs flying knee) |
| **202** | `if (isPlayerWhiffing && dist < 115 && Math.random() < aggRate) {` | Whiff punish reaction probability |
| **211** | `if (Math.random() < guardRate) {` | Guard-break low sweep reaction probability |
| **224** | `if (Math.random() < blockChance) {` | Defensive guard / dodge reaction threshold |
| **225** | `if (Math.random() < 0.40) {` | Defensive selection (dodge roll vs block) |
| **243** | `if (Math.random() < aggRate) {` | Close-range offensive commitment check |
| **244** | `const roll = Math.random();` | Close-range combo string selection roll |
| **274** | `if (Math.random() < aggRate * 0.80) {` | Mid-range approach commitment check |
| **275** | `if (Math.random() < 0.35) {` | Mid-range jump kick approach roll |

#### In `src/engine/Arena.ts` (17 calls)

| Line | Code | Usage |
| :--- | :--- | :--- |
| **282** | `y: Math.random() * this.height,` | Matrix rain drop initial Y spawn |
| **283** | `speed: 2 + Math.random() * 4,` | Matrix rain drop vertical speed |
| **284** | `char: this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)]` | Matrix rain random character pick |
| **291** | `x: Math.random() * this.width,` | Ofrenda petal initial X spawn |
| **292** | `y: Math.random() * this.height,` | Ofrenda petal initial Y spawn |
| **293** | `vx: (Math.random() - 0.5) * 1.5 - 0.5,` | Ofrenda petal horizontal drift velocity |
| **294** | `vy: 0.8 + Math.random() * 1.2,` | Ofrenda petal fall speed |
| **295** | `rot: Math.random() * Math.PI * 2,` | Ofrenda petal initial rotation angle |
| **296** | `rotSpeed: (Math.random() - 0.5) * 0.05` | Ofrenda petal angular velocity |
| **408** | `const angle = Math.random() * Math.PI * 2;` | Hit spark explosion dispersion angle |
| **409** | `const speed = isHeavy ? 4 + Math.random() * 9 : 2.5 + Math.random() * 6;` | Hit spark particle velocity |
| **415** | `size: isHeavy ? 3 + Math.random() * 3.5 : 2 + Math.random() * 2,` | Hit spark particle size |
| **417** | `maxLife: isHeavy ? 22 + Math.random() * 12 : 14 + Math.random() * 8,` | Hit spark particle lifespan |
| **552** | `drop.char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];` | Matrix drop recycled character |
| **562** | `p.x = Math.random() * this.width;` | Ofrenda recycled petal X position |
| **717** | `shakeX = (Math.random() - 0.5) * this.screenShake;` | Camera shake horizontal jitter |
| **718** | `shakeY = (Math.random() - 0.5) * this.screenShake;` | Camera shake vertical jitter |

#### In `src/engine/Audio.ts` (2 calls)

| Line | Code | Usage |
| :--- | :--- | :--- |
| **72** | `data[i] = Math.random() * 2 - 1;` | Audio noise buffer white noise generator |
| **165** | `const freq = 1500 + Math.random() * 450;` | Procedural typewriter key click frequency jitter |

#### In `src/engine/Obstacle.ts` (5 calls)

| Line | Code | Usage |
| :--- | :--- | :--- |
| **64** | `x: this.x + Math.random() * this.w,` | Wood debris particle X position on crate smash |
| **65** | `y: this.y + Math.random() * this.h,` | Wood debris particle Y position on crate smash |
| **66** | `vx: (Math.random() - 0.5) * 6,` | Wood debris horizontal splatter velocity |
| **67** | `vy: -Math.random() * 5 - 2,` | Wood debris vertical launch velocity |
| **69** | `size: Math.random() * 4 + 2,` | Wood debris particle render size |

---

## F. CONSTRAINTS

### 14. Hacktoberfest / Challenge Rules Audit

Derived from `README.md` and `SUBMISSION.md`:

1. **Challenge & Track**:
   - **Target Event**: DEV x MLH Hacktoberfest 2026 Week 4 Challenge: *"Ghost in the Machine"* (`#hf26challenge`).
   - **Target Prize Categories**: Best Use of Gemma ($200 USD) • Overall Grand Prize ($250 USD).
2. **Mandatory Theme & Philosophical Prompt**:
   - Must answer the core Hacktoberfest prompt: *“Tell us why open innovation matters for what you built. Does running your own model mean your project works with the lights (and the internet) off? Make sure what you build isn't locked inside a service that might disappear someday.”*
   - Theme centers around the January 12, 2021 Adobe Flash Player time-bomb kill-switch.
3. **AI Architecture Requirements**:
   - Must use Google Gemma (specifically **Google Gemma 3:4B** running offline via local Ollama).
   - Must execute 100% locally with zero external cloud API keys or subscriptions.
   - AI must perform continuous combat telemetry analysis and dynamic adaptation.
4. **Artistic & Combat Constraints**:
   - Pure hand-to-hand martial arts stickman combat (strict **no weapons** rule — bare fists, kicks, knees, sweeps).
   - Authentic 2000s Newgrounds / Flash aesthetic (Macromedia Flash MX 2004 window frame, CRT scanlines, ActionScript 2.0 commentary).
   - High performance target: Smooth 60 FPS HTML5 Canvas animation without external sprite sheets.
   - Día de los Muertos Flash Cemetery Ofrenda with *calaveritas literarias* rhyming epitaphs.
5. **Licensing & Publication**:
   - Must be fully open source under the MIT License.
   - Post publication requires specific tags: `hf26challenge`, `hacktoberfest`, `gemma`, `webdev`.
