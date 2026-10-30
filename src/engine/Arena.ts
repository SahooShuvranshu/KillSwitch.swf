// ============================================================================
// KillSwitch.swf — Ultra-Polished 60 FPS Combat Arena & Camera Engine
// Dynamic Cinematics, Afterimages, Floating Damage & Impact Flashes
// ============================================================================

import { Stickman } from './Stickman';
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

export interface DamageNumber {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  scale: number;
  life: number;
  maxLife: number;
}

export interface Afterimage {
  x: number;
  y: number;
  facing: number;
  state: string;
  color: string;
  alpha: number;
}

export class Arena {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public width: number = 800;
  public height: number = 500;

  public player: Stickman;
  public ghost: Stickman;

  public sparks: SparkParticle[] = [];
  public damageNumbers: DamageNumber[] = [];
  public afterimages: Afterimage[] = [];

  // Dynamic Camera & Screen Shake
  public cameraX: number = 400;
  public cameraY: number = 250;
  public targetCameraX: number = 400;
  public targetCameraY: number = 250;
  public cameraZoom: number = 1.0;
  public targetCameraZoom: number = 1.0;

  public screenShake: number = 0;
  public freezeFrames: number = 0;
  public impactFlashFrames: number = 0;

  public roundNumber: number = 1;
  public roundTime: number = 99;
  public timerFrames: number = 0;
  public isRoundOver: boolean = false;
  public winner: string | null = null;

  public announcementText: string = 'ROUND 1';
  public announcementSub: string = 'READY... FIGHT!';
  public announcementFrames: number = 90;

  // Combo tracker
  public playerCombo: number = 0;
  public ghostCombo: number = 0;
  public comboResetTimer: number = 0;

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

    this.sparks = [];
    this.damageNumbers = [];
    this.afterimages = [];
    this.playerCombo = 0;
    this.ghostCombo = 0;

