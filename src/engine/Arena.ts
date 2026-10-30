// ============================================================================
// KillSwitch.swf — Combat Arena & 60 FPS Particle Physics Engine
// ============================================================================

import { Stickman, Hitbox } from './Stickman';
import { sound } from './Audio';

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

export class Arena {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public width: number = 800;
  public height: number = 500;

  public player: Stickman;
  public ghost: Stickman;

  public sparks: SparkParticle[] = [];
  public screenShake: number = 0;
  public freezeFrames: number = 0;
  public roundNumber: number = 1;
  public roundTime: number = 99; // 99 seconds
  public timerFrames: number = 0;
  public isRoundOver: boolean = false;
  public winner: string | null = null;

  // Visual text announcements (e.g. "ROUND 1", "FIGHT!", "K.O.!")
  public announcementText: string = 'ROUND 1';
  public announcementSub: string = 'READY...';
  public announcementFrames: number = 90;

  // Telemetry callback to notify AI loop when round ends
  public onRoundEnd?: (winner: string) => void;

  constructor(canvas: HTMLCanvasElement, playerName: string = 'XiaoXiao_04') {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get 2D canvas context');
    this.ctx = context;

    this.player = new Stickman(220, false, playerName, '#00f0ff');
    this.ghost = new Stickman(580, true, 'Ghost of Flash', '#ff00aa');
  }

  public startRound(roundNum: number) {
    this.roundNumber = roundNum;
    this.roundTime = 99;
    this.timerFrames = 0;
    this.isRoundOver = false;
    this.winner = null;

    this.player.reset(220);
    this.ghost.reset(580);
    this.player.facing = 1;
    this.ghost.facing = -1;

    this.announcementText = `ROUND ${roundNum}`;
    this.announcementSub = 'READY... FIGHT!';
    this.announcementFrames = 90;
  }

