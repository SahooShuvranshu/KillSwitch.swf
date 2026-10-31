// ============================================================================
// KillSwitch.swf — StickmanAnatomy.ts
// High-Fidelity Anatomical Vector Skeletal Model & Stylized Fighter Skins
// 60 FPS Procedural Canvas Rendering • Zero External Assets • Authentic Vector Lines
// ============================================================================

import { KeyframePose } from './StickmanPoses';

export type FighterArchetype = 
  | 'player_black'     // Player: 100% Pure Pitch Black Hero (#000000)
  | 'ghost_white'      // Round 1 AI: Pure White Minimalist Ghost Stickman
  | 'cobalt_striker'   // Round 2 AI: Electric Cyan Speedster (Lean Kickboxer)
  | 'jade_grandmaster' // Round 3 AI: Emerald Acrobat (Low Horse Stance & Sash)
  | 'crimson_titan'    // Round 4 AI: Heavyweight Berserker (Heavy Lines, Broad Shoulders)
  | 'steve_easter_egg' // Wildcard Easter Egg: Minecraft Blocky Voxel Steve
  | 'plasma_ascetic'   // Round 5 AI: Void Monk with Hollow Ring Head & Halo
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
   * Closed-form 2-bone geometric joint solver (Inverse Kinematics).
   * Prevents limb popping, stretching, and dislocated joints.
   */
  private static solveJoint(
    rootX: number, rootY: number,
    targetX: number, targetY: number,
    L1: number, L2: number,
    bendSign: number
  ): { x: number; y: number } {
    const dx = targetX - rootX;
    const dy = targetY - rootY;
    const dist = Math.hypot(dx, dy);

    // If target is beyond full reach, clamp along vector without dislocation
    if (dist >= L1 + L2) {
      const ang = Math.atan2(dy, dx);
      return {
        x: rootX + Math.cos(ang) * L1,
        y: rootY + Math.sin(ang) * L1
      };
    }

    const d = Math.max(Math.abs(L1 - L2) + 0.1, dist);
    const baseAng = Math.atan2(dy, dx);
    const cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
    const clampedCosA = Math.max(-1, Math.min(1, cosA));
    const angleA = Math.acos(clampedCosA);

    const jointAng = baseAng + bendSign * angleA;
    return {
      x: rootX + Math.cos(jointAng) * L1,
      y: rootY + Math.sin(jointAng) * L1
    };
  }

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
    const isGhostPrime = config.archetype === 'flash_ghost_prime';

    // 1. Soft Radial Floor Drop Shadow (shrinks and softens as fighter jumps)
    const elevation = Math.max(0, groundY - y);
    const jumpProgress = Math.min(1.0, elevation / 140);
    const shadowW = Math.max(8 * s, (28 * s) * (1 - jumpProgress * 0.55));
    const shadowH = Math.max(2.5 * s, (7.0 * s) * (1 - jumpProgress * 0.55));
    const shadowAlpha = Math.max(0.05, 0.45 * (1 - jumpProgress * 0.75));

    const shadowGrad = ctx.createRadialGradient(x, groundY, shadowW * 0.15, x, groundY, shadowW);
    shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowAlpha})`);
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(x, groundY, shadowW, shadowH, 0, 0, Math.PI * 2);
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

    // 3. Flash Ghost Prime Chromatic Glitch Afterimages
    if (isGhostPrime && state !== 'DEFEAT') {
      ctx.save();
      ctx.globalAlpha = 0.35;
      const glitchX1 = (Math.sin(animFrame * 0.8) * 8 - 4) * s;
      const glitchX2 = (-Math.cos(animFrame * 0.7) * 7 + 3) * s;
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = thick * 0.9;
      ctx.beginPath();
      ctx.arc(x + glitchX1, y - 82 * s, 7 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#ff00aa';
      ctx.beginPath();
      ctx.arc(x + glitchX2, y - 82 * s, 7 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Setup Line Styling & Flash Glow
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (flashFrames > 0) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8 * s;
    } else if (config.auraColor && state !== 'DEFEAT') {
      ctx.shadowColor = config.auraColor;
      ctx.shadowBlur = 10 * s;
    } else {
      ctx.shadowBlur = 0;
    }

    // --- Animation Principle: Subtle Idle Breathing & Stance Bounces ---
    let breathY = 0;
    let stanceBounceY = 0;

    if (state === 'IDLE') {
      breathY = Math.sin(animFrame * 0.12) * 1.6 * s;
      if (config.archetype === 'cobalt_striker') {
        // Cobalt kickboxer bouncy cadence
        stanceBounceY = -Math.abs(Math.sin(animFrame * 0.22)) * 3.5 * s;
      }
    }

    // --- Animation Principle: Jump Squash & Stretch ---
    let squashX = 1.0;
    let squashY = 1.0;
    if (state === 'JUMP') {
      if (stateTime <= 3) {
        // Takeoff Stretch (volume preserved: 1.12 * 0.89 = 1.0)
        squashY = 1.12;
        squashX = 0.89;
      } else if (elevation <= 6 && stateTime > 12) {
        // Landing Squash (volume preserved: 0.88 * 1.14 = 1.0)
        squashY = 0.88;
        squashX = 1.14;
      }
    }

    // ========================================================================
    // WILDCARD EASTER EGG: MINECRAFT "STEVE" VOXEL RENDERER
    // ========================================================================
    if (config.archetype === 'steve_easter_egg') {
      this.renderSteveVoxel(ctx, x, y, f, s, pose, state, animFrame);
      ctx.restore();
      return;
    }

    // --- Compute Articulated Skeleton Joints ---
    const headX = x + pose.headX * f * s * squashX;
    const headY = y + (pose.headY + breathY + stanceBounceY) * s * squashY;
    const neckX = x + pose.neckX * f * s * squashX;
    const neckY = y + (pose.neckY + breathY * 0.8 + stanceBounceY) * s * squashY;
    const pelvisX = x + pose.pelvisX * f * s * squashX;
    const pelvisY = y + (pose.pelvisY + stanceBounceY) * s * squashY;

    // Torso mid-point (Solar Plexus)
    const solarPlexusX = (neckX * 0.52 + pelvisX * 0.48);
    const solarPlexusY = (neckY * 0.52 + pelvisY * 0.48);

    // Anatomical Clavicle Span
    const shoulderHalfSpan = config.archetype === 'crimson_titan' ? 11.0 * s : 7.2 * s;
    const leftShoulderX = neckX - shoulderHalfSpan * f;
    const leftShoulderY = neckY + 1.2 * s;
    const rightShoulderX = neckX + shoulderHalfSpan * f;
    const rightShoulderY = neckY + 1.2 * s;

    // Anatomical Pelvic Hip Bar
    const hipHalfSpan = config.archetype === 'crimson_titan' ? 8.5 * s : 5.8 * s;
    const leftHipX = pelvisX - hipHalfSpan * f;
    const leftHipY = pelvisY;
    const rightHipX = pelvisX + hipHalfSpan * f;
    const rightHipY = pelvisY;

    // Hands and Feet Targets
    const leftHandX = x + pose.leftHandX * f * s;
    const leftHandY = y + (pose.leftHandY + breathY * 0.5 + stanceBounceY) * s;
    const rightHandX = x + pose.rightHandX * f * s;
    const rightHandY = y + (pose.rightHandY + breathY * 0.6 + stanceBounceY) * s;

    const leftFootX = x + pose.leftFootX * f * s;
    const leftFootY = y + pose.leftFootY * s;
    const rightFootX = x + pose.rightFootX * f * s;
    const rightFootY = y + pose.rightFootY * s;

    // --- Bone Lengths (Upper & Lower Segments) ---
    // Scaled for natural joint articulation and athletic stance flexion
    const armL1 = 17.5 * s;
    const armL2 = 17.5 * s;
    const legL1 = 24.5 * s;
    const legL2 = 24.5 * s;

    // Solve Articulated Elbows with Closed-Form Kinematics (No pop, no dislocate)
    const leftElbow = this.solveJoint(leftShoulderX, leftShoulderY, leftHandX, leftHandY, armL1, armL2, -1 * f);
    const rightElbow = this.solveJoint(rightShoulderX, rightShoulderY, rightHandX, rightHandY, armL1, armL2, 1 * f);

    // Solve Articulated Knees (Natural forward bend in stance, chambering on jumps/kicks)
    const kneeBendSign = state === 'LOW_SWEEP' ? 1 * f : -1 * f;
    const leftKnee = this.solveJoint(leftHipX, leftHipY, leftFootX, leftFootY, legL1, legL2, -1 * f);
    const rightKnee = this.solveJoint(rightHipX, rightHipY, rightFootX, rightFootY, legL1, legL2, kneeBendSign);

    // 5. Martial Arts Block Barrier
    if (state === 'BLOCK') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + 20 * f * s, y - 56 * s, 32 * s, -Math.PI / 2.3, Math.PI / 2.3, f < 0);
      ctx.lineWidth = 4.2 * s;
      ctx.strokeStyle = config.auraColor || (config.color === '#000000' ? '#00e5ff' : config.color);
      ctx.stroke();
      ctx.restore();
    }

    // --- High-Contrast Black Boundary for White / Light Stickmen ---
    const hasBlackOutline = config.archetype === 'ghost_white' || 
                            config.color === '#ffffff' || 
                            config.color === '#f5f5f5';

    if (hasBlackOutline) {
      ctx.save();
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#000000';
      ctx.lineWidth = thick + 2.8 * s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Spine & Bars
      ctx.beginPath();
      ctx.moveTo(leftShoulderX, leftShoulderY);
      ctx.lineTo(rightShoulderX, rightShoulderY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(neckX, neckY);
      ctx.quadraticCurveTo(solarPlexusX, solarPlexusY, pelvisX, pelvisY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(leftHipX, leftHipY);
      ctx.lineTo(rightHipX, rightHipY);
      ctx.stroke();

      // Limbs outline
      ctx.beginPath();
      ctx.moveTo(leftHipX, leftHipY);
      ctx.lineTo(leftKnee.x, leftKnee.y);
      ctx.lineTo(leftFootX, leftFootY);
      ctx.moveTo(rightHipX, rightHipY);
      ctx.lineTo(rightKnee.x, rightKnee.y);
      ctx.lineTo(rightFootX, rightFootY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(leftShoulderX, leftShoulderY);
      ctx.lineTo(leftElbow.x, leftElbow.y);
      ctx.lineTo(leftHandX, leftHandY);
      ctx.moveTo(rightShoulderX, rightShoulderY);
      ctx.lineTo(rightElbow.x, rightElbow.y);
      ctx.lineTo(rightHandX, rightHandY);
      ctx.stroke();

      // Head outline (Proportion 1/7 of height: radius ~7px)
      const headR = 7.0 * s * (config.headScale || 1.0);
      ctx.beginPath();
      ctx.arc(headX, headY, headR + 1.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Fists & Feet outlines
      ctx.beginPath();
      ctx.arc(leftHandX, leftHandY, 5.2 * s, 0, Math.PI * 2);
      ctx.arc(rightHandX, rightHandY, 5.2 * s, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 5.2 * s;
      ctx.beginPath();
      ctx.moveTo(leftFootX - 5 * f * s, leftFootY);
      ctx.lineTo(leftFootX + 10 * f * s, leftFootY);
      ctx.moveTo(rightFootX - 5 * f * s, rightFootY);
      ctx.lineTo(rightFootX + 10 * f * s, rightFootY);
      ctx.stroke();

      ctx.restore();
    }

    // 6. Draw Spine (Slightly heavier tapered stroke)
    ctx.strokeStyle = config.color;
    ctx.lineWidth = (thick + 0.5 * s);
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.quadraticCurveTo(solarPlexusX, solarPlexusY, pelvisX, pelvisY);
    ctx.stroke();

    // 7. Clavicle & Pelvis Bars
    ctx.lineWidth = thick;
    ctx.beginPath();
    ctx.moveTo(leftShoulderX, leftShoulderY);
    ctx.lineTo(rightShoulderX, rightShoulderY);
    ctx.moveTo(leftHipX, leftHipY);
    ctx.lineTo(rightHipX, rightHipY);
    ctx.stroke();

    // 8. Martial Arts Belt & Fluttering Ribbons
    ctx.save();
    let beltColor = '#ffffff';
    if (config.archetype === 'player_black') beltColor = '#ffffff';
    else if (config.archetype === 'ghost_white') beltColor = '#111111';
    else if (config.archetype === 'jade_grandmaster') beltColor = '#ffd700';
    else beltColor = config.auraColor || '#ff2200';

    ctx.strokeStyle = beltColor;
    ctx.fillStyle = beltColor;
    ctx.lineWidth = 2.6 * s;
    ctx.beginPath();
    ctx.arc(pelvisX, pelvisY, 2.8 * s, 0, Math.PI * 2);
    ctx.fill();

    // Trailing sash follow-through ribbons
    const ribbonWave1 = Math.sin(animFrame * 0.22) * 5 * s;
    const ribbonWave2 = Math.cos(animFrame * 0.18) * 6 * s;
    ctx.beginPath();
    ctx.moveTo(pelvisX, pelvisY);
    ctx.quadraticCurveTo(pelvisX - 10 * f * s, pelvisY + 12 * s + ribbonWave1, pelvisX - 18 * f * s, pelvisY + 22 * s + ribbonWave1);
    ctx.moveTo(pelvisX, pelvisY);
    ctx.quadraticCurveTo(pelvisX - 8 * f * s, pelvisY + 14 * s + ribbonWave2, pelvisX - 14 * f * s, pelvisY + 26 * s + ribbonWave2);
    ctx.stroke();
    ctx.restore();

    // 9. Back Leg (Left Leg) — Tapered stroke (Thigh -> Calf)
    ctx.strokeStyle = config.color;
    ctx.lineWidth = thick;
    ctx.beginPath();
    ctx.moveTo(leftHipX, leftHipY);
    ctx.lineTo(leftKnee.x, leftKnee.y);
    ctx.stroke();

    ctx.lineWidth = thick * 0.88;
    ctx.beginPath();
    ctx.moveTo(leftKnee.x, leftKnee.y);
    ctx.lineTo(leftFootX, leftFootY);
    ctx.stroke();
    this.drawJoint(ctx, leftKnee.x, leftKnee.y, 2.4 * s, config.color);
    this.drawFoot(ctx, leftFootX, leftFootY, f, s, config.color);

    // 10. Front Leg (Right Leg)
    ctx.lineWidth = thick;
    ctx.beginPath();
    ctx.moveTo(rightHipX, rightHipY);
    ctx.lineTo(rightKnee.x, rightKnee.y);
    ctx.stroke();

    ctx.lineWidth = thick * 0.88;
    ctx.beginPath();
    ctx.moveTo(rightKnee.x, rightKnee.y);
    ctx.lineTo(rightFootX, rightFootY);
    ctx.stroke();
    this.drawJoint(ctx, rightKnee.x, rightKnee.y, 2.4 * s, config.color);
    this.drawFoot(ctx, rightFootX, rightFootY, f, s, config.color);

    // 11. Back Arm (Left Arm) — Tapered stroke (Upper Arm -> Forearm)
    ctx.lineWidth = thick * 0.95;
    ctx.beginPath();
    ctx.moveTo(leftShoulderX, leftShoulderY);
    ctx.lineTo(leftElbow.x, leftElbow.y);
    ctx.stroke();

    ctx.lineWidth = thick * 0.84;
    ctx.beginPath();
    ctx.moveTo(leftElbow.x, leftElbow.y);
    ctx.lineTo(leftHandX, leftHandY);
    ctx.stroke();
    this.drawJoint(ctx, leftElbow.x, leftElbow.y, 2.2 * s, config.color);
    this.drawFist(ctx, leftHandX, leftHandY, f, s, config, state === 'PALM_BURST');

    // 12. Front Arm (Right Arm)
    ctx.lineWidth = thick * 0.95;
    ctx.beginPath();
    ctx.moveTo(rightShoulderX, rightShoulderY);
    ctx.lineTo(rightElbow.x, rightElbow.y);
    ctx.stroke();

    ctx.lineWidth = thick * 0.84;
    ctx.beginPath();
    ctx.moveTo(rightElbow.x, rightElbow.y);
    ctx.lineTo(rightHandX, rightHandY);
    ctx.stroke();
    this.drawJoint(ctx, rightElbow.x, rightElbow.y, 2.2 * s, config.color);
    this.drawFist(ctx, rightHandX, rightHandY, f, s, config, state === 'PALM_BURST');

    // 13. Dynamic Attack Motion Arcs & Energy Shockwaves
    this.drawAttackArcs(ctx, rightHandX, rightHandY, rightFootX, rightFootY, rightKnee.x, rightKnee.y, f, s, state, stateTime, config);

    // 14. Head & Expressive Battle Face (Proportion: 1/7 of height)
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

  // --- Sub-renderer: Flat Planted Martial Arts Foot with Angled Toe ---
  private static drawFoot(ctx: CanvasRenderingContext2D, x: number, y: number, f: number, s: number, color: string) {
    ctx.save();
    const isWhiteGuy = color === '#ffffff' || color === '#f5f5f5';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.6 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Sole
    ctx.moveTo(x - 5 * f * s, y);
    ctx.lineTo(x + 9 * f * s, y);
    // Upward angled toe
    ctx.lineTo(x + 11 * f * s, y - 2.5 * s);
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
    const fistR = 4.2 * s;
    const isWhiteGuy = config.archetype === 'ghost_white' || config.color === '#ffffff' || config.color === '#f5f5f5';

    if (isOpenPalm) {
      // Wing Chun Open Palm Strike
      ctx.fillStyle = config.color;
      ctx.strokeStyle = isWhiteGuy ? '#000000' : config.color;
      ctx.beginPath();
      ctx.arc(x, y, fistR * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1.8 * s;
      ctx.stroke();
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + (i * 1.8) * s, y);
        ctx.lineTo(x + 7 * f * s + (i * 1.8) * s, y + (i * 2.2) * s);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // Clenched Martial Fist
    ctx.beginPath();
    ctx.arc(x, y, fistR, 0, Math.PI * 2);
    ctx.fillStyle = config.color;
    ctx.fill();
    ctx.strokeStyle = isWhiteGuy ? '#000000' : config.color;
    ctx.lineWidth = isWhiteGuy ? 2.0 * s : 1.4 * s;
    ctx.stroke();

    // Knuckle Tape Wraps
    const tapeColor = config.knuckleTapeColor || (isWhiteGuy ? '#111111' : (config.archetype === 'player_black' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'));
    ctx.strokeStyle = tapeColor;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(x - 2.5 * s, y - 2.5 * s);
    ctx.lineTo(x + 2.5 * s, y + 2.5 * s);
    ctx.moveTo(x + 2.5 * s, y - 2.5 * s);
    ctx.lineTo(x - 2.5 * s, y + 2.5 * s);
    ctx.stroke();

    ctx.restore();
  }

  // --- Sub-renderer: Head & Expressive Battle Face (1/7 of height) ---
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
    const headRadius = 7.0 * s * (config.headScale || 1.0);
    const isWhiteGuy = config.archetype === 'ghost_white' || config.color === '#ffffff' || config.color === '#f5f5f5';

    // Plasma Ascetic Hollow Ring Head & Halo
    if (config.isHollowHead || config.archetype === 'plasma_ascetic') {
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius * 1.05, 0, Math.PI * 2);
      ctx.lineWidth = 3.6 * s;
      ctx.strokeStyle = config.color;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();

      // Floating Cyan Halo
      ctx.save();
      const haloGlow = config.auraColor || '#00ffff';
      ctx.strokeStyle = haloGlow;
      ctx.shadowColor = haloGlow;
      ctx.shadowBlur = 12 * s;
      ctx.lineWidth = 2.2 * s;
      const haloY = headY - (headRadius + 6 * s) + Math.sin(animFrame * 0.15) * 2 * s;
      ctx.beginPath();
      ctx.ellipse(headX, haloY, 8 * s, 2.5 * s, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing Core Eye
      ctx.fillStyle = haloGlow;
      ctx.beginPath();
      ctx.arc(headX + 2.5 * f * s, headY, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Solid Martial Arts Head
    ctx.beginPath();
    ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = config.color;
    ctx.fill();
    ctx.strokeStyle = isWhiteGuy ? '#000000' : config.color;
    ctx.lineWidth = isWhiteGuy ? 2.0 * s : 1.4 * s;
    ctx.stroke();

    // Calavera Skull Face Paint
    if (config.archetype === 'calavera_phantom') {
      ctx.save();
      ctx.fillStyle = '#ff9900';
      ctx.beginPath();
      ctx.arc(headX + 2.5 * f * s, headY - 1 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();
      // Stitched jaw
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      ctx.moveTo(headX + (f * s - 3 * s), headY + 4 * s);
      ctx.lineTo(headX + (f * s + 4 * s), headY + 4 * s);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Cobalt Duelist Athletic Headband & Streamers
    if (config.archetype === 'cobalt_striker') {
      ctx.save();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2.0 * s;
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius + 0.6 * s, -Math.PI * 0.9, 0.1);
      ctx.stroke();
      const ribbonWave = Math.sin(animFrame * 0.25) * 4 * s;
      ctx.beginPath();
      ctx.moveTo(headX - headRadius * f, headY - 1 * s);
      ctx.quadraticCurveTo(headX - (headRadius + 8) * f * s, headY - 2 * s + ribbonWave, headX - (headRadius + 16) * f * s, headY + 3 * s + ribbonWave);
      ctx.moveTo(headX - headRadius * f, headY);
      ctx.quadraticCurveTo(headX - (headRadius + 6) * f * s, headY + 4 * s - ribbonWave, headX - (headRadius + 14) * f * s, headY + 9 * s - ribbonWave);
      ctx.stroke();
      ctx.restore();
    }

    // Jade Grandmaster Forehead Silk Sash & Crest
    if (config.archetype === 'jade_grandmaster') {
      ctx.save();
      ctx.strokeStyle = '#ffd700';
      ctx.fillStyle = '#ffd700';
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius + 0.6 * s, -Math.PI * 0.8, -Math.PI * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(headX + 2 * f * s, headY - 4 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();
      const tailWave = Math.sin(animFrame * 0.18) * 5 * s;
      ctx.strokeStyle = '#00e676';
      ctx.beginPath();
      ctx.moveTo(headX - headRadius * f, headY - 2 * s);
      ctx.quadraticCurveTo(headX - (headRadius + 10) * f * s, headY + 6 * s + tailWave, headX - (headRadius + 20) * f * s, headY + 14 * s + tailWave);
      ctx.stroke();
      ctx.restore();
    }

    // Flash Ghost Prime Digital Bytecode Horns / Spikes
    if (config.archetype === 'flash_ghost_prime') {
      ctx.save();
      ctx.strokeStyle = '#ff00aa';
      ctx.fillStyle = '#ff00aa';
      ctx.lineWidth = 2.2 * s;
      const spikeFlicker = Math.sin(animFrame * 0.4) * 2 * s;
      ctx.beginPath();
      ctx.moveTo(headX - 4 * s, headY - headRadius);
      ctx.lineTo(headX - 6 * s, headY - headRadius - 8 * s - spikeFlicker);
      ctx.moveTo(headX + 4 * s, headY - headRadius);
      ctx.lineTo(headX + 6 * s, headY - headRadius - 8 * s + spikeFlicker);
      ctx.stroke();
      ctx.restore();
    }

    // Crimson Titan Heavy Brow Ridge
    if (config.archetype === 'crimson_titan') {
      ctx.save();
      ctx.strokeStyle = '#ff0044';
      ctx.lineWidth = 2.4 * s;
      ctx.beginPath();
      ctx.moveTo(headX - 4 * f * s, headY - 2 * s);
      ctx.lineTo(headX + 5 * f * s, headY - 1 * s);
      ctx.stroke();
      ctx.restore();
    }

    // Expressive Battle Eyes
    ctx.save();
    const eyeColor = config.color === '#000000' || config.color === '#111111' ? '#ffffff' : '#000000';
    ctx.strokeStyle = eyeColor;
    ctx.fillStyle = eyeColor;
    ctx.lineWidth = 1.8 * s;

    if (state === 'HIT_STUN' || state === 'KNOCKDOWN' || state === 'DEFEAT') {
      // Knockout Shock Eyes (X X)
      ctx.beginPath();
      ctx.moveTo(headX + (1.5 * f - 2) * s, headY - 3 * s);
      ctx.lineTo(headX + (1.5 * f + 2) * s, headY + 1 * s);
      ctx.moveTo(headX + (1.5 * f + 2) * s, headY - 3 * s);
      ctx.lineTo(headX + (1.5 * f - 2) * s, headY + 1 * s);
      ctx.stroke();
    } else if (state === 'JAB' || state === 'CROSS_PUNCH' || state === 'UPPERCUT' || state === 'HEAVY_KICK') {
      // Fierce Battle Eye Slit
      ctx.beginPath();
      ctx.moveTo(headX + 1 * f * s, headY - 2 * s);
      ctx.lineTo(headX + 4.5 * f * s, headY - 0.5 * s);
      ctx.stroke();
    } else {
      // Focused Martial Slit
      ctx.beginPath();
      ctx.arc(headX + 2.8 * f * s, headY - 0.8 * s, 1.4 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- Sub-renderer: Dynamic Attack Motion Arcs & Shockwaves ---
  private static drawAttackArcs(
    ctx: CanvasRenderingContext2D,
    handX: number, handY: number,
    footX: number, footY: number,
    kneeX: number, kneeY: number,
    f: number, s: number,
    state: string,
    stateTime: number,
    config: AnatomyConfig
  ) {
    const color = config.auraColor || config.color;

    // Heavy Kick Crescent Arc
    if (state === 'HEAVY_KICK' && stateTime >= 2 && stateTime <= 8) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12 * s;
      ctx.lineWidth = 3.8 * s;
      ctx.beginPath();
      ctx.arc(footX - 16 * f * s, footY + 12 * s, 36 * s, -Math.PI / 3, Math.PI / 4, f < 0);
      ctx.stroke();
      ctx.restore();
    }

    // Uppercut Skyward Helix Arc
    if (state === 'UPPERCUT' && stateTime >= 3 && stateTime <= 9) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14 * s;
      ctx.lineWidth = 4 * s;
      ctx.beginPath();
      ctx.moveTo(handX - 10 * f * s, handY + 22 * s);
      ctx.quadraticCurveTo(handX + 16 * f * s, handY, handX, handY - 20 * s);
      ctx.stroke();
      ctx.restore();
    }

    // Flying Knee Leaping Wedge
    if (state === 'FLYING_KNEE' && stateTime >= 2 && stateTime <= 10) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14 * s;
      ctx.lineWidth = 4.2 * s;
      ctx.beginPath();
      ctx.arc(kneeX + 8 * f * s, kneeY, 20 * s, -Math.PI / 2.6, Math.PI / 2.6, f < 0);
      ctx.stroke();
      ctx.restore();
    }

    // Palm Burst Dual Shockwave
    if (state === 'PALM_BURST' && stateTime >= 2 && stateTime <= 8) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16 * s;
      ctx.lineWidth = 5 * s;
      ctx.beginPath();
      ctx.arc(handX + 14 * f * s, handY, 28 * s, -Math.PI / 2.2, Math.PI / 2.2, f < 0);
      ctx.stroke();
      ctx.restore();
    }

    // Low Sweep Floor Arc
    if (state === 'LOW_SWEEP' && stateTime >= 2 && stateTime <= 7) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10 * s;
      ctx.lineWidth = 3.6 * s;
      ctx.beginPath();
      ctx.moveTo(footX - 22 * f * s, footY);
      ctx.lineTo(footX + 14 * f * s, footY);
      ctx.stroke();
      ctx.restore();
    }
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
    const headW = 16 * s;
    const headH = 16 * s;
    const headX = x + pose.headX * f * s - (headW / 2);
    const headY = y + pose.headY * s - (headH / 2);

    // Voxel Head
    ctx.fillStyle = '#b58863';
    ctx.fillRect(headX, headY, headW, headH);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.8 * s;
    ctx.strokeRect(headX, headY, headW, headH);

    // Hair
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(headX, headY, headW, 4 * s);

    // Pixel Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(headX + (f > 0 ? 9 * s : 2 * s), headY + 6 * s, 4 * s, 3 * s);
    ctx.fillStyle = '#3f51b5';
    ctx.fillRect(headX + (f > 0 ? 11 * s : 2 * s), headY + 7 * s, 2 * s, 2 * s);

    // Voxel Torso (Cyan T-Shirt)
    const torsoW = 14 * s;
    const torsoH = 24 * s;
    const torsoX = x - (torsoW / 2) + pose.neckX * f * s * 0.5;
    const torsoY = y - 72 * s;
    ctx.fillStyle = '#00a8a8';
    ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
    ctx.strokeRect(torsoX, torsoY, torsoW, torsoH);

    // Voxel Legs (Blue Pants)
    const legW = 6.5 * s;
    const legH = 26 * s;
    const leftLegX = torsoX;
    const rightLegX = torsoX + 7.5 * s;
    const legY = torsoY + torsoH;
    ctx.fillStyle = '#2b3990';
    ctx.fillRect(leftLegX, legY, legW, legH);
    ctx.strokeRect(leftLegX, legY, legW, legH);
    ctx.fillRect(rightLegX, legY, legW, legH);
    ctx.strokeRect(rightLegX, legY, legW, legH);

    // Voxel Arms
    ctx.fillStyle = '#b58863';
    const leftArmX = x + pose.leftHandX * f * s - 4 * s;
    const leftArmY = y + pose.leftHandY * s - 4 * s;
    const rightArmX = x + pose.rightHandX * f * s - 4 * s;
    const rightArmY = y + pose.rightHandY * s - 4 * s;
    ctx.fillRect(leftArmX, leftArmY, 8 * s, 8 * s);
    ctx.strokeRect(leftArmX, leftArmY, 8 * s, 8 * s);
    ctx.fillRect(rightArmX, rightArmY, 8 * s, 8 * s);
    ctx.strokeRect(rightArmX, rightArmY, 8 * s, 8 * s);

    ctx.restore();
  }
}
