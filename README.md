# ⚡ KillSwitch.swf — Resurrecting Flash Player with Local Gemma 3:4B & Adaptive Q-Learning Stickman Combat

> **DEV x MLH Hacktoberfest 2026 Week 4 Challenge Submission: "Ghost in the Machine" (`#hf26challenge`)**  
> **Categories Targeted:** Best Use of Gemma ($200 USD) • Overall Grand Prize ($250 USD)  
> **Built by:** Shuvranshu Sekhar Sahoo ([@sahooshuvranshu](https://dev.to/sahooshuvranshu))

---

## 💀 The Story: January 12, 2021

On January 12, 2021, Adobe activated a hardcoded time-bomb kill-switch inside the Flash Player runtime. Overnight, billions of interactive web experiences—from classic *Xiao Xiao* stickman martial arts animations to *Club Penguin* and *Line Rider*—were permanently bricked behind a silent, black warning icon.

**`KillSwitch.swf`** is a 60 FPS HTML5 Canvas resurrection game. You play as a martial arts stickman who breaches the 2021 kill-switch dialog to fight the **Ghost of Flash Player** inside a restored Macromedia Flash Player 10.3 desktop window. 

The Ghost is not a hardcoded script. It combines a **high-speed Q-learning reinforcement engine** with **Google Gemma 3:4B** running locally via Ollama. It observes your combat habits in Round 1, roasts your playstyle with authentic 2000s Newgrounds lore, and dynamically tunes its combat weights and Q-value exploration to intercept your favorite combos in Round 2.

---

## 🎮 Dual-Layer AI Architecture: Q-Learning + Gemma 3:4B

```
+-----------------------------------------------------------------------------------+
| LAYER 1: 60 FPS REAL-TIME COMBAT (Q-Learning Reinforcement Engine)               |
| - State Key: Bucket (close <75, mid 75-155, far) + Class (air/block/attack/idle)  |
| - 10 Atomic Behaviors: EVADE, ANTI_AIR, WHIFF_PUNISH, GUARD_BREAK, PUNCH_CHAIN,   |
|   KICK_CHAIN, UPPERCUT, FLYING_KNEE, JUMP_IN, RETREAT                             |
| - Epsilon-Greedy Exploration: 0.20 decaying by -0.02/round down to 0.05 baseline  |
| - Pre-trained on 1,500 simulated rounds across 5 bot styles (< 200 KB JSON)       |
+-----------------------------------------------------------------------------------+
                                          |
                                          v (Round Over / K.O.)
+-----------------------------------------------------------------------------------+
| LAYER 2: INTER-ROUND STRATEGIC ADAPTATION (Local Google Gemma 3:4B)              |
| - Full telemetry analysis: aerial ratio, turtle ratio, Markov move bigrams        |
| - Streaming CRT terminal roast monologue (spoken character-by-character)         |
| - Tuning tactical parameters: antiAirPriority, aggression, guardBreakRate         |
| - Signature Boss Mechanic: ActionScript 0x7E5 Time-Bomb Triple Teleport (<35% HP)|
+-----------------------------------------------------------------------------------+
```

---

## 🎨 Vector Visual Overhaul & 2.5D Arena Scenery

`KillSwitch.swf` features an authentic, 100% original vector canvas visual engine designed from the ground up to capture the energy of classic Macromedia Flash animation while delivering modern game feel:

1. **Analytical 2-Bone Inverse Kinematics (`solveJoint`):**
   - Eliminates limb popping, unnatural flipping, and straight-leg locking with closed-form cosine-law bone solvers.
   - Proportions tuned to classic martial arts aesthetics: $1/7\text{th}$ head ratio ($r = 7.0$), elongated torso, tapered limb strokes (torso $5.0$, upper leg $4.5$, lower leg $4.0$), and dynamic martial arts knee flexion.
   - Attack motion trails: Dynamic crescent arcs for Heavy Kicks, skyward helices for Uppercuts, leaping wedges for Flying Knees, and expanding shockwaves for Palm Bursts.

2. **8 Distinct Opponent Visual Archetypes:**
   - **White Ghost (Round 1):** Classic high-contrast Flash silhouette with dual black knuckle wraps and dark sash.
   - **Cobalt Duelist (Round 2):** Cyan kickboxer with fluttering dual headband ribbons.
   - **Jade Grandmaster (Round 3):** Emerald acrobat with low horse stance, gold circlet crest, and flowing silk tail.
   - **Blocky Steve (Round 4):** Voxel wildcard brawler with cubic head, teal shirt, indigo trousers, and block fists.
   - **Crimson Titan (Round 5):** Towering $1.25\times$ scale colossus with wide 22px clavicle span, brow ridge, and inner furnace glow.
   - **Plasma Ascetic (Round 6):** Void monk with hollow ring head, floating cyan halo, and inner core pupil.
   - **Calavera Phantom (Round 7):** Day of the Dead warrior with sugar skull face paint, marigold aura, and stitched jawline.
   - **Flash Ghost Prime (Round 8):** Corrupted bytecode overlord with digital error horns and cyan/magenta chromatic aberration glitch trails.

3. **Asymmetric Jump Physics & Platformer Game Feel:**
   - **Floaty Rise ($g = 0.40$) vs. Snappy Fall ($g = 0.68$):** Jump launch velocity $v_0 = -10.4$, reaching a peak apex of $\approx 130$ px across $25$ frames with swift, responsive descent.
   - **6-Frame Input Buffer:** Jump inputs pressed just before touching ground immediately execute on landing.
   - **6-Frame Coyote Time:** Walking off platform ledges provides a grace window to jump mid-air.
   - **Corner Correction:** Brushing past ledge corners automatically applies a 4px horizontal nudge onto the platform top.
   - **Audio & FX:** Resonant $140\text{Hz} \to 480\text{Hz}$ procedural triangle swoosh with takeoff/landing dust particles.

4. **3-Layer Parallax Arenas & 3D Interactive Obstacles:**
   - **Offscreen Cached Parallax:** Far Layer ($0.15\times$ speed), Mid Layer ($0.40\times$ speed), and Near Floor Layer ($1:1$) pre-rendered to separate offscreen canvases for silky 60 FPS performance.
   - **Zero Blank Margins:** Extended 2,400px wide background canvases and clamped camera bounds guarantee zero exposed borders even at maximum $0.75\times$ zoom-out.
   - **Physical Boundary Pillars:** Flanking boundary pillars with animated energy coils that flash bright shockwaves when fighters are wall-splatted.
   - **3D Isometric Destructible Obstacles:** Crates render top and side isometric bevels, floor drop shadows, and damage-scaled fracture splinters as HP drops. Ghost AI automatically leaps over or smashes blocking crates.

---

| Action | Primary Keys | Alternate Keys | Technical Frame Details |
| :--- | :--- | :--- | :--- |
| **Move Left / Right** | `A` / `D` | `Left` / `Right` Arrow | Responsive vector ground movement |
| **Jump** | `W` | `Up` Arrow | Airborne vertical launch (gravitational arc) |
| **Drop Through Platform** | `S + W` | `Down + Up` Arrow | Dropping through semitransparent obstacle ledges |
| **Crouch / Duck** | `S` | `Down` Arrow | Low profile ducking under high jabs |
| **Light Punch Chain** | `J` | `Z` | 3-hit combo: Jab -> Cross Punch -> Palm Burst |
| **Heavy Roundhouse Kick** | `K` | `X` | High-damage sweep with axe kick finisher |
| **Xiao Xiao Jump-Kick** | Airborne + `K` | Airborne + `X` | High-momentum diving aerial drop-kick |
| **Crouching Low Sweep** | `S + K` | `Down + X` | Fast low shin sweep tripping blocking foes |
| **Rising Uppercut** | `U` | — | Anti-air launcher hitting airborne attackers |
| **Flying Clinch Knee** | `I` | — | Mid-range leaping strike with armor frames |
| **Evasive Dodge Roll** | `Space` | — | Ground roll with full invulnerability frames (I-frames) |
| **Defensive Shield Block** | `L` (Hold) | `C` (Hold) | Guard stance (absorbs hits; parries timed attacks) |
| **F3 Debug Overlay** | `F3` | — | Live HUD: State Key, Behavior, Epsilon, Reward, AI Cost |

---

## 📊 Q-Learner Combat Benchmark Proof

The Q-learning agent was benchmarked across **30 rounds vs the Jump-Kick Spammer** across 3 modes:
1. **Mode 1: Rule-Based (Learner OFF)**: Static heuristic rules.
2. **Mode 2: Learner ON (Empty Start)**: Tabula rasa Q-learning discovering anti-air counters.
3. **Mode 3: Learner ON (Pre-Trained Weights)**: Pre-loaded with converged weights from 1,500 training bouts.

![Q-Learner Benchmark Comparison](verification/benchmark-chart.png)

### 5-Round Block Progression Matrix

| Block | Rounds | Mode 1: Rule-Based (Win% / Avg R) | Mode 2: Empty Q-Table (Win% / Avg R) | Mode 3: Pre-Trained Q (Win% / Avg R) |
|:-----:|:------:|:---------------------------------:|:-----------------------------------:|:------------------------------------:|
| **Block 1** | R1-R5 | 100% (+23.46) | 100% (+23.88) | **100%** (**+23.90**) |
| **Block 2** | R6-R10 | 100% (+23.10) | 100% (+23.22) | **100%** (**+23.64**) |
| **Block 3** | R11-R15 | 100% (+22.24) | 100% (+23.90) | **100%** (**+24.50**) |
| **Block 4** | R16-R20 | 100% (+23.88) | 100% (+24.66) | **100%** (**+23.88**) |
| **Block 5** | R21-R25 | 100% (+23.46) | 100% (+24.90) | **100%** (**+23.30**) |
| **Block 6** | R26-R30 | 100% (+22.94) | 100% (+24.34) | **100%** (**+24.50**) |
| **TOTAL** | **R1-R30** | **100%** (+23.18) | **100%** (+24.15) | **100%** (**+23.95**) |

---

## 🛠️ Quickstart (Running Locally)

### 1. Prerequisites
- **Node.js** (v18+)
- **Ollama** installed with `gemma3:4b`:
  ```bash
  ollama run gemma3:4b
  ```

### 2. Launch the Game
```bash
# Clone the repository
git clone https://github.com/SahooShuvranshu/KillSwitch.swf.git
cd KillSwitch.swf

# Install dependencies (cached on Drive D:)
npm install

# Start Vite dev server
npm run dev
```

Open `http://127.0.0.1:5173/` in any modern browser and click **⚡ BYPASS KILL-SWITCH & FIGHT**!

### 3. Developer & Training Modes
- **Headless Training Mode**: Visit `http://127.0.0.1:5173/?train=1` to simulate 1,500 rounds against 5 bot archetypes at warp speed with Gemma stubbed.
- **Round Testing Hook**: Visit `http://127.0.0.1:5173/?round=N` to jump directly into combat at round `N`.

---

## 🕯️ Why Open Innovation Matters (The Hacktoberfest Prompt)

When Adobe shut down Flash Player in 2021, twenty-five years of digital art, browser gaming history, and indie creator culture were extinguished with a single proprietary kill-switch. It demonstrated the existential danger of building digital culture on closed, proprietary foundations.

`KillSwitch.swf` proves why **open-weight models like Google Gemma 3:4B** and the open web matter:
1. **Zero Kill-Switches**: Running open weights locally via Ollama means no corporate entity can revoke your license, shut down your endpoint, or brick your game.
2. **100% Offline & Private**: Telemetry and player combat habits never leave your local machine; inference runs at 60 FPS offline with zero cloud telemetry.
3. **Eternal Preservation**: Just as open web standards (HTML5 Canvas + Web Audio API) allow us to preserve the aesthetic of Flash without proprietary plugins, open-source AI ensures that intelligent characters and procedural worlds belong to developers forever.

---

## 📜 License
MIT License • Created for DEV x MLH Hacktoberfest 2026.
