// ============================================================================
// KillSwitch.swf — Dynamic Skeletal Stickman Martial Arts Fighter
// Distinct body proportions, variable scales (Speedster to Titan), and unique props
// ============================================================================

import { getPoseForState } from './StickmanPoses';

export type FighterState = 
  | 'IDLE' 
  | 'WALK_FORWARD' 
  | 'WALK_BACK' 
  | 'JUMP' 
  | 'CROUCH' 
  | 'JAB' 
  | 'HEAVY_KICK' 
  | 'JUMP_KICK' 
  | 'BLOCK' 
  | 'HIT_STUN' 
  | 'KNOCKDOWN' 
  | 'VICTORY';

export type CharacterSkin = 
  | 'orange'    // Apex Striker (Orange Ink + Stylus)
  | 'chosen'    // Plasma Ascetic (Hollow Head, Cyan Aura)
  | 'darklord'  // Crimson Titan (Heavyweight Titan, Dual Energy Blades)
  | 'green'     // Jade Acrobat (Nimble Martial Artist)
  | 'blue'      // Azure Speedster (Compact Rush Fighter)
  | 'yellow'    // Volt Striker (Spark Rush)
  | 'classic'   // Xiao Xiao Grandmaster (White Ink + Red Headband)
  | 'calavera'  // Calavera Phantom (Día de los Muertos Resurrected Warrior)
  | 'ghost';    // The Flash Ghost (Corrupted Bytecode Boss)

export interface Hitbox {
  x: number;
  y: number;
  w: number;
  h: number;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  isHeavy: boolean;
}

export interface Hurtbox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class Stickman {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public groundY: number = 410;
  public facing: number = 1;
  public isAI: boolean;
  public name: string;
  public skin: CharacterSkin = 'orange';
  public color: string = '#ff8c00';
  public auraColor: string | null = null;
  public isHollowHead: boolean = false;
  public health: number = 100;
  public maxHealth: number = 100;
  public damageMultiplier: number = 1.0;

  // --- Dynamic Physical Stature & Scale Variation ---
  public scale: number = 1.0;
  public thickness: number = 4.2;
  public headScale: number = 1.0;
  public sizeMultiplier: number = 1.0;

  public state: FighterState = 'IDLE';
  public stateTime: number = 0;
  public animFrame: number = 0;
  public isGrounded: boolean = true;
  public hitStunFrames: number = 0;
  public blockStunFrames: number = 0;

  public flashFrames: number = 0;
  public glitchOffset: number = 0;

  constructor(x: number, isAI: boolean = false, name: string = 'Stickman', skin: CharacterSkin = 'orange') {
    this.x = x;
    this.y = this.groundY;
    this.isAI = isAI;
    this.name = name;
    this.applySkin(skin);
    this.facing = isAI ? -1 : 1;
  }

