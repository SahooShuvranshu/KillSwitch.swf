// ============================================================================
// KillSwitch.swf — StickmanAnatomy.ts
// High-Fidelity Anatomical Skeletal Model & Stylized Fighter Skins
// Replaces primitive single-vertex lines with real anatomical articulation:
// - Clavicle / Shoulder Span (14px) separating the arms
// - Dynamic Curving Spine with Solar Plexus
// - Pelvic Hip Bar (12px) separating the legs
// - Articulated Dual-Joint Limbs (Elbow & Knee Accent Pivots)
// - Martial Arts Knuckle Wraps / Clenched Fists / Open Palm Strikes
// - Flat Planted Foot Soles with Angled Toes
// - Zero Weapons: Pure Hand-to-Hand Martial Arts
// - Player: 100% Pure Pitch Black Hero (#000000)
// - AI: Starts as Pure White Ghost (#ffffff), morphs into stylized archetypes
// - Wildcard Easter Egg: Blocky Voxel "Steve"
// ============================================================================

import { KeyframePose } from './StickmanPoses';

export type FighterArchetype = 
  | 'player_black'     // Player: 100% Pure Pitch Black Stickman
  | 'ghost_white'      // Round 1 AI: Pure White Minimalist Ghost Stickman
  | 'cobalt_striker'   // Round 2 AI: Electric Cyan Speedster
  | 'jade_grandmaster' // Round 3 AI: Emerald Acrobat
  | 'crimson_titan'    // Round 4 AI: Heavyweight Berserker (Heavy lines, no weapons)
  | 'steve_easter_egg' // Wildcard Easter Egg: Minecraft Blocky Voxel Steve
  | 'plasma_ascetic'   // Round 5 AI: Void Monk with Cyan Flame Eyes
  | 'calavera_phantom' // Round 6 AI: Day of the Dead Sugar Skull Warrior
  | 'flash_ghost_prime'// Round 7 AI: Corrupted Magenta Bytecode Overlord
  | 'procedural';

export interface AnatomyConfig {
  archetype: FighterArchetype;
  color: string;
  auraColor?: string;
  scale: number;
  thickness: number;
  isHollowHead?: boolean;
  headScale?: number;
  hasKnuckleTape?: boolean;
  knuckleTapeColor?: string;
  isOverclocked?: boolean;
}

