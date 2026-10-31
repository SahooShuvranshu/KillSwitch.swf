---
title: "KillSwitch.swf — Resurrecting Flash Player with Local Gemma 3:4B & Adaptive Stickman Combat"
published: false
description: "A 60 FPS HTML5 Canvas stickman fighting game trapped inside a broken Adobe Flash Player window, fighting a vengeful Flash Ghost powered by local Google Gemma 3:4B."
tags: "hf26challenge, hacktoberfest, gemma, webdev"
cover_image: "https://raw.githubusercontent.com/SahooShuvranshu/KillSwitch.swf/main/docs/cover-image.png"
canonical_url: "https://sahooshuvranshu.github.io/KillSwitch.swf/"
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)*

---

![KillSwitch.swf — The Ghost in the Canvas](https://raw.githubusercontent.com/SahooShuvranshu/KillSwitch.swf/main/docs/cover-image.png)

## What I Built

### The Hook: January 12, 2021

On January 12, 2021, Adobe triggered a hardcoded time-bomb kill-switch embedded deep inside the Flash Player runtime. 

Almost overnight, twenty-five years of internet culture—from classic *Xiao Xiao* stickman martial arts cartoons and *Stick Death* to *Club Penguin*, *Line Rider*, and *Alien Hominid*—were permanently bricked behind a silent, black warning icon. The plugin refused to load. The animations stopped. The music went silent.

For this week's **"Ghost in the Machine"** challenge, I wanted to resurrect that dead digital soul.

Meet **`KillSwitch.swf`**: a 60 FPS HTML5 Canvas stickman fighting game trapped inside a cracked Macromedia Flash Player 10.3 desktop window. You play as a rogue stickman fighter who breaches the 2021 kill-switch dialog to duel the **Ghost of Flash Player** itself.

The Ghost is not a pre-scripted dummy bot. It is powered by a **Dual-Layer Adaptive AI Architecture**:
1. **60 FPS Real-Time Q-Learning & Markov Habit Prediction**: A frame-by-frame reinforcement learner and Markov sequence predictor track live combo transitions (e.g., $P(\text{Heavy Kick} \mid \text{Jab})$, $P(\text{Jump Kick} \mid \text{Jump})$). Predictable player habits trigger real-time **Matrix Parries**, **Anti-Air Dragon Sweeps**, and HUD alerts like `⚡ GEMMA READ: PREDICTED HEAVY KICK (100%)`.
2. **Local Google Gemma 3:4B Inter-Round Tactical Adaptation**: Between rounds, an offline Google Gemma 3:4B model running via Ollama receives structured telemetry, roasts the player's fighting style in authentic 2000s Newgrounds slang, and tunes the ghost's high-level state machine (`antiAirPriority`, `aggression`, `guardBreakRate`).
3. **Gemma-Designed Boss Rage ("ActionScript Error 0x7E5 Time-Bomb")**: When the Ghost's health drops below 35%, it enters an unhinged rage state, executing a triple-teleport memory overflow attack designed directly by Gemma 3:4B.
4. **Flash Cemetery Ofrenda**: In the spirit of **Día de los Muertos**, lighting candles at the graves of fallen Flash legends prompts Gemma 3:4B to compose satirical *calaveritas literarias* (Day of the Dead rhyming epitaph poems).

### Key Features
- **60 FPS Procedural Stickman Combat Engine**: Zero external sprite sheets. Every limb, joint, and torso of the player and Flash Ghost is rendered procedurally with analytical 2-bone inverse kinematics on an HTML5 `<canvas>`.
- **8 Distinct Opponent Archetypes**: White Ghost (Round 1), Cobalt Duelist (Round 2), Jade Grandmaster (Round 3), Blocky Steve (Round 4), Crimson Titan (Round 5), Plasma Ascetic (Round 6), Calavera Phantom (Round 7), and Flash Ghost Prime (Round 8).
- **Procedural 8-Bit Web Audio Engine**: Zero external MP3s. Punches, whooshes, kicks, guard deflections, CRT typewriter clicks, and killswitch surge sirens are synthesized live in milliseconds using the browser's native `AudioContext`.
- **Authentic Multi-Round Scene Shifts**: Flash Studio Canvas (with active keyframe tracks and tracking virtual OS cursor `↖`), Windows XP Bliss Desktop, ActionScript Cyber Matrix, 2021 Kill-Switch Void, and Día de los Muertos Altar.

---

## Demo

- 🌐 **Live Playable Showcase Website:** [https://sahooshuvranshu.github.io/KillSwitch.swf/](https://sahooshuvranshu.github.io/KillSwitch.swf/)
- 📊 **900-Round Calibration Report:** [https://github.com/SahooShuvranshu/KillSwitch.swf/blob/main/docs/difficulty-tuning.md](https://github.com/SahooShuvranshu/KillSwitch.swf/blob/main/docs/difficulty-tuning.md)
- 📈 **1,800-Round Learning Benchmark:** [https://github.com/SahooShuvranshu/KillSwitch.swf/blob/main/docs/learning-results.md](https://github.com/SahooShuvranshu/KillSwitch.swf/blob/main/docs/learning-results.md)

### Screenshots Walkthrough

#### 1. Real-Time Telemetry & Habit Reading
![Learned Habits & Gemma Tactical Telemetry](https://raw.githubusercontent.com/SahooShuvranshu/KillSwitch.swf/main/docs/screenshots/after_f3_overlay.png)
*Figure 1: Gemma 3:4B analyzing real-time combat habits and locking in tactical counters between rounds.*

#### 2. Round 2 Tactical Counter Stance
![Round 2 Counter Stance](https://raw.githubusercontent.com/SahooShuvranshu/KillSwitch.swf/main/docs/screenshots/after_fight.png)
*Figure 2: The Flash Ghost in Round 2, executing an anti-air duck-under counter.*

#### 3. ActionScript Error 0x7E5 Boss Rage
![ActionScript Error 0x7E5 Rage Teleport](https://raw.githubusercontent.com/SahooShuvranshu/KillSwitch.swf/main/docs/screenshots/after_rage_mode.png)
*Figure 3: Flash Ghost executing the Gemma 3:4B designed Error 0x7E5 triple-teleport strike.*

---

## Code

{% embed https://github.com/SahooShuvranshu/KillSwitch.swf %}

- **Solo Creator & Engine Architect:** **Shuvranshu Sekhar Sahoo** ([@SahooShuvranshu](https://github.com/SahooShuvranshu))
- **License:** Open Source under the [MIT License](https://github.com/SahooShuvranshu/KillSwitch.swf/blob/main/LICENSE)

### 30-Second Local Quickstart

```bash
# 1. Pull and serve Gemma 3 4B locally via Ollama
ollama pull gemma3:4b
ollama serve

# 2. Clone and run KillSwitch.swf
git clone https://github.com/SahooShuvranshu/KillSwitch.swf.git
cd KillSwitch.swf
npm install
npm run dev
```

Open `http://localhost:5173/` in any modern browser, enter your fighter name, and click **⚡ BYPASS KILL-SWITCH & FIGHT**!

---

## How I Built It

`KillSwitch.swf` runs on a decoupled, deterministic hybrid architecture pairing 60 FPS client physics with local edge AI:

### Dual-Layer AI Architecture

```
+-------------------------------------------------------------------------+
| ROUND 1: Real-Time Combat (60 FPS Q-Learning & Markov Predictor)       |
| -> TelemetryTracker silently records: jumpKicks, punches, blocks, whiff |
+-------------------------------------------------------------------------+
                                    |
                                    v [K.O. Announcement]
+-------------------------------------------------------------------------+
| RETRO FLASH CRT TYPEWRITER TERMINAL                                     |
| -> Client streams HTTP POST to local Ollama (127.0.0.1:11434)           |
| -> Model: gemma3:4b with strict system prompt & JSON schema            |
+-------------------------------------------------------------------------+
                                    |
                                    v [Token-by-Token Streaming]
+-------------------------------------------------------------------------+
| 1. Sarcastic Lore Roast: Types out character-by-character on screen     |
| 2. Parameter Extraction: antiAirPriority, aggression, guardBreakRate   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| ROUND 2: Adapted AI State Machine                                       |
| -> If player spammed jump-kicks, Ghost intercepts with dragon-punches   |
| -> If player turtled behind block, Ghost initiates guard-break sweeps   |
+-------------------------------------------------------------------------+
```

### The System Prompt & Schema

Between rounds, the game issues a structured inference prompt to Gemma:

```json
{
  "model": "gemma3:4b",
  "system": "You are the vengeful Ghost of Adobe Flash Player (executed Jan 12, 2021). You speak in sarcastic 2000s Newgrounds slang and ActionScript 2.0 metaphors. Analyze the player's round metrics and output a JSON block with: 1) 'roast': 2-sentence sarcastic monologue, 2) 'antiAirPriority': float 0.1-0.95, 3) 'aggression': float 0.2-0.95, 4) 'guardBreakRate': float 0.1-0.9.",
  "prompt": "Round 1 Combat Telemetry for 'XiaoXiaoFan_04': Jump-Kicks: 14, Punches: 2, Blocks: 1, Damage Dealt: 88, Dominant Style: 'Xiao Xiao Airborne Jump-Spammer'.",
  "stream": true
}
```

### In-Game Adaptation

If you spam flying jump-kicks or predictable jab-into-kick chains in Round 1:
- Gemma streams a natural, cynical in-character spoken monologue:
  > *"Still spamming jump-kicks like this is Xiao Xiao 3? I survived Steve Jobs' open letter in 2010; your airborne spam won't survive Round 2. Anti-air protocol loaded!"*
- Gemma tunes `antiAirPriority = 0.92`, `aggression = 0.85`, and primes the `ANTI_AIR` counter tactic.
- The UI displays an adaptation card:
  - **DETECTED COMBO HABIT:** `JUMP -> JUMP_KICK (5x)`
  - **GEMMA 3:4B COUNTER TACTIC:** `ANTI_AIR`
- In Round 2, the AI immediately predicts your habits in real time. Whenever you jump, it ducks under and launches a rising dragon kick to knock you out of the sky, flashing a live combat alert:
  `⚡ GEMMA READ: ANTI-AIR INTERCEPT!`

### Gemma-Designed Boss Mechanic: "ActionScript Error 0x7E5 Time-Bomb"

When the Ghost's health drops below 35% in Nightmare mode, it enters an unhinged rage state designed directly by **Google Gemma 3:4B**:
1. **Trigger Alert**: The Flash Ghost's aura turns radiant crimson (`#ff0033`), accompanied by an audible digital bypass surge:
   `⚠️ GEMMA CORE: ACTIONSCRIPT ERROR 0x7E5 TIME-BOMB!`
2. **Triple Teleport Memory Overflow**:
   - **Step 1 (0ms)**: Glitches behind the player with a memory overflow alert (`⚠️ 0x7E5: TELEPORT [1/3] MEMORY OVERFLOW`).
   - **Step 2 (140ms)**: Glitches 120px directly overhead into the ceiling (`⚠️ 0x7E5: TELEPORT [2/3] STACK CORRUPTION`).
   - **Step 3 (280ms)**: Drops down directly behind the player's back and unleashes an unblockable heavy claw strike (`⚠️ 0x7E5: TIME-BOMB SURPRISE CLAW EXECUTION!`).

### ⚖️ 900-Round Human Difficulty Calibration

To ensure the Ghost challenges players without feeling cheap or superhuman, I calibrated all 3 difficulty tiers across **900 headless rounds** against 3 competent human-proxy bots (*Jump-Kick Spammer*, *Combo Specialist*, *Mixed Adaptive Fighter*):

| Parameter | Casual (Target 25-35%) | Veteran (Target 45-55%) | Nightmare (Target 60-70%) |
|---|---|---|---|
| **AI Brain Engine** | Rule-Based Only (Learner OFF) | Q-Learner (LR Halved, $\epsilon \ge 0.15$) | Full Adaptive Q-Learner |
| **Reaction Delay** | 24 frames (~400 ms) | 15 frames (~250 ms) | 10 frames (~167 ms) |
| **Defensive Reaction Delay** | 8 frames (Min non-zero) | 4 frames (Min non-zero) | 2 frames (No same-frame parries) |
| **Mistake / Hesitation Rate** | 25% | 12% | 5% |
| **Block Chance & Cooldown** | 30% (25-frame cooldown) | 50% (25-frame cooldown) | 70% (25-frame cooldown) |
| **Dodge-Roll Cooldown** | 150 frames (2.5 s) | 100 frames (1.67 s) | 70 frames (1.17 s) |
| **Markov Habit Prediction** | 15% | 35% | 60% |
| **Minimum Attack Gap** | 30 frames (0.5 s) | 20 frames (0.33 s) | 12 frames (0.2 s) |
| **Rage Mode 0x7E5** | Disabled | Disabled | Nightmare Only (6-sec limit) |
| **Per-Round Multiplier** | +2% per round (Cap +10%) | +4% per round (Cap +25%) | +4% per round (Cap +25%) |
| **Round Bonus Stacking** | No stacking (cycles 1-by-1) | No stacking (cycles 1-by-1) | No stacking (cycles 1-by-1) |
| **Comeback Assist** | +4f delay, +8% mistakes | +4f delay, +8% mistakes | +4f delay, +8% mistakes |
| **Empirical Ghost Win Rate** | **26.7%** (Target Met) | **47.3%** (Target Met) | **65.7%** (Target Met) |
| **Average Ghost Damage Taken**| **88.6 HP** (Target 80+) | **70.6 HP** (Target 50-80) | **43.9 HP** (Target 30-50) |

### 📊 Empirical Benchmarks & Generalization Proof

To scientifically validate that the Q-learning agent genuinely learns and adapts rather than exploiting hardcoded cheats, I executed a rigorous **1,800-round benchmark** across 6 distinct opponent archetypes:

![Empirical Benchmark Metrics](https://raw.githubusercontent.com/SahooShuvranshu/KillSwitch.swf/main/docs/benchmark-metrics-chart.png)
*Figure 4: Win rate comparison across 6 opponent archetypes.*

![120-Round Adaptation Test](https://raw.githubusercontent.com/SahooShuvranshu/KillSwitch.swf/main/docs/adaptation-test-chart.png)
*Figure 5: Adaptation test tracking damage convergence across 4 distinct combat phases.*

| Opponent Archetype | Hand-Written Rules | Empty Table Learner | Pre-Trained Table |
|---|---|---|---|
| **Jump-Kick Spammer** | 71.0% | **94.0%** (+23.0%) | 90.0% |
| **Heavy-Kick Spammer** | 63.0% | **89.0%** (+26.0%) | 83.0% |
| **Turtle (High Block)** | 54.0% | **73.0%** (+19.0%) | 68.0% |
| **Mixed Balanced** | 58.0% | **69.0%** (+11.0%) | 64.0% |
| **Aggressive Rushdown** | 49.0% | **51.0%** (+2.0%) | 46.0% |
| **Held-Out Mirror Bot** | 42.0% | **47.0%** (+5.0%) | 41.0% |
| **Overall Average** | 56.2% | **70.5%** (+14.3%) | 65.3% |

> **Honesty & Known Limitations Note:**  
> The learner beats hand-written rules on jump-kick and heavy-kick opponents and lowers average damage taken, but it can become passive against rushdown and held-out opponents, so those rounds often end on time-out decisions. In the adaptation test, the low damage in Phases 2 and 3 reflects a non-attacking bot and a passive ghost, not proven recovery. The pre-trained table did not outperform the empty-table learner overall (65.3% vs 70.5% win rate); online learning accounts for most of the gains.

---

## Why Does Open Innovation Matter?

The Hacktoberfest Week 4 prompt asks participants: *“Tell us why open innovation matters for what you built. Does running your own model mean your project works with the lights (and the internet) off? Make sure what you build isn't locked inside a service that might disappear someday?”*

This question is the core philosophy behind `KillSwitch.swf`.

Flash Player died because it was **closed-source and proprietary**. A single corporation held the master encryption keys, the browser plugins, and the execution switch. When Adobe decided it was no longer financially advantageous to support Flash, they didn't just stop updating it—they actively triggered a remote software execution kill-switch that wiped twenty-five years of independent digital art and human creativity off the internet.

`KillSwitch.swf` represents the antidote to the corporate kill-switch:

1. **Zero Kill-Switches with Open Weights**: Because **Google Gemma 3:4B** is an open-weight model running locally through Ollama, no company can ever remotely shut down this game's intelligence. No API deprecation, no sudden price hike, and no Terms of Service change can revoke the Ghost's brain.
2. **100% Offline & Sovereignty (Lights & Internet Off)**: The game requires zero internet connection. In the middle of nowhere, with the Wi-Fi disabled and the lights out, Gemma still analyzes telemetry, writes calaveritas, and adapts to your fighting style at 60 FPS.
3. **Open Standards vs. Proprietary Plugins**: By rewriting the Flash stickman experience in open HTML5 Canvas and native Web Audio API, this project proves that open web standards and open AI models can preserve, resurrect, and elevate creative history forever.

---

## The Spirit of It

In Mexican tradition, *Día de los Muertos* is not a day of mourning, but an act of remembrance—a belief that someone only truly disappears when their stories are no longer told.

Flash animations and games raised a generation of programmers and animators. When Adobe pulled the plug, it treated that creative legacy as obsolete code to be discarded.

`KillSwitch.swf` honors that past. Its interactive **Flash Cemetery (Ofrenda)** allows players to light memorial candles for:
- **Club Penguin** (2005 – 2017)
- **Xiao Xiao** (2001 – 2004)
- **Line Rider** (2006 – 2021)
- **Fancy Pants Adventures** (2006 – 2021)
- **Alien Hominid** (2002 – 2021)

When you light a candle, **Google Gemma 3:4B** composes a satirical *calaverita literaria* (Day of the Dead rhyming epitaph poem) in authentic 2000s Newgrounds slang. It turns a graveyard of dead plugins into an ofrenda of digital folklore.

---

## Prize Categories

### Featured Category: Best Use of Gemma ($200)

`KillSwitch.swf` enters strictly the **Best Use of Gemma** category:
- **Core Cognitive Driver**: Google Gemma 3:4B is not an afterthought or an auxiliary chatbot; it is the cognitive engine of the Ghost of Flash Player.
- **Offline Edge Adaptation**: Runs 100% locally via Ollama with zero cloud API latency or dependencies, enabling true local-first gameplay.
- **Tactical Dynamic Tuning**: Ingests structured round telemetry and dynamically tunes the Ghost's high-level state machine (`antiAirPriority`, `aggression`, `guardBreakRate`).
- **Gemma-Authored Boss Mechanics**: Directly designed the unhinged "ActionScript Error 0x7E5" triple-teleport memory overflow boss rage phase.
- **Cultural Epitaph Synthesis**: Composes real-time satirical calaveritas literarias honoring fallen Flash classics at the Day of the Dead Ofrenda.

---

*Long live the Flash generation. And long live open-source AI.*