  // --- Archetype Proportions, Sizing & Palettes ---
  public applySkin(skin: CharacterSkin, customSizeMultiplier: number = 1.0) {
    this.skin = skin;
    this.sizeMultiplier = customSizeMultiplier;
    this.isHollowHead = false;
    this.auraColor = null;

    let baseScale = 1.00;
    let baseThickness = 4.2;
    let baseHeadScale = 1.00;

    if (skin === 'orange') {
      // Apex Striker: Balanced athletic physique with artist stylus
      this.color = '#ff8800';
      this.auraColor = '#ffbb44';
      baseScale = 1.00;
      baseThickness = 4.2;
      baseHeadScale = 1.00;
    } else if (skin === 'chosen') {
      // Plasma Ascetic: Tall, lithe martial artist with Cyan Ring
      this.color = '#111111';
      this.isHollowHead = true;
      this.auraColor = '#00ffff';
      baseScale = 1.10;
      baseThickness = 4.0;
      baseHeadScale = 0.95;
    } else if (skin === 'darklord') {
      // Crimson Titan: Towering heavyweight brawler with dual energy blades
      this.color = '#ee1133';
      this.isHollowHead = true;
      this.auraColor = '#ff0044';
      baseScale = 1.28;
      baseThickness = 5.8;
      baseHeadScale = 0.90;
    } else if (skin === 'green') {
      // Jade Acrobat: Flexible, nimble martial artist
      this.color = '#00e676';
      this.auraColor = '#69f0ae';
      baseScale = 0.94;
      baseThickness = 3.8;
      baseHeadScale = 1.00;
    } else if (skin === 'blue') {
      // Azure Speedster: Compact, rapid low-profile rusher
      this.color = '#2979ff';
      this.auraColor = '#82b1ff';
      baseScale = 0.85;
      baseThickness = 3.5;
      baseHeadScale = 1.05;
    } else if (skin === 'yellow') {
      // Volt Striker: Quick, energetic spark brawler
      this.color = '#ffea00';
      this.auraColor = '#fff59d';
      baseScale = 0.90;
      baseThickness = 3.8;
      baseHeadScale = 1.02;
    } else if (skin === 'classic') {
      // Xiao Xiao Grandmaster: Traditional martial artist with red headband
      this.color = '#ffffff';
      this.auraColor = null;
      baseScale = 1.02;
      baseThickness = 4.4;
      baseHeadScale = 1.00;
    } else if (skin === 'calavera') {
      // Calavera Phantom: Day of the Dead Resurrected Warrior
      this.color = '#f5f5f5';
      this.auraColor = '#ffaa00';
      baseScale = 1.18;
      baseThickness = 4.8;
      baseHeadScale = 1.05;
    } else if (skin === 'ghost') {
      // Flash Ghost Boss: Imposing cyber-phantom
      this.color = '#ff00aa';
      this.auraColor = '#d175ff';
      baseScale = 1.16;
      baseThickness = 4.8;
      baseHeadScale = 0.96;
    }

    this.scale = baseScale * customSizeMultiplier;
    this.thickness = baseThickness * customSizeMultiplier;
    this.headScale = baseHeadScale;
  }

  public reset(x: number) {
    this.x = x;
    this.y = this.groundY;
    this.vx = 0;
    this.vy = 0;
    this.health = this.maxHealth;
    this.state = 'IDLE';
    this.stateTime = 0;
    this.animFrame = 0;
    this.hitStunFrames = 0;
    this.blockStunFrames = 0;
    this.facing = this.isAI ? -1 : 1;
  }

  // --- Snappy Responsive Movement & Martial Arts Attacks ---
  public move(dir: number) {
    if (this.canAct()) {
      const speed = 5.2;
      this.vx = dir * speed;
      if (this.isGrounded) {
        if ((dir > 0 && this.facing > 0) || (dir < 0 && this.facing < 0)) {
          this.setState('WALK_FORWARD');
        } else {
          this.setState('WALK_BACK');
        }
      }
    }
  }

  public stopMoving() {
    if (this.state === 'WALK_FORWARD' || this.state === 'WALK_BACK') {
      this.setState('IDLE');
    }
    this.vx *= 0.5;
  }

  // Snappy, weighted martial arts hop (Xiao Xiao / Stick Fight style)
  public jump() {
    if (this.canAct() && this.isGrounded) {
      this.vy = -9.6;
      this.isGrounded = false;
      this.setState('JUMP');
    }
  }

  public crouch() {
    if (this.canAct() && this.isGrounded) {
      this.vx = 0;
      this.setState('CROUCH');
    }
  }

  public unCrouch() {
    if (this.state === 'CROUCH') {
      this.setState('IDLE');
    }
  }

  public jab() {
    if (this.canAct() && this.isGrounded) {
      this.vx = this.facing * 2.5;
      this.setState('JAB');
    }
  }

  public heavyKick() {
    const canCancel = this.state === 'JAB' && this.stateTime >= 5;
    if ((this.canAct() || canCancel) && this.isGrounded) {
      this.vx = this.facing * 4.0;
      this.setState('HEAVY_KICK');
    }
  }

  public jumpKick() {
    if (this.canAct() && !this.isGrounded) {
      this.vx = this.facing * 8.5;
      this.vy = 5.0;
      this.setState('JUMP_KICK');
    }
  }

  public block(holding: boolean) {
    if (holding) {
      if (this.canAct() && this.isGrounded) {
        this.vx = 0;
        this.setState('BLOCK');
      }
    } else {
      if (this.state === 'BLOCK') {
        this.setState('IDLE');
      }
    }
  }