  // Spawn starburst sparks on hit
  public spawnHitSparks(x: number, y: number, isHeavy: boolean, isBlocked: boolean) {
    const count = isBlocked ? 8 : (isHeavy ? 24 : 12);
    const baseColor = isBlocked ? '#ffffaa' : (isHeavy ? '#ff3300' : '#00ffff');

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isHeavy ? 3 + Math.random() * 8 : 2 + Math.random() * 5;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isHeavy ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
        life: 0,
        maxLife: isHeavy ? 20 + Math.random() * 10 : 12 + Math.random() * 8,
        color: baseColor
      });
    }
  }

  // Update loop (called 60 FPS)
  public update() {
    // Impact hit freeze frame
    if (this.freezeFrames > 0) {
      this.freezeFrames--;
      return;
    }

    if (this.announcementFrames > 0) {
      this.announcementFrames--;
    }

    // Round timer
    if (!this.isRoundOver && this.announcementFrames <= 30) {
      this.timerFrames++;
      if (this.timerFrames >= 60) {
        this.timerFrames = 0;
        this.roundTime = Math.max(0, this.roundTime - 1);
        if (this.roundTime <= 0) {
          this.endRound(this.player.health >= this.ghost.health ? this.player.name : this.ghost.name);
        }
      }
    }

    // Auto-turn facing towards each other
    if (this.player.canAct() && this.ghost.canAct() && !this.isRoundOver) {
      if (this.player.x < this.ghost.x) {
        this.player.facing = 1;
        this.ghost.facing = -1;
      } else {
        this.player.facing = -1;
        this.ghost.facing = 1;
      }
    }

    // Update characters
    this.player.update(this.width);
    this.ghost.update(this.width);

    // Update Sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // slight gravity
      p.life++;
      if (p.life >= p.maxLife) {
        this.sparks.splice(i, 1);
      }
    }

    // Camera shake dampening
    if (this.screenShake > 0) {
      this.screenShake *= 0.85;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    // Combat Hitbox collisions
    if (!this.isRoundOver) {
      this.checkHit(this.player, this.ghost);
      this.checkHit(this.ghost, this.player);
    }

    // Check Win/Loss conditions
    if (!this.isRoundOver) {
      if (this.player.health <= 0) {
        this.endRound(this.ghost.name);
      } else if (this.ghost.health <= 0) {
        this.endRound(this.player.name);
      }
    }
  }

  private checkHit(attacker: Stickman, defender: Stickman) {
    const hitbox = attacker.getHitbox();
    if (!hitbox) return;

    const hurtbox = defender.getHurtbox();

    // AABB intersection check
    const isIntersecting = 
      hitbox.x < hurtbox.x + hurtbox.w &&
      hitbox.x + hitbox.w > hurtbox.x &&
      hitbox.y < hurtbox.y + hurtbox.h &&
      hitbox.y + hitbox.h > hurtbox.y;

    if (isIntersecting && defender.state !== 'HIT_STUN' && defender.state !== 'KNOCKDOWN') {
      const result = defender.takeHit(hitbox);
      attacker.comboCounter++;

      const sparkX = (hitbox.x + hurtbox.x + hurtbox.w / 2) / 2;
      const sparkY = (hitbox.y + hurtbox.y + hurtbox.h / 2) / 2;

      this.spawnHitSparks(sparkX, sparkY, hitbox.isHeavy, result.blocked);

      if (result.blocked) {
        sound.playBlock();
        this.screenShake = 2;
      } else {
        if (hitbox.isHeavy) {
          sound.playHeavyHit();
          this.screenShake = 9;
          this.freezeFrames = 4; // slow-mo freeze frame for crunch!
        } else {
          sound.playJab();
          this.screenShake = 3;
        }
      }
    }
  }

  private endRound(winnerName: string) {
    if (this.isRoundOver) return;
    this.isRoundOver = true;
    this.winner = winnerName;
    sound.playKO();
    this.screenShake = 16;
    this.freezeFrames = 15; // dramatic freeze

    this.announcementText = 'K.O.!';
    this.announcementSub = `${winnerName.toUpperCase()} WINS`;
    this.announcementFrames = 120;

    if (this.onRoundEnd) {
      setTimeout(() => {
        this.onRoundEnd?.(winnerName);
      }, 1800);
    }
  }

  // --- 60 FPS Render Pipeline ---
  public render() {
    this.ctx.save();

    // Camera Shake
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(shakeX, shakeY);
    }

    // 1. Stage Background (Classic Xiao Xiao 2004 aesthetic: Minimalist dark vector arena)
    this.renderStage();

    // 2. Render Fighters
    this.player.render(this.ctx);
    this.ghost.render(this.ctx);

    // 3. Render Sparks
    for (const p of this.sparks) {
      const alpha = 1 - p.life / p.maxLife;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;

    // 4. Render HUD (Health Bars, Round Counter, Timer)
    this.renderHUD();

    // 5. Render Announcements ("ROUND 1", "FIGHT!", "K.O.!")
    if (this.announcementFrames > 0) {
      this.renderAnnouncements();
    }

    this.ctx.restore();
  }

  private renderStage() {
    // Gradient dark backdrop
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#0a0a14');
    grad.addColorStop(0.7, '#141424');
    grad.addColorStop(1, '#050508');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Vector grid floor lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 1;
    const floorY = 410;

    // Arena Floor
    this.ctx.fillStyle = '#10101c';
    this.ctx.fillRect(0, floorY, this.width, this.height - floorY);

    this.ctx.beginPath();
    this.ctx.moveTo(0, floorY);
    this.ctx.lineTo(this.width, floorY);
    this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Perspective floor lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = -200; x <= this.width + 200; x += 60) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, floorY);
      this.ctx.lineTo(x + (x - this.width / 2) * 0.4, this.height);
      this.ctx.stroke();
    }

    // Ghost of Flash vector watermark on the background wall
    this.ctx.save();
    this.ctx.font = 'italic bold 140px Arial Black';
    this.ctx.fillStyle = 'rgba(255, 0, 100, 0.04)';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('f', this.width / 2, floorY - 60);
    this.ctx.restore();
  }

  private renderHUD() {
    // Player Health Bar (Left)
    const barWidth = 280;
    const barHeight = 18;
    const barY = 24;

    // Player Bar Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(40, barY, barWidth, barHeight);
    this.ctx.strokeStyle = '#333';
    this.ctx.strokeRect(40, barY, barWidth, barHeight);

    // Player Current HP Fill
    const playerHpWidth = (this.player.health / this.player.maxHealth) * barWidth;
    const playerGrad = this.ctx.createLinearGradient(40, 0, 40 + barWidth, 0);
    playerGrad.addColorStop(0, '#00e5ff');
    playerGrad.addColorStop(1, '#00ff88');
    this.ctx.fillStyle = playerGrad;
    this.ctx.fillRect(40, barY, playerHpWidth, barHeight);

    // Player Label
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 12px "Share Tech Mono", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`P1: ${this.player.name.toUpperCase()}`, 40, barY - 6);

    // Ghost Health Bar (Right)
    const ghostBarX = this.width - 40 - barWidth;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(ghostBarX, barY, barWidth, barHeight);
    this.ctx.strokeStyle = '#333';
    this.ctx.strokeRect(ghostBarX, barY, barWidth, barHeight);

    // Ghost Current HP Fill
    const ghostHpWidth = (this.ghost.health / this.ghost.maxHealth) * barWidth;
    const ghostGrad = this.ctx.createLinearGradient(ghostBarX, 0, ghostBarX + barWidth, 0);
    ghostGrad.addColorStop(0, '#ff00aa');
    ghostGrad.addColorStop(1, '#b537f2');
    this.ctx.fillStyle = ghostGrad;
    this.ctx.fillRect(ghostBarX + (barWidth - ghostHpWidth), barY, ghostHpWidth, barHeight);

    // Ghost Label
    this.ctx.fillStyle = '#ff75df';
    this.ctx.font = 'bold 12px "Share Tech Mono", monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('CPU: FLASH GHOST (GEMMA 3:4B)', this.width - 40, barY - 6);

    // Center Round Timer
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 26px "Share Tech Mono", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.roundTime}`, this.width / 2, barY + 18);
  }

  private renderAnnouncements() {
    this.ctx.save();
    this.ctx.textAlign = 'center';

    // Shadow & Glow
    this.ctx.shadowColor = '#ff00aa';
    this.ctx.shadowBlur = 20;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 46px "Press Start 2P", monospace';
    this.ctx.fillText(this.announcementText, this.width / 2, this.height / 2 - 20);

    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = 'bold 18px "Share Tech Mono", monospace';
    this.ctx.fillText(this.announcementSub, this.width / 2, this.height / 2 + 30);

    this.ctx.restore();
  }
}
