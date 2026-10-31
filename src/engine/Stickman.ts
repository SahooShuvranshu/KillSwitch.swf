// ============================================================================
// KillSwitch.swf — Stickman.ts
// Dynamic Skeletal Stickman Martial Arts Fighter
// Features:
// - Anatomical Articulation via StickmanAnatomy
// - Pure Hand-to-Hand Martial Arts (Zero Weapons)
// - Rebalanced Health (180 HP) & Combo Damage (5 to 16 HP)
// - Expanded Combo States: Jab -> Cross -> Palm, Kick -> Axe, Uppercut, Knee, Sweep, Roll
// - Konami Code 60s Overclock Boost
// - Platform Landing & Drop-Through Physics
// ============================================================================

import { getPoseForState } from './StickmanPoses';
import { StickmanAnatomy, FighterArchetype } from './StickmanAnatomy';
import { ArenaObstacle } from './Obstacle';

export type FighterState = 
  | 'IDLE' 
  | 'WALK_FORWARD' 
  | 'WALK_BACK' 
  | 'JUMP' 
  | 'CROUCH' 
  | 'JAB' 
  | 'CROSS_PUNCH'
  | 'PALM_BURST'
  | 'HEAVY_KICK' 
  | 'AXE_KICK'
  | 'UPPERCUT'
  | 'FLYING_KNEE'
  | 'LOW_SWEEP'
  | 'DODGE_ROLL'
  | 'JUMP_KICK' 
  | 'BLOCK' 
  | 'HIT_STUN' 
  | 'KNOCKDOWN' 
  | 'DEFEAT'
  | 'VICTORY';

export type CharacterSkin = 
  | 'black'       // Player: 100% Pure Pitch Black Hero (#000000)
  | 'ghost_white' // Round 1 AI: Pure White Ghost (#ffffff)
  | 'orange'      // Cobalt / Apex Striker
  | 'chosen'      // Plasma Ascetic (Hollow Head, Cyan Aura)
  | 'darklord'    // Crimson Titan (Heavyweight Berserker, Bare Fists)
  | 'green'       // Jade Grandmaster (Emerald Acrobat)
  | 'blue'        // Azure Speedster (Compact Rusher)
  | 'yellow'      // Volt Archon (High-Voltage Rusher)
  | 'classic'     // Xiao Xiao Grandmaster (Headband Ribbons)
  | 'calavera'    // Calavera Phantom (Day of the Dead Sugar Skull)
  | 'ghost'       // Flash Ghost Prime (Bytecode Overlord)
  | 'steve';      // Wildcard Easter Egg: Minecraft Voxel Steve

export interface Hitbox {
  x: number;
  y: number;
  w: number;
  h: number;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  isHeavy: boolean;
  isLauncher?: boolean;
  isSweep?: boolean;
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
  public currentSurfaceY: number = 410;
  public facing: number = 1;
  public isAI: boolean;
  public name: string;
  public skin: CharacterSkin = 'black';
  public color: string = '#000000';
  public auraColor: string | null = null;
  public isHollowHead: boolean = false;
  public health: number = 180;
  public maxHealth: number = 180;
  public damageMultiplier: number = 1.0;

  // --- Dynamic Physical Stature & Scale Variation ---
  public scale: number = 1.0;
  public thickness: number = 4.4;
  public headScale: number = 1.0;
  public sizeMultiplier: number = 1.0;

  public state: FighterState = 'IDLE';
  public stateTime: number = 0;
  public animFrame: number = 0;
  public isGrounded: boolean = true;
  public hitStunFrames: number = 0;
  public blockStunFrames: number = 0;

  // Combo cancel buffer
  public comboStep: number = 0;
  public cancelWindowOpen: boolean = false;

  // Platform drop-through
  public dropThroughTimer: number = 0;

  // Konami Code Overclock
  public isOverclocked: boolean = false;
  public overclockTimeRemaining: number = 0;

  // Jump Juice: Input Buffer, Coyote Time & Visual Callbacks
  public jumpBufferTimer: number = 0;
  public coyoteTimer: number = 0;
  public onTakeoff?: (x: number, y: number) => void;
  public onLand?: (x: number, y: number, hard: boolean) => void;

  public flashFrames: number = 0;
  public glitchOffset: number = 0;

