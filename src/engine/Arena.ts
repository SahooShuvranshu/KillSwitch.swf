// ============================================================================
// KillSwitch.swf — Ultra-Polished 60 FPS Combat Arena & Camera Engine
// Dynamic multi-round scene rotation: Flash Studio Canvas, Windows XP Desktop,
// ActionScript Matrix, 2021 Kill-Switch Void, and Día de los Muertos Stages!
// ============================================================================

import { Stickman, CharacterSkin } from './Stickman';
import { sound } from './Audio';

export type ArenaStage = 'animator' | 'desktop' | 'matrix' | 'void' | 'ofrenda';
export type GameDifficulty = 'casual' | 'veteran' | 'nightmare';

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
  skin: CharacterSkin;
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

  public stage: ArenaStage = 'animator';
  public difficulty: GameDifficulty = 'veteran';

  public sparks: SparkParticle[] = [];
  public damageNumbers: DamageNumber[] = [];
  public afterimages: Afterimage[] = [];

  // Studio Virtual Mouse Cursor (wanders & tracks fighters)
  private cursorX: number = 400;
  private cursorY: number = 180;
  private targetCursorX: number = 400;
  private targetCursorY: number = 180;

  // Matrix code rain particles
  private matrixChars: string[] = ['0', '1', 'A', 'S', '2', 'F', 'L', 'A', 'S', 'H', 'x', '7', 'E', '5'];
  private matrixDrops: Array<{ x: number; y: number; speed: number; char: string }> = [];

  // Ofrenda floating marigold petals
  private petals: Array<{ x: number; y: number; vx: number; vy: number; rot: number; rotSpeed: number }> = [];

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
  public announcementSub: string = 'STAGE: FLASH STUDIO CANVAS';
  public announcementFrames: number = 90;

  public playerCombo: number = 0;
  public ghostCombo: number = 0;

  // Gemma Neural Read & Move Prediction Banner
  public tacticalBannerText: string | null = null;
  public tacticalBannerFrames: number = 0;

  public onRoundEnd?: (winner: string) => void;

  constructor(canvas: HTMLCanvasElement, playerName: string = 'Apex Striker', playerSkin: CharacterSkin = 'orange') {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get 2D canvas context');
    this.ctx = context;

    this.player = new Stickman(220, false, playerName, playerSkin);
    this.ghost = new Stickman(580, true, 'Ghost of Flash', 'ghost');

    this.initStageParticles();
  }

  private initStageParticles() {
    this.matrixDrops = [];
    for (let x = -200; x <= this.width + 200; x += 25) {
      this.matrixDrops.push({
        x,
        y: Math.random() * this.height,
        speed: 2 + Math.random() * 4,
        char: this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)]
      });
    }

    this.petals = [];
    for (let i = 0; i < 35; i++) {
      this.petals.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 1.5 - 0.5,
        vy: 0.8 + Math.random() * 1.2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05
      });
    }
  }

  public setStage(stage: ArenaStage) {
    this.stage = stage;
  }

  public setDifficulty(diff: GameDifficulty) {
    this.difficulty = diff;
  }

  public getStageDisplayName(stage: ArenaStage): string {
    switch (stage) {
      case 'animator': return 'FLASH STUDIO CANVAS';
      case 'desktop': return 'WINDOWS XP BLISS DESKTOP';
      case 'matrix': return 'ACTIONSCRIPT CYBER MATRIX';
      case 'void': return '2021 KILL-SWITCH VOID';
      case 'ofrenda': return 'DÍA DE LOS MUERTOS ALTAR';
      default: return (stage as string).toUpperCase();
    }
  }

  public startRound(roundNum: number) {
    this.roundNumber = roundNum;
    this.roundTime = 99;
    this.timerFrames = 0;
    this.isRoundOver = false;
    this.winner = null;

    // SCENE AUTOMATICALLY ADVANCES IN EACH ROUND!
    // Round 1: Flash Studio Canvas
    // Round 2: Windows XP Bliss Desktop
    // Round 3: ActionScript Cyber Matrix
    // Round 4: 2021 Kill-Switch Void
    // Round 5: Día de los Muertos Altar
    const roundStages: ArenaStage[] = ['animator', 'desktop', 'matrix', 'void', 'ofrenda'];
    this.stage = roundStages[(roundNum - 1) % roundStages.length];

    // In Round 2+, the Ghost adapts and grows in boss stature!
    if (this.ghost) {
      this.ghost.scale = Math.min(1.30, 1.16 + (roundNum - 1) * 0.07);
      this.ghost.thickness = Math.min(5.6, 4.8 + (roundNum - 1) * 0.3);
    }

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
    this.announcementSub = `STAGE: ${this.getStageDisplayName(this.stage)}`;
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

    // Round Timer
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

    // Auto Facing
    if (this.player.canAct() && this.ghost.canAct() && !this.isRoundOver) {
      if (this.player.x < this.ghost.x) {
        this.player.facing = 1;
        this.ghost.facing = -1;
      } else {
        this.player.facing = -1;
        this.ghost.facing = 1;
      }
    }

    // Update Fighters
    this.player.update(this.width);
    this.ghost.update(this.width);

    // Animator Mouse Cursor tracking in 'animator' and 'desktop' stages
    if (this.stage === 'animator' || this.stage === 'desktop') {
      const targetX = (this.player.x + this.ghost.x) / 2 + Math.sin(this.player.animFrame * 0.05) * 50;
      const targetY = Math.min(this.player.y, this.ghost.y) - 80 + Math.cos(this.player.animFrame * 0.04) * 30;
      this.targetCursorX = targetX;
      this.targetCursorY = targetY;
      this.cursorX += (this.targetCursorX - this.cursorX) * 0.08;
      this.cursorY += (this.targetCursorY - this.cursorY) * 0.08;
    }

    // Motion Afterimages
    if (this.player.state === 'JUMP_KICK' || (this.player.state === 'HEAVY_KICK' && this.player.stateTime < 8)) {
      if (this.player.animFrame % 2 === 0) {
        this.afterimages.push({
          x: this.player.x,
          y: this.player.y,
          facing: this.player.facing,
          skin: this.player.skin,
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
          skin: this.ghost.skin,
          color: this.ghost.color,
          alpha: 0.6
        });
      }
    }

    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].alpha -= 0.07;
      if (this.afterimages[i].alpha <= 0) {
        this.afterimages.splice(i, 1);
      }
    }

    // Sparks
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

    // Floating Damage
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.y += d.vy;
      d.vy += 0.15;
      d.life++;
      if (d.life >= d.maxLife) {
        this.damageNumbers.splice(i, 1);
      }
    }

    // Stage Particle Updates
    if (this.stage === 'matrix') {
      for (const drop of this.matrixDrops) {
        drop.y += drop.speed;
        if (drop.y > this.height) {
          drop.y = 0;
          drop.char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
        }
      }
    } else if (this.stage === 'ofrenda') {
      for (const p of this.petals) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        if (p.y > this.height) {
          p.y = -10;
          p.x = Math.random() * this.width;
        }
      }
    }

    // Dynamic Camera Tracking & Zoom (Grounded Horizon Tracking)
    const midX = (this.player.x + this.ghost.x) / 2;
    const floorY = this.height - 90;
    const stageCenterY = floorY - 140;
    const dist = Math.abs(this.player.x - this.ghost.x);

    let desiredZoom = 1.0;
    if (dist < 140) {
      desiredZoom = 1.16; // Dramatic impact focus on close quarters
    } else if (dist > 560) {
      desiredZoom = 0.94; // Wide view when fighters spread out
    }

    this.targetCameraX = midX;
    this.targetCameraY = stageCenterY; // Locked vertically to stage horizon so jumps feel grounded!
    this.targetCameraZoom = desiredZoom;

    this.cameraX += (this.targetCameraX - this.cameraX) * 0.10;
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.10;
    this.cameraZoom += (this.targetCameraZoom - this.cameraZoom) * 0.08;

    if (this.screenShake > 0) {
      this.screenShake *= 0.84;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    if (this.tacticalBannerFrames > 0) {
      this.tacticalBannerFrames--;
    }

    // Hit Detection
    if (!this.isRoundOver) {
      this.checkHit(this.player, this.ghost, true);
      this.checkHit(this.ghost, this.player, false);
    }

    // Win/Loss
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
          this.freezeFrames = 6;
          this.impactFlashFrames = 2;
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
    this.freezeFrames = 20;
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

  // Dynamically adapt canvas buffer to window dimensions with zero letterboxing
  public resize() {
    const parent = this.canvas.parentElement;
    const w = parent ? parent.clientWidth : window.innerWidth;
    const h = parent ? parent.clientHeight : window.innerHeight;

    if (w > 100 && h > 100 && (this.canvas.width !== w || this.canvas.height !== h)) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.width = w;
      this.height = h;

      const floorY = this.height - 90;
      this.player.groundY = floorY;
      this.ghost.groundY = floorY;
      if (this.player.isGrounded) this.player.y = floorY;
      if (this.ghost.isGrounded) this.ghost.y = floorY;
    }
  }

  public render() {
    this.resize();
    this.ctx.save();

    if (this.impactFlashFrames > 0) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
      return;
    }

    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake;
      shakeY = (Math.random() - 0.5) * this.screenShake;
    }

    this.ctx.translate(this.width / 2 + shakeX, this.height / 2 + shakeY);
    this.ctx.scale(this.cameraZoom, this.cameraZoom);
    this.ctx.translate(-this.cameraX, -this.cameraY);

    // 1. Stage Background
    this.renderStage();

    // 2. Stage Particles
    this.renderStageParticles();

    // 3. Motion Afterimages
    this.renderAfterimages();

    // 4. Fighters
    this.player.render(this.ctx);
    this.ghost.render(this.ctx);

    // 5. Sparks
    for (const p of this.sparks) {
      const alpha = 1 - p.life / p.maxLife;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;

    // 6. Floating Damage Numbers
    this.renderDamageNumbers();

    this.ctx.restore();

    // 7. Clean, Uncluttered HUD
    this.renderHUD();

    if (this.announcementFrames > 0) {
      this.renderAnnouncements();
    }
  }

  // --- Virtual Animator Mouse Cursor ---
  private renderAnimatorCursor() {
    this.ctx.save();
    this.ctx.translate(this.cursorX, this.cursorY);

    // Drop shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.drawCursorPath(3, 4);
    this.ctx.fill();

    // White cursor with black border
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1.8;
    this.drawCursorPath(0, 0);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  private drawCursorPath(dx: number, dy: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(dx, dy);
    this.ctx.lineTo(dx, dy + 22);
    this.ctx.lineTo(dx + 5, dy + 17);
    this.ctx.lineTo(dx + 11, dy + 28);
    this.ctx.lineTo(dx + 15, dy + 26);
    this.ctx.lineTo(dx + 9, dy + 15);
    this.ctx.lineTo(dx + 16, dy + 15);
    this.ctx.closePath();
  }

  // --- Stage Background Rendering ---
  private renderStage() {
    const floorY = this.height - 90;

    if (this.stage === 'animator') {
      // Flash Studio Drawing Canvas
      // Clean white/light-gray drawing canvas with subtle vector grid
      this.ctx.fillStyle = '#f8f8fa';
      this.ctx.fillRect(-1500, -500, this.width + 3000, this.height + 1000);

      // Fine grid dots/lines
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
      this.ctx.lineWidth = 1;
      for (let x = -1500; x <= this.width + 1500; x += 32) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, -500);
        this.ctx.lineTo(x, this.height + 500);
        this.ctx.stroke();
      }
      for (let y = -500; y <= this.height + 500; y += 32) {
        this.ctx.beginPath();
        this.ctx.moveTo(-1500, y);
        this.ctx.lineTo(this.width + 1500, y);
        this.ctx.stroke();
      }

      // Drawn Ground Line (Like drawn by the Animator's Pencil Tool)
      this.ctx.strokeStyle = '#222222';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(-1500, floorY);
      this.ctx.lineTo(this.width + 1500, floorY);
      this.ctx.stroke();

      // "Document 1 - Macromedia Flash" watermark
      this.ctx.save();
      this.ctx.font = 'bold 14px "Share Tech Mono", monospace';
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      this.ctx.fillText('[Flash Canvas 10.3 — Scene 1 @ 60.0 fps]', 60, floorY + 40);
      this.ctx.restore();

    } else if (this.stage === 'desktop') {
      // Windows XP "Bliss" Desktop
      // Blue Sky with Gradient
      const skyGrad = this.ctx.createLinearGradient(0, 0, 0, floorY);
      skyGrad.addColorStop(0, '#1c74d8');
      skyGrad.addColorStop(0.65, '#68b1f5');
      skyGrad.addColorStop(1, '#c5e2fe');
      this.ctx.fillStyle = skyGrad;
      this.ctx.fillRect(-1500, -500, this.width + 3000, floorY + 500);

      // Rolling Green Grass Hills
      const hillGrad = this.ctx.createLinearGradient(0, floorY - 140, 0, floorY);
      hillGrad.addColorStop(0, '#74ba27');
      hillGrad.addColorStop(1, '#3b7811');
      this.ctx.fillStyle = hillGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(-1500, floorY);
      this.ctx.bezierCurveTo(-400, floorY - 120, 200, floorY - 60, 500, floorY - 100);
      this.ctx.bezierCurveTo(700, floorY - 130, 900, floorY - 70, this.width + 1500, floorY);
      this.ctx.lineTo(this.width + 1500, floorY);
      this.ctx.lineTo(-1500, floorY);
      this.ctx.fill();

      // Windows XP Blue Taskbar (Acts as the combat floor!)
      this.ctx.fillStyle = '#245ddc';
      this.ctx.fillRect(-1500, floorY, this.width + 3000, this.height - floorY + 500);

      // Taskbar top rim
      this.ctx.fillStyle = '#3f82fc';
      this.ctx.fillRect(-1500, floorY, this.width + 3000, 3);

      // Green "start" Button
      this.ctx.fillStyle = '#388e3c';
      this.ctx.beginPath();
      this.ctx.roundRect(-30, floorY + 6, 85, 32, [0, 8, 8, 0]);
      this.ctx.fill();
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'italic bold 15px sans-serif';
      this.ctx.fillText('start', 6, floorY + 28);

      // Desktop Icons on the left
      this.renderDesktopIcon(-150, 80, '🗑️', 'Recycle Bin');
      this.renderDesktopIcon(-150, 160, '💻', 'My Computer');
      this.renderDesktopIcon(-150, 240, '⚡', 'Flash_MX.exe');
      this.renderDesktopIcon(-150, 320, '📁', 'Animations');

    } else if (this.stage === 'void') {
      // 2021 Kill-Switch Void
      const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
      grad.addColorStop(0, '#0a0a14');
      grad.addColorStop(0.7, '#141424');
      grad.addColorStop(1, '#050508');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(-1500, -500, this.width + 3000, this.height + 1000);

      this.ctx.fillStyle = '#0f0f1c';
      this.ctx.fillRect(-1500, floorY, this.width + 3000, this.height - floorY + 500);

      this.ctx.beginPath();
      this.ctx.moveTo(-1500, floorY);
      this.ctx.lineTo(this.width + 1500, floorY);
      this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();

      this.ctx.save();
      this.ctx.font = 'italic bold 160px Arial Black';
      this.ctx.fillStyle = 'rgba(255, 0, 100, 0.05)';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('f', this.width / 2, floorY - 50);
      this.ctx.restore();

    } else if (this.stage === 'ofrenda') {
      // Día de los Muertos Altar
      const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
      grad.addColorStop(0, '#15091c');
      grad.addColorStop(0.7, '#2d1138');
      grad.addColorStop(1, '#0c0512');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(-400, 0, this.width + 800, this.height);

      this.ctx.fillStyle = '#190a21';
      this.ctx.fillRect(-400, floorY, this.width + 800, this.height - floorY);

      this.ctx.beginPath();
      this.ctx.moveTo(-400, floorY);
      this.ctx.lineTo(this.width + 400, floorY);
      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();

      this.ctx.save();
      this.ctx.font = 'italic bold 100px "VT323"';
      this.ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('💀 DÍA DE LOS MUERTOS 🕯️', this.width / 2, floorY - 70);
      this.ctx.restore();

    } else if (this.stage === 'matrix') {
      // ActionScript 2.0 Bytecode Matrix
      this.ctx.fillStyle = '#020703';
      this.ctx.fillRect(-400, 0, this.width + 800, this.height);

      this.ctx.fillStyle = '#031205';
      this.ctx.fillRect(-400, floorY, this.width + 800, this.height - floorY);

      this.ctx.beginPath();
      this.ctx.moveTo(-400, floorY);
      this.ctx.lineTo(this.width + 400, floorY);
      this.ctx.strokeStyle = 'rgba(0, 255, 100, 0.5)';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();
    }
  }

  private renderDesktopIcon(x: number, y: number, icon: string, name: string) {
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.font = '28px sans-serif';
    this.ctx.fillText(icon, x, y);
    this.ctx.font = '11px sans-serif';
    this.ctx.fillStyle = '#fff';
    this.ctx.shadowColor = '#000';
    this.ctx.shadowBlur = 4;
    this.ctx.fillText(name, x, y + 16);
    this.ctx.restore();
  }

  // --- Macromedia Flash Timeline Overlay for 'animator' Stage ---
  private renderFlashTimeline() {
    this.ctx.save();
    // Timeline Bar Top Box
    this.ctx.fillStyle = '#ece9d8';
    this.ctx.fillRect(0, 0, this.width, 28);
    this.ctx.strokeStyle = '#999';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, 0, this.width, 28);

    // Layer 1 Label
    this.ctx.fillStyle = '#111';
    this.ctx.font = 'bold 10px Tahoma, sans-serif';
    this.ctx.fillText('📁 Layer 1', 10, 18);

    // Keyframe ruler
    const startX = 90;
    this.ctx.font = '8px monospace';
    this.ctx.fillStyle = '#666';
    for (let f = 1; f <= 50; f += 5) {
      const fx = startX + f * 12;
      this.ctx.fillText(`${f}`, fx, 12);
      this.ctx.beginPath();
      this.ctx.moveTo(fx, 14);
      this.ctx.lineTo(fx, 28);
      this.ctx.strokeStyle = '#ccc';
      this.ctx.stroke();
    }

    // Scrubbing Red Playhead
    const currentFrame = (Math.floor(this.player.animFrame / 3) % 45) + 1;
    const playheadX = startX + currentFrame * 12;
    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.moveTo(playheadX - 4, 2);
    this.ctx.lineTo(playheadX + 4, 2);
    this.ctx.lineTo(playheadX + 4, 8);
    this.ctx.lineTo(playheadX, 14);
    this.ctx.lineTo(playheadX - 4, 8);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(playheadX, 14);
    this.ctx.lineTo(playheadX, 28);
    this.ctx.stroke();

    this.ctx.restore();
  }

  // --- Flash Tools Palette Overlay on Left Side ---
  private renderFlashToolsPalette() {
    this.ctx.save();
    const boxX = 6;
    const boxY = 36;
    const boxW = 28;
    const boxH = 260;

    this.ctx.fillStyle = 'rgba(236, 233, 216, 0.9)';
    this.ctx.fillRect(boxX, boxY, boxW, boxH);
    this.ctx.strokeStyle = '#716f64';
    this.ctx.strokeRect(boxX, boxY, boxW, boxH);

    const tools = ['↖', '▲', '╱', '✎', '🖌', '○', '□', 'T', '🪣', '🧹'];
    this.ctx.font = '12px sans-serif';
    this.ctx.fillStyle = '#222';
    this.ctx.textAlign = 'center';

    tools.forEach((t, i) => {
      this.ctx.fillText(t, boxX + boxW / 2, boxY + 22 + i * 24);
    });

    this.ctx.restore();
  }

  private renderStageParticles() {
    if (this.stage === 'matrix') {
      this.ctx.save();
      this.ctx.font = '12px "Share Tech Mono", monospace';
      this.ctx.fillStyle = 'rgba(0, 255, 100, 0.25)';
      for (const drop of this.matrixDrops) {
        this.ctx.fillText(drop.char, drop.x, drop.y);
      }
      this.ctx.restore();
    } else if (this.stage === 'ofrenda') {
      this.ctx.save();
      for (const p of this.petals) {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rot);
        this.ctx.fillStyle = '#ff8800';
        this.ctx.globalAlpha = 0.55;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
      this.ctx.restore();
    }
  }

  private renderAfterimages() {
    for (const img of this.afterimages) {
      this.ctx.save();
      this.ctx.globalAlpha = img.alpha;
      this.ctx.strokeStyle = img.color;
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
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

  private renderHUD() {
    const isLightStage = this.stage === 'animator' || this.stage === 'desktop';
    const textColor = isLightStage ? '#111111' : '#ffffff';
    const cpuColor = isLightStage ? '#990055' : '#ff75df';
    const timerColor = isLightStage ? '#111111' : '#ffd700';

    const barWidth = Math.min(340, Math.max(220, this.width * 0.32));
    const barHeight = 20;
    const barY = 22;

    // Player Health Bar (Left)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(40, barY, barWidth, barHeight);
    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(40, barY, barWidth, barHeight);

    const playerHpWidth = (this.player.health / this.player.maxHealth) * barWidth;
    const playerGrad = this.ctx.createLinearGradient(40, 0, 40 + barWidth, 0);
    playerGrad.addColorStop(0, '#00e5ff');
    playerGrad.addColorStop(1, '#00ff88');
    this.ctx.fillStyle = playerGrad;
    this.ctx.fillRect(40, barY, playerHpWidth, barHeight);

    this.ctx.fillStyle = textColor;
    this.ctx.font = 'bold 12px "Share Tech Mono", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`P1: ${this.player.name.toUpperCase()} (${this.player.skin.toUpperCase()}) [${Math.round(this.player.health)}%]`, 40, barY - 6);

    // Ghost Health Bar (Right)
    const ghostBarX = this.width - 40 - barWidth;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(ghostBarX, barY, barWidth, barHeight);
    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(ghostBarX, barY, barWidth, barHeight);

    const ghostHpWidth = (this.ghost.health / this.ghost.maxHealth) * barWidth;
    const ghostGrad = this.ctx.createLinearGradient(ghostBarX, 0, ghostBarX + barWidth, 0);
    ghostGrad.addColorStop(0, '#ff00aa');
    ghostGrad.addColorStop(1, '#b537f2');
    this.ctx.fillStyle = ghostGrad;
    this.ctx.fillRect(ghostBarX + (barWidth - ghostHpWidth), barY, ghostHpWidth, barHeight);

    this.ctx.fillStyle = cpuColor;
    this.ctx.font = 'bold 12px "Share Tech Mono", monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`CPU: FLASH GHOST (GEMMA 3:4B) [${Math.round(this.ghost.health)}%]`, this.width - 40, barY - 6);

    // Center Round Timer
    this.ctx.fillStyle = timerColor;
    this.ctx.font = 'bold 28px "Share Tech Mono", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.roundTime}`, this.width / 2, barY + 18);

    // Combo Counter
    if (this.playerCombo > 1) {
      this.ctx.fillStyle = '#ff4400';
      this.ctx.font = 'bold 18px "Press Start 2P", monospace';
      this.ctx.textAlign = 'left';
      this.ctx.shadowColor = 'rgba(255, 68, 0, 0.5)';
      this.ctx.shadowBlur = 8;
      this.ctx.fillText(`${this.playerCombo} HITS!`, 44, barY + 46);
      this.ctx.shadowBlur = 0;
    }

    // Gemma Neural Cognition Read Banner (Real-Time Learned Counter Alert)
    if (this.tacticalBannerFrames > 0 && this.tacticalBannerText) {
      this.ctx.save();
      const bannerW = Math.min(460, this.width - 80);
      const bannerH = 28;
      const bannerX = this.width / 2 - bannerW / 2;
      const bannerY = barY + 34;

      // Dark Neon Pill
      this.ctx.fillStyle = 'rgba(12, 10, 22, 0.94)';
      this.ctx.strokeStyle = '#ff00aa';
      this.ctx.lineWidth = 1.8;
      this.ctx.shadowColor = '#ff00aa';
      this.ctx.shadowBlur = 14;
      this.ctx.beginPath();
      this.ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 4);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#00ffff';
      this.ctx.font = 'bold 12px "Share Tech Mono", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.shadowBlur = 6;
      this.ctx.fillText(this.tacticalBannerText, this.width / 2, bannerY + 19);
      this.ctx.restore();
    }
  }

  public showTacticalBanner(text: string) {
    this.tacticalBannerText = text;
    this.tacticalBannerFrames = 85;
  }

  private renderAnnouncements() {
    this.ctx.save();
    this.ctx.textAlign = 'center';

    this.ctx.shadowColor = '#ff00aa';
    this.ctx.shadowBlur = 24;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 46px "Press Start 2P", monospace';
    this.ctx.fillText(this.announcementText, this.width / 2, this.height / 2 - 20);

    this.ctx.shadowBlur = 12;
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = 'bold 18px "Share Tech Mono", monospace';
    this.ctx.fillText(this.announcementSub, this.width / 2, this.height / 2 + 32);

    this.ctx.restore();
  }
}
