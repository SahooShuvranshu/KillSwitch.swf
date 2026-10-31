// ============================================================================
// KillSwitch.swf — Obstacle.ts
// Interactive Stage Platforms & Obstacles
// Features:
// - Semi-solid high platforms (jump through from below, land on top, drop through with S+W)
// - Destructible ground crates & blocks (absorb hits and emit crisp Flash vector debris)
// - Thematic visuals matched to all 5 round scenes
// ============================================================================

export interface ObstacleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export class ArenaObstacle {
  public id: string;
  public x: number;
  public y: number;
  public w: number;
  public h: number;
  public isPlatform: boolean; // Semi-solid top platform
  public isDestructible: boolean;
  public maxHp: number;
  public hp: number;
  public stage: string;
  public particles: ObstacleParticle[] = [];

  constructor(
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    isPlatform: boolean,
    isDestructible: boolean,
    stage: string,
    hp: number = 60
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.isPlatform = isPlatform;
    this.isDestructible = isDestructible;
    this.stage = stage;
    this.maxHp = hp;
    this.hp = hp;
  }

  public takeHit(damage: number): boolean {
    if (!this.isDestructible) return false;
    this.hp = Math.max(0, this.hp - damage);

    // Spawn fracture debris particles
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.x + Math.random() * this.w,
        y: this.y + Math.random() * this.h,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5 - 2,
        color: this.getParticleColor(),
        size: Math.random() * 4 + 2,
        life: 0,
        maxLife: 20
      });
    }

    return this.hp <= 0;
  }

  public update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.life++;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private getParticleColor(): string {
    switch (this.stage) {
      case 'studio': return '#bfa068';
      case 'bliss': return '#7288a2';
      case 'matrix': return '#00ff66';
      case 'void': return '#ff0033';
      case 'ofrenda': return '#ffaa00';
      default: return '#ffffff';
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Render flying fracture particles
    for (const p of this.particles) {
      ctx.save();
      const alpha = 1 - (p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    }

    if (this.hp <= 0 && this.isDestructible) return;

    ctx.save();

    // 1. Soft Floor Drop Shadow for Ground Obstacles
    if (!this.isPlatform) {
      this.renderDropShadow(ctx);
    }

    // 2. Render Stage Themed 3D Obstacle Body
    switch (this.stage) {
      case 'studio':
        this.renderStudioTheme(ctx);
        break;
      case 'bliss':
        this.renderBlissTheme(ctx);
        break;
      case 'matrix':
        this.renderMatrixTheme(ctx);
        break;
      case 'void':
        this.renderVoidTheme(ctx);
        break;
      case 'ofrenda':
        this.renderOfrendaTheme(ctx);
        break;
      default:
        this.renderDefaultTheme(ctx);
        break;
    }

    // 3. Render Damage Fractures & Splinters when Damaged
    if (this.isDestructible && this.hp < this.maxHp) {
      this.drawDamageCracks(ctx);
    }

    ctx.restore();
  }

  // --- Soft Ground Shadow ---
  private renderDropShadow(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(
      this.x + this.w / 2, this.y + this.h + 2, 8,
      this.x + this.w / 2, this.y + this.h + 2, this.w * 0.7
    );
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(this.x + this.w / 2, this.y + this.h + 2, this.w * 0.65, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- Dynamic Damage Splinters & Fissure Cracks ---
  private drawDamageCracks(ctx: CanvasRenderingContext2D) {
    const dmgRatio = 1 - (this.hp / this.maxHp);
    if (dmgRatio < 0.15) return;

    ctx.save();
    ctx.strokeStyle = this.stage === 'matrix' ? '#00ff66' : this.stage === 'void' ? '#ff0033' : 'rgba(0, 0, 0, 0.75)';
    ctx.lineWidth = 2.0;

    // Primary jagged stress fissure
    ctx.beginPath();
    ctx.moveTo(this.x + this.w * 0.22, this.y);
    ctx.lineTo(this.x + this.w * 0.38, this.y + this.h * 0.38);
    ctx.lineTo(this.x + this.w * 0.28, this.y + this.h * 0.72);
    ctx.lineTo(this.x + this.w * 0.46, this.y + this.h);
    ctx.stroke();

    if (dmgRatio > 0.48) {
      // Secondary branching fracture splinters
      ctx.beginPath();
      ctx.moveTo(this.x + this.w * 0.38, this.y + this.h * 0.38);
      ctx.lineTo(this.x + this.w * 0.68, this.y + this.h * 0.48);
      ctx.lineTo(this.x + this.w * 0.82, this.y + this.h * 0.82);
      ctx.moveTo(this.x + this.w * 0.72, this.y);
      ctx.lineTo(this.x + this.w * 0.58, this.y + this.h * 0.32);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- 1. Flash Studio Theme (Timeline Shelf & Pencil Crate) ---
  private renderStudioTheme(ctx: CanvasRenderingContext2D) {
    if (this.isPlatform) {
      // Semi-solid Floating Flash Timeline Shelf with Highlight Rail
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // Top reflective highlight rail
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(this.x + 1, this.y + 1, this.w - 2, 3);

      // Top timeline tick marks
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 1;
      for (let tx = this.x + 10; tx < this.x + this.w - 10; tx += 12) {
        ctx.beginPath();
        ctx.moveTo(tx, this.y);
        ctx.lineTo(tx, this.y + 6);
        ctx.stroke();
      }
      // Red playhead pip in center
      ctx.fillStyle = '#ff2200';
      ctx.fillRect(this.x + this.w / 2 - 4, this.y - 4, 8, 8);
    } else {
      // 3D Wooden Animator Pencil Crate
      const bevel = 6;
      // Top face
      ctx.fillStyle = '#dbb880';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w, this.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#4a3318';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Right side face
      ctx.fillStyle = '#ad8950';
      ctx.beginPath();
      ctx.moveTo(this.x + this.w, this.y);
      ctx.lineTo(this.x + this.w + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w + bevel, this.y + this.h - bevel);
      ctx.lineTo(this.x + this.w, this.y + this.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Front Face
      ctx.fillStyle = '#c8a46b';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeStyle = '#4a3318';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // Crate planks and cross brace
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.w, this.y + this.h);
      ctx.moveTo(this.x + this.w, this.y);
      ctx.lineTo(this.x, this.y + this.h);
      ctx.stroke();

      // "CRATE" label stenciled on crate
      ctx.fillStyle = '#4a3318';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CRATE', this.x + this.w / 2, this.y + this.h / 2 + 4);
    }
  }

  // --- 2. Windows XP Bliss Theme (Window Titlebar Platform & Desktop Speaker) ---
  private renderBlissTheme(ctx: CanvasRenderingContext2D) {
    if (this.isPlatform) {
      // Luna Blue Window Titlebar Platform with Glossy Bevel
      const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
      grad.addColorStop(0, '#0a64dc');
      grad.addColorStop(0.5, '#2e8bed');
      grad.addColorStop(1, '#0054c2');
      ctx.fillStyle = grad;
      ctx.fillRect(this.x, this.y, this.w, this.h);

      // Top glossy highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
      ctx.fillRect(this.x + 1, this.y + 1, this.w - 2, 3);

      ctx.strokeStyle = '#003399';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // Title text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Tahoma, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('📁 System32 Platform', this.x + 8, this.y + 13);
    } else {
      // 3D Retro Desktop Beige Speaker
      const bevel = 6;
      ctx.fillStyle = '#eeebe3';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w, this.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#8a857a';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = '#c4c0b5';
      ctx.beginPath();
      ctx.moveTo(this.x + this.w, this.y);
      ctx.lineTo(this.x + this.w + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w + bevel, this.y + this.h - bevel);
      ctx.lineTo(this.x + this.w, this.y + this.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Front
      ctx.fillStyle = '#dedad2';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeStyle = '#999488';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // Black speaker cone mesh
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- 3. Cyber Matrix Theme (Floating Bytecode Platform & Data Cache) ---
  private renderMatrixTheme(ctx: CanvasRenderingContext2D) {
    ctx.shadowColor = '#00ff66';
    ctx.shadowBlur = 8;

    if (this.isPlatform) {
      // Neon Bytecode Energy Beam Platform
      ctx.fillStyle = 'rgba(0, 40, 15, 0.85)';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.fillStyle = '#00ff66';
      ctx.fillRect(this.x + 1, this.y + 1, this.w - 2, 2.5); // Top glow rail

      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // Green bytecode glow bar
      ctx.fillStyle = '#00ff66';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('<BYTECODE_PLATFORM>', this.x + this.w / 2, this.y + 11);
    } else {
      // 3D Glowing Green Data Cache Cube
      const bevel = 6;
      ctx.fillStyle = 'rgba(0, 80, 30, 0.9)';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w, this.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 30, 10, 0.9)';
      ctx.beginPath();
      ctx.moveTo(this.x + this.w, this.y);
      ctx.lineTo(this.x + this.w + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w + bevel, this.y + this.h - bevel);
      ctx.lineTo(this.x + this.w, this.y + this.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Front
      ctx.fillStyle = 'rgba(0, 50, 20, 0.9)';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // Digital circuit pattern
      ctx.fillStyle = '#00ff66';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[ 0x7E5 ]', this.x + this.w / 2, this.y + this.h / 2 + 4);
    }
  }

  // --- 4. 2021 Kill-Switch Void Theme (Caution Platform & Corrupted DRM Crate) ---
  private renderVoidTheme(ctx: CanvasRenderingContext2D) {
    if (this.isPlatform) {
      // Hazard Diagonal Warning Platform
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // Yellow/Black diagonal hazard stripes
      ctx.fillStyle = '#ffcc00';
      for (let sx = this.x; sx < this.x + this.w; sx += 20) {
        ctx.beginPath();
        ctx.moveTo(sx, this.y);
        ctx.lineTo(sx + 10, this.y);
        ctx.lineTo(sx + 4, this.y + this.h);
        ctx.lineTo(sx - 6, this.y + this.h);
        ctx.fill();
      }
    } else {
      // 3D Corrupted Red Flash Crate
      const bevel = 6;
      ctx.fillStyle = '#420810';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w, this.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = '#1a0306';
      ctx.beginPath();
      ctx.moveTo(this.x + this.w, this.y);
      ctx.lineTo(this.x + this.w + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w + bevel, this.y + this.h - bevel);
      ctx.lineTo(this.x + this.w, this.y + this.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Front
      ctx.fillStyle = '#2a050b';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 10;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // Broken Flash 'f' logo
      ctx.fillStyle = '#ff0033';
      ctx.font = 'bold 18px serif';
      ctx.textAlign = 'center';
      ctx.fillText('f', this.x + this.w / 2, this.y + this.h / 2 + 7);
    }
  }

  // --- 5. Día de los Muertos Theme (Memorial Stone Altar & Tomb Pillar) ---
  private renderOfrendaTheme(ctx: CanvasRenderingContext2D) {
    if (this.isPlatform) {
      // Stone Carved Memorial Step Platform
      ctx.fillStyle = '#3a332c';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(this.x + 1, this.y + 1, this.w - 2, 2.5); // Top marigold rim

      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // Golden Marigold Petals along the platform top
      for (let px = this.x + 8; px < this.x + this.w - 8; px += 18) {
        ctx.beginPath();
        ctx.arc(px, this.y + 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // 3D Carved Stone Tomb Block with Candle
      const bevel = 6;
      ctx.fillStyle = '#3d352c';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w, this.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#6e5f50';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = '#1e1a16';
      ctx.beginPath();
      ctx.moveTo(this.x + this.w, this.y);
      ctx.lineTo(this.x + this.w + bevel, this.y - bevel);
      ctx.lineTo(this.x + this.w + bevel, this.y + this.h - bevel);
      ctx.lineTo(this.x + this.w, this.y + this.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Front
      ctx.fillStyle = '#2d2722';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeStyle = '#857361';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // Flickering Candle on top
      const candleX = this.x + this.w / 2;
      const candleY = this.y - 12;
      ctx.fillStyle = '#fff8e7';
      ctx.fillRect(candleX - 3, candleY, 6, 12);
      // Flame
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(candleX, candleY - 3, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderDefaultTheme(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#444444';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
}