  constructor(x: number, isAI: boolean = false, name: string = 'Stickman', skin: CharacterSkin = 'black') {
    this.x = x;
    this.y = this.groundY;
    this.currentSurfaceY = this.groundY;
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
    let baseThickness = 4.4;
    let baseHeadScale = 1.00;

    if (skin === 'black') {
      // Player: 100% Pure Pitch Black Hero
      this.color = '#000000';
      this.auraColor = null;
      baseScale = 1.00;
      baseThickness = 4.5;
      baseHeadScale = 1.00;
    } else if (skin === 'ghost_white') {
      // Round 1 AI: Pure White Minimalist Ghost Stickman
      this.color = '#ffffff';
      this.auraColor = 'rgba(255, 255, 255, 0.4)';
      baseScale = 1.00;
      baseThickness = 4.2;
      baseHeadScale = 1.00;
    } else if (skin === 'orange') {
      // Cobalt / Apex Duelist
      this.color = '#00e5ff';
      this.auraColor = '#80d8ff';
      baseScale = 1.04;
      baseThickness = 4.2;
      baseHeadScale = 1.00;
    } else if (skin === 'green') {
      // Jade Grandmaster: Emerald Acrobat
      this.color = '#00e676';
      this.auraColor = '#69f0ae';
      baseScale = 0.96;
      baseThickness = 4.0;
      baseHeadScale = 1.00;
    } else if (skin === 'darklord') {
      // Crimson Titan: Heavyweight Colossus (Bare Fists)
      this.color = '#ee1133';
      this.isHollowHead = true;
      this.auraColor = '#ff0044';
      baseScale = 1.25;
      baseThickness = 5.6;
      baseHeadScale = 0.90;
    } else if (skin === 'chosen') {
      // Plasma Ascetic: Void Monk
      this.color = '#111111';
      this.isHollowHead = true;
      this.auraColor = '#00ffff';
      baseScale = 1.14;
      baseThickness = 4.2;
      baseHeadScale = 0.95;
    } else if (skin === 'calavera') {
      // Calavera Phantom: Day of the Dead Sugar Skull
      this.color = '#f5f5f5';
      this.auraColor = '#ffaa00';
      baseScale = 1.18;
      baseThickness = 4.8;
      baseHeadScale = 1.00;
    } else if (skin === 'yellow') {
      // Volt Archon: High-Voltage Spark Rusher
      this.color = '#ffea00';
      this.auraColor = '#fff59d';
      baseScale = 1.08;
      baseThickness = 4.2;
      baseHeadScale = 1.00;
    } else if (skin === 'ghost') {
      // Flash Ghost Prime: Corrupted Bytecode Overlord
      this.color = '#ff00aa';
      this.auraColor = '#d175ff';
      baseScale = 1.22;
      baseThickness = 5.0;
      baseHeadScale = 1.05;
    } else if (skin === 'steve') {
      // Minecraft Steve Voxel Easter Egg
      this.color = '#00a8a8';
      this.auraColor = '#ffd700';
      baseScale = 1.15;
      baseThickness = 4.5;
      baseHeadScale = 1.10;
    } else {
      this.color = '#ffffff';
      baseScale = 1.00;
      baseThickness = 4.4;
    }

    this.scale = baseScale * customSizeMultiplier;
    this.thickness = baseThickness;
    this.headScale = baseHeadScale;
  }

  // --- Konami Code Overclock Activation ---
  public activateOverclock(seconds: number = 60) {
    this.isOverclocked = true;
    this.overclockTimeRemaining = seconds;
    this.damageMultiplier = 1.25;
  }

  public canAct(): boolean {
    return this.state !== 'HIT_STUN' && 
           this.state !== 'KNOCKDOWN' && 
           this.state !== 'DEFEAT' && 
           this.state !== 'VICTORY';
  }

  public reset(x: number) {
    this.x = x;
    this.y = this.groundY;
    this.currentSurfaceY = this.groundY;
    this.vx = 0;
    this.vy = 0;
    this.health = this.maxHealth;
    this.state = 'IDLE';
    this.stateTime = 0;
    this.animFrame = 0;
    this.comboStep = 0;
    this.cancelWindowOpen = false;
    this.isGrounded = true;
    this.facing = this.isAI ? -1 : 1;
    this.flashFrames = 0;
    this.glitchOffset = 0;
    this.dropThroughTimer = 0;
    this.jumpBufferTimer = 0;
    this.coyoteTimer = 0;
  }

