// ============================================================================
// KillSwitch.swf — Headless Q-Learning Offline Training Session
// Simulates 300 rounds against 5 scripted bot archetypes at warp speed
// ============================================================================

import { Arena } from '../engine/Arena';
import { AIController } from '../engine/AIController';
import { TelemetryTracker } from './Telemetry';
import { gemmaGhost } from './GemmaGhost';
import { Stickman } from '../engine/Stickman';

export type BotStyle = 'JUMP_KICK' | 'TURTLE' | 'COMBO' | 'HEAVY_KICK' | 'RANDOM_MIX';

export class TrainingSession {
  private arena: Arena;
  private aiController: AIController;
  private telemetry: TelemetryTracker;
  public isTraining: boolean = false;
  public totalRoundsCompleted: number = 0;
  public statsByBot: Record<string, { rounds: number; ghostWins: number; winRate: number }> = {};

  constructor(arena: Arena, aiController: AIController, telemetry: TelemetryTracker) {
    this.arena = arena;
    this.aiController = aiController;
    this.telemetry = telemetry;
  }

  private updateBot(style: BotStyle, player: Stickman, ghost: Stickman, tick: number): void {
    const dir = ghost.x > player.x ? 1 : -1;
    const dist = Math.abs(ghost.x - player.x);

    switch (style) {
      case 'JUMP_KICK':
        if (player.isGrounded) {
          player.move(dir);
          if (dist < 200 && tick % 15 === 0) {
            player.jump();
          }
        } else {
          player.jumpKick();
        }
        break;

      case 'TURTLE':
        if (dist < 100) {
          if (ghost.state === 'IDLE' || ghost.state === 'WALK_FORWARD' || ghost.state === 'WALK_BACK') {
            player.block(false);
            if (player.canAct()) player.jab();
          } else {
            player.block(true);
          }
        } else {
          player.block(false);
          player.move(dir);
        }
        break;

      case 'COMBO':
        if (dist > 65) {
          player.move(dir);
        } else if (player.canAct()) {
          player.jab();
        }
        break;

      case 'HEAVY_KICK':
        if (dist > 95) {
          player.move(dir);
        } else if (player.canAct()) {
          player.heavyKick();
        }
        break;

      case 'RANDOM_MIX':
        // Sub-styles handled per round
        break;
    }
  }

  public async runFullTraining(onProgress?: (progress: { bot: BotStyle; round: number; winRate: number }) => void): Promise<Record<string, Record<string, number>>> {
    this.isTraining = true;

    // Stub Gemma bridge with procedural fallback (NEVER call Ollama during training)
    gemmaGhost.streamCombatAnalysis = async (_summary, _chunk, done) => {
      done(gemmaGhost.generateProceduralFallback(_summary));
    };

    const botStyles: BotStyle[] = ['JUMP_KICK', 'TURTLE', 'COMBO', 'HEAVY_KICK', 'RANDOM_MIX'];
    const subStyles: BotStyle[] = ['JUMP_KICK', 'TURTLE', 'COMBO', 'HEAVY_KICK'];
    const roundsPerBot = 300;

    // Epsilon begins at 0.20
    this.aiController.learner.epsilon = 0.20;

    for (const style of botStyles) {
      let ghostWins = 0;

      for (let r = 1; r <= roundsPerBot; r++) {
        this.totalRoundsCompleted++;

        // Determine active fighting style for this round
        const activeStyle = style === 'RANDOM_MIX' 
          ? subStyles[Math.floor(Math.random() * subStyles.length)] 
          : style;

        // Start headless round
        this.arena.startRound(r);
        this.aiController.setRound(r);
        this.telemetry.startRound(r);
        this.arena.announcementFrames = 0; // Skip intro banner delay

        let ticks = 0;
        const maxTicks = 1800; // 30 seconds max at 60 FPS

        while (!this.arena.isRoundOver && ticks < maxTicks) {
          this.updateBot(activeStyle, this.arena.player, this.arena.ghost, ticks);
          this.aiController.update();
          this.arena.update();
          ticks++;
        }

        // Fail loudly if ghost did zero actions
        if (this.aiController.actionCountThisRound === 0) {
          throw new Error(`CRITICAL TRAINING FAILURE: Ghost performed ZERO actions in round ${r} against bot [${style}]!`);
        }

        const ghostWon = this.arena.winner === this.arena.ghost.name;
        if (ghostWon) ghostWins++;

        this.aiController.onRoundEnd(ghostWon);
        this.aiController.learner.endRound();

        if (r % 25 === 0) {
          const currentWinRate = Math.round((ghostWins / r) * 100);
          onProgress?.({ bot: style, round: r, winRate: currentWinRate });
          // Yield to browser loop to prevent freezing
          await new Promise(res => setTimeout(res, 0));
        }
      }

      this.statsByBot[style] = {
        rounds: roundsPerBot,
        ghostWins,
        winRate: Math.round((ghostWins / roundsPerBot) * 100)
      };
    }

    this.isTraining = false;

    // Export trained Q-table with <3 visits pruned and 3 decimals
    const exportedQ = this.aiController.learner.exportPretrained();
    try {
      localStorage.setItem('killswitch.ai.v1', JSON.stringify({
        learner: this.aiController.learner.toJSON(),
        transitions: this.telemetry.transitions
      }));
    } catch {}

    return exportedQ;
  }
}