  public canAct(): boolean {
    return (
      this.state !== 'HIT_STUN' &&
      this.state !== 'KNOCKDOWN' &&
      this.state !== 'JAB' &&
      this.state !== 'HEAVY_KICK' &&
      this.state !== 'JUMP_KICK'
    );
  }

  public setState(newState: FighterState) {
    if (this.state === newState) return;
    this.state = newState;
    this.stateTime = 0;
  }

  public update(arenaWidth: number) {
    this.stateTime++;
    this.animFrame++;

    if (this.flashFrames > 0) this.flashFrames--;

    if (this.skin === 'ghost' && Math.random() < 0.22) {
      this.glitchOffset = (Math.random() - 0.5) * 8;
    } else {
      this.glitchOffset = 0;
    }

    // Snappy grounded gravity
    if (!this.isGrounded) {
      this.vy += 1.08;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Floor collision
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      if (!this.isGrounded) {
        this.isGrounded = true;
        if (this.state === 'JUMP' || this.state === 'JUMP_KICK') {
          this.setState('IDLE');
        }
      }
    }

    if (this.isGrounded) {
      if (this.state === 'IDLE' || this.state === 'BLOCK' || this.state === 'CROUCH') {
        this.vx *= 0.72;
      }
    }

    const padding = 40;
    if (this.x < padding) {
      this.x = padding;
      if (this.state === 'HIT_STUN' && Math.abs(this.vx) > 3) {
        this.vx = -this.vx * 0.6;
      } else {
        this.vx = 0;
      }
    } else if (this.x > arenaWidth - padding) {
      this.x = arenaWidth - padding;
      if (this.state === 'HIT_STUN' && Math.abs(this.vx) > 3) {
        this.vx = -this.vx * 0.6;
      } else {
        this.vx = 0;
      }
    }

    if (this.state === 'JAB' && this.stateTime > 12) {
      this.setState('IDLE');
    } else if (this.state === 'HEAVY_KICK' && this.stateTime > 20) {
      this.setState('IDLE');
    } else if (this.state === 'HIT_STUN') {
      this.hitStunFrames--;
      if (this.hitStunFrames <= 0) {
        this.setState('IDLE');
      }
    } else if (this.state === 'KNOCKDOWN' && this.stateTime > 45) {
      this.setState('IDLE');
    }
  }

  public getHurtbox(): Hurtbox {
    const isCrouching = this.state === 'CROUCH';
    const s = this.scale;
    const h = (isCrouching ? 55 : 95) * s;
    const w = 38 * s;
    return { x: this.x - w / 2, y: this.y - h, w, h };
  }

  public getHitbox(): Hitbox | null {
    const s = this.scale;
    const dmgMult = this.damageMultiplier;
    if (this.state === 'JAB' && this.stateTime >= 3 && this.stateTime <= 7) {
      return {
        x: this.facing > 0 ? this.x + 12 * s : this.x - 52 * s,
        y: this.y - 78 * s,
        w: 42 * s,
        h: 26 * s,
        damage: Math.round(10 * Math.max(0.8, s) * dmgMult),
        knockbackX: this.facing * (4.0 * s),
        knockbackY: -2.5 * s,
        isHeavy: false
      };
    }

    if (this.state === 'HEAVY_KICK' && this.stateTime >= 5 && this.stateTime <= 13) {
      return {
        x: this.facing > 0 ? this.x + 14 * s : this.x - 64 * s,
        y: this.y - 84 * s,
        w: 52 * s,
        h: 36 * s,
        damage: Math.round(20 * Math.max(0.8, s) * dmgMult),
        knockbackX: this.facing * (8.5 * s),
        knockbackY: -5.5 * s,
        isHeavy: true
      };
    }

    if (this.state === 'JUMP_KICK' && this.stateTime >= 2) {
      return {
        x: this.facing > 0 ? this.x + 12 * s : this.x - 60 * s,
        y: this.y - 68 * s,
        w: 50 * s,
        h: 40 * s,
        damage: Math.round(26 * Math.max(0.8, s) * dmgMult),
        knockbackX: this.facing * (10.0 * s),
        knockbackY: -6.5 * s,
        isHeavy: true
      };
    }

    return null;
  }

