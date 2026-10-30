// ============================================================================
// KillSwitch.swf — Deterministic Frame-by-Frame Stickman Pose Data
// High-performance keyframe animation tables (Zero trigonometry per frame)
// Ultra-low RAM & CPU overhead for consumer devices
// ============================================================================

export interface KeyframePose {
  headX: number;
  headY: number;
  neckX: number;
  neckY: number;
  pelvisX: number;
  pelvisY: number;
  leftHandX: number;
  leftHandY: number;
  rightHandX: number;
  rightHandY: number;
  leftFootX: number;
  leftFootY: number;
  rightFootX: number;
  rightFootY: number;
}

// 1. IDLE: 4-Frame Martial Arts Ready Breathing Stance (Step every 6 ticks)
export const POSE_IDLE: KeyframePose[] = [
  {
    headX: 0, headY: -88, neckX: 0, neckY: -76, pelvisX: 0, pelvisY: -45,
    leftHandX: -8, leftHandY: -60, rightHandX: 14, rightHandY: -62,
    leftFootX: -12, leftFootY: 0, rightFootX: 12, rightFootY: 0
  },
  {
    headX: 0, headY: -90, neckX: 0, neckY: -78, pelvisX: 0, pelvisY: -46,
    leftHandX: -9, leftHandY: -62, rightHandX: 16, rightHandY: -64,
    leftFootX: -12, leftFootY: 0, rightFootX: 12, rightFootY: 0
  },
  {
    headX: 0, headY: -91, neckX: 0, neckY: -79, pelvisX: 0, pelvisY: -47,
    leftHandX: -8, leftHandY: -63, rightHandX: 15, rightHandY: -65,
    leftFootX: -12, leftFootY: 0, rightFootX: 12, rightFootY: 0
  },
  {
    headX: 0, headY: -88, neckX: 0, neckY: -76, pelvisX: 0, pelvisY: -45,
    leftHandX: -7, leftHandY: -59, rightHandX: 13, rightHandY: -61,
    leftFootX: -12, leftFootY: 0, rightFootX: 12, rightFootY: 0
  }
];

// 2. WALK_FORWARD: 6-Frame Martial Arts Combat Stride (Step every 4 ticks)
export const POSE_WALK_FORWARD: KeyframePose[] = [
  {
    headX: 2, headY: -87, neckX: 1, neckY: -75, pelvisX: 0, pelvisY: -44,
    leftHandX: 12, leftHandY: -60, rightHandX: -10, rightHandY: -60,
    leftFootX: -16, leftFootY: 0, rightFootX: 16, rightFootY: 0
  },
  {
    headX: 4, headY: -85, neckX: 3, neckY: -73, pelvisX: 2, pelvisY: -42,
    leftHandX: 8, leftHandY: -58, rightHandX: -6, rightHandY: -58,
    leftFootX: -10, leftFootY: -2, rightFootX: 12, rightFootY: 0
  },
  {
    headX: 2, headY: -89, neckX: 1, neckY: -77, pelvisX: 0, pelvisY: -46,
    leftHandX: 0, leftHandY: -60, rightHandX: 0, rightHandY: -60,
    leftFootX: 0, leftFootY: -8, rightFootX: 4, rightFootY: 0
  },
  {
    headX: 2, headY: -87, neckX: 1, neckY: -75, pelvisX: 0, pelvisY: -44,
    leftHandX: -10, leftHandY: -60, rightHandX: 12, rightHandY: -60,
    leftFootX: 16, leftFootY: 0, rightFootX: -16, rightFootY: 0
  },
  {
    headX: 4, headY: -85, neckX: 3, neckY: -73, pelvisX: 2, pelvisY: -42,
    leftHandX: -6, leftHandY: -58, rightHandX: 8, rightHandY: -58,
    leftFootX: 12, leftFootY: 0, rightFootX: -10, rightFootY: -2
  },
  {
    headX: 2, headY: -89, neckX: 1, neckY: -77, pelvisX: 0, pelvisY: -46,
    leftHandX: 0, leftHandY: -60, rightHandX: 0, rightHandY: -60,
    leftFootX: 4, leftFootY: 0, rightFootX: 0, rightFootY: -8
  }
];

