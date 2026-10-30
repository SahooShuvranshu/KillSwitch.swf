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
