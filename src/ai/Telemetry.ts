// ============================================================================
// KillSwitch.swf — Player Combat Telemetry Tracker
// Records real-time combat metrics to feed into Google Gemma 3:4B
// ============================================================================

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
    this.startTime = Date.now();
  }

  public recordJumpKick() {
    this.jumpKicks++;
  }

  public recordPunch() {
    this.punches++;
  }

  public recordHeavyKick() {
    this.heavyKicks++;
  }

  public recordBlock() {
    this.blocksCount++;
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

    // Determine dominant playstyle
    let dominantStyle = 'Balanced Brawler';
    if (this.jumpKicks > this.punches && this.jumpKicks > this.heavyKicks && this.jumpKicks >= 4) {
      dominantStyle = 'Xiao Xiao Airborne Jump-Spammer';
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
      dominantStyle
    };
  }
}
