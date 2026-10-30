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

export interface AIStickmanArchetype {
  name: string;
  title: string;
  skin: CharacterSkin;
  color?: string;
  auraColor?: string | null;
  isHollowHead?: boolean;
  scale: number;
  thickness: number;
  damageMultiplier: number;
  bonusMaxHealth: number;
  description: string;
}

export const AI_GAUNTLET_ROSTER: AIStickmanArchetype[] = [
  {
    name: 'SHADOW RECON',
    title: 'Round 1: Reconnaissance Scout',
    skin: 'classic',
    color: '#8c9ba5',
    auraColor: null,
    scale: 0.96,
    thickness: 3.8,
    damageMultiplier: 1.0,
    bonusMaxHealth: 0,
    description: 'Probes challenger habits and opening moves'
  },
  {
    name: 'COBALT DUELIST',
    title: 'Round 2: Swift Kickboxer',
    skin: 'blue',
    color: '#2979ff',
    auraColor: '#82b1ff',
    scale: 1.04,
    thickness: 4.2,
    damageMultiplier: 1.15,
    bonusMaxHealth: 15,
    description: 'Armed with lightning arcs and anti-air interceptors'
  },
  {
    name: 'JADE GRANDMASTER',
    title: 'Round 3: Acrobatic Martial Artist',
    skin: 'green',
    color: '#00e676',
    auraColor: '#69f0ae',
    scale: 1.08,
    thickness: 4.4,
    damageMultiplier: 1.30,
    bonusMaxHealth: 30,
    description: 'Nimble martial artist with rapid sweep counters'
  },
  {
    name: 'CRIMSON TITAN',
    title: 'Round 4: Heavyweight Berserker',
    skin: 'darklord',
    color: '#ee1133',
    auraColor: '#ff0044',
    isHollowHead: true,
    scale: 1.25,
    thickness: 5.6,
    damageMultiplier: 1.45,
    bonusMaxHealth: 50,
    description: 'Towering colossus with dual energy blades and guard-crush sweeps'
  },
  {
    name: 'PLASMA ASCETIC',
    title: 'Round 5: Void Halo Monk',
    skin: 'chosen',
    color: '#111111',
    auraColor: '#00ffff',
    isHollowHead: true,
    scale: 1.15,
    thickness: 4.2,
    damageMultiplier: 1.60,
    bonusMaxHealth: 70,
    description: 'Pure obsidian speedster with cyan halo and frame-trap punches'
  },
  {
    name: 'CALAVERA PHANTOM',
    title: 'Round 6: Day of the Dead Spectral Reaper',
    skin: 'calavera',
    color: '#f5f5f5',
    auraColor: '#ffaa00',
    scale: 1.20,
    thickness: 5.0,
    damageMultiplier: 1.75,
    bonusMaxHealth: 90,
    description: 'Resurrected warrior shrouded in golden marigolds and ghostly fury'
  },
  {
    name: 'VOLT ARCHON',
    title: 'Round 7: High-Voltage Spark Rusher',
    skin: 'yellow',
    color: '#ffea00',
    auraColor: '#fff59d',
    scale: 1.12,
    thickness: 4.5,
    damageMultiplier: 1.90,
    bonusMaxHealth: 110,
    description: 'Blistering speed with rapid dash chains and unreactable pressure'
  },
  {
    name: 'FLASH GHOST PRIME',
    title: 'Round 8: Corrupted Bytecode Overlord',
    skin: 'ghost',
    color: '#ff00aa',
    auraColor: '#d175ff',
    scale: 1.30,
    thickness: 5.8,
    damageMultiplier: 2.10,
    bonusMaxHealth: 140,
    description: 'The ancient ghost of 2021 with Error 0x7E5 time-bomb teleports'
  }
];

export class Arena {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public width: number = 800;
  public height: number = 500;

  public player: Stickman;
  public ghost: Stickman;

  public stage: ArenaStage = 'animator';
  public difficulty: GameDifficulty = 'veteran';