  // --- State Transitions ---
  public setState(newState: FighterState) {
    if (this.state === 'DEFEAT') return;
    this.state = newState;
    this.stateTime = 0;
    this.cancelWindowOpen = false;

    if (newState === 'JAB') this.comboStep = 1;
    else if (newState === 'CROSS_PUNCH') this.comboStep = 2;
    else if (newState === 'PALM_BURST') this.comboStep = 3;
    else if (newState === 'HEAVY_KICK') this.comboStep = 1;
    else if (newState === 'AXE_KICK') this.comboStep = 2;
    else this.comboStep = 0;
  }

  // --- Combat Moves & Combo Chaining ---

  // 1. Light Punch Combo (Jab -> Cross -> Palm Burst)
  public jab() {
    if (this.state === 'HIT_STUN' || this.state === 'KNOCKDOWN' || this.state === 'DEFEAT') return;

    if (this.state === 'JAB' && this.stateTime >= 3 && this.stateTime <= 10) {
      // Cancel Jab into Straight Right Cross!
      this.crossPunch();
      return;
    }

    if (this.state === 'CROSS_PUNCH' && this.stateTime >= 3 && this.stateTime <= 10) {
      // Cancel Cross into Wing Chun Two-Handed Palm Burst!
      this.palmBurst();
      return;
    }

    if (this.state === 'IDLE' || this.state === 'WALK_FORWARD' || this.state === 'WALK_BACK') {
      this.setState('JAB');
      this.vx = this.facing * 1.5;
    }
  }

  public crossPunch() {
    this.setState('CROSS_PUNCH');
    this.vx = this.facing * 3.5;
  }

  public palmBurst() {
    this.setState('PALM_BURST');
    this.vx = this.facing * 5.0;
  }

  // 2. Heavy Kick Combo (Roundhouse -> Axe Kick)
  public heavyKick() {
    if (this.state === 'HIT_STUN' || this.state === 'KNOCKDOWN' || this.state === 'DEFEAT') return;

    if (this.state === 'HEAVY_KICK' && this.stateTime >= 5 && this.stateTime <= 14) {
      // Cancel into Overhead Axe Kick!
      this.axeKick();
      return;
    }

    if (this.state === 'IDLE' || this.state === 'WALK_FORWARD' || this.state === 'WALK_BACK') {
      this.setState('HEAVY_KICK');
      this.vx = this.facing * 2.0;
    }
  }

  public axeKick() {
    this.setState('AXE_KICK');
    this.vx = this.facing * 3.0;
  }

  // 3. Rising Uppercut Launcher
  public uppercut() {
    if (this.state === 'HIT_STUN' || this.state === 'KNOCKDOWN' || this.state === 'DEFEAT') return;
    if (this.isGrounded) {
      this.setState('UPPERCUT');
      this.vy = -7.5;
      this.vx = this.facing * 2.0;
      this.isGrounded = false;
    }
  }

  // 4. Flying Clinch Knee
  public flyingKnee() {
    if (this.state === 'HIT_STUN' || this.state === 'KNOCKDOWN' || this.state === 'DEFEAT') return;
    this.setState('FLYING_KNEE');
    this.vy = -4.5;
    this.vx = this.facing * (this.isOverclocked ? 9.5 : 7.5);
    this.isGrounded = false;
  }

  // 5. Low Shin Sweep (Trip Knockdown)
  public lowSweep() {
    if (this.state === 'HIT_STUN' || this.state === 'KNOCKDOWN' || this.state === 'DEFEAT') return;
    this.setState('LOW_SWEEP');
    this.vx = this.facing * 3.0;
  }

  // 6. Evasive Dodge Roll
  public dodgeRoll() {
    if (this.state === 'HIT_STUN' || this.state === 'KNOCKDOWN' || this.state === 'DEFEAT') return;
    if (this.isGrounded && this.state !== 'DODGE_ROLL') {
      this.setState('DODGE_ROLL');
      this.vx = this.facing * (this.isOverclocked ? 10.5 : 8.5);
    }
  }

  // 7. Jump Kick (Aerial Dive)
  public jumpKick() {
    if (!this.isGrounded && this.state !== 'JUMP_KICK' && this.state !== 'HIT_STUN' && this.state !== 'DEFEAT') {
      this.setState('JUMP_KICK');
      this.vx = this.facing * (this.isOverclocked ? 8.5 : 6.8);
      this.vy = 4.2;
    }
  }

