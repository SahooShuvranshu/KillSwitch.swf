// ============================================================================
// KillSwitch.swf — Showcase Website Interactive Controller
// Powers interactive Q-matrix explorer, archetype tabs, soundboard, and smooth UX
// ============================================================================

import { sound } from './engine/Audio';

export interface QStatePreset {
  id: string;
  label: string;
  desc: string;
  stateKey: string;
  opponentClass: string;
  distanceBucket: string;
  recommendedMove: string;
  rationale: string;
  qValues: Record<string, number>;
}

export const Q_PRESETS: QStatePreset[] = [
  {
    id: 'air_dive',
    label: 'Airborne Dive-Kick',
    desc: 'Opponent launches an airborne Xiao Xiao jump-kick descending towards you.',
    stateKey: 'mid_air',
    opponentClass: 'AIR (Jumping / Dive-Kick)',
    distanceBucket: 'MID (80–150 px)',
    recommendedMove: 'ANTI_AIR',
    rationale: 'Cosine-law bone solver angles Rising Uppercut to hit during the vulnerable apex descent, canceling dive momentum before the hitbox activates.',
    qValues: {
      ANTI_AIR: 18.4,
      UPPERCUT: 14.2,
      FLYING_KNEE: 11.5,
      EVADE: 7.8,
      RETREAT: 2.1,
      PUNCH_CHAIN: -5.4,
      GUARD_BREAK: -9.8
    }
  },
  {
    id: 'turtle_shield',
    label: 'Turtling Guard',
    desc: 'Opponent holds a stationary high block, absorbing light frontal strikes.',
    stateKey: 'close_block',
    opponentClass: 'BLOCK (Guarding Shield)',
    distanceBucket: 'CLOSE (<75 px)',
    recommendedMove: 'GUARD_BREAK',
    rationale: 'High guard blocks high punches with 85% damage absorption. Crouching Low Sweep bypasses upper guard frames, scoring a knockdown and opening cancel windows.',
    qValues: {
      GUARD_BREAK: 16.9,
      PUNCH_CHAIN: 4.2,
      KICK_CHAIN: 3.1,
      EVADE: 2.5,
      UPPERCUT: -1.2,
      ANTI_AIR: -8.5,
      RETREAT: -4.0
    }
  },
  {
    id: 'whiff_punish',
    label: 'Whiffed Heavy Kick',
    desc: 'Opponent threw a heavy roundhouse at maximum range and missed, stuck in 14-frame recovery.',
    stateKey: 'mid_attack',
    opponentClass: 'ATTACK (Recovery Lag)',
    distanceBucket: 'MID (80–150 px)',
    recommendedMove: 'WHIFF_PUNISH',
    rationale: 'Enemy hurtbox is extended forward during leg retract. Flying Clinch Knee closes distance in 3 frames with armor frames, punishing before guard can be restored.',
    qValues: {
      WHIFF_PUNISH: 17.5,
      FLYING_KNEE: 15.1,
      JUMP_IN: 8.4,
      EVADE: 5.2,
      RETREAT: 1.0,
      GUARD_BREAK: -2.3,
      ANTI_AIR: -6.0
    }
  },
  {
    id: 'close_brawl',
    label: 'In-The-Pocket Brawl',
    desc: 'Both fighters at point-blank range in neutral stance waiting for frame advantage.',
    stateKey: 'close_idle',
    opponentClass: 'IDLE (Neutral Spacing)',
    distanceBucket: 'CLOSE (<75 px)',
    recommendedMove: 'PUNCH_CHAIN',
    rationale: 'Light Jab has a lightning 3-frame startup. Starting the 3-hit jab-cross-palm chain claims immediate frame advantage and forces the foe into hitstun.',
    qValues: {
      PUNCH_CHAIN: 15.3,
      KICK_CHAIN: 11.8,
      UPPERCUT: 9.4,
      GUARD_BREAK: 6.2,
      EVADE: 5.0,
      RETREAT: 0.5,
      ANTI_AIR: -4.1
    }
  },
  {
    id: 'corner_trap',
    label: 'Corner Boundary Trap',
    desc: 'Ghost is pushed near the arena edge (<95 px from wall) under forward pressure.',
    stateKey: 'close_wall',
    opponentClass: 'ATTACK (Corner Pressure)',
    distanceBucket: 'CLOSE (<75 px)',
    recommendedMove: 'EVADE',
    rationale: 'Wall-splat against energy boundary pillars causes extra shockwave damage. Evasive Dodge Roll utilizes 12 I-frames to tumble through the foe and reverse positioning.',
    qValues: {
      EVADE: 19.1,
      RETREAT: -8.0, // Retreating into wall is impossible
      WHIFF_PUNISH: 8.2,
      PUNCH_CHAIN: 5.4,
      UPPERCUT: 4.1,
      GUARD_BREAK: 1.2,
      ANTI_AIR: -3.5
    }
  }
];