  // --- Low-RAM Offscreen Background Cache ---
  private stageCacheCanvas: HTMLCanvasElement | null = null;
  private stageCacheCtx: CanvasRenderingContext2D | null = null;
  private cachedStage: ArenaStage | null = null;
  private cachedWidth: number = 0;
  private cachedHeight: number = 0;

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

  public getArchetypeForRound(roundNum: number): AIStickmanArchetype {
    const rosterIdx = (roundNum - 1) % AI_GAUNTLET_ROSTER.length;
    const base = AI_GAUNTLET_ROSTER[rosterIdx];
    const loopCycle = Math.floor((roundNum - 1) / AI_GAUNTLET_ROSTER.length);

    if (loopCycle === 0) {
      return base;
    }

    // Procedural scaling for infinite loop beyond Round 8
    return {
      name: `${base.name} Mk. ${loopCycle + 1}`,
      title: `Round ${roundNum}: Ascended ${base.name}`,
      skin: base.skin,
      color: base.color,
      auraColor: loopCycle % 2 === 0 ? '#ff0055' : '#00ffff',
      isHollowHead: base.isHollowHead,
      scale: Math.min(1.35, base.scale + loopCycle * 0.05),
      thickness: Math.min(6.0, base.thickness + loopCycle * 0.3),
      damageMultiplier: base.damageMultiplier + loopCycle * 0.35,
      bonusMaxHealth: base.bonusMaxHealth + loopCycle * 50,
      description: 'Ascended combat iteration with hyper-reactive adaptation.'
    };
  }