    this.announcementText = `ROUND ${roundNum}`;
    this.announcementSub = 'READY... FIGHT!';
    this.announcementFrames = 90;
  }

  public spawnDamageNumber(x: number, y: number, text: string, isCrit: boolean, isBlocked: boolean) {
    this.damageNumbers.push({
      x,
      y,
      vy: -3.5,
      text,
      color: isBlocked ? '#ffffaa' : (isCrit ? '#ff0055' : '#00ffff'),
      scale: isCrit ? 1.6 : 1.1,
      life: 0,
      maxLife: 32
    });
  }

  public spawnHitSparks(x: number, y: number, isHeavy: boolean, isBlocked: boolean) {
    const count = isBlocked ? 10 : (isHeavy ? 30 : 16);
    const baseColor = isBlocked ? '#ffffaa' : (isHeavy ? '#ff2200' : '#00ffff');

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isHeavy ? 4 + Math.random() * 9 : 2.5 + Math.random() * 6;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isHeavy ? 3 + Math.random() * 3.5 : 2 + Math.random() * 2,
        life: 0,
        maxLife: isHeavy ? 22 + Math.random() * 12 : 14 + Math.random() * 8,
        color: baseColor
      });
    }
  }

  public update() {
    // 1. Impact Hit-Freeze
    if (this.freezeFrames > 0) {
      this.freezeFrames--;
      return;
    }

    if (this.impactFlashFrames > 0) {
      this.impactFlashFrames--;
    }

    if (this.announcementFrames > 0) {
      this.announcementFrames--;
    }

    // 2. Round Timer
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

    // 3. Facing orientation
    if (this.player.canAct() && this.ghost.canAct() && !this.isRoundOver) {
      if (this.player.x < this.ghost.x) {
        this.player.facing = 1;
        this.ghost.facing = -1;
      } else {
        this.player.facing = -1;
        this.ghost.facing = 1;
      }
    }

    // 4. Update Fighters
    this.player.update(this.width);
    this.ghost.update(this.width);

    // 5. Spawn Afterimages on Fast Actions (Jump Kick, Heavy Kick)
    if (this.player.state === 'JUMP_KICK' || (this.player.state === 'HEAVY_KICK' && this.player.stateTime < 8)) {
      if (this.player.animFrame % 2 === 0) {
        this.afterimages.push({
          x: this.player.x,
          y: this.player.y,
          facing: this.player.facing,
          state: this.player.state,
          color: this.player.color,
          alpha: 0.6
        });
      }
    }

    if (this.ghost.state === 'JUMP_KICK' || (this.ghost.state === 'HEAVY_KICK' && this.ghost.stateTime < 8)) {
      if (this.ghost.animFrame % 2 === 0) {
        this.afterimages.push({
          x: this.ghost.x,
          y: this.ghost.y,
          facing: this.ghost.facing,
          state: this.ghost.state,
          color: this.ghost.color,
          alpha: 0.6
        });
      }
    }

    // Update Afterimages
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].alpha -= 0.07;
      if (this.afterimages[i].alpha <= 0) {
        this.afterimages.splice(i, 1);
      }
    }

    // 6. Update Sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22;
      p.life++;
      if (p.life >= p.maxLife) {
        this.sparks.splice(i, 1);
      }
    }

    // 7. Update Floating Damage Numbers
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.y += d.vy;
      d.vy += 0.15; // float decel
      d.life++;
      if (d.life >= d.maxLife) {
        this.damageNumbers.splice(i, 1);
      }
    }

    // 8. Dynamic Cinematic Camera Zoom & Tracking
    const midX = (this.player.x + this.ghost.x) / 2;
    const midY = (this.player.y + this.ghost.y) / 2 - 35;
    const dist = Math.abs(this.player.x - this.ghost.x);

    // Zoom in when fighters brawl up close
    let desiredZoom = 1.0;
    if (dist < 120) {
      desiredZoom = 1.28; // dramatic close-up
    } else if (dist < 220) {
      desiredZoom = 1.15;
    } else {
      desiredZoom = 1.0;
    }

    // Smooth camera interpolation (lerp)
    this.targetCameraX = midX;
    this.targetCameraY = midY;
    this.targetCameraZoom = desiredZoom;

    this.cameraX += (this.targetCameraX - this.cameraX) * 0.12;
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.12;
    this.cameraZoom += (this.targetCameraZoom - this.cameraZoom) * 0.08;

    // Shake dampening
    if (this.screenShake > 0) {
      this.screenShake *= 0.84;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    // 9. Combat Hit Collisions
    if (!this.isRoundOver) {
      this.checkHit(this.player, this.ghost, true);
      this.checkHit(this.ghost, this.player, false);
    }

    // 10. Win/Loss Check
    if (!this.isRoundOver) {
      if (this.player.health <= 0) {
        this.endRound(this.ghost.name);
      } else if (this.ghost.health <= 0) {
        this.endRound(this.player.name);
      }
    }
  }

  private checkHit(attacker: Stickman, defender: Stickman, isPlayerAttacker: boolean) {
    const hitbox = attacker.getHitbox();
    if (!hitbox) return;

    const hurtbox = defender.getHurtbox();

    const isIntersecting = 
      hitbox.x < hurtbox.x + hurtbox.w &&
      hitbox.x + hitbox.w > hurtbox.x &&
      hitbox.y < hurtbox.y + hurtbox.h &&
      hitbox.y + hitbox.h > hurtbox.y;

    if (isIntersecting && defender.state !== 'HIT_STUN' && defender.state !== 'KNOCKDOWN') {
      const result = defender.takeHit(hitbox);

      if (isPlayerAttacker) {
        this.playerCombo++;
      } else {
        this.ghostCombo++;
      }

      const sparkX = (hitbox.x + hurtbox.x + hurtbox.w / 2) / 2;
      const sparkY = (hitbox.y + hurtbox.y + hurtbox.h / 2) / 2;

      this.spawnHitSparks(sparkX, sparkY, hitbox.isHeavy, result.blocked);

      if (result.blocked) {
        sound.playBlock();
        this.spawnDamageNumber(sparkX, sparkY - 20, 'GUARD!', false, true);
        this.screenShake = 3;
      } else {
        const dmgText = `-${result.damageDealt}`;
        this.spawnDamageNumber(sparkX, sparkY - 20, dmgText, hitbox.isHeavy, false);

        if (hitbox.isHeavy) {
          sound.playHeavyHit();
          this.screenShake = 14;
          this.freezeFrames = 6; // juicy hit-freeze!
          this.impactFlashFrames = 2; // inverted impact flash!
        } else {
          sound.playJab();
          this.screenShake = 4;
          this.freezeFrames = 2;
        }
      }
    }
  }

  private endRound(winnerName: string) {
    if (this.isRoundOver) return;
    this.isRoundOver = true;
    this.winner = winnerName;
    sound.playKO();
    this.screenShake = 22;
    this.freezeFrames = 20; // slow-mo freeze
    this.impactFlashFrames = 4;

    this.announcementText = 'K.O.!';
    this.announcementSub = `${winnerName.toUpperCase()} WINS`;
    this.announcementFrames = 140;

    if (this.onRoundEnd) {
      setTimeout(() => {
        this.onRoundEnd?.(winnerName);
      }, 2000);
    }
  }

  // --- Render Pipeline ---
  public render() {
    this.ctx.save();

    // Inverted Impact Flash (Anime / Xiao Xiao style)
    if (this.impactFlashFrames > 0) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
      return;
    }

    // Screen Shake Offset
    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake;
      shakeY = (Math.random() - 0.5) * this.screenShake;
    }

    // Dynamic Camera Transform (Center + Zoom + Shake)
    this.ctx.translate(this.width / 2 + shakeX, this.height / 2 + shakeY);
    this.ctx.scale(this.cameraZoom, this.cameraZoom);
    this.ctx.translate(-this.cameraX, -this.cameraY);

    // 1. Stage Background
    this.renderStage();

    // 2. Render Motion Afterimages
    this.renderAfterimages();

    // 3. Render Fighters
    this.player.render(this.ctx);
    this.ghost.render(this.ctx);

    // 4. Render Sparks
    for (const p of this.sparks) {
      const alpha = 1 - p.life / p.maxLife;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;

    // 5. Render Floating Damage Numbers
    this.renderDamageNumbers();

    // Restore Camera Transform before rendering static HUD
    this.ctx.restore();

    // 6. Static Screen HUD (Health Bars, Combo, Announcements)
    this.renderHUD();

    if (this.announcementFrames > 0) {
      this.renderAnnouncements();
    }
  }

  private renderAfterimages() {
    for (const img of this.afterimages) {
      this.ctx.save();
      this.ctx.globalAlpha = img.alpha;
      this.ctx.strokeStyle = img.color;
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      // simplified ghost silhouette
      this.ctx.arc(img.x, img.y - 88, 10, 0, Math.PI * 2);
      this.ctx.moveTo(img.x, img.y - 76);
      this.ctx.lineTo(img.x, img.y - 45);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private renderDamageNumbers() {
    for (const d of this.damageNumbers) {
      const alpha = 1 - d.life / d.maxLife;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = d.color;
      this.ctx.font = `bold ${Math.round(18 * d.scale)}px "Share Tech Mono", monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = d.color;
      this.ctx.shadowBlur = 8;
      this.ctx.fillText(d.text, d.x, d.y);
      this.ctx.restore();
    }
  }

  private renderStage() {
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#0a0a14');
    grad.addColorStop(0.7, '#141424');
    grad.addColorStop(1, '#050508');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const floorY = 410;
    this.ctx.fillStyle = '#0f0f1c';
    this.ctx.fillRect(-400, floorY, this.width + 800, this.height - floorY);

    // Neon Floor Rim
    this.ctx.beginPath();
    this.ctx.moveTo(-400, floorY);
    this.ctx.lineTo(this.width + 400, floorY);
    this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    // Perspective Lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = -400; x <= this.width + 400; x += 60) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, floorY);
      this.ctx.lineTo(x + (x - this.width / 2) * 0.5, this.height + 100);
      this.ctx.stroke();
    }

    // Ghost of Flash vector watermark
    this.ctx.save();
    this.ctx.font = 'italic bold 160px Arial Black';
    this.ctx.fillStyle = 'rgba(255, 0, 100, 0.05)';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('f', this.width / 2, floorY - 50);
    this.ctx.restore();
  }

  private renderHUD() {
    const barWidth = 300;
    const barHeight = 20;
    const barY = 24;

    // Player Health Bar (Left)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(36, barY, barWidth, barHeight);
    this.ctx.strokeStyle = '#444';
    this.ctx.strokeRect(36, barY, barWidth, barHeight);

    const playerHpWidth = (this.player.health / this.player.maxHealth) * barWidth;
    const playerGrad = this.ctx.createLinearGradient(36, 0, 36 + barWidth, 0);
    playerGrad.addColorStop(0, '#00e5ff');
    playerGrad.addColorStop(1, '#00ff88');
    this.ctx.fillStyle = playerGrad;
    this.ctx.fillRect(36, barY, playerHpWidth, barHeight);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 13px "Share Tech Mono", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`P1: ${this.player.name.toUpperCase()} [${Math.round(this.player.health)}%]`, 36, barY - 6);

    // Ghost Health Bar (Right)
    const ghostBarX = this.width - 36 - barWidth;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(ghostBarX, barY, barWidth, barHeight);
    this.ctx.strokeStyle = '#444';
    this.ctx.strokeRect(ghostBarX, barY, barWidth, barHeight);

    const ghostHpWidth = (this.ghost.health / this.ghost.maxHealth) * barWidth;
    const ghostGrad = this.ctx.createLinearGradient(ghostBarX, 0, ghostBarX + barWidth, 0);
    ghostGrad.addColorStop(0, '#ff00aa');
    ghostGrad.addColorStop(1, '#b537f2');
    this.ctx.fillStyle = ghostGrad;
    this.ctx.fillRect(ghostBarX + (barWidth - ghostHpWidth), barY, ghostHpWidth, barHeight);

    this.ctx.fillStyle = '#ff75df';
    this.ctx.font = 'bold 13px "Share Tech Mono", monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`CPU: FLASH GHOST (GEMMA 3:4B) [${Math.round(this.ghost.health)}%]`, this.width - 36, barY - 6);

    // Center Round Timer
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 28px "Share Tech Mono", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.roundTime}`, this.width / 2, barY + 18);

    // Combo Counter Display
    if (this.playerCombo > 1) {
      this.ctx.fillStyle = '#00ffff';
      this.ctx.font = 'bold 18px "Press Start 2P", monospace';
      this.ctx.textAlign = 'left';
      this.ctx.shadowColor = '#00ffff';
      this.ctx.shadowBlur = 10;
      this.ctx.fillText(`${this.playerCombo} HITS!`, 40, barY + 45);
      this.ctx.shadowBlur = 0;
    }
  }

  private renderAnnouncements() {
    this.ctx.save();
    this.ctx.textAlign = 'center';

    this.ctx.shadowColor = '#ff00aa';
    this.ctx.shadowBlur = 24;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 48px "Press Start 2P", monospace';
    this.ctx.fillText(this.announcementText, this.width / 2, this.height / 2 - 20);

    this.ctx.shadowBlur = 12;
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = 'bold 20px "Share Tech Mono", monospace';
    this.ctx.fillText(this.announcementSub, this.width / 2, this.height / 2 + 32);

    this.ctx.restore();
  }
}