export interface ArchetypeData {
  round: number;
  name: string;
  title: string;
  skin: string;
  color: string;
  scale: string;
  trait: string;
  description: string;
}

export const ARCHETYPES: ArchetypeData[] = [
  {
    round: 1,
    name: 'WHITE GHOST',
    title: 'The Ghost of Flash Player (10.3)',
    skin: 'ghost',
    color: '#ffffff',
    scale: '1.00x',
    trait: 'Baseline Vector Form',
    description: 'Classic high-contrast Flash silhouette with dual black knuckle wraps and dark sash. Learns your opening jump and punch habits.'
  },
  {
    round: 2,
    name: 'COBALT DUELIST',
    title: 'Swift Kickboxer with Cyan Halo',
    skin: 'duelist',
    color: '#00ffff',
    scale: '1.04x',
    trait: 'Agile Spacing & Flutter Ribbons',
    description: 'Cyan kickboxer with fluttering dual headband ribbons. Counters jump spam with high-velocity anti-air uppercuts.'
  },
  {
    round: 3,
    name: 'JADE GRANDMASTER',
    title: 'Emerald Acrobat & Horse Stance Monk',
    skin: 'grandmaster',
    color: '#00ff88',
    scale: '1.08x',
    trait: 'Frame-Trap Low Sweeps',
    description: 'Emerald acrobat with low horse stance, gold circlet crest, and flowing silk tail. Punishes passive blocking with guard breaks.'
  },
  {
    round: 4,
    name: 'BLOCKY STEVE',
    title: 'Voxel Wildcard Brawler',
    skin: 'steve',
    color: '#22cc88',
    scale: '1.10x',
    trait: 'Cubic Head & Heavy Voxel Punches',
    description: 'Voxel wildcard brawler with cubic head, teal shirt, indigo trousers, and block fists. High-momentum lunges.'
  },
  {
    round: 5,
    name: 'CRIMSON TITAN',
    title: 'Bare-Knuckle Heavyweight Colossus',
    skin: 'darklord',
    color: '#ee1133',
    scale: '1.25x',
    trait: 'Wide Clavicle & Guard-Crush Impact',
    description: 'Towering colossus with wide 22px clavicle span, brow ridge, and inner furnace glow. High damage knockback strikes.'
  },
  {
    round: 6,
    name: 'PLASMA ASCETIC',
    title: 'Void Halo Monk',
    skin: 'chosen',
    color: '#111111',
    scale: '1.14x',
    trait: 'Obsidian Speed & Floating Ring Halo',
    description: 'Pure obsidian speedster with cyan halo and frame-trap punches. Executes lightning-fast dodge rolls and punishes.'
  },
  {
    round: 7,
    name: 'CALAVERA PHANTOM',
    title: 'Day of the Dead Sugar Skull Warrior',
    skin: 'calavera',
    color: '#f5f5f5',
    scale: '1.18x',
    trait: 'Marigold Aura & Stitched Jawline',
    description: 'Resurrected warrior shrouded in golden marigolds and ghostly fury. Channels the spirits of fallen Flash classics.'
  },
  {
    round: 8,
    name: 'FLASH GHOST PRIME',
    title: 'Corrupted Bytecode Overlord',
    skin: 'ghost',
    color: '#ff00aa',
    scale: '1.24x',
    trait: 'ActionScript 0x7E5 Triple Teleport',
    description: 'The ancient ghost of 2021 with Error 0x7E5 time-bomb teleports. Unleashes crimson rage aura and chromatic aberration glitch trails.'
  }
];