  public takeHit(hitbox: Hitbox): { damageDealt: number; blocked: boolean } {
    const isGuarding = this.state === 'BLOCK';

    if (isGuarding) {
      const blockedDamage = Math.max(1, Math.round(hitbox.damage * 0.15));
      this.health = Math.max(0, this.health - blockedDamage);
      this.vx = hitbox.knockbackX * 0.35;
      this.flashFrames = 4;
      return { damageDealt: blockedDamage, blocked: true };
    }

    this.health = Math.max(0, this.health - hitbox.damage);
    this.vx = hitbox.knockbackX;
    this.vy = hitbox.knockbackY;
    this.flashFrames = 10;

    if (hitbox.isHeavy || this.health <= 0) {
      this.hitStunFrames = 26;
      this.setState('HIT_STUN');
      this.isGrounded = false;
    } else {
      this.hitStunFrames = 13;
      this.setState('HIT_STUN');
    }

    return { damageDealt: hitbox.damage, blocked: false };
  }

  // --- Dynamic Procedural Skeletal Render Engine ---
  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const s = this.scale;
    const renderX = this.x + this.glitchOffset;
    const renderY = this.y;

    // Floor Shadow
    const elevation = Math.max(0, this.groundY - this.y);
    const shadowWidth = Math.max(10 * s, (24 * s) - elevation * 0.15);
    const shadowAlpha = Math.max(0.1, 0.45 - elevation * 0.003);

