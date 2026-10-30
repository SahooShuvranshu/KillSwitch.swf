// ============================================================================
// KillSwitch.swf — Adaptive AI Stickman Controller (The Flash Ghost)
// Powered by Google Gemma 3:4B with Multi-Round Learning & Difficulty Scaling
// ============================================================================

import { Stickman } from './Stickman';
import { CombatAdaptation } from '../ai/GemmaGhost';
import { GameDifficulty } from './Arena';

export class AIController {
  private ghost: Stickman;
  private player: Stickman;

  public difficulty: GameDifficulty = 'veteran';

  // Gemma-tuned adaptation parameters
  public antiAirPriority: number = 0.35;
  public aggression: number = 0.55;
  public guardBreakRate: number = 0.35;

  private actionCooldown: number = 0;
  private decisionTimer: number = 0;

  constructor(ghost: Stickman, player: Stickman, difficulty: GameDifficulty = 'veteran') {
    this.ghost = ghost;
    this.player = player;
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: GameDifficulty) {
    this.difficulty = diff;
  }

  // Update dynamic weights from Gemma 3:4B round analysis
  public applyAdaptation(adaptation: CombatAdaptation) {
    let multiplier = 1.0;
    if (this.difficulty === 'casual') multiplier = 0.7;
    else if (this.difficulty === 'nightmare') multiplier = 1.25;

    this.antiAirPriority = Math.min(0.95, adaptation.antiAirPriority * multiplier);
    this.aggression = Math.min(0.95, adaptation.aggression * multiplier);
    this.guardBreakRate = Math.min(0.95, adaptation.guardBreakRate * multiplier);

    console.log('[AI Controller] Applied Gemma 3:4B Adaptation:', {
      difficulty: this.difficulty,
      antiAir: this.antiAirPriority,
      aggression: this.aggression,
      guardBreak: this.guardBreakRate
    });
  }

  public update() {
    if (!this.ghost.canAct() || this.ghost.health <= 0) return;

    if (this.actionCooldown > 0) {
      this.actionCooldown--;
      return;
    }

    // Reaction frame interval based on difficulty
    const reactionDelay = this.difficulty === 'casual' ? 7 : (this.difficulty === 'veteran' ? 3 : 1);
    this.decisionTimer++;
    if (this.decisionTimer < reactionDelay) return;
    this.decisionTimer = 0;

    const dx = this.player.x - this.ghost.x;
    const dist = Math.abs(dx);
    const dir = dx > 0 ? 1 : -1;

    // --- 1. Reactive Anti-Air Counter (Gemma Adaptive Priority) ---
    const isPlayerAirborne = this.player.state === 'JUMP' || this.player.state === 'JUMP_KICK';
    if (isPlayerAirborne && dist < 150) {
      if (Math.random() < this.antiAirPriority) {
        if (Math.random() < 0.65) {
          // Dragon rising kick to punish airborne spammer
          this.ghost.jump();
          this.ghost.heavyKick();
          this.actionCooldown = this.difficulty === 'nightmare' ? 16 : 26;
          return;
        } else {
          // Duck under flying kick, counter with jab
          this.ghost.crouch();
          setTimeout(() => {
            this.ghost.unCrouch();
            this.ghost.jab();
          }, 300);
          this.actionCooldown = this.difficulty === 'nightmare' ? 20 : 30;
          return;
        }
      }
    }

    // --- 2. Guard-Break Counter (Gemma Adaptive Priority) ---
    if (this.player.state === 'BLOCK' && dist < 95) {
      if (Math.random() < this.guardBreakRate) {
        this.ghost.heavyKick();
        this.actionCooldown = this.difficulty === 'nightmare' ? 18 : 28;
        return;
      }
    }

    // --- 3. Defensive Evasion vs Incoming Attack ---
    const playerHitbox = this.player.getHitbox();
    if (playerHitbox && dist < 95) {
      const blockChance = this.difficulty === 'casual' ? 0.2 : (this.difficulty === 'veteran' ? 0.45 : 0.7);
      if (Math.random() < blockChance) {
        this.ghost.block(true);
        setTimeout(() => this.ghost.block(false), 200);
        this.actionCooldown = 18;
        return;
      }
    }

    // --- 4. Spacing & Aggression Movement ---
    const closeDistance = 65;
    const midDistance = 140;

    if (dist > midDistance) {
      this.ghost.move(dir);
    } else if (dist < closeDistance) {
      if (Math.random() < this.aggression) {
        const roll = Math.random();
        if (roll < 0.45) {
          this.ghost.jab();
          // Nightmare chains jab into heavy kick immediately
          if (this.difficulty === 'nightmare' || Math.random() < 0.5) {
            setTimeout(() => this.ghost.heavyKick(), 120);
          }
          this.actionCooldown = 18;
        } else if (roll < 0.85) {
          this.ghost.heavyKick();
          this.actionCooldown = 26;
        } else {
          this.ghost.jump();
          this.ghost.jumpKick();
          this.actionCooldown = 32;
        }
      } else {
        this.ghost.move(-dir);
      }
    } else {
      if (Math.random() < this.aggression * 0.75) {
        if (Math.random() < 0.4) {
          this.ghost.jump();
          this.ghost.jumpKick();
          this.actionCooldown = 34;
        } else {
          this.ghost.move(dir);
        }
      } else {
        this.ghost.stopMoving();
      }
    }
  }
}