// 3. WALK_BACK: 4-Frame Defensive Tactical Retreat
export const POSE_WALK_BACK: KeyframePose[] = [
  {
    headX: -4, headY: -88, neckX: -2, neckY: -76, pelvisX: -2, pelvisY: -45,
    leftHandX: -14, leftHandY: -64, rightHandX: 12, rightHandY: -62,
    leftFootX: -18, leftFootY: 0, rightFootX: 8, rightFootY: 0
  },
  {
    headX: -3, headY: -87, neckX: -1, neckY: -75, pelvisX: -1, pelvisY: -44,
    leftHandX: -12, leftHandY: -62, rightHandX: 14, rightHandY: -64,
    leftFootX: -12, leftFootY: 0, rightFootX: 4, rightFootY: -4
  },
  {
    headX: -4, headY: -88, neckX: -2, neckY: -76, pelvisX: -2, pelvisY: -45,
    leftHandX: -15, leftHandY: -65, rightHandX: 10, rightHandY: -61,
    leftFootX: -6, leftFootY: 0, rightFootX: 12, rightFootY: 0
  },
  {
    headX: -3, headY: -87, neckX: -1, neckY: -75, pelvisX: -1, pelvisY: -44,
    leftHandX: -13, leftHandY: -63, rightHandX: 12, rightHandY: -63,
    leftFootX: -14, leftFootY: -4, rightFootX: 10, rightFootY: 0
  }
];

// 4. JUMP: 4-Frame Athletic Airborne Hop
export const POSE_JUMP: KeyframePose[] = [
  {
    headX: 0, headY: -96, neckX: 0, neckY: -84, pelvisX: 0, pelvisY: -54,
    leftHandX: -16, leftHandY: -90, rightHandX: 16, rightHandY: -90,
    leftFootX: -10, leftFootY: -22, rightFootX: 8, rightFootY: -18
  },
  {
    headX: 0, headY: -92, neckX: 0, neckY: -80, pelvisX: 0, pelvisY: -50,
    leftHandX: -14, leftHandY: -85, rightHandX: 14, rightHandY: -85,
    leftFootX: -8, leftFootY: -32, rightFootX: 6, rightFootY: -28
  },
  {
    headX: 0, headY: -90, neckX: 0, neckY: -78, pelvisX: 0, pelvisY: -48,
    leftHandX: -12, leftHandY: -72, rightHandX: 12, rightHandY: -72,
    leftFootX: -10, leftFootY: -14, rightFootX: 10, rightFootY: -12
  },
  {
    headX: 0, headY: -78, neckX: 0, neckY: -66, pelvisX: 0, pelvisY: -38,
    leftHandX: -8, leftHandY: -50, rightHandX: 10, rightHandY: -50,
    leftFootX: -16, leftFootY: 0, rightFootX: 16, rightFootY: 0
  }
];

// 5. CROUCH: 2-Frame Low Martial Arts Guard
export const POSE_CROUCH: KeyframePose[] = [
  {
    headX: 0, headY: -72, neckX: 0, neckY: -60, pelvisX: 0, pelvisY: -34,
    leftHandX: 4, leftHandY: -52, rightHandX: 16, rightHandY: -52,
    leftFootX: -16, leftFootY: 0, rightFootX: 14, rightFootY: 0
  },
  {
    headX: 0, headY: -60, neckX: 0, neckY: -50, pelvisX: 0, pelvisY: -26,
    leftHandX: 6, leftHandY: -45, rightHandX: 20, rightHandY: -45,
    leftFootX: -18, leftFootY: 0, rightFootX: 16, rightFootY: 0
  }
];

// 6. JAB: 4-Frame Snappy Straight Punch (Anticipation -> Thrust -> Impact -> Recoil)
export const POSE_JAB: KeyframePose[] = [
  { // Windup
    headX: -4, headY: -86, neckX: -2, neckY: -75, pelvisX: -3, pelvisY: -45,
    leftHandX: -8, leftHandY: -72, rightHandX: 8, rightHandY: -68,
    leftFootX: -12, leftFootY: 0, rightFootX: 14, rightFootY: 0
  },
  { // Thrust Strike
    headX: 8, headY: -87, neckX: 6, neckY: -76, pelvisX: 4, pelvisY: -45,
    leftHandX: -4, leftHandY: -68, rightHandX: 42, rightHandY: -75,
    leftFootX: -14, leftFootY: 0, rightFootX: 18, rightFootY: 0
  },
  { // Maximum Extension Impact
    headX: 10, headY: -87, neckX: 8, neckY: -76, pelvisX: 5, pelvisY: -45,
    leftHandX: -5, leftHandY: -70, rightHandX: 46, rightHandY: -74,
    leftFootX: -14, leftFootY: 0, rightFootX: 20, rightFootY: 0
  },
  { // Swift Recoil
    headX: 4, headY: -88, neckX: 2, neckY: -76, pelvisX: 1, pelvisY: -45,
    leftHandX: -7, leftHandY: -64, rightHandX: 22, rightHandY: -66,
    leftFootX: -12, leftFootY: 0, rightFootX: 14, rightFootY: 0
  }
];