    ctx.beginPath();
    ctx.ellipse(renderX, this.groundY, shadowWidth, 6 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.fill();

    // Line Styles
    ctx.lineWidth = this.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (this.flashFrames > 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 14 * s;
    } else {
      ctx.strokeStyle = this.color;
      if (this.auraColor) {
        ctx.shadowColor = this.auraColor;
        ctx.shadowBlur = 12 * s;
      } else {
        ctx.shadowBlur = 0;
      }
    }

    const f = this.facing;

    // Fast deterministic frame pose lookup (Zero trigonometry per frame, ultra-low RAM)
    const pose = getPoseForState(this.state, this.stateTime, this.animFrame);

    const headX = renderX + pose.headX * f * s;
    const headY = renderY + pose.headY * s;
    const neckX = renderX + pose.neckX * f * s;
    const neckY = renderY + pose.neckY * s;
    const pelvisX = renderX + pose.pelvisX * f * s;
    const pelvisY = renderY + pose.pelvisY * s;

    const leftHandX = renderX + pose.leftHandX * f * s;
    const leftHandY = renderY + pose.leftHandY * s;
    const rightHandX = renderX + pose.rightHandX * f * s;
    const rightHandY = renderY + pose.rightHandY * s;

    const leftFootX = renderX + pose.leftFootX * f * s;
    const leftFootY = renderY + pose.leftFootY * s;
    const rightFootX = renderX + pose.rightFootX * f * s;
    const rightFootY = renderY + pose.rightFootY * s;

    if (this.state === 'BLOCK') {
      // Energy Shield Barrier
      ctx.beginPath();
      ctx.arc(renderX + 18 * f * s, renderY - 60 * s, 32 * s, -Math.PI / 2.3, Math.PI / 2.3, f < 0);
      ctx.lineWidth = 4.5 * s;
      ctx.strokeStyle = this.auraColor || this.color;
      ctx.stroke();
      ctx.lineWidth = this.thickness;
      ctx.strokeStyle = this.color;
    }

    // 1. Spine
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(pelvisX, pelvisY);
    ctx.stroke();

    // --- Martial Arts Belt & Fluttering Sash Ribbons ---
    ctx.save();
    ctx.strokeStyle = this.skin === 'classic' ? '#ff2200' : (this.skin === 'ghost' ? '#d175ff' : '#222222');
    ctx.lineWidth = 3.2 * s;
    // Belt knot at pelvis
    ctx.beginPath();
    ctx.arc(pelvisX, pelvisY, 3.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    // Two trailing ribbons fluttering with motion
    const sashWave1 = Math.sin(this.animFrame * 0.22) * 5 * s;
    const sashWave2 = Math.cos(this.animFrame * 0.18) * 6 * s;
    ctx.beginPath();
    ctx.moveTo(pelvisX, pelvisY);
    ctx.quadraticCurveTo(pelvisX - 10 * f * s, pelvisY + 12 * s + sashWave1, pelvisX - 18 * f * s, pelvisY + 22 * s + sashWave1);
    ctx.moveTo(pelvisX, pelvisY);
    ctx.quadraticCurveTo(pelvisX - 8 * f * s, pelvisY + 14 * s + sashWave2, pelvisX - 14 * f * s, pelvisY + 26 * s + sashWave2);
    ctx.stroke();
    ctx.restore();

    // 2. Head (Hollow Ring Head or Solid Minimalist Circle)
    const headRadius = 13 * s * this.headScale;
    if (this.isHollowHead) {
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
      ctx.lineWidth = 4.5 * s;
      ctx.strokeStyle = this.color;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // Hollow Head Glowing Eyes
      if (this.skin === 'chosen') {
        // Cyan Flame Pupils
        ctx.save();
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10 * s;
        ctx.beginPath();
        ctx.arc(headX + 4 * f * s, headY - 1 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.arc(headX - 1 * f * s, headY - 1 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (this.skin === 'darklord') {
        // Piercing Crimson Demon Eyes
        ctx.save();
        ctx.fillStyle = '#ff0033';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 12 * s;
        ctx.beginPath();
        ctx.arc(headX + 4 * f * s, headY - 1 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.arc(headX - 1 * f * s, headY - 1 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else {
      // Solid Minimalist Circle
      ctx.beginPath();
      ctx.arc(headX, headY, 12 * s * this.headScale, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = this.color;
      ctx.stroke();

      // Expressive Anime Battle Eyes
      ctx.save();
      const eyeColor = (this.color === '#ffffff' || this.color === '#ffea00') ? '#111111' : '#ffffff';
      ctx.strokeStyle = eyeColor;
      ctx.fillStyle = eyeColor;
      ctx.lineWidth = 2.0 * s;

      if (this.state === 'HIT_STUN') {
        // Shock / Knockout Eyes (X X)
        ctx.beginPath();
        // Eye 1
        ctx.moveTo(headX + (2 * f - 3) * s, headY - 4 * s);
        ctx.lineTo(headX + (2 * f + 3) * s, headY + 2 * s);
        ctx.moveTo(headX + (2 * f + 3) * s, headY - 4 * s);
        ctx.lineTo(headX + (2 * f - 3) * s, headY + 2 * s);
        // Eye 2
        ctx.moveTo(headX + (-4 * f - 3) * s, headY - 4 * s);
        ctx.lineTo(headX + (-4 * f + 3) * s, headY + 2 * s);
        ctx.moveTo(headX + (-4 * f + 3) * s, headY - 4 * s);
        ctx.lineTo(headX + (-4 * f - 3) * s, headY + 2 * s);
        ctx.stroke();
      } else if (this.state === 'JAB' || this.state === 'HEAVY_KICK' || this.state === 'JUMP_KICK') {
        // Fierce Determined Battle Slants
        ctx.beginPath();
        ctx.moveTo(headX + 1 * f * s, headY - 3 * s);
        ctx.lineTo(headX + 6 * f * s, headY - 1 * s);
        ctx.moveTo(headX - 5 * f * s, headY - 3 * s);
        ctx.lineTo(headX - 1 * f * s, headY - 1 * s);
        ctx.stroke();
      } else {
        // Calm Focused Battle Slits
        ctx.beginPath();
        ctx.arc(headX + 4 * f * s, headY - 1 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.arc(headX - 2 * f * s, headY - 1 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Flash Ghost Ethereal Glitch Face
    if (this.skin === 'ghost') {
      ctx.save();
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#ff00aa';
      ctx.shadowBlur = 14 * s;
      ctx.fillRect(headX + (2 * f - 2) * s, headY - 2 * s, 4 * s, 3 * s);
      ctx.fillRect(headX - (4 * f + 2) * s, headY - 2 * s, 4 * s, 3 * s);
      ctx.restore();
    }

    // Calavera Phantom Day of the Dead Sugar Skull Ornaments
    if (this.skin === 'calavera') {
      ctx.save();
      // Marigold flower petals surrounding eye sockets
      ctx.fillStyle = '#ffaa00';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const petX = headX + 3 * f * s + Math.cos(a) * 5 * s;
        const petY = headY - 1 * s + Math.sin(a) * 5 * s;
        ctx.beginPath();
        ctx.arc(petX, petY, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      // Skull mouth stitches
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.moveTo(headX + (f * s - 4 * s), headY + 7 * s);
      ctx.lineTo(headX + (f * s + 6 * s), headY + 7 * s);
      ctx.stroke();
      for (let st = -3; st <= 5; st += 2.5) {
        ctx.beginPath();
        ctx.moveTo(headX + (f * s + st * s), headY + 5 * s);
        ctx.lineTo(headX + (f * s + st * s), headY + 9 * s);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Xiao Xiao Legendary Red Headband (Dual Long Billowing Ribbons)
    if (this.skin === 'classic') {
      ctx.save();
      ctx.strokeStyle = '#ff1100';
      ctx.lineWidth = 3.5 * s;
      ctx.beginPath();
      ctx.arc(headX, headY - 4 * s, 13 * s, Math.PI * 0.75, Math.PI * 1.85, false);
      ctx.stroke();

      const wave1 = Math.sin(this.animFrame * 0.22) * 7 * s;
      const wave2 = Math.cos(this.animFrame * 0.26) * 8 * s;
      // Ribbon 1
      ctx.beginPath();
      ctx.moveTo(headX - 12 * f * s, headY - 4 * s);
      ctx.bezierCurveTo(headX - 24 * f * s, headY - 2 * s + wave1, headX - 36 * f * s, headY + 4 * s + wave2, headX - 46 * f * s, headY + 2 * s + wave1);
      ctx.stroke();
      // Ribbon 2 (Lower tail)
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(headX - 12 * f * s, headY - 2 * s);
      ctx.bezierCurveTo(headX - 22 * f * s, headY + 4 * s + wave2, headX - 32 * f * s, headY + 12 * s + wave1, headX - 42 * f * s, headY + 14 * s + wave2);
      ctx.stroke();
      ctx.restore();
    }

    // Apex Striker Artist Stylus Prop + Ink Slash
    if (this.skin === 'orange') {
      ctx.save();
      ctx.lineWidth = 3.8 * s;
      ctx.strokeStyle = '#663a15';
      ctx.beginPath();
      ctx.moveTo(rightHandX, rightHandY);
      ctx.lineTo(rightHandX + 18 * f * s, rightHandY - 16 * s);
      ctx.stroke();
      // Golden Ferrule
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4.2 * s;
      ctx.beginPath();
      ctx.moveTo(rightHandX + 14 * f * s, rightHandY - 12 * s);
      ctx.lineTo(rightHandX + 17 * f * s, rightHandY - 15 * s);
      ctx.stroke();
      // Glowing Orange Ink Tip
      ctx.fillStyle = '#ff5500';
      ctx.shadowColor = '#ff7700';
      ctx.shadowBlur = 10 * s;
      ctx.beginPath();
      ctx.arc(rightHandX + 20 * f * s, rightHandY - 18 * s, 4.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Calligraphy Slash Trail during attacks
      if (this.state === 'JAB' || this.state === 'HEAVY_KICK') {
        ctx.strokeStyle = 'rgba(255, 120, 0, 0.7)';
        ctx.lineWidth = 6 * s;
        ctx.beginPath();
        ctx.arc(renderX + 24 * f * s, renderY - 60 * s, 48 * s, -Math.PI / 3, Math.PI / 3, f < 0);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Crimson Titan Dual Energy Laser Blades
    if (this.skin === 'darklord') {
      ctx.save();
      ctx.strokeStyle = '#ff0044';
      ctx.lineWidth = 4.8 * s;
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 18 * s;
      // Right Hand Blade
      ctx.beginPath();
      ctx.moveTo(rightHandX, rightHandY);
      ctx.lineTo(rightHandX + 30 * f * s, rightHandY - 8 * s);
      ctx.stroke();
      // Left Hand Blade
      ctx.beginPath();
      ctx.moveTo(leftHandX, leftHandY);
      ctx.lineTo(leftHandX + 26 * f * s, leftHandY - 12 * s);
      ctx.stroke();
      ctx.restore();
    }

    // Plasma Ascetic Divine Plasma Aura on Fists
    if (this.skin === 'chosen' && (this.state === 'JAB' || this.state === 'HEAVY_KICK' || this.state === 'JUMP_KICK')) {
      ctx.save();
      ctx.strokeStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 16 * s;
      ctx.lineWidth = 4 * s;
      ctx.beginPath();
      ctx.arc(rightHandX, rightHandY, 8 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Flash Ghost Spectral Claws
    if (this.skin === 'ghost') {
      ctx.save();
      ctx.strokeStyle = '#ff00aa';
      ctx.shadowColor = '#ff75df';
      ctx.shadowBlur = 14 * s;
      ctx.lineWidth = 2.5 * s;
      for (let c = -1; c <= 1; c++) {
        ctx.beginPath();
        ctx.moveTo(rightHandX, rightHandY);
        ctx.lineTo(rightHandX + (12 + Math.abs(c) * 4) * f * s, rightHandY + c * 5 * s);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Left Arm
    const leftElbowX = (neckX + leftHandX) / 2 - 4 * f * s;
    const leftElbowY = (neckY + leftHandY) / 2 + 5 * s;
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(leftElbowX, leftElbowY);
    ctx.lineTo(leftHandX, leftHandY);
    ctx.stroke();

    // 4. Right Arm
    const rightElbowX = (neckX + rightHandX) / 2 + 4 * f * s;
    const rightElbowY = (neckY + rightHandY) / 2 + 5 * s;
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(rightElbowX, rightElbowY);
    ctx.lineTo(rightHandX, rightHandY);
    ctx.stroke();

    // --- Martial Arts Clenched Fists ---
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.arc(leftHandX, leftHandY, 4.5 * s, 0, Math.PI * 2);
    ctx.arc(rightHandX, rightHandY, 4.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 5. Left Leg
    const leftKneeX = (pelvisX + leftFootX) / 2 - 6 * f * s;
    const leftKneeY = (pelvisY + leftFootY) / 2;
    ctx.beginPath();
    ctx.moveTo(pelvisX, pelvisY);
    ctx.lineTo(leftKneeX, leftKneeY);
    ctx.lineTo(leftFootX, leftFootY);
    ctx.stroke();

    // 6. Right Leg
    const rightKneeX = (pelvisX + rightFootX) / 2 + 5 * f * s;
    const rightKneeY = (pelvisY + rightFootY) / 2;
    ctx.beginPath();
    ctx.moveTo(pelvisX, pelvisY);
    ctx.lineTo(rightKneeX, rightKneeY);
    ctx.lineTo(rightFootX, rightFootY);
    ctx.stroke();

    // --- Planted Martial Arts Feet (Stylized Soles) ---
    ctx.save();
    ctx.lineWidth = 3.8 * s;
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(leftFootX - 4 * f * s, leftFootY);
    ctx.lineTo(leftFootX + 8 * f * s, leftFootY);
    ctx.moveTo(rightFootX - 4 * f * s, rightFootY);
    ctx.lineTo(rightFootX + 8 * f * s, rightFootY);
    ctx.stroke();
    ctx.restore();

    // Dynamic Crescent Slash Arcs on Kicks
    if (this.state === 'HEAVY_KICK' && this.stateTime >= 5 && this.stateTime <= 12) {
      ctx.save();
      ctx.strokeStyle = this.auraColor || this.color;
      ctx.lineWidth = 5 * s;
      ctx.shadowColor = this.auraColor || this.color;
      ctx.shadowBlur = 12 * s;
      ctx.beginPath();
      ctx.arc(renderX + 15 * f * s, renderY - 45 * s, 52 * s, -Math.PI / 4, Math.PI / 4, f < 0);
      ctx.stroke();
      ctx.restore();
    } else if (this.state === 'JUMP_KICK' && this.stateTime >= 3) {
      ctx.save();
      ctx.strokeStyle = this.auraColor || this.color;
      ctx.lineWidth = 4 * s;
      ctx.shadowColor = this.auraColor || this.color;
      ctx.shadowBlur = 10 * s;
      ctx.beginPath();
      ctx.moveTo(renderX - 25 * f * s, renderY - 80 * s);
      ctx.lineTo(renderX + 45 * f * s, renderY - 40 * s);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}