  public startRound(roundNum: number) {
    this.roundNumber = roundNum;
    this.roundTime = 99;
    this.timerFrames = 0;
    this.isRoundOver = false;
    this.winner = null;

    // 1. SCENE AUTOMATICALLY ADVANCES IN EACH ROUND!
    const roundStages: ArenaStage[] = ['animator', 'desktop', 'matrix', 'void', 'ofrenda'];
    this.stage = roundStages[(roundNum - 1) % roundStages.length];

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
    this.ghost.maxHealth = 100 + archetype.bonusMaxHealth;

    // 3. Reset player & ghost positions and health
    this.player.maxHealth = 100;
    this.player.health = 100;
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

  // --- Low-RAM Offscreen Stage Caching & Vector Background Engine ---
  private renderStage() {
    if (!this.stageCacheCanvas || this.cachedStage !== this.stage || this.cachedWidth !== this.width || this.cachedHeight !== this.height) {
      this.rebuildStageCache();
    }
    if (this.stageCacheCanvas) {
      this.ctx.drawImage(this.stageCacheCanvas, -800, -400);
    }
    if (this.stage === 'animator') {
      this.renderAnimatorCursor();
    }
  }

  private rebuildStageCache() {
    const padW = 800;
    const padH = 400;
    const totalW = this.width + padW * 2;
    const totalH = this.height + padH * 2;

    if (!this.stageCacheCanvas) {
      this.stageCacheCanvas = document.createElement('canvas');
      this.stageCacheCtx = this.stageCacheCanvas.getContext('2d');
    }

    if (!this.stageCacheCanvas || !this.stageCacheCtx) return;

    this.stageCacheCanvas.width = totalW;
    this.stageCacheCanvas.height = totalH;

    const ctx = this.stageCacheCtx;
    ctx.save();
    // Offset so (0,0) in game coordinates corresponds to (padW, padH) in cache
    ctx.translate(padW, padH);

    const floorY = this.height - 90;
    const minX = -padW;
    const maxX = this.width + padW;
    const minY = -padH;
    const maxY = this.height + padH;

    if (this.stage === 'animator') {
      // 1. FLASH STUDIO CANVAS (Round 1)
      ctx.fillStyle = '#f6f6f8';
      ctx.fillRect(minX, minY, totalW, totalH);

      // Flash Stage Document Border with subtle drop shadow
      const docW = Math.min(this.width - 80, 850);
      const docH = this.height - 120;
      const docX = (this.width - docW) / 2;
      const docY = 40;

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 18;
      ctx.fillRect(docX, docY, docW, docH);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
      ctx.strokeRect(docX, docY, docW, docH);

      // Fine grid drafting lines inside document
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.035)';
      ctx.lineWidth = 1;
      for (let x = docX; x <= docX + docW; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, docY);
        ctx.lineTo(x, docY + docH);
        ctx.stroke();
      }
      for (let y = docY; y <= docY + docH; y += 24) {
        ctx.beginPath();
        ctx.moveTo(docX, y);
        ctx.lineTo(docX + docW, y);
        ctx.stroke();
      }

      // Hand-Drawn Dark Graphite Pencil Ground Line
      ctx.strokeStyle = '#1e1e24';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(minX, floorY);
      ctx.lineTo(maxX, floorY);
      ctx.stroke();

      // Top Flash Timeline Header Bar
      ctx.fillStyle = '#ece9d8';
      ctx.fillRect(docX, docY, docW, 26);
      ctx.strokeStyle = '#a0a0a0';
      ctx.lineWidth = 1;
      ctx.strokeRect(docX, docY, docW, 26);

      ctx.fillStyle = '#222';
      ctx.font = 'bold 11px Tahoma, sans-serif';
      ctx.fillText('📁 Layer 1', docX + 10, docY + 17);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#666';
      for (let f = 1; f <= 35; f += 5) {
        const fx = docX + 85 + f * 12;
        if (fx < docX + docW - 10) {
          ctx.fillText(`${f}`, fx, docY + 11);
          ctx.beginPath();
          ctx.moveTo(fx, docY + 13);
          ctx.lineTo(fx, docY + 26);
          ctx.strokeStyle = '#ccc';
          ctx.stroke();
        }
      }

      // Left Flash Tools Palette
      const toolBoxW = 26;
      const toolBoxH = 220;
      const toolBoxX = docX + 8;
      const toolBoxY = docY + 36;
      ctx.fillStyle = '#ece9d8';
      ctx.fillRect(toolBoxX, toolBoxY, toolBoxW, toolBoxH);
      ctx.strokeStyle = '#716f64';
      ctx.strokeRect(toolBoxX, toolBoxY, toolBoxW, toolBoxH);
      const tools = ['↖', '▲', '╱', '✎', '🖌', '○', '□', '🪣', '🧹'];
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      tools.forEach((t, i) => {
        ctx.fillText(t, toolBoxX + toolBoxW / 2, toolBoxY + 20 + i * 22);
      });
      ctx.textAlign = 'left';

      // Stage Watermark
      ctx.font = 'bold 13px "Share Tech Mono", monospace';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillText('[Flash Studio MX — Scene 1 @ 60.0 fps]', docX + 45, floorY + 36);

    } else if (this.stage === 'desktop') {
      // 2. WINDOWS XP BLISS DESKTOP (Round 2)
      // Multi-stop Radiant Azure Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, minY, 0, floorY);
      skyGrad.addColorStop(0, '#1565c0');
      skyGrad.addColorStop(0.4, '#42a5f5');
      skyGrad.addColorStop(0.85, '#90caf9');
      skyGrad.addColorStop(1, '#e3f2fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(minX, minY, totalW, floorY - minY);

      // Cumulus Clouds
      this.drawPuffyCloud(ctx, 120, floorY - 260, 1.2);
      this.drawPuffyCloud(ctx, this.width - 200, floorY - 320, 1.5);
      this.drawPuffyCloud(ctx, -180, floorY - 200, 0.9);

      // Distant rolling hills
      const backHillGrad = ctx.createLinearGradient(0, floorY - 180, 0, floorY);
      backHillGrad.addColorStop(0, '#558b2f');
      backHillGrad.addColorStop(1, '#33691e');
      ctx.fillStyle = backHillGrad;
      ctx.beginPath();
      ctx.moveTo(minX, floorY);
      ctx.bezierCurveTo(-100, floorY - 140, 300, floorY - 90, 600, floorY - 130);
      ctx.bezierCurveTo(900, floorY - 160, 1200, floorY - 100, maxX, floorY);
      ctx.lineTo(maxX, floorY);
      ctx.lineTo(minX, floorY);
      ctx.fill();

      // Main Sunny Rolling Hill Crest (Classic Bliss Curve)
      const hillGrad = ctx.createLinearGradient(0, floorY - 130, 0, floorY);
      hillGrad.addColorStop(0, '#7cb342');
      hillGrad.addColorStop(0.5, '#689f38');
      hillGrad.addColorStop(1, '#33691e');
      ctx.fillStyle = hillGrad;
      ctx.beginPath();
      ctx.moveTo(minX, floorY);
      ctx.bezierCurveTo(-200, floorY - 90, 250, floorY - 45, 500, floorY - 95);
      ctx.bezierCurveTo(750, floorY - 135, 1050, floorY - 60, maxX, floorY);
      ctx.lineTo(maxX, floorY);
      ctx.lineTo(minX, floorY);
      ctx.fill();

      // Windows XP Luna Blue Taskbar (Combat Floor)
      const taskbarH = maxY - floorY;
      ctx.fillStyle = '#245edc';
      ctx.fillRect(minX, floorY, totalW, taskbarH);

      // Taskbar top rim highlight
      ctx.fillStyle = '#458bf8';
      ctx.fillRect(minX, floorY, totalW, 3);

      // Green "start" Button
      ctx.fillStyle = '#388e3c';
      ctx.beginPath();
      ctx.roundRect(-20, floorY + 4, 95, 34, [0, 8, 8, 0]);
      ctx.fill();
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Windows 4-color tile emblem
      const wx = 8;
      const wy = floorY + 14;
      ctx.fillStyle = '#f44336'; ctx.fillRect(wx, wy, 5, 5);
      ctx.fillStyle = '#4caf50'; ctx.fillRect(wx + 6, wy, 5, 5);
      ctx.fillStyle = '#2196f3'; ctx.fillRect(wx, wy + 6, 5, 5);
      ctx.fillStyle = '#ffeb3b'; ctx.fillRect(wx + 6, wy + 6, 5, 5);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic bold 16px "Segoe UI", Tahoma, sans-serif';
      ctx.fillText('start', wx + 18, floorY + 27);

      // Active Window Taskbar Tab
      const tabX = 90;
      const tabY = floorY + 5;
      ctx.fillStyle = '#1e4fb8';
      ctx.fillRect(tabX, tabY, 190, 26);
      ctx.strokeStyle = '#173c8d';
      ctx.strokeRect(tabX, tabY, 190, 26);
      ctx.fillStyle = '#fff';
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillText('⚡ KillSwitch.swf [Flash MX]', tabX + 12, tabY + 17);

      // System Tray (right)
      const trayX = this.width - 90;
      ctx.fillStyle = '#0f3a9e';
      ctx.fillRect(trayX, floorY + 4, 85, 28);
      ctx.strokeStyle = '#173c8d';
      ctx.strokeRect(trayX, floorY + 4, 85, 28);
      ctx.fillStyle = '#e3f2fd';
      ctx.font = 'bold 11px Tahoma, sans-serif';
      ctx.fillText('🔊 22:30 PM', trayX + 8, floorY + 22);

      // Classic Desktop Icons
      this.renderDesktopIconToCtx(ctx, -150, 70, '🗑️', 'Recycle Bin');
      this.renderDesktopIconToCtx(ctx, -150, 150, '💻', 'My Computer');
      this.renderDesktopIconToCtx(ctx, -150, 230, '📁', 'My Documents');
      this.renderDesktopIconToCtx(ctx, -150, 310, '🌐', 'Internet Explorer');
      this.renderDesktopIconToCtx(ctx, -150, 390, '⚡', 'Flash_MX.exe');

    } else if (this.stage === 'matrix') {
      // 3. ACTIONSCRIPT CYBER MATRIX (Round 3)
      ctx.fillStyle = '#010803';
      ctx.fillRect(minX, minY, totalW, totalH);

      // 3D Receding Horizon Perspective Wireframe Floor Grid
      const horizonY = floorY - 70;
      const vanishingX = this.width / 2;

      // Dark floor base
      ctx.fillStyle = '#021406';
      ctx.fillRect(minX, horizonY, totalW, maxY - horizonY);

      // Perspective Ray Lines radiating from vanishing point
      ctx.strokeStyle = 'rgba(0, 255, 100, 0.35)';
      ctx.lineWidth = 1.5;
      const rayCount = 18;
      for (let i = 0; i <= rayCount; i++) {
        const spreadX = minX + (totalW / rayCount) * i;
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizonY);
        ctx.lineTo(spreadX, maxY);
        ctx.stroke();
      }

      // Horizontal lines with exponential distance compression
      for (let d = 0; d < 12; d++) {
        const hy = horizonY + Math.pow(d / 11, 2.2) * (maxY - horizonY);
        const alpha = 0.15 + (d / 11) * 0.45;
        ctx.strokeStyle = `rgba(0, 255, 120, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(minX, hy);
        ctx.lineTo(maxX, hy);
        ctx.stroke();
      }

      // Glowing Neon Floor Rim
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(minX, floorY);
      ctx.lineTo(maxX, floorY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Holographic ActionScript Code Blocks in the background
      ctx.font = '13px "Share Tech Mono", monospace';
      ctx.fillStyle = 'rgba(0, 255, 100, 0.22)';
      ctx.fillText('_root.onEnterFrame = function() {', 40, 100);
      ctx.fillText('  Ghost.anticipatePlayerHabits();', 60, 125);
      ctx.fillText('  if (player.isJumping) Ghost.antiAirSweep();', 60, 150);
      ctx.fillText('  0x7E5_STACK_OVERFLOW_VECTORS();', 60, 175);
      ctx.fillText('};', 40, 200);

    } else if (this.stage === 'void') {
      // 4. 2021 KILL-SWITCH VOID (Round 4)
      const grad = ctx.createLinearGradient(0, minY, 0, maxY);
      grad.addColorStop(0, '#06060c');
      grad.addColorStop(0.5, '#120d1c');
      grad.addColorStop(1, '#040308');
      ctx.fillStyle = grad;
      ctx.fillRect(minX, minY, totalW, totalH);

      // Dark floor
      ctx.fillStyle = '#0d0b16';
      ctx.fillRect(minX, floorY, totalW, maxY - floorY);

      // Cyan Grid Floor
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      for (let x = minX; x <= maxX; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, floorY);
        ctx.lineTo(x, maxY);
        ctx.stroke();
      }
      for (let y = floorY; y <= maxY; y += 30) {
        ctx.beginPath();
        ctx.moveTo(minX, y);
        ctx.lineTo(maxX, y);
        ctx.stroke();
      }

      // Neon Cyan Floor Rim with Red Glitch Outline
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(minX, floorY);
      ctx.lineTo(maxX, floorY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Shattered Adobe Flash Puzzle Monolith
      const cx = this.width / 2;
      ctx.save();
      ctx.font = 'italic bold 170px "Arial Black", sans-serif';
      ctx.fillStyle = 'rgba(255, 0, 80, 0.07)';
      ctx.textAlign = 'center';
      ctx.fillText('f', cx, floorY - 50);

      // Warning Prompt
      ctx.font = 'bold 12px "Share Tech Mono", monospace';
      ctx.fillStyle = 'rgba(255, 50, 80, 0.4)';
      ctx.fillText('[CRITICAL EXECUTION ERROR 0x7E5 — JAN 12, 2021 TIME-BOMB ACTIVE]', cx, floorY - 180);
      ctx.fillText('[MEMORY ADAPTATION: GOOGLE GEMMA 3:4B LOCAL ENGINE]', cx, floorY - 160);
      ctx.restore();

    } else if (this.stage === 'ofrenda') {
      // 5. DÍA DE LOS MUERTOS ALTAR (Round 5)
      // Twilight Night Sky
      const nightGrad = ctx.createLinearGradient(0, minY, 0, floorY);
      nightGrad.addColorStop(0, '#10061e');
      nightGrad.addColorStop(0.6, '#280c38');
      nightGrad.addColorStop(1, '#0e0417');
      ctx.fillStyle = nightGrad;
      ctx.fillRect(minX, minY, totalW, floorY - minY);

      // Full Moon
      ctx.save();
      ctx.fillStyle = '#fff9d6';
      ctx.shadowColor = '#ffeb3b';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(this.width - 120, 90, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Waving Papel Picado Banners across the top
      this.drawPapelPicadoRow(ctx, minX, maxX, 18);

      // Earthy altar floor
      ctx.fillStyle = '#16081c';
      ctx.fillRect(minX, floorY, totalW, maxY - floorY);

      // Golden Marigold Floor Rim
      ctx.strokeStyle = '#ff9800';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffa726';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(minX, floorY);
      ctx.lineTo(maxX, floorY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Memorial Gravestones with Candles
      this.drawAltarCandle(ctx, 80, floorY);
      this.drawAltarCandle(ctx, 220, floorY);
      this.drawAltarCandle(ctx, this.width - 100, floorY);
      this.drawAltarCandle(ctx, this.width - 240, floorY);

      // Center Calavera Banner
      ctx.save();
      ctx.font = 'bold 36px "VT323", monospace';
      ctx.fillStyle = 'rgba(255, 179, 0, 0.22)';
      ctx.textAlign = 'center';
      ctx.fillText('💀 DÍA DE LOS MUERTOS — FLASH OFRENDA 🕯️', this.width / 2, floorY - 90);
      ctx.restore();
    }

    ctx.restore();

    this.cachedStage = this.stage;
    this.cachedWidth = this.width;
    this.cachedHeight = this.height;
  }

  private drawPuffyCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(x, y, 22 * scale, 0, Math.PI * 2);
    ctx.arc(x + 24 * scale, y - 10 * scale, 28 * scale, 0, Math.PI * 2);
    ctx.arc(x + 55 * scale, y, 24 * scale, 0, Math.PI * 2);
    ctx.arc(x + 36 * scale, y + 10 * scale, 20 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawPapelPicadoRow(ctx: CanvasRenderingContext2D, minX: number, maxX: number, y: number) {
    const colors = ['#e91e63', '#ff9800', '#9c27b0', '#ffeb3b', '#00e676', '#00bcd4'];
    const flagW = 38;
    const flagH = 46;

    // String across the top
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(minX, y);
    ctx.lineTo(maxX, y);
    ctx.stroke();

    let i = 0;
    for (let x = minX + 20; x < maxX - 20; x += flagW + 8) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + flagW, y);
      ctx.lineTo(x + flagW, y + flagH);
      ctx.lineTo(x + flagW / 2, y + flagH - 10);
      ctx.lineTo(x, y + flagH);
      ctx.closePath();
      ctx.fill();

      // Cutout details
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(x + flagW / 2, y + 20, 6, 0, Math.PI * 2);
      ctx.fill();
      i++;
    }
  }

  private drawAltarCandle(ctx: CanvasRenderingContext2D, x: number, floorY: number) {
    ctx.save();
    // Candle wax body
    ctx.fillStyle = '#fff8e7';
    ctx.fillRect(x - 6, floorY - 26, 12, 26);
    // Wick
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, floorY - 26);
    ctx.lineTo(x, floorY - 32);
    ctx.stroke();
    // Glowing Flame Halo
    ctx.fillStyle = 'rgba(255, 152, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(x, floorY - 35, 14, 0, Math.PI * 2);
    ctx.fill();
    // Flame teardrop
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.ellipse(x, floorY - 35, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderDesktopIconToCtx(ctx: CanvasRenderingContext2D, x: number, y: number, icon: string, name: string) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '28px sans-serif';
    ctx.fillText(icon, x, y);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(name, x, y + 16);
    ctx.restore();
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