// 7. HEAVY_KICK: 5-Frame High-Velocity Roundhouse Kick
export const POSE_HEAVY_KICK: KeyframePose[] = [
  { // Chamber Knee High
    headX: -10, headY: -86, neckX: -8, neckY: -75, pelvisX: -6, pelvisY: -45,
    leftHandX: -12, leftHandY: -74, rightHandX: 10, rightHandY: -74,
    leftFootX: -8, leftFootY: 0, rightFootX: -4, rightFootY: -36
  },
  { // Explosive Extension Whip
    headX: -14, headY: -84, neckX: -10, neckY: -74, pelvisX: -8, pelvisY: -46,
    leftHandX: -16, leftHandY: -76, rightHandX: -8, rightHandY: -76,
    leftFootX: -10, leftFootY: 0, rightFootX: 48, rightFootY: -72
  },
  { // Apex Crescent Strike
    headX: -12, headY: -84, neckX: -8, neckY: -74, pelvisX: -6, pelvisY: -46,
    leftHandX: -18, leftHandY: -78, rightHandX: -10, rightHandY: -78,
    leftFootX: -10, leftFootY: 0, rightFootX: 56, rightFootY: -78
  },
  { // Overshoot Follow-through
    headX: -6, headY: -85, neckX: -4, neckY: -75, pelvisX: -2, pelvisY: -45,
    leftHandX: -12, leftHandY: -72, rightHandX: 4, rightHandY: -72,
    leftFootX: -10, leftFootY: 0, rightFootX: 38, rightFootY: -48
  },
  { // Recovery Step
    headX: 0, headY: -88, neckX: 0, neckY: -76, pelvisX: 0, pelvisY: -45,
    leftHandX: -8, leftHandY: -62, rightHandX: 12, rightHandY: -62,
    leftFootX: -12, leftFootY: 0, rightFootX: 20, rightFootY: -10
  }
];

// 8. JUMP_KICK: 4-Frame Diagonal Airborne Dive Kick
export const POSE_JUMP_KICK: KeyframePose[] = [
  { // Chamber Tuck
    headX: 8, headY: -78, neckX: 4, neckY: -70, pelvisX: -6, pelvisY: -52,
    leftHandX: -12, leftHandY: -68, rightHandX: 12, rightHandY: -68,
    leftFootX: -18, leftFootY: -42, rightFootX: 14, rightFootY: -48
  },
  { // Flying Extension
    headX: 16, headY: -72, neckX: 10, neckY: -64, pelvisX: -12, pelvisY: -46,
    leftHandX: -18, leftHandY: -66, rightHandX: -6, rightHandY: -66,
    leftFootX: -26, leftFootY: -34, rightFootX: 52, rightFootY: -64
  },
  { // Locked Air Kick Hold
    headX: 18, headY: -72, neckX: 12, neckY: -64, pelvisX: -10, pelvisY: -46,
    leftHandX: -18, leftHandY: -66, rightHandX: -6, rightHandY: -66,
    leftFootX: -26, leftFootY: -34, rightFootX: 54, rightFootY: -62
  },
  { // Descent Prep
    headX: 12, headY: -76, neckX: 8, neckY: -68, pelvisX: -6, pelvisY: -48,
    leftHandX: -14, leftHandY: -62, rightHandX: 8, rightHandY: -62,
    leftFootX: -20, leftFootY: -22, rightFootX: 36, rightFootY: -34
  }
];

// 9. BLOCK: 2-Frame Fortified Cross-Arm Guard
export const POSE_BLOCK: KeyframePose[] = [
  {
    headX: -4, headY: -86, neckX: -2, neckY: -75, pelvisX: -2, pelvisY: -44,
    leftHandX: 12, leftHandY: -72, rightHandX: 14, rightHandY: -78,
    leftFootX: -16, leftFootY: 0, rightFootX: 10, rightFootY: 0
  },
  {
    headX: -5, headY: -85, neckX: -3, neckY: -74, pelvisX: -3, pelvisY: -43,
    leftHandX: 14, leftHandY: -70, rightHandX: 16, rightHandY: -78,
    leftFootX: -18, leftFootY: 0, rightFootX: 12, rightFootY: 0
  }
];

