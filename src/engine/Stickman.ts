// ============================================================================
// KillSwitch.swf — Alan Becker "Animator vs. Animation" Skeletal Stickman
// Hollow heads (The Chosen One, The Dark Lord), The Second Coming (Orange),
// Color-coded cast (Green, Blue, Yellow), and animator tools as props!
// ============================================================================

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
  | 'orange'    // The Second Coming (Alan Becker)
  | 'chosen'    // The Chosen One (Hollow Head, Cyan Aura)
  | 'darklord'  // The Dark Lord (Hollow Head, Crimson Energy)
  | 'green'     // Green (Acrobat)
  | 'blue'      // Blue (Speedster)
  | 'yellow'    // Yellow (Redstone/Coder)
  | 'classic'   // Xiao Xiao Classic (Red Headband)
  | 'ghost';    // The Flash Ghost (Corrupted Matrix)

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

  // --- Authentic Alan Becker Color Palettes & Archetypes ---
  public applySkin(skin: CharacterSkin) {
    this.skin = skin;
    this.isHollowHead = false;
    this.auraColor = null;

    if (skin === 'orange') {
      // The Second Coming: Vibrant Warm Orange with drawing brush
      this.color = '#ff8800';
      this.auraColor = '#ffbb44';
    } else if (skin === 'chosen') {
      // The Chosen One: Pitch Black Hollow Head with Cyan Divine Flame
      this.color = '#111111';
      this.isHollowHead = true;
      this.auraColor = '#00ffff';
    } else if (skin === 'darklord') {
      // The Dark Lord: Blood Crimson Hollow Head with Red Flame
      this.color = '#ee1133';
      this.isHollowHead = true;
      this.auraColor = '#ff0044';
    } else if (skin === 'green') {
      // Green: Energetic Lime Green
      this.color = '#00e676';
      this.auraColor = '#69f0ae';
    } else if (skin === 'blue') {
      // Blue: Electric Azure
      this.color = '#2979ff';
      this.auraColor = '#82b1ff';
    } else if (skin === 'yellow') {
      // Yellow: Command Block Goldenrod
      this.color = '#ffea00';
      this.auraColor = '#fff59d';
    } else if (skin === 'classic') {
      // Xiao Xiao: White Ink with Red Headband
      this.color = '#ffffff';
      this.auraColor = null;
    } else if (skin === 'ghost') {
      // Flash Ghost: Magenta Glitch
      this.color = '#ff00aa';
      this.auraColor = '#d175ff';
    }
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

  // --- Snappy Alan Becker Movement & Attacks ---
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
    const h = isCrouching ? 55 : 95;
    const w = 38;
    return { x: this.x - w / 2, y: this.y - h, w, h };
  }

  public getHitbox(): Hitbox | null {
    if (this.state === 'JAB' && this.stateTime >= 3 && this.stateTime <= 7) {
      return {
        x: this.facing > 0 ? this.x + 12 : this.x - 52,
        y: this.y - 78,
        w: 42,
        h: 26,
        damage: 10,
        knockbackX: this.facing * 4.0,
        knockbackY: -2.5,
        isHeavy: false
      };
    }

    if (this.state === 'HEAVY_KICK' && this.stateTime >= 5 && this.stateTime <= 13) {
      return {
        x: this.facing > 0 ? this.x + 14 : this.x - 62,
        y: this.y - 84,
        w: 50,
        h: 34,
        damage: 20,
        knockbackX: this.facing * 8.5,
        knockbackY: -5.5,
        isHeavy: true
      };
    }

    if (this.state === 'JUMP_KICK' && this.stateTime >= 2) {
      return {
        x: this.facing > 0 ? this.x + 12 : this.x - 58,
        y: this.y - 68,
        w: 48,
        h: 38,
        damage: 26,
        knockbackX: this.facing * 10.0,
        knockbackY: -6.5,
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

  // --- Render Alan Becker Style Stickman ---
  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const renderX = this.x + this.glitchOffset;
    const renderY = this.y;

    // Floor Shadow
    const elevation = Math.max(0, this.groundY - this.y);
    const shadowWidth = Math.max(10, 24 - elevation * 0.15);
    const shadowAlpha = Math.max(0.1, 0.45 - elevation * 0.003);

    ctx.beginPath();
    ctx.ellipse(renderX, this.groundY, shadowWidth, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.fill();

    // Line Styles
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (this.flashFrames > 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 14;
    } else {
      ctx.strokeStyle = this.color;
      if (this.auraColor) {
        ctx.shadowColor = this.auraColor;
        ctx.shadowBlur = 12;
      } else {
        ctx.shadowBlur = 0;
      }
    }

    const f = this.facing;
    const t = this.stateTime;

    let headX = renderX;
    let headY = renderY - 88;
    let neckX = renderX;
    let neckY = renderY - 76;
    let pelvisX = renderX;
    let pelvisY = renderY - 45;

    let leftHandX = renderX - 10 * f;
    let leftHandY = renderY - 60;
    let rightHandX = renderX + 14 * f;
    let rightHandY = renderY - 60;

    let leftFootX = renderX - 12 * f;
    let leftFootY = renderY;
    let rightFootX = renderX + 12 * f;
    let rightFootY = renderY;

    // Dynamic Kinematics
    if (this.state === 'IDLE') {
      const breath = Math.sin(this.animFrame * 0.09) * 2.5;
      headY += breath;
      neckY += breath;
      pelvisY += breath * 0.5;
      rightHandX = renderX + 16 * f;
      rightHandY = renderY - 62 + breath;
      leftHandX = renderX - 8 * f;
      leftHandY = renderY - 58 + breath;
    } else if (this.state === 'WALK_FORWARD' || this.state === 'WALK_BACK') {
      const stride = Math.sin(this.animFrame * 0.28) * 18;
      leftFootX = renderX - stride * f;
      rightFootX = renderX + stride * f;
      leftHandX = renderX + stride * 0.8 * f;
      rightHandX = renderX - stride * 0.8 * f;
      headY += Math.abs(Math.sin(this.animFrame * 0.28)) * 3;
    } else if (this.state === 'JUMP') {
      headY = renderY - 92;
      neckY = renderY - 80;
      pelvisY = renderY - 50;
      leftFootX = renderX - 8 * f;
      leftFootY = renderY - 18;
      rightFootX = renderX + 6 * f;
      rightFootY = renderY - 14;
      leftHandX = renderX - 14 * f;
      leftHandY = renderY - 85;
      rightHandX = renderX + 14 * f;
      rightHandY = renderY - 85;
    } else if (this.state === 'CROUCH') {
      headY = renderY - 60;
      neckY = renderY - 50;
      pelvisY = renderY - 26;
      leftFootX = renderX - 18 * f;
      rightFootX = renderX + 16 * f;
      leftHandX = renderX + 6 * f;
      leftHandY = renderY - 45;
      rightHandX = renderX + 20 * f;
      rightHandY = renderY - 45;
    } else if (this.state === 'JAB') {
      pelvisX += 5 * f;
      neckX += 8 * f;
      headX += 10 * f;
      if (t < 6) {
        rightHandX = renderX + 42 * f;
        rightHandY = renderY - 74;
      } else {
        rightHandX = renderX + 20 * f;
        rightHandY = renderY - 66;
      }
      leftHandX = renderX - 4 * f;
      leftHandY = renderY - 70;
    } else if (this.state === 'HEAVY_KICK') {
      pelvisX -= 6 * f;
      neckX -= 8 * f;
      headX -= 12 * f;
      if (t < 5) {
        rightFootX = renderX - 12 * f;
        rightFootY = renderY - 30;
      } else if (t < 13) {
        rightFootX = renderX + 52 * f;
        rightFootY = renderY - 76;
      } else {
        rightFootX = renderX + 22 * f;
        rightFootY = renderY - 22;
      }
      leftFootX = renderX - 10 * f;
      rightHandX = renderX - 14 * f;
      rightHandY = renderY - 78;
    } else if (this.state === 'JUMP_KICK') {
      headX = renderX + 16 * f;
      headY = renderY - 72;
      neckX = renderX + 10 * f;
      neckY = renderY - 64;
      pelvisX = renderX - 12 * f;
      pelvisY = renderY - 46;
      rightFootX = renderX + 50 * f;
      rightFootY = renderY - 62;
      leftFootX = renderX - 24 * f;
      leftFootY = renderY - 36;
      rightHandX = renderX - 16 * f;
      rightHandY = renderY - 66;
    } else if (this.state === 'BLOCK') {
      rightHandX = renderX + 14 * f;
      rightHandY = renderY - 78;
      leftHandX = renderX + 12 * f;
      leftHandY = renderY - 70;

      // Energy Shield Barrier
      ctx.beginPath();
      ctx.arc(renderX + 18 * f, renderY - 60, 32, -Math.PI / 2.3, Math.PI / 2.3, f < 0);
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = this.auraColor || this.color;
      ctx.stroke();
      ctx.lineWidth = 4.2;
      ctx.strokeStyle = this.color;
    } else if (this.state === 'HIT_STUN') {
      headX = renderX - 16 * f;
      neckX = renderX - 10 * f;
      headY = renderY - 84;
      leftHandX = renderX - 22 * f;
      leftHandY = renderY - 72;
      rightHandX = renderX - 12 * f;
      rightHandY = renderY - 82;
    }

    // 1. Spine
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(pelvisX, pelvisY);
    ctx.stroke();

    // --- Martial Arts Belt & Fluttering Sash Ribbons ---
    ctx.save();
    ctx.strokeStyle = this.skin === 'classic' ? '#ff2200' : (this.skin === 'ghost' ? '#d175ff' : '#222222');
    ctx.lineWidth = 3.2;
    // Belt knot at pelvis
    ctx.beginPath();
    ctx.arc(pelvisX, pelvisY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    // Two trailing ribbons fluttering with motion
    const sashWave1 = Math.sin(this.animFrame * 0.22) * 5;
    const sashWave2 = Math.cos(this.animFrame * 0.18) * 6;
    ctx.beginPath();
    ctx.moveTo(pelvisX, pelvisY);
    ctx.quadraticCurveTo(pelvisX - 10 * f, pelvisY + 12 + sashWave1, pelvisX - 18 * f, pelvisY + 22 + sashWave1);
    ctx.moveTo(pelvisX, pelvisY);
    ctx.quadraticCurveTo(pelvisX - 8 * f, pelvisY + 14 + sashWave2, pelvisX - 14 * f, pelvisY + 26 + sashWave2);
    ctx.stroke();
    ctx.restore();

    // 2. Head (Alan Becker Signature: Hollow Ring Head or Solid Minimalist)
    if (this.isHollowHead) {
      // The Chosen One & The Dark Lord: Iconic Hollow Ring Head!
      ctx.beginPath();
      ctx.arc(headX, headY, 13, 0, Math.PI * 2);
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = this.color;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // Hollow Head Glowing Eyes
      if (this.skin === 'chosen') {
        // Divine Cyan Flame Pupils
        ctx.save();
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(headX + 4 * f, headY - 1, 2.5, 0, Math.PI * 2);
        ctx.arc(headX - 1 * f, headY - 1, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (this.skin === 'darklord') {
        // Piercing Crimson Demon Eyes
        ctx.save();
        ctx.fillStyle = '#ff0033';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(headX + 4 * f, headY - 1, 2.5, 0, Math.PI * 2);
        ctx.arc(headX - 1 * f, headY - 1, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else {
      // Solid Minimalist Circle
      ctx.beginPath();
      ctx.arc(headX, headY, 12, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = this.color;
      ctx.stroke();

      // Expressive Anime / Alan Becker Battle Eyes
      ctx.save();
      const eyeColor = (this.color === '#ffffff' || this.color === '#ffea00') ? '#111111' : '#ffffff';
      ctx.strokeStyle = eyeColor;
      ctx.fillStyle = eyeColor;
      ctx.lineWidth = 2.0;

      if (this.state === 'HIT_STUN') {
        // Shock / Knockout Eyes (X X)
        ctx.beginPath();
        // Eye 1
        ctx.moveTo(headX + 2 * f - 3, headY - 4);
        ctx.lineTo(headX + 2 * f + 3, headY + 2);
        ctx.moveTo(headX + 2 * f + 3, headY - 4);
        ctx.lineTo(headX + 2 * f - 3, headY + 2);
        // Eye 2
        ctx.moveTo(headX - 4 * f - 3, headY - 4);
        ctx.lineTo(headX - 4 * f + 3, headY + 2);
        ctx.moveTo(headX - 4 * f + 3, headY - 4);
        ctx.lineTo(headX - 4 * f - 3, headY + 2);
        ctx.stroke();
      } else if (this.state === 'JAB' || this.state === 'HEAVY_KICK' || this.state === 'JUMP_KICK') {
        // Fierce Determined Battle Slants
        ctx.beginPath();
        ctx.moveTo(headX + 1 * f, headY - 3);
        ctx.lineTo(headX + 6 * f, headY - 1);
        ctx.moveTo(headX - 5 * f, headY - 3);
        ctx.lineTo(headX - 1 * f, headY - 1);
        ctx.stroke();
      } else {
        // Calm Focused Battle Slits
        ctx.beginPath();
        ctx.arc(headX + 4 * f, headY - 1, 1.8, 0, Math.PI * 2);
        ctx.arc(headX - 2 * f, headY - 1, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Flash Ghost Ethereal Glitch Face
    if (this.skin === 'ghost') {
      ctx.save();
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#ff00aa';
      ctx.shadowBlur = 14;
      ctx.fillRect(headX + 2 * f - 2, headY - 2, 4, 3);
      ctx.fillRect(headX - 4 * f - 2, headY - 2, 4, 3);
      ctx.restore();
    }

    // Xiao Xiao Legendary Red Headband (Dual Long Billowing Ribbons)
    if (this.skin === 'classic') {
      ctx.save();
      ctx.strokeStyle = '#ff1100';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(headX, headY - 4, 13, Math.PI * 0.75, Math.PI * 1.85, false);
      ctx.stroke();

      const wave1 = Math.sin(this.animFrame * 0.22) * 7;
      const wave2 = Math.cos(this.animFrame * 0.26) * 8;
      // Ribbon 1
      ctx.beginPath();
      ctx.moveTo(headX - 12 * f, headY - 4);
      ctx.bezierCurveTo(headX - 24 * f, headY - 2 + wave1, headX - 36 * f, headY + 4 + wave2, headX - 46 * f, headY + 2 + wave1);
      ctx.stroke();
      // Ribbon 2 (Lower tail)
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(headX - 12 * f, headY - 2);
      ctx.bezierCurveTo(headX - 22 * f, headY + 4 + wave2, headX - 32 * f, headY + 12 + wave1, headX - 42 * f, headY + 14 + wave2);
      ctx.stroke();
      ctx.restore();
    }

    // The Second Coming Drawing Brush Prop + Calligraphy Ink Slash
    if (this.skin === 'orange') {
      ctx.save();
      ctx.lineWidth = 3.8;
      ctx.strokeStyle = '#663a15';
      ctx.beginPath();
      ctx.moveTo(rightHandX, rightHandY);
      ctx.lineTo(rightHandX + 18 * f, rightHandY - 16);
      ctx.stroke();
      // Golden Ferrule
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(rightHandX + 14 * f, rightHandY - 12);
      ctx.lineTo(rightHandX + 17 * f, rightHandY - 15);
      ctx.stroke();
      // Glowing Orange Ink Tip
      ctx.fillStyle = '#ff5500';
      ctx.shadowColor = '#ff7700';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(rightHandX + 20 * f, rightHandY - 18, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Calligraphy Slash Trail during attacks
      if (this.state === 'JAB' || this.state === 'HEAVY_KICK') {
        ctx.strokeStyle = 'rgba(255, 120, 0, 0.7)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(renderX + 24 * f, renderY - 60, 48, -Math.PI / 3, Math.PI / 3, f < 0);
        ctx.stroke();
      }
      ctx.restore();
    }

    // The Dark Lord Dual Energy Laser Blades
    if (this.skin === 'darklord') {
      ctx.save();
      ctx.strokeStyle = '#ff0044';
      ctx.lineWidth = 4.5;
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 18;
      // Right Hand Blade
      ctx.beginPath();
      ctx.moveTo(rightHandX, rightHandY);
      ctx.lineTo(rightHandX + 28 * f, rightHandY - 8);
      ctx.stroke();
      // Left Hand Blade
      ctx.beginPath();
      ctx.moveTo(leftHandX, leftHandY);
      ctx.lineTo(leftHandX + 24 * f, leftHandY - 12);
      ctx.stroke();
      ctx.restore();
    }

    // The Chosen One Divine Plasma Aura on Fists
    if (this.skin === 'chosen' && (this.state === 'JAB' || this.state === 'HEAVY_KICK' || this.state === 'JUMP_KICK')) {
      ctx.save();
      ctx.strokeStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(rightHandX, rightHandY, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Flash Ghost Spectral Claws
    if (this.skin === 'ghost') {
      ctx.save();
      ctx.strokeStyle = '#ff00aa';
      ctx.shadowColor = '#ff75df';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.5;
      for (let c = -1; c <= 1; c++) {
        ctx.beginPath();
        ctx.moveTo(rightHandX, rightHandY);
        ctx.lineTo(rightHandX + (12 + Math.abs(c) * 4) * f, rightHandY + c * 5);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Left Arm
    const leftElbowX = (neckX + leftHandX) / 2 - 4 * f;
    const leftElbowY = (neckY + leftHandY) / 2 + 5;
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(leftElbowX, leftElbowY);
    ctx.lineTo(leftHandX, leftHandY);
    ctx.stroke();

    // 4. Right Arm
    const rightElbowX = (neckX + rightHandX) / 2 + 4 * f;
    const rightElbowY = (neckY + rightHandY) / 2 + 5;
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
    ctx.arc(leftHandX, leftHandY, 4.5, 0, Math.PI * 2);
    ctx.arc(rightHandX, rightHandY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 5. Left Leg
    const leftKneeX = (pelvisX + leftFootX) / 2 - 6 * f;
    const leftKneeY = (pelvisY + leftFootY) / 2;
    ctx.beginPath();
    ctx.moveTo(pelvisX, pelvisY);
    ctx.lineTo(leftKneeX, leftKneeY);
    ctx.lineTo(leftFootX, leftFootY);
    ctx.stroke();

    // 6. Right Leg
    const rightKneeX = (pelvisX + rightFootX) / 2 + 5 * f;
    const rightKneeY = (pelvisY + rightFootY) / 2;
    ctx.beginPath();
    ctx.moveTo(pelvisX, pelvisY);
    ctx.lineTo(rightKneeX, rightKneeY);
    ctx.lineTo(rightFootX, rightFootY);
    ctx.stroke();

    // --- Planted Martial Arts Feet (Stylized Soles) ---
    ctx.save();
    ctx.lineWidth = 3.8;
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(leftFootX - 4 * f, leftFootY);
    ctx.lineTo(leftFootX + 8 * f, leftFootY);
    ctx.moveTo(rightFootX - 4 * f, rightFootY);
    ctx.lineTo(rightFootX + 8 * f, rightFootY);
    ctx.stroke();
    ctx.restore();

    // Dynamic Crescent Slash Arcs on Kicks
    if (this.state === 'HEAVY_KICK' && this.stateTime >= 5 && this.stateTime <= 12) {
      ctx.save();
      ctx.strokeStyle = this.auraColor || this.color;
      ctx.lineWidth = 5;
      ctx.shadowColor = this.auraColor || this.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(renderX + 15 * f, renderY - 45, 52, -Math.PI / 4, Math.PI / 4, f < 0);
      ctx.stroke();
      ctx.restore();
    } else if (this.state === 'JUMP_KICK' && this.stateTime >= 3) {
      ctx.save();
      ctx.strokeStyle = this.auraColor || this.color;
      ctx.lineWidth = 4;
      ctx.shadowColor = this.auraColor || this.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(renderX - 25 * f, renderY - 80);
      ctx.lineTo(renderX + 45 * f, renderY - 40);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}