  public jump() {
    if (this.state === 'HIT_STUN' || this.state === 'KNOCKDOWN' || this.state === 'DEFEAT' || this.state === 'VICTORY') return;

    if (this.isGrounded || this.coyoteTimer > 0) {
      this.setState('JUMP');
      // Classic platformer jump: apex 1.42x height (~135px), time-to-apex ~26 frames (0.43s)
      this.vy = -10.4;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.onTakeoff?.(this.x, this.y);
    } else {
      // Buffer jump input up to 6 frames before landing
      if (this.y >= this.currentSurfaceY - 85 && this.vy > 0) {
        this.jumpBufferTimer = 6;
      }
    }
  }

  public dropThroughPlatform() {
    if (this.currentSurfaceY < this.groundY) {
      this.dropThroughTimer = 18;
      this.isGrounded = false;
      this.vy = 2.0;
      this.currentSurfaceY = this.groundY;
    }
  }

  public crouch() {
    if (this.isGrounded && this.state !== 'HIT_STUN' && this.state !== 'DEFEAT') {
      this.setState('CROUCH');
      this.vx = 0;
    }
  }

  public unCrouch() {
    if (this.state === 'CROUCH') {
      this.setState('IDLE');
    }
  }

  public block(isBlocking: boolean) {
    if (this.state === 'HIT_STUN' || this.state === 'KNOCKDOWN' || this.state === 'DEFEAT') return;
    if (isBlocking) {
      if (this.state !== 'BLOCK') {
        this.setState('BLOCK');
        this.vx = 0;
      }
    } else {
      if (this.state === 'BLOCK') {
        this.setState('IDLE');
      }
    }
  }

  public move(dir: number) {
    if (this.state === 'HIT_STUN' || this.state === 'KNOCKDOWN' || this.state === 'BLOCK' || this.state === 'DEFEAT' || this.state === 'DODGE_ROLL') {
      return;
    }

    const speedBoost = this.isOverclocked ? 1.35 : 1.0;
    const speed = 4.2 * speedBoost * Math.max(0.7, 1.3 - (this.scale - 1.0) * 0.5);

    if (this.isGrounded) {
      if (dir === this.facing) {
        if (this.state !== 'WALK_FORWARD') this.setState('WALK_FORWARD');
        this.vx = dir * speed;
      } else {
        if (this.state !== 'WALK_BACK') this.setState('WALK_BACK');
        this.vx = dir * (speed * 0.75);
      }
    } else {
      this.vx = dir * (speed * 0.85);
    }
  }

  public stopMoving() {
    if (this.state === 'WALK_FORWARD' || this.state === 'WALK_BACK') {
      this.setState('IDLE');
      this.vx = 0;
    }
  }