export class StickmanAnatomy {
  /**
   * Render the complete articulated anatomical stickman
   */
  public static renderFighter(
    ctx: CanvasRenderingContext2D,
    pose: KeyframePose,
    x: number,
    y: number,
    groundY: number,
    facing: number,
    state: string,
    stateTime: number,
    animFrame: number,
    config: AnatomyConfig,
    flashFrames: number
  ) {
    ctx.save();

    const s = config.scale;
    const f = facing;
    const thick = config.thickness * s;

    // 1. Floor Drop Shadow
    const elevation = Math.max(0, groundY - y);
    const shadowWidth = Math.max(12 * s, (26 * s) - elevation * 0.15);
    const shadowAlpha = Math.max(0.12, 0.45 - elevation * 0.003);

    ctx.beginPath();
    ctx.ellipse(x, groundY, shadowWidth, 6 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.fill();

    // 2. Overclock Flame Aura (Konami Code Boost)
    if (config.isOverclocked && state !== 'DEFEAT') {
      ctx.save();
      const auraPulse = Math.sin(animFrame * 0.3) * 6 * s;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = (20 + auraPulse) * s;
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.55)';
      ctx.lineWidth = 4 * s;
      ctx.beginPath();
      ctx.arc(x, y - 55 * s, 48 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Setup Line Styling & Flash Glow
    ctx.lineWidth = thick;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = config.color;

    if (flashFrames > 0) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6 * s;
    } else if (config.auraColor && state !== 'DEFEAT') {
      ctx.shadowColor = config.auraColor;
      ctx.shadowBlur = 10 * s;
    } else {
      ctx.shadowBlur = 0;
    }

    // --- Compute Articulated Skeleton Joints ---
    const headX = x + pose.headX * f * s;
    const headY = y + pose.headY * s;
    const neckX = x + pose.neckX * f * s;
    const neckY = y + pose.neckY * s;
    const pelvisX = x + pose.pelvisX * f * s;
    const pelvisY = y + pose.pelvisY * s;

    // Torso / Solar Plexus mid-point
    const solarPlexusX = (neckX * 0.55 + pelvisX * 0.45);
    const solarPlexusY = (neckY * 0.55 + pelvisY * 0.45);

    // Anatomical Shoulder Span (Clavicle Bar) — 14px span centered at neck
    const shoulderHalfSpan = 7.5 * s;
    const leftShoulderX = neckX - shoulderHalfSpan * f;
    const leftShoulderY = neckY + 1.5 * s;
    const rightShoulderX = neckX + shoulderHalfSpan * f;
    const rightShoulderY = neckY + 1.5 * s;

    // Anatomical Pelvic Hip Bar — 12px span centered at pelvis
    const hipHalfSpan = 6.0 * s;
    const leftHipX = pelvisX - hipHalfSpan * f;
    const leftHipY = pelvisY;
    const rightHipX = pelvisX + hipHalfSpan * f;
    const rightHipY = pelvisY;

    // Hands and Feet
    const leftHandX = x + pose.leftHandX * f * s;
    const leftHandY = y + pose.leftHandY * s;
    const rightHandX = x + pose.rightHandX * f * s;
    const rightHandY = y + pose.rightHandY * s;

    const leftFootX = x + pose.leftFootX * f * s;
    const leftFootY = y + pose.leftFootY * s;
    const rightFootX = x + pose.rightFootX * f * s;
    const rightFootY = y + pose.rightFootY * s;

    // Calculate Articulated Elbows
    const leftElbowX = (leftShoulderX + leftHandX) / 2 - 4 * f * s;
    const leftElbowY = (leftShoulderY + leftHandY) / 2 + 5 * s;
    const rightElbowX = (rightShoulderX + rightHandX) / 2 + 4 * f * s;
    const rightElbowY = (rightShoulderY + rightHandY) / 2 + 5 * s;

    // Calculate Articulated Knees
    const leftKneeX = (leftHipX + leftFootX) / 2 - 5 * f * s;
    const leftKneeY = (leftHipY + leftFootY) / 2 + 2 * s;
    const rightKneeX = (rightHipX + rightFootX) / 2 + 5 * f * s;
    const rightKneeY = (rightHipY + rightFootY) / 2 + 2 * s;

    // ========================================================================
    // WILDCARD EASTER EGG: MINECRAFT "STEVE" VOXEL RENDERER
    // ========================================================================
    if (config.archetype === 'steve_easter_egg') {
      this.renderSteveVoxel(ctx, x, y, f, s, pose, state, animFrame);
      ctx.restore();
      return;
    }

    // ========================================================================
    // STANDARD ANATOMICAL MARTIAL ARTS SKELETON
    // ========================================================================

    // 4. Martial Arts Guard Barrier
    if (state === 'BLOCK') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + 18 * f * s, y - 60 * s, 34 * s, -Math.PI / 2.3, Math.PI / 2.3, f < 0);
      ctx.lineWidth = 4.5 * s;
      ctx.strokeStyle = config.auraColor || (config.color === '#000000' ? '#00e5ff' : config.color);
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 12 * s;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Clavicle / Shoulder Bar
    ctx.beginPath();
    ctx.moveTo(leftShoulderX, leftShoulderY);
    ctx.lineTo(rightShoulderX, rightShoulderY);
    ctx.stroke();

    // 6. Curving Spine (Neck -> Solar Plexus -> Pelvis)
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.quadraticCurveTo(solarPlexusX, solarPlexusY, pelvisX, pelvisY);
    ctx.stroke();

    // 7. Pelvic Hip Bar
    ctx.beginPath();
    ctx.moveTo(leftHipX, leftHipY);
    ctx.lineTo(rightHipX, rightHipY);
    ctx.stroke();

    // 8. Martial Arts Belt & Fluttering Ribbons
    ctx.save();
    const beltColor = config.archetype === 'player_black' ? '#ffffff' : (config.archetype === 'ghost_white' ? '#111111' : '#ff2200');
    ctx.strokeStyle = beltColor;
    ctx.fillStyle = beltColor;
    ctx.lineWidth = 2.8 * s;
    // Belt knot
    ctx.beginPath();
    ctx.arc(pelvisX, pelvisY, 3.2 * s, 0, Math.PI * 2);
    ctx.fill();
    // Two trailing ribbons
    const ribbonWave1 = Math.sin(animFrame * 0.22) * 5 * s;
    const ribbonWave2 = Math.cos(animFrame * 0.18) * 6 * s;
    ctx.beginPath();
    ctx.moveTo(pelvisX, pelvisY);
    ctx.quadraticCurveTo(pelvisX - 10 * f * s, pelvisY + 12 * s + ribbonWave1, pelvisX - 18 * f * s, pelvisY + 22 * s + ribbonWave1);
    ctx.moveTo(pelvisX, pelvisY);
    ctx.quadraticCurveTo(pelvisX - 8 * f * s, pelvisY + 14 * s + ribbonWave2, pelvisX - 14 * f * s, pelvisY + 26 * s + ribbonWave2);
    ctx.stroke();
    ctx.restore();

    // 9. Back Leg (Left Leg)
    ctx.beginPath();
    ctx.moveTo(leftHipX, leftHipY);
    ctx.lineTo(leftKneeX, leftKneeY);
    ctx.lineTo(leftFootX, leftFootY);
    ctx.stroke();
    // Knee joint accent
    this.drawJoint(ctx, leftKneeX, leftKneeY, 2.8 * s, config.color);

    // Back Foot (Articulated Martial Soles)
    this.drawFoot(ctx, leftFootX, leftFootY, f, s, config.color);

    // 10. Front Leg (Right Leg)
    ctx.beginPath();
    ctx.moveTo(rightHipX, rightHipY);
    ctx.lineTo(rightKneeX, rightKneeY);
    ctx.lineTo(rightFootX, rightFootY);
    ctx.stroke();
    // Knee joint accent
    this.drawJoint(ctx, rightKneeX, rightKneeY, 2.8 * s, config.color);

    // Front Foot
    this.drawFoot(ctx, rightFootX, rightFootY, f, s, config.color);

    // 11. Back Arm (Left Arm)
    ctx.beginPath();
    ctx.moveTo(leftShoulderX, leftShoulderY);
    ctx.lineTo(leftElbowX, leftElbowY);
    ctx.lineTo(leftHandX, leftHandY);
    ctx.stroke();
    // Elbow joint accent
    this.drawJoint(ctx, leftElbowX, leftElbowY, 2.5 * s, config.color);

    // Back Hand (Knuckle Tape / Fist)
    this.drawFist(ctx, leftHandX, leftHandY, f, s, config, state === 'PALM_BURST');

    // 12. Front Arm (Right Arm)
    ctx.beginPath();
    ctx.moveTo(rightShoulderX, rightShoulderY);
    ctx.lineTo(rightElbowX, rightElbowY);
    ctx.lineTo(rightHandX, rightHandY);
    ctx.stroke();
    // Elbow joint accent
    this.drawJoint(ctx, rightElbowX, rightElbowY, 2.5 * s, config.color);

    // Front Hand
    this.drawFist(ctx, rightHandX, rightHandY, f, s, config, state === 'PALM_BURST');

    // 13. Dynamic Attack Shockwaves (Pure Martial Arts Energy)
    if (state === 'UPPERCUT' && stateTime >= 4 && stateTime <= 10) {
      this.drawUppercutSpiral(ctx, rightHandX, rightHandY, f, s, config.auraColor || config.color);
    } else if (state === 'FLYING_KNEE' && stateTime >= 3 && stateTime <= 12) {
      this.drawKneeShockwave(ctx, rightKneeX, rightKneeY, f, s, config.auraColor || config.color);
    } else if (state === 'PALM_BURST' && stateTime >= 3 && stateTime <= 10) {
      this.drawPalmShockwave(ctx, rightHandX, rightHandY, f, s, config.auraColor || config.color);
    }

    // 14. Head & Expressive Battle Eyes
    this.drawHeadAndFace(ctx, headX, headY, f, s, config, state, animFrame);

    ctx.restore();
  }

