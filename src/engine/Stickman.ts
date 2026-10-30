// ============================================================================
// KillSwitch.swf — Ultra-Polished 2D Skeletal Stickman Fighter
// Xiao Xiao martial arts fluid kinematics, recoil, and combo cancels
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
  public stateTime: number = 0;
  public animFrame: number = 0;
  public isGrounded: boolean = true;
  public hitStunFrames: number = 0;
  public blockStunFrames: number = 0;

  // Visual effects
  public flashFrames: number = 0;
  public glitchOffset: number = 0;

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

  // --- Attack & Movement Actions with Combo Cancels ---
  public move(dir: number) {
    if (this.canAct()) {
      const speed = 4.8;
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
      this.vy = -15.0;
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
      this.vx = this.facing * 2.0; // aggressive step forward
      this.setState('JAB');
    }
  }

  public heavyKick() {
    // Allows cancelling Jab recovery directly into Heavy Kick (Xiao Xiao combo chain!)
    const canCancelFromJab = this.state === 'JAB' && this.stateTime >= 6;
    if ((this.canAct() || canCancelFromJab) && this.isGrounded) {
      this.vx = this.facing * 3.5; // lunging roundhouse
      this.setState('HEAVY_KICK');
    }
  }

  public jumpKick() {
    if (this.canAct() && !this.isGrounded) {
      this.vx = this.facing * 8.5; // High velocity Xiao Xiao flying leap!
      this.vy = 4.5;
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

  // --- Physics & Kinematics Step ---
  public update(arenaWidth: number) {
    this.stateTime++;
    this.animFrame++;

    if (this.flashFrames > 0) this.flashFrames--;

    // Ghost visual glitching
    if (this.isAI && Math.random() < 0.2) {
      this.glitchOffset = (Math.random() - 0.5) * 8;
    } else {
      this.glitchOffset = 0;
    }

    // Gravity
    if (!this.isGrounded) {
      this.vy += 0.88;
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

    // Friction
    if (this.isGrounded) {
      if (this.state === 'IDLE' || this.state === 'BLOCK' || this.state === 'CROUCH') {
        this.vx *= 0.72;
      }
    }

    // Arena walls (with wall bounce)
    const padding = 40;
    if (this.x < padding) {
      this.x = padding;
      if (this.state === 'HIT_STUN' && Math.abs(this.vx) > 3) {
        this.vx = -this.vx * 0.6; // dynamic wall bounce!
      } else {
        this.vx = 0;
      }
    } else if (this.x > arenaWidth - padding) {
      this.x = arenaWidth - padding;
      if (this.state === 'HIT_STUN' && Math.abs(this.vx) > 3) {
        this.vx = -this.vx * 0.6; // dynamic wall bounce!
      } else {
        this.vx = 0;
      }
    }

    // State Recoveries & Frame Timings
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

  // --- Combat Hitbox & Hurtbox Generation ---
  public getHurtbox(): Hurtbox {
    const isCrouching = this.state === 'CROUCH';
    const h = isCrouching ? 55 : 95;
    const w = 38;
    return {
      x: this.x - w / 2,
      y: this.y - h,
      w,
      h
    };
  }

  public getHitbox(): Hitbox | null {
    // Fast Jab (Frames 3 to 7)
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

    // Heavy Roundhouse Kick (Frames 5 to 13)
    if (this.state === 'HEAVY_KICK' && this.stateTime >= 5 && this.stateTime <= 13) {
      return {
        x: this.facing > 0 ? this.x + 14 : this.x - 62,
        y: this.y - 84,
        w: 50,
        h: 34,
        damage: 20,
        knockbackX: this.facing * 8.5,
        knockbackY: -6.0,
        isHeavy: true
      };
    }

    // Xiao Xiao Flying Jump Kick
    if (this.state === 'JUMP_KICK' && this.stateTime >= 2) {
      return {
        x: this.facing > 0 ? this.x + 12 : this.x - 58,
        y: this.y - 68,
        w: 48,
        h: 38,
        damage: 26,
        knockbackX: this.facing * 10.5,
        knockbackY: -7.5,
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
      this.hitStunFrames = 28;
      this.setState('HIT_STUN');
      this.isGrounded = false;
    } else {
      this.hitStunFrames = 14;
      this.setState('HIT_STUN');
    }

    return { damageDealt: hitbox.damage, blocked: false };
  }

  // --- Render Skeletal Stickman ---
  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const renderX = this.x + this.glitchOffset;
    const renderY = this.y;

    // Fluid Floor Drop Shadow with elevation scaling
    const elevation = Math.max(0, this.groundY - this.y);
    const shadowWidth = Math.max(10, 24 - elevation * 0.15);
    const shadowAlpha = Math.max(0.1, 0.45 - elevation * 0.003);

    ctx.beginPath();
    ctx.ellipse(renderX, this.groundY, shadowWidth, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.fill();

    ctx.lineWidth = 4.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (this.flashFrames > 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 14;
    } else if (this.isAI) {
      ctx.strokeStyle = this.color;
      ctx.shadowColor = '#ff00aa';
      ctx.shadowBlur = 10;
    } else {
      ctx.strokeStyle = this.color;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 8;
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

    // State Kinematics
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
        // Anticipation coil
        rightFootX = renderX - 12 * f;
        rightFootY = renderY - 30;
      } else if (t < 13) {
        // High whip roundhouse
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

      // Glowing Deflection Shield
      ctx.beginPath();
      ctx.arc(renderX + 18 * f, renderY - 60, 32, -Math.PI / 2.3, Math.PI / 2.3, f < 0);
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = this.isAI ? 'rgba(255, 0, 170, 0.8)' : 'rgba(0, 255, 255, 0.8)';
      ctx.stroke();
      ctx.lineWidth = 4.0;
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

    // 1. Spine / Torso
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(pelvisX, pelvisY);
    ctx.stroke();

    // 2. Head
    ctx.beginPath();
    ctx.arc(headX, headY, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Head Visor / Eye
    ctx.beginPath();
    ctx.arc(headX + 5 * f, headY - 1, 3.0, 0, Math.PI * 2);
    ctx.fillStyle = this.eyeColor;
    ctx.fill();

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

    ctx.restore();
  }
}
