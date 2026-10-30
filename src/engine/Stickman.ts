// ============================================================================
// KillSwitch.swf — 2D Skeletal Stickman Fighter (Xiao Xiao Style)
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
  public facing: number = 1; // 1: facing right, -1: facing left
  public isAI: boolean;
  public name: string;
  public color: string;
  public eyeColor: string;
  public health: number = 100;
  public maxHealth: number = 100;

  public state: FighterState = 'IDLE';
  public stateTime: number = 0; // frames in current state
  public animFrame: number = 0;
  public isGrounded: boolean = true;
  public hitStunFrames: number = 0;
  public blockStunFrames: number = 0;
  public comboCounter: number = 0;

  // Visual effects
  public flashFrames: number = 0; // flash white/red when hit
  public glitchOffset: number = 0; // Flash Ghost glitch effect

  constructor(x: number, isAI: boolean = false, name: string = 'Stickman', color: string = '#00f0ff') {
    this.x = x;
    this.y = this.groundY;
    this.isAI = isAI;
    this.name = name;
    this.color = color;
    this.eyeColor = isAI ? '#ff0055' : '#00ffff';
    this.facing = isAI ? -1 : 1;
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

  // --- Attack & Movement Actions ---
  public move(dir: number) {
    if (this.canAct()) {
      const speed = 4.5;
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

  public jump() {
    if (this.canAct() && this.isGrounded) {
      this.vy = -14.5;
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
      this.vx = this.facing * 1.5; // slight forward step
      this.setState('JAB');
    }
  }

  public heavyKick() {
    if (this.canAct() && this.isGrounded) {
      this.vx = this.facing * 2.5;
      this.setState('HEAVY_KICK');
    }
  }

  public jumpKick() {
    if (this.canAct() && !this.isGrounded) {
      this.vx = this.facing * 7.5; // Xiao Xiao flying leap kick!
      this.vy = 5;
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

  // --- Physics & Animation Step ---
  public update(arenaWidth: number) {
    this.stateTime++;
    this.animFrame++;

    if (this.flashFrames > 0) this.flashFrames--;

    // Ghost visual glitching
    if (this.isAI && Math.random() < 0.15) {
      this.glitchOffset = (Math.random() - 0.5) * 6;
    } else {
      this.glitchOffset = 0;
    }

    // Gravity
    if (!this.isGrounded) {
      this.vy += 0.85; // gravity constant
    }

    // Position integration
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

    // Friction
    if (this.isGrounded) {
      if (this.state === 'IDLE' || this.state === 'BLOCK' || this.state === 'CROUCH') {
        this.vx *= 0.75;
      }
    }

    // Arena walls (with wall bounce)
    const padding = 35;
    if (this.x < padding) {
      this.x = padding;
      if (this.state === 'HIT_STUN' && Math.abs(this.vx) > 3) {
        this.vx = -this.vx * 0.5; // wall bounce!
      } else {
        this.vx = 0;
      }
    } else if (this.x > arenaWidth - padding) {
      this.x = arenaWidth - padding;
      if (this.state === 'HIT_STUN' && Math.abs(this.vx) > 3) {
        this.vx = -this.vx * 0.5; // wall bounce!
      } else {
        this.vx = 0;
      }
    }

    // State Durations & Recoveries
    if (this.state === 'JAB' && this.stateTime > 14) {
      this.setState('IDLE');
    } else if (this.state === 'HEAVY_KICK' && this.stateTime > 22) {
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

  // --- Combat Hitbox & Hurtbox Generation ---
  public getHurtbox(): Hurtbox {
    const isCrouching = this.state === 'CROUCH';
    const h = isCrouching ? 55 : 95;
    const w = 36;
    return {
      x: this.x - w / 2,
      y: this.y - h,
      w,
      h
    };
  }

  public getHitbox(): Hitbox | null {
    // Jab hitbox active frames: 4 to 8
    if (this.state === 'JAB' && this.stateTime >= 4 && this.stateTime <= 8) {
      return {
        x: this.facing > 0 ? this.x + 10 : this.x - 48,
        y: this.y - 75,
        w: 38,
        h: 24,
        damage: 8,
        knockbackX: this.facing * 3.5,
        knockbackY: -2,
        isHeavy: false
      };
    }

    // Heavy Kick active frames: 6 to 14
    if (this.state === 'HEAVY_KICK' && this.stateTime >= 6 && this.stateTime <= 14) {
      return {
        x: this.facing > 0 ? this.x + 12 : this.x - 56,
        y: this.y - 82,
        w: 44,
        h: 30,
        damage: 18,
        knockbackX: this.facing * 7.5,
        knockbackY: -5,
        isHeavy: true
      };
    }

    // Jump Kick active throughout flight until landing
    if (this.state === 'JUMP_KICK' && this.stateTime >= 3) {
      return {
        x: this.facing > 0 ? this.x + 10 : this.x - 52,
        y: this.y - 65,
        w: 42,
        h: 34,
        damage: 22,
        knockbackX: this.facing * 9.0,
        knockbackY: -6.5,
        isHeavy: true
      };
    }

    return null;
  }

  public takeHit(hitbox: Hitbox): { damageDealt: number; blocked: boolean } {
    const isGuarding = this.state === 'BLOCK';

    if (isGuarding) {
      // Block absorbs 85% damage, minor pushback
      const blockedDamage = Math.max(1, Math.round(hitbox.damage * 0.15));
      this.health = Math.max(0, this.health - blockedDamage);
      this.vx = hitbox.knockbackX * 0.35;
      this.flashFrames = 3;
      return { damageDealt: blockedDamage, blocked: true };
    }

    // Full damage taken
    this.health = Math.max(0, this.health - hitbox.damage);
    this.vx = hitbox.knockbackX;
    this.vy = hitbox.knockbackY;
    this.flashFrames = 8;

    if (hitbox.isHeavy || this.health <= 0) {
      this.hitStunFrames = 26;
      this.setState('HIT_STUN');
      this.isGrounded = false;
    } else {
      this.hitStunFrames = 12;
      this.setState('HIT_STUN');
    }

    return { damageDealt: hitbox.damage, blocked: false };
  }

  // --- Rendering 2D Stick Skeleton ---
  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Glitch shift for Flash Ghost
    const renderX = this.x + this.glitchOffset;
    const renderY = this.y;

    // Drop shadow
    ctx.beginPath();
    ctx.ellipse(renderX, this.groundY, 22, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Line style
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (this.flashFrames > 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
    } else if (this.isAI) {
      ctx.strokeStyle = this.color;
      ctx.shadowColor = '#ff00aa';
      ctx.shadowBlur = 8;
    } else {
      ctx.strokeStyle = this.color;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 6;
    }

    const f = this.facing;
    const t = this.stateTime;

    // Coordinate joints calculation based on state
    let headX = renderX;
    let headY = renderY - 88;
    let neckX = renderX;
    let neckY = renderY - 76;
    let pelvisX = renderX;
    let pelvisY = renderY - 45;

    let leftHandX = renderX - 10 * f;
    let leftHandY = renderY - 60;
    let rightHandX = renderX + 12 * f;
    let rightHandY = renderY - 60;

    let leftFootX = renderX - 12 * f;
    let leftFootY = renderY;
    let rightFootX = renderX + 10 * f;
    let rightFootY = renderY;

    // --- State-Driven Skeletal Poses ---
    if (this.state === 'IDLE') {
      const breath = Math.sin(this.animFrame * 0.08) * 2;
      headY += breath;
      neckY += breath;
      pelvisY += breath * 0.5;
      rightHandX = renderX + 14 * f;
      rightHandY = renderY - 62 + breath;
      leftHandX = renderX - 8 * f;
      leftHandY = renderY - 58 + breath;
    } else if (this.state === 'WALK_FORWARD' || this.state === 'WALK_BACK') {
      const stride = Math.sin(this.animFrame * 0.25) * 16;
      leftFootX = renderX - stride * f;
      rightFootX = renderX + stride * f;
      leftHandX = renderX + stride * 0.8 * f;
      rightHandX = renderX - stride * 0.8 * f;
      headY += Math.abs(Math.sin(this.animFrame * 0.25)) * 3;
    } else if (this.state === 'JUMP') {
      headY = renderY - 92;
      neckY = renderY - 80;
      pelvisY = renderY - 50;
      leftFootX = renderX - 8 * f;
      leftFootY = renderY - 15;
      rightFootX = renderX + 6 * f;
      rightFootY = renderY - 12;
      leftHandX = renderX - 14 * f;
      leftHandY = renderY - 85;
      rightHandX = renderX + 14 * f;
      rightHandY = renderY - 85;
    } else if (this.state === 'CROUCH') {
      headY = renderY - 60;
      neckY = renderY - 50;
      pelvisY = renderY - 26;
      leftFootX = renderX - 16 * f;
      rightFootX = renderX + 14 * f;
      leftHandX = renderX + 6 * f;
      leftHandY = renderY - 45;
      rightHandX = renderX + 18 * f;
      rightHandY = renderY - 45;
    } else if (this.state === 'JAB') {
      // Rapid extension
      pelvisX += 4 * f;
      neckX += 6 * f;
      headX += 8 * f;
      if (t < 7) {
        // punching out
        rightHandX = renderX + 38 * f;
        rightHandY = renderY - 72;
      } else {
        // retracting
        rightHandX = renderX + 18 * f;
        rightHandY = renderY - 64;
      }
      leftHandX = renderX - 4 * f;
      leftHandY = renderY - 68;
    } else if (this.state === 'HEAVY_KICK') {
      pelvisX -= 6 * f;
      neckX -= 8 * f;
      headX -= 10 * f;
      if (t < 14) {
        // High roundhouse kick extension
        rightFootX = renderX + 46 * f;
        rightFootY = renderY - 74;
      } else {
        rightFootX = renderX + 20 * f;
        rightFootY = renderY - 20;
      }
      leftFootX = renderX - 8 * f;
      rightHandX = renderX - 12 * f;
      rightHandY = renderY - 75;
    } else if (this.state === 'JUMP_KICK') {
      // Xiao Xiao Flying Kick: Torso angled forward, kick foot extended far
      headX = renderX + 14 * f;
      headY = renderY - 70;
      neckX = renderX + 8 * f;
      neckY = renderY - 62;
      pelvisX = renderX - 10 * f;
      pelvisY = renderY - 45;
      rightFootX = renderX + 44 * f;
      rightFootY = renderY - 60;
      leftFootX = renderX - 22 * f;
      leftFootY = renderY - 35;
      rightHandX = renderX - 14 * f;
      rightHandY = renderY - 65;
    } else if (this.state === 'BLOCK') {
      // Arms crossed defensively
      rightHandX = renderX + 12 * f;
      rightHandY = renderY - 75;
      leftHandX = renderX + 10 * f;
      leftHandY = renderY - 68;
      // Draw neon energy shield
      ctx.beginPath();
      ctx.arc(renderX + 16 * f, renderY - 60, 30, -Math.PI / 2.5, Math.PI / 2.5, f < 0);
      ctx.lineWidth = 4;
      ctx.strokeStyle = this.isAI ? 'rgba(255, 0, 150, 0.7)' : 'rgba(0, 255, 255, 0.7)';
      ctx.stroke();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = this.color;
    } else if (this.state === 'HIT_STUN') {
      headX = renderX - 12 * f;
      neckX = renderX - 8 * f;
      headY = renderY - 82;
      leftHandX = renderX - 20 * f;
      leftHandY = renderY - 70;
      rightHandX = renderX - 10 * f;
      rightHandY = renderY - 80;
    }

    // --- Draw Skeleton Elements ---
    // 1. Spine / Torso
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(pelvisX, pelvisY);
    ctx.stroke();

    // 2. Head
    ctx.beginPath();
    ctx.arc(headX, headY, 11, 0, Math.PI * 2);
    ctx.stroke();

    // Head Visor / Eye
    ctx.beginPath();
    ctx.arc(headX + 5 * f, headY - 1, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = this.eyeColor;
    ctx.fill();

    // 3. Left Arm (shoulder -> elbow -> hand)
    const leftElbowX = (neckX + leftHandX) / 2 - 4 * f;
    const leftElbowY = (neckY + leftHandY) / 2 + 5;
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(leftElbowX, leftElbowY);
    ctx.lineTo(leftHandX, leftHandY);
    ctx.stroke();

    // 4. Right Arm
    const rightElbowX = (neckX + rightHandX) / 2 + 3 * f;
    const rightElbowY = (neckY + rightHandY) / 2 + 5;
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(rightElbowX, rightElbowY);
    ctx.lineTo(rightHandX, rightHandY);
    ctx.stroke();

    // 5. Left Leg (pelvis -> knee -> foot)
    const leftKneeX = (pelvisX + leftFootX) / 2 - 5 * f;
    const leftKneeY = (pelvisY + leftFootY) / 2;
    ctx.beginPath();
    ctx.moveTo(pelvisX, pelvisY);
    ctx.lineTo(leftKneeX, leftKneeY);
    ctx.lineTo(leftFootX, leftFootY);
    ctx.stroke();

    // 6. Right Leg
    const rightKneeX = (pelvisX + rightFootX) / 2 + 4 * f;
    const rightKneeY = (pelvisY + rightFootY) / 2;
    ctx.beginPath();
    ctx.moveTo(pelvisX, pelvisY);
    ctx.lineTo(rightKneeX, rightKneeY);
    ctx.lineTo(rightFootX, rightFootY);
    ctx.stroke();

    ctx.restore();
  }
}