  // --- Sub-renderer: Accented Joint Pivot ---
  private static drawJoint(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  // --- Sub-renderer: Flat Planted Martial Arts Foot ---
  private static drawFoot(ctx: CanvasRenderingContext2D, x: number, y: number, f: number, s: number, color: string) {
    ctx.save();
    ctx.lineWidth = 3.6 * s;
    ctx.strokeStyle = color;
    ctx.beginPath();
    // Heel to toe planted sole
    ctx.moveTo(x - 5 * f * s, y);
    ctx.lineTo(x + 9 * f * s, y);
    // Slight angled toe cap
    ctx.lineTo(x + 10 * f * s, y - 2 * s);
    ctx.stroke();
    ctx.restore();
  }

  // --- Sub-renderer: Martial Arts Clenched Fist with Knuckle Tape ---
  private static drawFist(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    f: number,
    s: number,
    config: AnatomyConfig,
    isOpenPalm: boolean
  ) {
    ctx.save();
    const fistRadius = 4.8 * s;

    if (isOpenPalm) {
      // Wing Chun Open Palm Strike
      ctx.fillStyle = config.color;
      ctx.strokeStyle = config.color;
      ctx.beginPath();
      ctx.arc(x, y, fistRadius * 0.9, 0, Math.PI * 2);
      ctx.fill();
      // 4 open finger ridges
      ctx.lineWidth = 2.0 * s;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + (i * 2) * s, y);
        ctx.lineTo(x + 8 * f * s + (i * 2) * s, y + (i * 2.5) * s);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // Clenched Boxing / Karate Fist
    ctx.beginPath();
    ctx.arc(x, y, fistRadius, 0, Math.PI * 2);
    ctx.fillStyle = config.color;
    ctx.fill();
    ctx.strokeStyle = config.color;
    ctx.stroke();

    // Knuckle Tape / Hand Wraps (White for pure black player, themed for opponents)
    const tapeColor = config.knuckleTapeColor || (config.archetype === 'player_black' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)');
    ctx.strokeStyle = tapeColor;
    ctx.lineWidth = 1.8 * s;
    // Cross wrap lines on fist
    ctx.beginPath();
    ctx.moveTo(x - 3 * s, y - 3 * s);
    ctx.lineTo(x + 3 * s, y + 3 * s);
    ctx.moveTo(x + 3 * s, y - 3 * s);
    ctx.lineTo(x - 3 * s, y + 3 * s);
    ctx.stroke();

    ctx.restore();
  }

  // --- Sub-renderer: Head & Expressive Battle Face ---
  private static drawHeadAndFace(
    ctx: CanvasRenderingContext2D,
    headX: number,
    headY: number,
    f: number,
    s: number,
    config: AnatomyConfig,
    state: string,
    animFrame: number
  ) {
    const headRadius = 12 * s * (config.headScale || 1.0);

    if (config.isHollowHead) {
      // Hollow Void Head (Plasma Ascetic / Crimson Titan)
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius * 1.1, 0, Math.PI * 2);
      ctx.lineWidth = 4.5 * s;
      ctx.strokeStyle = config.color;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fill();

      // Glowing Core Eyes
      ctx.save();
      const eyeGlow = config.auraColor || '#00ffff';
      ctx.fillStyle = eyeGlow;
      ctx.shadowColor = eyeGlow;
      ctx.shadowBlur = 10 * s;
      ctx.beginPath();
      ctx.arc(headX + 4 * f * s, headY - 1 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.arc(headX - 1 * f * s, headY - 1 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Solid Martial Head
    ctx.beginPath();
    ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = config.color;
    ctx.fill();
    ctx.strokeStyle = config.color;
    ctx.stroke();

    // Calavera Face Paint (Sugar Skull)
    if (config.archetype === 'calavera_phantom') {
      ctx.save();
      ctx.fillStyle = '#ffaa00';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const petX = headX + 3 * f * s + Math.cos(a) * 5 * s;
        const petY = headY - 1 * s + Math.sin(a) * 5 * s;
        ctx.beginPath();
        ctx.arc(petX, petY, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.moveTo(headX + (f * s - 4 * s), headY + 6 * s);
      ctx.lineTo(headX + (f * s + 6 * s), headY + 6 * s);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Expressive Battle Eyes
    ctx.save();
    // Invert eye contrast: Black stickman gets bright white eyes; White stickman gets sharp black eyes
    const eyeColor = config.color === '#000000' || config.color === '#111111' ? '#ffffff' : '#000000';
    ctx.strokeStyle = eyeColor;
    ctx.fillStyle = eyeColor;
    ctx.lineWidth = 2.0 * s;

    if (state === 'HIT_STUN' || state === 'KNOCKDOWN' || state === 'DEFEAT') {
      // Knockout Shock Eyes (X X)
      ctx.beginPath();
      ctx.moveTo(headX + (2 * f - 3) * s, headY - 4 * s);
      ctx.lineTo(headX + (2 * f + 3) * s, headY + 2 * s);
      ctx.moveTo(headX + (2 * f + 3) * s, headY - 4 * s);
      ctx.lineTo(headX + (2 * f - 3) * s, headY + 2 * s);
      ctx.moveTo(headX + (-4 * f - 3) * s, headY - 4 * s);
      ctx.lineTo(headX + (-4 * f + 3) * s, headY + 2 * s);
      ctx.moveTo(headX + (-4 * f + 3) * s, headY - 4 * s);
      ctx.lineTo(headX + (-4 * f - 3) * s, headY + 2 * s);
      ctx.stroke();
    } else if (state === 'JAB' || state === 'CROSS_PUNCH' || state === 'UPPERCUT' || state === 'HEAVY_KICK') {
      // Fierce Battle Slits
      ctx.beginPath();
      ctx.moveTo(headX + 1 * f * s, headY - 3 * s);
      ctx.lineTo(headX + 6 * f * s, headY - 1 * s);
      ctx.moveTo(headX - 5 * f * s, headY - 3 * s);
      ctx.lineTo(headX - 1 * f * s, headY - 1 * s);
      ctx.stroke();
    } else {
      // Focused Martial Slits
      ctx.beginPath();
      ctx.arc(headX + 4 * f * s, headY - 1 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.arc(headX - 2 * f * s, headY - 1 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- Sub-renderer: Rising Uppercut Spiral Effect ---
  private static drawUppercutSpiral(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    f: number,
    s: number,
    color: string
  ) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14 * s;
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.moveTo(x - 12 * f * s, y + 25 * s);
    ctx.quadraticCurveTo(x + 18 * f * s, y, x, y - 24 * s);
    ctx.stroke();
    ctx.restore();
  }

  // --- Sub-renderer: Flying Clinch Knee Shockwave ---
  private static drawKneeShockwave(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    f: number,
    s: number,
    color: string
  ) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16 * s;
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.arc(x + 10 * f * s, y, 22 * s, -Math.PI / 2.5, Math.PI / 2.5, f < 0);
    ctx.stroke();
    ctx.restore();
  }

  // --- Sub-renderer: Two-Handed Palm Burst Shockwave ---
  private static drawPalmShockwave(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    f: number,
    s: number,
    color: string
  ) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18 * s;
    ctx.lineWidth = 6 * s;
    ctx.beginPath();
    ctx.arc(x + 16 * f * s, y, 32 * s, -Math.PI / 2, Math.PI / 2, f < 0);
    ctx.stroke();
    ctx.restore();
  }

  // ========================================================================
  // WILDCARD EASTER EGG: MINECRAFT "STEVE" VOXEL RENDERER
  // ========================================================================
  private static renderSteveVoxel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    f: number,
    s: number,
    pose: KeyframePose,
    state: string,
    animFrame: number
  ) {
    ctx.save();

    const headW = 22 * s;
    const headH = 22 * s;
    const headX = x + pose.headX * f * s - (headW / 2);
    const headY = y + pose.headY * s - (headH / 2);

    // 1. Steve Voxel Head (Flesh tone: #d79878)
    ctx.fillStyle = '#d79878';
    ctx.fillRect(headX, headY, headW, headH);
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(headX, headY, headW, headH);

    // Brown Hair & Goatee (#4a2e18)
    ctx.fillStyle = '#4a2e18';
    ctx.fillRect(headX, headY, headW, 6 * s); // Hair cap
    ctx.fillRect(headX + (f > 0 ? headW - 5 * s : 0), headY + 5 * s, 5 * s, 5 * s); // Sideburn
    ctx.fillRect(headX + (f > 0 ? headW - 10 * s : 2 * s), headY + 14 * s, 8 * s, 3 * s); // Goatee/mouth

    // Pixel Eyes (#ffffff + #2d45b5 blue pupil)
    const eyeX = f > 0 ? headX + 11 * s : headX + 3 * s;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(eyeX, headY + 8 * s, 6 * s, 3.5 * s);
    ctx.fillStyle = '#2d45b5';
    ctx.fillRect(f > 0 ? eyeX + 3 * s : eyeX, headY + 8 * s, 3 * s, 3.5 * s);

    // 2. Cyan Shirt Torso (#00a8a8)
    const torsoW = 18 * s;
    const torsoH = 28 * s;
    const torsoX = x + pose.neckX * f * s - (torsoW / 2);
    const torsoY = y + pose.neckY * s;
    ctx.fillStyle = '#00a8a8';
    ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(torsoX, torsoY, torsoW, torsoH);

    // 3. Indigo Pants Legs (#2d3282)
    const leftFootX = x + pose.leftFootX * f * s;
    const rightFootX = x + pose.rightFootX * f * s;
    const legW = 7 * s;
    const legH = 34 * s;
    ctx.fillStyle = '#2d3282';
    // Back leg
    ctx.fillRect(leftFootX - legW / 2, y + pose.pelvisY * s + 6 * s, legW, legH);
    ctx.strokeRect(leftFootX - legW / 2, y + pose.pelvisY * s + 6 * s, legW, legH);
    // Front leg
    ctx.fillRect(rightFootX - legW / 2, y + pose.pelvisY * s + 6 * s, legW, legH);
    ctx.strokeRect(rightFootX - legW / 2, y + pose.pelvisY * s + 6 * s, legW, legH);

    // Grey Shoes (#555555)
    ctx.fillStyle = '#555555';
    ctx.fillRect(leftFootX - legW / 2, y - 4 * s, legW + 3 * f * s, 5 * s);
    ctx.fillRect(rightFootX - legW / 2, y - 4 * s, legW + 3 * f * s, 5 * s);

    // 4. Blocky Voxel Arms & Boxing Fists (#00a8a8 sleeves + #d79878 flesh fists)
    const armW = 8 * s;
    const armH = 24 * s;
    const leftHandX = x + pose.leftHandX * f * s;
    const leftHandY = y + pose.leftHandY * s;
    const rightHandX = x + pose.rightHandX * f * s;
    const rightHandY = y + pose.rightHandY * s;

    // Back arm
    ctx.fillStyle = '#00a8a8';
    ctx.fillRect(leftHandX - armW / 2, leftHandY - armH / 2, armW, 8 * s);
    ctx.fillStyle = '#d79878';
    ctx.fillRect(leftHandX - armW / 2, leftHandY - armH / 2 + 8 * s, armW, armH - 8 * s);
    ctx.strokeRect(leftHandX - armW / 2, leftHandY - armH / 2, armW, armH);

    // Front arm
    ctx.fillStyle = '#00a8a8';
    ctx.fillRect(rightHandX - armW / 2, rightHandY - armH / 2, armW, 8 * s);
    ctx.fillStyle = '#d79878';
    ctx.fillRect(rightHandX - armW / 2, rightHandY - armH / 2 + 8 * s, armW, armH - 8 * s);
    ctx.strokeRect(rightHandX - armW / 2, rightHandY - armH / 2, armW, armH);

    ctx.restore();
  }
}