// 10. HIT_STUN: 3-Frame Whiplash Recoil
export const POSE_HIT_STUN: KeyframePose[] = [
  {
    headX: -20, headY: -84, neckX: -14, neckY: -74, pelvisX: -6, pelvisY: -44,
    leftHandX: -24, leftHandY: -76, rightHandX: -14, rightHandY: -84,
    leftFootX: -16, leftFootY: 0, rightFootX: 4, rightFootY: -6
  },
  {
    headX: -16, headY: -82, neckX: -10, neckY: -72, pelvisX: -4, pelvisY: -44,
    leftHandX: -20, leftHandY: -70, rightHandX: -10, rightHandY: -78,
    leftFootX: -14, leftFootY: 0, rightFootX: 2, rightFootY: 0
  },
  {
    headX: -8, headY: -86, neckX: -4, neckY: -75, pelvisX: -2, pelvisY: -45,
    leftHandX: -14, leftHandY: -64, rightHandX: 4, rightHandY: -68,
    leftFootX: -12, leftFootY: 0, rightFootX: 10, rightFootY: 0
  }
];

// 11. KNOCKDOWN: 4-Frame Collapse
export const POSE_KNOCKDOWN: KeyframePose[] = [
  {
    headX: -28, headY: -70, neckX: -20, neckY: -64, pelvisX: -8, pelvisY: -42,
    leftHandX: -30, leftHandY: -74, rightHandX: -16, rightHandY: -74,
    leftFootX: 12, leftFootY: -28, rightFootX: 24, rightFootY: -34
  },
  {
    headX: -32, headY: -30, neckX: -22, neckY: -26, pelvisX: -6, pelvisY: -18,
    leftHandX: -28, leftHandY: -32, rightHandX: -12, rightHandY: -32,
    leftFootX: 14, leftFootY: -8, rightFootX: 28, rightFootY: -12
  },
  {
    headX: -30, headY: -34, neckX: -20, neckY: -28, pelvisX: -5, pelvisY: -20,
    leftHandX: -26, leftHandY: -34, rightHandX: -10, rightHandY: -34,
    leftFootX: 12, leftFootY: -12, rightFootX: 24, rightFootY: -16
  },
  {
    headX: -34, headY: -14, neckX: -24, neckY: -12, pelvisX: -8, pelvisY: -8,
    leftHandX: -30, leftHandY: -12, rightHandX: -14, rightHandY: -12,
    leftFootX: 16, leftFootY: 0, rightFootX: 30, rightFootY: 0
  }
];

// Helper to retrieve the current frame pose without memory allocations
export function getPoseForState(state: string, stateTime: number, animFrame: number): KeyframePose {
  switch (state) {
    case 'IDLE':
      return POSE_IDLE[Math.floor(animFrame / 7) % POSE_IDLE.length];
    case 'WALK_FORWARD':
      return POSE_WALK_FORWARD[Math.floor(animFrame / 4) % POSE_WALK_FORWARD.length];
    case 'WALK_BACK':
      return POSE_WALK_BACK[Math.floor(animFrame / 5) % POSE_WALK_BACK.length];
    case 'JUMP':
      return POSE_JUMP[Math.min(POSE_JUMP.length - 1, Math.floor(stateTime / 6))];
    case 'CROUCH':
      return POSE_CROUCH[Math.min(POSE_CROUCH.length - 1, Math.floor(stateTime / 4))];
    case 'JAB':
      return POSE_JAB[Math.min(POSE_JAB.length - 1, Math.floor(stateTime / 3))];
    case 'HEAVY_KICK':
      return POSE_HEAVY_KICK[Math.min(POSE_HEAVY_KICK.length - 1, Math.floor(stateTime / 4))];
    case 'JUMP_KICK':
      return POSE_JUMP_KICK[Math.min(POSE_JUMP_KICK.length - 1, Math.floor(stateTime / 4))];
    case 'BLOCK':
      return POSE_BLOCK[Math.min(POSE_BLOCK.length - 1, Math.floor(stateTime / 6))];
    case 'HIT_STUN':
      return POSE_HIT_STUN[Math.min(POSE_HIT_STUN.length - 1, Math.floor(stateTime / 5))];
    case 'KNOCKDOWN':
      return POSE_KNOCKDOWN[Math.min(POSE_KNOCKDOWN.length - 1, Math.floor(stateTime / 8))];
    default:
      return POSE_IDLE[0];
  }
}
