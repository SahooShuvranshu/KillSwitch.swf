// ============================================================================
// KillSwitch.swf — Q-Learning Adaptive Behavior Engine
// State-Action reinforcement learning for frame-level combat tactics
// ============================================================================

import pretrainedQ from './pretrained-q.json';

export type AIBehavior = 
  | 'EVADE' 
  | 'ANTI_AIR' 
  | 'WHIFF_PUNISH' 
  | 'GUARD_BREAK' 
  | 'PUNCH_CHAIN' 
  | 'KICK_CHAIN' 
  | 'UPPERCUT' 
  | 'FLYING_KNEE' 
  | 'JUMP_IN' 
  | 'RETREAT';

export class BehaviorLearner {
  public qTable: Record<string, Record<string, number>> = {};
  public visits: Record<string, Record<string, number>> = {};
  public epsilon: number = 0.20;
  private readonly alpha: number = 0.1;

  constructor() {
    this.resetToPretrained();
  }

  public resetToPretrained(): void {
    this.qTable = {};
    this.visits = {};
    this.epsilon = 0.20;

    if (pretrainedQ && typeof pretrainedQ === 'object') {
      for (const [st, actions] of Object.entries(pretrainedQ)) {
        if (actions && typeof actions === 'object') {
          this.qTable[st] = {};
          for (const [act, val] of Object.entries(actions as Record<string, number>)) {
            if (typeof val === 'number') {
              this.qTable[st][act] = val;
              if (!this.visits[st]) this.visits[st] = {};
              this.visits[st][act] = 3;
            }
          }
        }
      }
    }
  }

  public getQ(stateKey: string, behavior: string): number {
    return this.qTable[stateKey]?.[behavior] ?? 0;
  }

  private setQ(stateKey: string, behavior: string, value: number): void {
    if (!this.qTable[stateKey]) {
      this.qTable[stateKey] = {};
    }
    this.qTable[stateKey][behavior] = value;
  }

  // Epsilon-greedy selection among currently allowed behaviors
  public choose(stateKey: string, allowed: string[]): string {
    if (allowed.length === 0) return 'RETREAT';

    // Exploration: pick random allowed behavior
    if (Math.random() < this.epsilon) {
      const idx = Math.floor(Math.random() * allowed.length);
      return allowed[idx];
    }

    // Exploitation: pick highest Q-value among allowed behaviors
    let bestBehavior = allowed[0];
    let bestQ = this.getQ(stateKey, bestBehavior);

    for (let i = 1; i < allowed.length; i++) {
      const b = allowed[i];
      const q = this.getQ(stateKey, b);
      if (q > bestQ) {
        bestQ = q;
        bestBehavior = b;
      }
    }

    return bestBehavior;
  }

  // Q-value update with learning rate alpha = 0.1
  public update(stateKey: string, behavior: string, reward: number): void {
    const currentQ = this.getQ(stateKey, behavior);
    const newQ = currentQ + this.alpha * (reward - currentQ);
    this.setQ(stateKey, behavior, newQ);

    if (!this.visits[stateKey]) {
      this.visits[stateKey] = {};
    }
    this.visits[stateKey][behavior] = (this.visits[stateKey][behavior] || 0) + 1;
  }

  // Decay exploration at round conclusion
  public endRound(): void {
    this.epsilon = Math.max(0.05, this.epsilon - 0.02);
  }

  public toJSON(): string {
    return JSON.stringify({
      qTable: this.qTable,
      epsilon: this.epsilon,
      visits: this.visits
    });
  }

  public fromJSON(jsonStr: string): void {
    try {
      const data = JSON.parse(jsonStr);
      if (data && typeof data === 'object') {
        if (data.qTable && typeof data.qTable === 'object') {
          this.qTable = data.qTable;
        }
        if (typeof data.epsilon === 'number') {
          this.epsilon = Math.max(0.05, Math.min(1.0, data.epsilon));
        }
        if (data.visits && typeof data.visits === 'object') {
          this.visits = data.visits;
        }
      }
    } catch {
      // Ignore corrupted storage
    }
  }

  // Filter pairs with < 3 visits and round Q-values to 3 decimals
  public exportPretrained(): Record<string, Record<string, number>> {
    const exported: Record<string, Record<string, number>> = {};
    for (const [st, actions] of Object.entries(this.qTable)) {
      const prunedActions: Record<string, number> = {};
      let hasActions = false;
      for (const [act, val] of Object.entries(actions)) {
        const v = this.visits[st]?.[act] ?? 0;
        if (v >= 3) {
          prunedActions[act] = Math.round(val * 1000) / 1000;
          hasActions = true;
        }
      }
      if (hasActions) {
        exported[st] = prunedActions;
      }
    }
    return exported;
  }
}
