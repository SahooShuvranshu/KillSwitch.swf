// ============================================================================
// KillSwitch.swf — Adaptive AI Stickman Controller (The Flash Ghost)
// Powered by Google Gemma 3:4B combat parameters
// ============================================================================

import { Stickman } from './Stickman';
import { CombatAdaptation } from '../ai/GemmaGhost';

export class AIController {
  private ghost: Stickman;
  private player: Stickman;

  // Gemma-tuned adaptation parameters
  public antiAirPriority: number = 0.35;
  public aggression: number = 0.50;
  public guardBreakRate: number = 0.30;

  private actionCooldown: number = 0;
  private decisionTimer: number = 0;

  constructor(ghost: Stickman, player: Stickman) {
    this.ghost = ghost;
    this.player = player;
  }

  // Update dynamic weights from Gemma 3:4B round analysis
  public applyAdaptation(adaptation: CombatAdaptation) {
    this.antiAirPriority = adaptation.antiAirPriority;
    this.aggression = adaptation.aggression;
    this.guardBreakRate = adaptation.guardBreakRate;
    console.log('[AI Controller] Applied Gemma 3:4B Adaptation:', {
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

    this.decisionTimer++;
    if (this.decisionTimer < 4) return; // run decision every 4 frames for realistic human reaction time
    this.decisionTimer = 0;

    const dx = this.player.x - this.ghost.x;
    const dist = Math.abs(dx);
    const dir = dx > 0 ? 1 : -1;

    // --- 1. Reactive Anti-Air Counter (Gemma Adaptive Priority) ---
    const isPlayerAirborne = this.player.state === 'JUMP' || this.player.state === 'JUMP_KICK';
    if (isPlayerAirborne && dist < 140) {
      if (Math.random() < this.antiAirPriority) {
        // Anti-air choice: Rising Dragon Kick or Duck Under
        if (Math.random() < 0.6) {
          // Dragon rising kick to punish airborne spammer
          this.ghost.jump();
          this.ghost.heavyKick();
          this.actionCooldown = 28;
          return;
        } else {
          // Duck under flying kick
          this.ghost.crouch();
          setTimeout(() => {
            this.ghost.unCrouch();
            this.ghost.jab();
          }, 350);
          this.actionCooldown = 32;
          return;
        }
      }
    }

    // --- 2. Guard-Break Counter (Gemma Adaptive Priority) ---
    if (this.player.state === 'BLOCK' && dist < 85) {
      if (Math.random() < this.guardBreakRate) {
        // Execute low heavy kick to push through guard
        this.ghost.heavyKick();
        this.actionCooldown = 30;
        return;
      }
    }

    // --- 3. Defensive Evasion vs Incoming Attack ---
    const playerHitbox = this.player.getHitbox();
    if (playerHitbox && dist < 90) {
      const blockChance = 0.35 + (1 - this.aggression) * 0.3;
      if (Math.random() < blockChance) {
        this.ghost.block(true);
        setTimeout(() => this.ghost.block(false), 220);
        this.actionCooldown = 20;
        return;
      }
    }

    // --- 4. Spacing & Aggression Movement ---
    const closeDistance = 65;
    const midDistance = 140;

    if (dist > midDistance) {
      // Approach player
      this.ghost.move(dir);
    } else if (dist < closeDistance) {
      // Very close: initiate attack or step back based on aggression
      if (Math.random() < this.aggression) {
        // Attack chain
        const roll = Math.random();
        if (roll < 0.5) {
          this.ghost.jab();
          this.actionCooldown = 16;
        } else if (roll < 0.85) {
          this.ghost.heavyKick();
          this.actionCooldown = 26;
        } else {
          // Xiao Xiao flying leap kick back
          this.ghost.jump();
          this.ghost.jumpKick();
          this.actionCooldown = 35;
        }
      } else {
        // Spacing step back
        this.ghost.move(-dir);
      }
    } else {
      // In mid-range (65px - 140px): Poke or Jump-Kick
      if (Math.random() < this.aggression * 0.7) {
        if (Math.random() < 0.4) {
          this.ghost.jump();
          this.ghost.jumpKick();
          this.actionCooldown = 38;
        } else {
          this.ghost.move(dir);
        }
      } else {
        this.ghost.stopMoving();
      }
    }
  }
}