export function initShowcase() {
  initSmoothScroll();
  initQExplorer();
  initArchetypes();
  initCopyButtons();
  initSoundboard();
  initFullscreenLauncher();
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href')?.substring(1);
      if (!targetId) return;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function initQExplorer() {
  const container = document.getElementById('q-presets-list');
  if (!container) return;

  function renderPreset(preset: QStatePreset) {
    const stateBadge = document.getElementById('q-view-state');
    const classBadge = document.getElementById('q-view-class');
    const distBadge = document.getElementById('q-view-dist');
    const moveBadge = document.getElementById('q-view-move');
    const rationaleP = document.getElementById('q-view-rationale');
    const barsContainer = document.getElementById('q-view-bars');

    if (stateBadge) stateBadge.innerText = preset.stateKey;
    if (classBadge) classBadge.innerText = preset.opponentClass;
    if (distBadge) distBadge.innerText = preset.distanceBucket;
    if (moveBadge) moveBadge.innerText = `⚔️ ${preset.recommendedMove}`;
    if (rationaleP) rationaleP.innerText = preset.rationale;

    if (barsContainer) {
      barsContainer.innerHTML = '';
      const entries = Object.entries(preset.qValues).sort((a, b) => b[1] - a[1]);
      const maxVal = Math.max(...entries.map(e => Math.abs(e[1])), 10);

      entries.forEach(([move, val]) => {
        const isBest = move === preset.recommendedMove;
        const row = document.createElement('div');
        row.className = `q-bar-row ${isBest ? 'best-move' : ''}`;

        const pct = Math.max(8, Math.min(100, (Math.max(0, val) / maxVal) * 100));
        row.innerHTML = `
          <div class="q-bar-label">
            <span class="move-name">${move}</span>
            <span class="move-val ${val >= 0 ? 'pos' : 'neg'}">${val >= 0 ? '+' : ''}${val.toFixed(1)}</span>
          </div>
          <div class="q-bar-track">
            <div class="q-bar-fill ${isBest ? 'best' : ''}" style="width: ${pct}%;"></div>
          </div>
        `;
        barsContainer.appendChild(row);
      });
    }

    // Play click sound
    sound.playJab();
  }

  // Populate preset buttons
  container.innerHTML = '';
  Q_PRESETS.forEach((preset, idx) => {
    const btn = document.createElement('button');
    btn.className = `q-preset-btn ${idx === 0 ? 'active' : ''}`;
    btn.innerHTML = `
      <span class="preset-name">${preset.label}</span>
      <span class="preset-sub">${preset.desc}</span>
    `;
    btn.addEventListener('click', () => {
      container.querySelectorAll('.q-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPreset(preset);
    });
    container.appendChild(btn);
  });

  // Initial render
  if (Q_PRESETS.length > 0) {
    renderPreset(Q_PRESETS[0]);
  }
}

function initArchetypes() {
  const grid = document.getElementById('archetypes-grid');
  if (!grid) return;

  grid.innerHTML = '';
  ARCHETYPES.forEach((arch) => {
    const card = document.createElement('div');
    card.className = 'archetype-card';
    card.innerHTML = `
      <div class="arch-round-badge">ROUND ${arch.round}</div>
      <div class="arch-avatar-circle" style="border-color: ${arch.color}; box-shadow: 0 0 15px ${arch.color}44;">
        <span class="arch-symbol" style="color: ${arch.color};">🥋</span>
      </div>
      <h3 class="arch-name" style="color: ${arch.color};">${arch.name}</h3>
      <div class="arch-title">${arch.title}</div>
      <div class="arch-stats">
        <span class="stat-pill">Scale: <strong>${arch.scale}</strong></span>
        <span class="stat-pill">Trait: <strong>${arch.trait}</strong></span>
      </div>
      <p class="arch-desc">${arch.description}</p>
    `;
    grid.appendChild(card);
  });
}

function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;
      const textToCopy = document.getElementById(targetId)?.innerText;
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const original = btn.innerHTML;
          btn.innerHTML = '✓ COPIED!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove('copied');
          }, 2000);
        });
      }
    });
  });
}

function initSoundboard() {
  document.querySelectorAll('.sound-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sndType = btn.getAttribute('data-sound');
      if (sndType === 'punch') sound.playJab();
      else if (sndType === 'heavy') sound.playHeavyHit();
      else if (sndType === 'block') sound.playBlock();
      else if (sndType === 'bypass') sound.playBypass();
      else if (sndType === 'whoosh') sound.playJump();
    });
  });
}

function initFullscreenLauncher() {
  const launchBtns = document.querySelectorAll('.trigger-fullscreen-play');
  const flashWindow = document.getElementById('flash-window');
  const btnMax = document.getElementById('btn-win-max');

  launchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (flashWindow) {
        flashWindow.classList.add('fullscreen');
        if (btnMax) {
          btnMax.innerText = '❐';
          btnMax.title = 'Restore Window';
        }
        // Scroll smoothly to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Focus the canvas
        const canvas = document.getElementById('game-canvas');
        canvas?.focus();
      }
    });
  });
}