  // --- Physics & Platform Collision Update ---
  public update(arenaWidth: number, obstacles: ArenaObstacle[] = []) {
    this.stateTime++;
    this.animFrame++;

    if (this.flashFrames > 0) this.flashFrames--;
    if (this.dropThroughTimer > 0) this.dropThroughTimer--;
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer--;
    if (this.coyoteTimer > 0) this.coyoteTimer--;

    const wasGrounded = this.isGrounded;

    // Overclock Timer
    if (this.isOverclocked) {
      this.overclockTimeRemaining -= (1 / 60);
      if (this.overclockTimeRemaining <= 0) {
        this.isOverclocked = false;
        this.damageMultiplier = 1.0;
      }
    }

    // Hit Stun / Recovery
    if (this.state === 'HIT_STUN') {
      this.hitStunFrames--;
      if (this.hitStunFrames <= 0) {
        this.setState(this.isGrounded ? 'IDLE' : 'JUMP');
      }
    }

    if (this.state === 'KNOCKDOWN') {
      if (this.stateTime > 32) {
        this.setState('IDLE');
      }
    }

    // Attack State Recoveries
    if (this.state === 'JAB' && this.stateTime > 12) this.setState('IDLE');
    if (this.state === 'CROSS_PUNCH' && this.stateTime > 14) this.setState('IDLE');
    if (this.state === 'PALM_BURST' && this.stateTime > 18) this.setState('IDLE');
    if (this.state === 'HEAVY_KICK' && this.stateTime > 16) this.setState('IDLE');
    if (this.state === 'AXE_KICK' && this.stateTime > 18) this.setState('IDLE');
    if (this.state === 'UPPERCUT' && this.stateTime > 18 && this.isGrounded) this.setState('IDLE');
    if (this.state === 'FLYING_KNEE' && this.stateTime > 16 && this.isGrounded) this.setState('IDLE');
    if (this.state === 'LOW_SWEEP' && this.stateTime > 16) this.setState('IDLE');
    if (this.state === 'DODGE_ROLL' && this.stateTime > 16) this.setState('IDLE');

    // Defeat State (Permanent Grounded Lock)
    if (this.state === 'DEFEAT') {
      if (!this.isGrounded) {
        this.vy += 0.88;
      }
      this.x += this.vx;
      this.y += this.vy;

      if (this.y >= this.groundY) {
        this.y = this.groundY;
        if (Math.abs(this.vy) > 3.0) {
          this.vy = -this.vy * 0.35;
          this.vx *= 0.5;
        } else {
          this.vy = 0;
          this.vx = 0;
          this.isGrounded = true;
        }
      }

      const padding = 70;
      if (this.x < padding) this.x = padding;
      else if (this.x > arenaWidth - padding) this.x = arenaWidth - padding;
      return;
    }

    // Asymmetric platformer gravity: floaty rise to apex (0.40), snappy descent (0.68)
    if (!this.isGrounded) {
      if (this.vy < 0) {
        this.vy += 0.40;
      } else {
        this.vy = Math.min(13.5, this.vy + 0.68);
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    // Platform & Floor Landing Detection
    let targetSurfaceY = this.groundY;

    if (this.dropThroughTimer <= 0) {
      for (const obs of obstacles) {
        if (obs.hp <= 0 && obs.isDestructible) continue;
        const leftEdge = obs.x - 14;
        const rightEdge = obs.x + obs.w + 14;

        // Corner correction: if moving downward near platform edge, nudge onto surface (~4px)
        if (this.vy > 0 && Math.abs(this.y - obs.y) <= 8) {
          if (this.x >= obs.x - 18 && this.x < obs.x - 10) {
            this.x += 4;
          } else if (this.x <= obs.x + obs.w + 18 && this.x > obs.x + obs.w + 10) {
            this.x -= 4;
          }
        }

        if (this.x >= leftEdge && this.x <= rightEdge) {
          // Check if fighter is falling onto platform top
          if (this.y >= obs.y && (this.y - this.vy) <= obs.y + 14) {
            targetSurfaceY = obs.y;
            break;
          }
        }
      }
    }

    this.currentSurfaceY = targetSurfaceY;

    // Surface collision & Landing
    if (this.y >= this.currentSurfaceY) {
      const hardLanding = this.vy > 6.0;
      this.y = this.currentSurfaceY;
      this.vy = 0;
      if (!this.isGrounded) {
        this.isGrounded = true;
        this.onLand?.(this.x, this.y, hardLanding);
        if (this.state === 'JUMP' || this.state === 'JUMP_KICK' || this.state === 'FLYING_KNEE' || this.state === 'UPPERCUT') {
          this.setState('IDLE');
        }
        // Consume buffered jump input immediately on landing
        if (this.jumpBufferTimer > 0) {
          this.jumpBufferTimer = 0;
          this.jump();
        }
      }
    } else {
      // Walking off a platform ledge triggers Coyote time (~6 frames window)
      if (wasGrounded && this.currentSurfaceY < this.groundY && this.y < this.currentSurfaceY - 4) {
        this.isGrounded = false;
        this.coyoteTimer = 6;
      }
    }

    // Ground friction
    if (this.isGrounded) {
      if (this.state === 'IDLE' || this.state === 'BLOCK' || this.state === 'CROUCH') {
        this.vx *= 0.72;
      }
    }

    // Clamp within visible arena boundaries
    const padding = 70;
    if (this.x < padding) {
      this.x = padding;
      if (this.state === 'HIT_STUN' && Math.abs(this.vx) > 3) {
        this.vx = -this.vx * 0.6; // Wall bounce stagger
      } else {
        this.vx = 0;
      }
    } else if (this.x > arenaWidth - padding) {
      this.x = arenaWidth - padding;
      if (this.state === 'HIT_STUN' && Math.abs(this.vx) > 3) {
        this.vx = -this.vx * 0.6; // Wall bounce stagger
      } else {
        this.vx = 0;
      }
    }
  }

  // --- Hurtbox (Body target area) ---
  public getHurtbox(): Hurtbox {
    const s = this.scale;
    const isCrouched = this.state === 'CROUCH' || this.state === 'LOW_SWEEP' || this.state === 'DODGE_ROLL';
    const h = isCrouched ? 52 * s : 94 * s;
    const w = 32 * s;

    return {
      x: this.x - w / 2,
      y: this.y - h,
      w,
      h
    };
  }

  // --- Rebalanced Combat Hitboxes (Pure Martial Arts) ---
  public getHitbox(): Hitbox | null {
    const s = this.scale;
    const dmgMult = this.damageMultiplier * (this.isOverclocked ? 1.25 : 1.0);

    // 1. Light Jab (5 damage)
    if (this.state === 'JAB' && this.stateTime >= 3 && this.stateTime <= 7) {
      return {
        x: this.facing > 0 ? this.x + 8 * s : this.x - 48 * s,
        y: this.y - 74 * s,
        w: 40 * s,
        h: 22 * s,
        damage: Math.round(5 * dmgMult),
        knockbackX: this.facing * (3.5 * s),
        knockbackY: -1.5 * s,
        isHeavy: false
      };
    }

    // 2. Straight Cross (8 damage)
    if (this.state === 'CROSS_PUNCH' && this.stateTime >= 3 && this.stateTime <= 8) {
      return {
        x: this.facing > 0 ? this.x + 10 * s : this.x - 56 * s,
        y: this.y - 74 * s,
        w: 46 * s,
        h: 24 * s,
        damage: Math.round(8 * dmgMult),
        knockbackX: this.facing * (5.5 * s),
        knockbackY: -2.0 * s,
        isHeavy: false
      };
    }

    // 3. Palm Burst Combo Finisher (14 damage)
    if (this.state === 'PALM_BURST' && this.stateTime >= 3 && this.stateTime <= 10) {
      return {
        x: this.facing > 0 ? this.x + 12 * s : this.x - 62 * s,
        y: this.y - 72 * s,
        w: 50 * s,
        h: 30 * s,
        damage: Math.round(14 * dmgMult),
        knockbackX: this.facing * (8.5 * s),
        knockbackY: -4.0 * s,
        isHeavy: true
      };
    }

    // 4. Heavy Roundhouse Kick (13 damage)
    if (this.state === 'HEAVY_KICK' && this.stateTime >= 5 && this.stateTime <= 12) {
      return {
        x: this.facing > 0 ? this.x + 12 * s : this.x - 60 * s,
        y: this.y - 80 * s,
        w: 48 * s,
        h: 32 * s,
        damage: Math.round(13 * dmgMult),
        knockbackX: this.facing * (7.5 * s),
        knockbackY: -4.5 * s,
        isHeavy: true
      };
    }

    // 5. Overhead Axe Kick (15 damage)
    if (this.state === 'AXE_KICK' && this.stateTime >= 5 && this.stateTime <= 12) {
      return {
        x: this.facing > 0 ? this.x + 14 * s : this.x - 64 * s,
        y: this.y - 60 * s,
        w: 50 * s,
        h: 40 * s,
        damage: Math.round(15 * dmgMult),
        knockbackX: this.facing * (6.0 * s),
        knockbackY: -6.0 * s,
        isHeavy: true
      };
    }

    // 6. Rising Uppercut Launcher (10 damage, launches opponent upward!)
    if (this.state === 'UPPERCUT' && this.stateTime >= 4 && this.stateTime <= 11) {
      return {
        x: this.facing > 0 ? this.x + 6 * s : this.x - 46 * s,
        y: this.y - 100 * s,
        w: 40 * s,
        h: 44 * s,
        damage: Math.round(10 * dmgMult),
        knockbackX: this.facing * (3.0 * s),
        knockbackY: -10.5 * s, // Skyward Launch!
        isHeavy: true,
        isLauncher: true
      };
    }

    // 7. Flying Clinch Knee (16 damage)
    if (this.state === 'FLYING_KNEE' && this.stateTime >= 3 && this.stateTime <= 11) {
      return {
        x: this.facing > 0 ? this.x + 12 * s : this.x - 58 * s,
        y: this.y - 74 * s,
        w: 46 * s,
        h: 34 * s,
        damage: Math.round(16 * dmgMult),
        knockbackX: this.facing * (9.0 * s),
        knockbackY: -5.0 * s,
        isHeavy: true
      };
    }

    // 8. Low Shin Sweep (7 damage, trips opponent)
    if (this.state === 'LOW_SWEEP' && this.stateTime >= 3 && this.stateTime <= 10) {
      return {
        x: this.facing > 0 ? this.x + 10 * s : this.x - 55 * s,
        y: this.y - 18 * s,
        w: 45 * s,
        h: 20 * s,
        damage: Math.round(7 * dmgMult),
        knockbackX: this.facing * (5.5 * s),
        knockbackY: -3.5 * s,
        isHeavy: false,
        isSweep: true
      };
    }

    // 9. Jump Kick (12 damage)
    if (this.state === 'JUMP_KICK' && this.stateTime >= 2) {
      return {
        x: this.facing > 0 ? this.x + 12 * s : this.x - 58 * s,
        y: this.y - 68 * s,
        w: 46 * s,
        h: 36 * s,
        damage: Math.round(12 * dmgMult),
        knockbackX: this.facing * (8.5 * s),
        knockbackY: -5.5 * s,
        isHeavy: true
      };
    }

    return null;
  }

  // --- Take Hit (Invulnerability during Dodge Roll) ---
  public takeHit(hitbox: Hitbox): { damageDealt: number; blocked: boolean; isInvulnerable?: boolean } {
    // Evasive Dodge Roll invulnerability frames
    if (this.state === 'DODGE_ROLL' && this.stateTime >= 2 && this.stateTime <= 13) {
      return { damageDealt: 0, blocked: false, isInvulnerable: true };
    }

    const isGuarding = this.state === 'BLOCK';

    if (isGuarding) {
      const blockedDamage = Math.max(1, Math.round(hitbox.damage * 0.15));
      this.health = Math.max(0, this.health - blockedDamage);
      this.vx = hitbox.knockbackX * 0.35;
      this.flashFrames = 1;
      return { damageDealt: blockedDamage, blocked: true };
    }

    this.health = Math.max(0, this.health - hitbox.damage);

    // Cinematic Defeat on K.O.
    if (this.health <= 0) {
      this.setState('DEFEAT');
      this.vx = -this.facing * 7.5;
      this.vy = -7.5;
      this.isGrounded = false;
      this.flashFrames = 2;
      return { damageDealt: hitbox.damage, blocked: false };
    }

    this.vx = hitbox.knockbackX;
    this.vy = hitbox.knockbackY;
    this.flashFrames = hitbox.isHeavy ? 2 : 1;

    if (hitbox.isLauncher) {
      this.hitStunFrames = 26;
      this.setState('HIT_STUN');
      this.isGrounded = false;
    } else if (hitbox.isSweep) {
      this.setState('KNOCKDOWN');
      this.isGrounded = true;
    } else if (hitbox.isHeavy) {
      this.hitStunFrames = 18;
      this.setState('HIT_STUN');
      this.isGrounded = false;
    } else {
      this.hitStunFrames = 10;
      this.setState('HIT_STUN');
    }

    return { damageDealt: hitbox.damage, blocked: false };
  }

  // --- Anatomical Skeletal Rendering ---
  public render(ctx: CanvasRenderingContext2D) {
    const pose = getPoseForState(this.state, this.stateTime, this.animFrame);

    let archetype: FighterArchetype = 'player_black';
    if (this.skin === 'black') archetype = 'player_black';
    else if (this.skin === 'ghost_white') archetype = 'ghost_white';
    else if (this.skin === 'steve') archetype = 'steve_easter_egg';
    else if (this.skin === 'chosen') archetype = 'plasma_ascetic';
    else if (this.skin === 'darklord') archetype = 'crimson_titan';
    else if (this.skin === 'calavera') archetype = 'calavera_phantom';
    else if (this.skin === 'green') archetype = 'jade_grandmaster';
    else if (this.skin === 'orange') archetype = 'cobalt_striker';
    else if (this.skin === 'ghost') archetype = 'flash_ghost_prime';
    else archetype = 'procedural';

    StickmanAnatomy.renderFighter(
      ctx,
      pose,
      this.x + this.glitchOffset,
      this.y,
      this.groundY,
      this.facing,
      this.state,
      this.stateTime,
      this.animFrame,
      {
        archetype,
        color: this.color,
        auraColor: this.auraColor || undefined,
        scale: this.scale,
        thickness: this.thickness,
        isHollowHead: this.isHollowHead,
        headScale: this.headScale,
        isOverclocked: this.isOverclocked,
        knuckleTapeColor: this.skin === 'black' ? '#ffffff' : undefined
      },
      this.flashFrames
    );
  }
}
