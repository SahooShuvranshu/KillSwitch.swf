---
title: "Adobe killed Flash in 2021. So I trapped its vengeful ghost in a 60 FPS Canvas fighter powered by local Gemma 3:4B."
published: false
description: "A 60 FPS HTML5 Canvas stickman fighting game trapped inside a broken Adobe Flash Player window, fighting a vengeful Flash Ghost powered by local Google Gemma 3:4B."
tags: "hf26challenge, hacktoberfest, gemma, webdev"
cover_image: "https://raw.githubusercontent.com/SahooShuvranshu/KillSwitch.swf/main/docs/cover-image.png"
canonical_url: "https://sahooshuvranshu.github.io/KillSwitch.swf/"
---

*This is a submission for the [**Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine**](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)*

---

![KillSwitch.swf — The Ghost in the Canvas](https://raw.githubusercontent.com/SahooShuvranshu/KillSwitch.swf/main/docs/cover-image.png)

## What I Built

On **January 12, 2021**, Adobe triggered a hardcoded time-bomb kill-switch embedded deep inside the Flash Player runtime. 

Almost overnight, twenty-five years of independent digital culture—from classic *Xiao Xiao* stickman martial arts cartoons and *Stick Death* to *Club Penguin*, *Line Rider*, *Fancy Pants Adventures*, and *Alien Hominid*—were permanently bricked behind a silent, black warning icon. The plugin refused to execute. The animations stopped. The music went silent.

Flash was closed-source, proprietary abandonware. When corporate priorities shifted, an entire era of human creativity was wiped from the live web with a single execution switch.

**What if the dead soul of Flash Player refused to leave?** 👻

**Meet `KillSwitch.swf`**: a 60 FPS HTML5 Canvas stickman fighting game trapped inside a cracked Macromedia Flash Player 10.3 desktop window. You play as a rogue stickman fighter who breaches the 2021 Adobe kill-switch error dialog to face the **Ghost of Flash Player** itself.

The Ghost is not a pre-scripted bot running cheap `if/else` checks. It is driven by a **Dual-Layer Edge AI Brain**:
1. **Layer 1: Real-Time 60 FPS Q-Learning & Markov Habit Predictor**: A sub-millisecond reinforcement learner and bigram sequence tracker running directly on the client canvas. It continuously tracks your frame data, strike rhythms, and combo tendencies (e.g., $P(\text{Heavy Kick} \mid \text{Jab})$, $P(\text{Jump Kick} \mid \text{Jump})$) to unleash real-time **Matrix Parries**, duck-under dragon sweeps, and live HUD alerts like `⚡ GEMMA READ: PREDICTED HEAVY KICK (100%)`.
2. **Layer 2: Local Google Gemma 3:4B Inter-Round Tactical Cognition**: Between rounds, an offline **Google Gemma 3:4B** model running locally via Ollama ingests structured combat telemetry, roasts your fighting habits in authentic 2000s Newgrounds slang on a retro CRT typewriter terminal, dynamically tunes the Ghost's AI state machine (`antiAirPriority`, `aggression`, `guardBreakRate`), and unleashes an unhinged, Gemma-designed **ActionScript Error 0x7E5** boss rage mechanic.

### How I Interpreted the Theme: Ghost in the Machine & Día de los Muertos

The Week 4 challenge brings together **Halloween (Ghost in the Machine)** and **Día de los Muertos (Honoring the Past)**. I interpreted both literally and culturally:

* 🎃 **The Ghost in the Machine:** The software runtime that died on Jan 12, 2021 is the literal ghost possessing your browser canvas. It fights with the glitching fury of a deprecated plugin, wielding CRT scanlines, ActionScript bytecode leaks, and memory overflow attacks against the modern browser.
* 🕯️ **Día de los Muertos (The Digital Ofrenda):** In Mexican tradition, the dead never truly disappear as long as the living remember them. `KillSwitch.swf` features an interactive **Flash Cemetery (Ofrenda)** glowing with marigold petals and memorial candles honoring fallen Flash classics (*Club Penguin*, *Xiao Xiao*, *Line Rider*, *Alien Hominid*). When you light a candle, **Google Gemma 3:4B** composes real-time satirical *calaveritas literarias* (Day of the Dead rhyming epitaph poems) in nostalgic 2000s web slang.

### Key Architectural Highlights
* **Zero External Sprites (Procedural IK Skeleton):** Every limb, joint, and torso of the player and Flash Ghost is rendered procedurally with analytical 2-bone inverse kinematics on an HTML5 `<canvas>`.
* **Zero External Audio Files (Web Audio Synth):** Every jab whoosh, bone-crunch kick, metallic guard ping, retro CRT typewriter click, and killswitch bypass surge is synthesized live in milliseconds using the browser's native `AudioContext`.
* **8 Distinct Fighter Archetypes across 8 Rounds:** White Ghost, Cobalt Duelist, Jade Grandmaster, Blocky Steve, Crimson Titan (128% stature brawler), Plasma Ascetic (hollow-ring head), Calavera Phantom, and Flash Ghost Prime.
* **5 Rotating Retro Scenes:** Brawling shifts every round across authentic Flash history:
  1. *Flash Studio Canvas* (featuring the top Timeline ruler, keyframe tracks, red scrubbing playhead, Tools palette, and a **giant floating virtual mouse cursor `↖`** tracking the fighters!).
  2. *Windows XP Bliss Desktop* (rolling green hills, azure sky, retro desktop icons, blue taskbar floor).
  3. *ActionScript Cyber Matrix* (raining bytecode streams).
  4. *2021 Kill-Switch Void* (black obsidian abyss with the cracked puzzle icon).
  5. *Día de los Muertos Altar* (marigolds, glowing candles, and ofrenda offerings).

---

## Demo

- 🌐 **Live Playable Showcase Website:** [https://sahooshuvranshu.github.io/KillSwitch.swf/](https://sahooshuvranshu.github.io/KillSwitch.swf/)
- 📊 **900-Round Calibration Report:** [docs/difficulty-tuning.md](https://github.com/SahooShuvranshu/KillSwitch.swf/blob/main/docs/difficulty-tuning.md)
- 📈 **1,800-Round Learning Benchmark:** [docs/learning-results.md](https://github.com/SahooShuvranshu/KillSwitch.swf/blob/main/docs/learning-results.md)

### Walkthrough & Screenshots

#### 1. Real-Time Telemetry & Habit Reading (F3 Overlay)
![Learned Habits & Gemma Tactical Telemetry](https://raw.githubusercontent.com/SahooShuvranshu/KillSwitch.swf/main/docs/screenshots/after_f3_overlay.png)
*Figure 1: Pressing F3 toggles the live telemetry inspector. Gemma 3:4B analyzes player combo habits, Markov transition probabilities, and locks in anti-air counters between rounds.*

#### 2. Round 2 Tactical Counter Stance
![Round 2 Counter Stance](https://raw.githubusercontent.com/SahooShuvranshu/KillSwitch.swf/main/docs/screenshots/after_fight.png)
*Figure 2: The Flash Ghost in Round 2, executing an anti-air duck-under counter after reading predictable airborne spam.*

#### 3. ActionScript Error 0x7E5 Boss Rage
![ActionScript Error 0x7E5 Rage Teleport](https://raw.githubusercontent.com/SahooShuvranshu/KillSwitch.swf/main/docs/screenshots/after_rage_mode.png)
*Figure 3: Flash Ghost executing the Gemma 3:4B designed Error 0x7E5 triple-teleport memory overflow attack.*

---

## Code

{% embed https://github.com/SahooShuvranshu/KillSwitch.swf %}

* **Author & Engine Architect:** **Shuvranshu Sekhar Sahoo** ([@SahooShuvranshu](https://github.com/SahooShuvranshu))
* **License:** Open Source under the [MIT License](https://github.com/SahooShuvranshu/KillSwitch.swf/blob/main/LICENSE)
* **Tech Stack:** TypeScript · HTML5 Canvas (2D IK) · Web Audio API · Vite · Local Google Gemma 3:4B via Ollama · Tabular Q-Learning

### 30-Second Local Quickstart

```bash
# 1. Pull and serve Gemma 3 4B locally via Ollama (GPU Vulkan / CPU)
ollama pull gemma3:4b
ollama serve

# 2. Clone and run KillSwitch.swf
git clone https://github.com/SahooShuvranshu/KillSwitch.swf.git
cd KillSwitch.swf
npm install
npm run dev
```

Visit `http://localhost:5173/` in any browser, enter your fighter handle, and click **⚡ BYPASS KILL-SWITCH & FIGHT**!

---

## How I Built It

Building a 60 FPS fighting game that interfaces with a large language model presents a fundamental architectural tension: **fighting games require sub-16.6ms deterministic frame loops, while LLM inference operates on hundreds of milliseconds.**

If you tie LLM generation to the combat loop, the game hitches, frames drop, and input lag destroys gameplay. 

`KillSwitch.swf` solves this with a **Decoupled Asynchronous Dual-Layer Architecture**:

```
+-------------------------------------------------------------------------+
| LAYER 1: 60 FPS Real-Time Combat Engine (Client HTML5 Canvas)           |
| -> Player inputs (WASD + JKUI / Space) -> 2-Bone Inverse Kinematics     |
| -> TelemetryTracker records: jump-kicks, punches, blocks, whiffs, gaps  |
| -> Markov Bigram Engine predicts: P(Next Action | Previous Action)      |
| -> Tabular Q-Learning (Bellman Eq): Selects atomic counters in < 0.1 ms |
+-------------------------------------------------------------------------+
                                    |
                                    v [K.O. Announcement]
+-------------------------------------------------------------------------+
| LAYER 2: Inter-Round Tactical Cognition (Local Google Gemma 3:4B)       |
| -> Client posts structured JSON telemetry to local Ollama (port 11434)  |
| -> Model: gemma3:4b with strict system prompt & JSON schema             |
+-------------------------------------------------------------------------+
                                    |
                                    v [Token-by-Token Streaming]
+-------------------------------------------------------------------------+
| 1. Sarcastic Lore Roast: Types out character-by-character on CRT screen |
| 2. Parameter Extraction: antiAirPriority, aggression, guardBreakRate    |
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

### What Gemma Got Wrong, and How I Fixed It

Deploying a 4B open model in an interactive game taught me lessons you never encounter in static benchmarks:

#### 1. The "JSON-Bleed" Problem on the CRT Terminal
Early prompts asked Gemma to generate both the spoken roast monologue and the JSON tuning object in one completion. Gemma would often wrap the JSON in Markdown code fences (` ```json ... ``` `) or output conversational chatter before the brackets. This caused raw JSON keys like `{"antiAirPriority": 0.92}` to leak directly onto the typewriter CRT screen, breaking player immersion.
* **The Fix:** I engineered a **dual-pass streaming parser**. The streaming receiver displays only the clean string tokens of the monologue to the typewriter display. When the generation finishes, a regex boundary harvester extracts the `{...}` payload, validates keys against fallback clamps (0.1–0.95), and passes them to the AI controller.

#### 2. The Inhuman God-Bot Problem (Why 95% Win Rates Feel Terrible)
In early iterations, when Gemma tuned `antiAirPriority = 0.95`, the Ghost became an inhuman god. The instant the player pressed Jump, the AI read the input on frame 1, ducked under, and executed a frame-perfect dragon punch. The AI won 95% of bouts, but playtesters hated it—it felt like a cheap input-reading cheat rather than an intelligent adversary.
* **The Fix:** I enforced **strict human cognitive reaction limits** into the state machine:
  * **Reaction Delay:** 24 frames (~400 ms) in Casual, 15 frames (~250 ms) in Veteran, and 10 frames (~167 ms) in Nightmare.
  * **Non-Zero Defensive Delay:** Minimum non-zero frames forbidding same-frame parries.
  * **Cooldowns:** 25-frame block cooldown and 70–150 frame dodge-roll cooldowns.
  * **Mistake / Hesitation Probability:** 5% to 25% chance of misreading or hesitating.
  * Calibrated across **900 headless simulation rounds** against human-proxy bots until win rates landed precisely on human-calibrated targets.

#### 3. Gemma-Designed Boss Mechanic: "ActionScript Error 0x7E5 Time-Bomb"
When designing the low-health boss phase, I prompted Gemma 3:4B to invent an unhinged combat attack inspired by 2000s Flash crashes. Gemma generated the concept of an **ActionScript Error 0x7E5 Memory Overflow**:
1. When HP falls below 35% in Nightmare mode, the Ghost's aura surges radiant crimson (`#ff0033`).
2. It executes a triple-teleport glitch sequence:
   * **Step 1 (0ms):** Teleports behind the player (`⚠️ 0x7E5: TELEPORT [1/3] MEMORY OVERFLOW`).
   * **Step 2 (140ms):** Glitches 120px into the ceiling rafters (`⚠️ 0x7E5: TELEPORT [2/3] STACK CORRUPTION`).
   * **Step 3 (280ms):** Drops down behind the player's back for an unblockable claw execution (`⚠️ 0x7E5: TIME-BOMB SURPRISE CLAW EXECUTION!`).

---

### ⚖️ 900-Round Human Difficulty Calibration Matrix

To scientifically guarantee that the game feels challenging rather than unfair, I calibrated all 3 difficulty tiers across **900 headless rounds** against 3 competent human-proxy bots (*Jump-Kick Spammer*, *Combo Specialist*, *Mixed Adaptive Fighter*):

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

---

### 📊 Empirical Benchmarks & Generalization Proof

To validate that the adaptive agent genuinely generalizes rather than overfitting to familiar loops, I conducted a **1,800-round benchmark** across 6 distinct opponent archetypes (including a held-out `MIRROR_COUNTER` bot never seen during training):

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
> The learner decisively beats hand-written rules on jump-kick and heavy-kick opponents and lowers average damage taken, but it can become passive against rushdown and held-out opponents, so those rounds often end on time-out decisions. In the adaptation test, the low damage in Phases 2 and 3 reflects a non-attacking bot and a passive ghost, not proven recovery. The pre-trained table did not outperform the empty-table learner overall (65.3% vs 70.5% win rate); online learning accounts for most of the gains.

---

## Why Does Open Innovation Matter?

The Hacktoberfest Week 4 prompt asks: *“Tell us why open innovation matters for what you built. Does running your own model mean your project works with the lights (and the internet) off? Make sure what you build isn't locked inside a service that might disappear someday?”*

For `KillSwitch.swf`, open weights are not an aesthetic choice—they are the foundational premise of the entire project:

### 1. Zero Kill-Switches with Open Weights
Flash Player died because it was closed-source and proprietary. A single corporate entity held the master cryptographic keys, the browser plugins, and the execution switch. When Adobe decided it was no longer financially advantageous to maintain Flash, they didn't just archive it—they triggered a remote software execution kill-switch that wiped twenty-five years of human creative history from the live web.

Because **Google Gemma 3:4B** is an open-weight model running locally through Ollama, **no company can ever remotely shut down this game's intelligence**. No API deprecation, no sudden price hike, and no Terms of Service change can revoke the Ghost's brain.

### 2. Works With the Lights (and the Internet) Off
When you unplug the ethernet cable and disable Wi-Fi, `KillSwitch.swf` continues to run at a solid 60 FPS. Gemma still analyzes telemetry, writes calaveritas, and adapts to your fighting style on your local GPU or CPU. A fighting game that requires a cloud ping to decide its tactics is fundamentally broken; open-weight edge models restore sovereignty to the player's own machine.

### 3. $0.00 Inference Cost & Privacy
Running 900 rounds of automated combat calibration against an external cloud API would cost dozens of dollars in token billing and risk getting throttled by rate limits. With open-weight Gemma running locally, you can play 10,000 rounds of fighting, re-train AI models, and explore tactical adaptations indefinitely for **$0.00**.

### 4. Open Web Standards
By rewriting the Flash stickman experience in open HTML5 Canvas and native Web Audio API, this project proves that open web standards and open AI models can preserve, resurrect, and elevate creative history forever.

---

## The Spirit of It

In Mexican tradition, *Día de los Muertos* is not a day of mourning, but an act of remembrance—a belief that someone only truly disappears when their stories are no longer told.

Flash animations and games raised a generation of programmers and animators. When Adobe pulled the plug, it treated that creative legacy as obsolete code to be discarded.

`KillSwitch.swf` honors that past. Its interactive **Flash Cemetery (Ofrenda)** allows players to light memorial candles for:
* **Club Penguin** (2005 – 2017)
* **Xiao Xiao** (2001 – 2004)
* **Line Rider** (2006 – 2021)
* **Fancy Pants Adventures** (2006 – 2021)
* **Alien Hominid** (2002 – 2021)

When you light a candle, **Google Gemma 3:4B** composes a satirical *calaverita literaria* (Day of the Dead rhyming epitaph poem) in authentic 2000s Newgrounds slang:

> *“Here lies Club Penguin, encased in deep freeze,*  
> *Where purple puffles once danced in the breeze.*  
> *Adobe struck hard with a corporate blow,*  
> *Now your tip-the-iceberg secrets lie under the snow.”*

It turns a graveyard of dead plugins into an ofrenda of digital folklore.

---

## Prize Categories

### Featured Category: Best Use of Gemma ($200)

`KillSwitch.swf` enters strictly the **Best Use of Gemma** category:
- **Core Cognitive Engine:** Gemma 3:4B is not an afterthought or an auxiliary chatbot; it is the cognitive engine of the Ghost of Flash Player.
- **Offline Edge Adaptation:** Runs 100% locally via Ollama with zero cloud API latency or dependencies, enabling true local-first gameplay.
- **Tactical Dynamic Tuning:** Ingests structured round telemetry and dynamically tunes the Ghost's high-level state machine (`antiAirPriority`, `aggression`, `guardBreakRate`).
- **Gemma-Authored Boss Mechanics:** Directly designed the unhinged "ActionScript Error 0x7E5" triple-teleport memory overflow boss rage phase.
- **Cultural Epitaph Synthesis:** Composes real-time satirical calaveritas literarias honoring fallen Flash classics at the Day of the Dead Ofrenda.

---

*Long live the Flash generation. And long live open-source AI.*
