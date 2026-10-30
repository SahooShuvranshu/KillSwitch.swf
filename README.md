# ⚡ KillSwitch.swf — Resurrecting Flash Player with Local Gemma 3:4B & Adaptive Stickman Combat

> **DEV x MLH Hacktoberfest 2026 Week 4 Challenge Submission: "Ghost in the Machine" (`#hf26challenge`)**  
> **Categories Targeted:** Best Use of Gemma ($200 USD) • Overall Grand Prize ($250 USD)  
> **Built by:** Shuvranshu Sekhar Sahoo ([@sahooshuvranshu](https://dev.to/sahooshuvranshu))

---

## 💀 The Story: January 12, 2021

On January 12, 2021, Adobe activated a hardcoded time-bomb kill-switch inside the Flash Player runtime. Overnight, billions of interactive web experiences—from classic *Xiao Xiao* stickman martial arts animations to *Club Penguin* and *Line Rider*—were permanently bricked behind a silent, black warning icon.

**`KillSwitch.swf`** is a 60 FPS HTML5 Canvas resurrection game. You play as a martial arts stickman who breaches the 2021 kill-switch dialog to fight the **Ghost of Flash Player** inside a restored Macromedia Flash Player 10.3 desktop window. 

The Ghost is not a hardcoded script. It is powered locally by **Google Gemma 3 4B** via Ollama. It observes your combat habits in Round 1, roasts your playstyle with authentic 2000s Newgrounds lore, and dynamically tunes its combat parameters (`antiAirPriority`, `aggression`, `guardBreakRate`) to intercept your favorite combos in Round 2.

---

## 🎮 Features & Gameplay

- **60 FPS Procedural Canvas Combat**: Fully skeletal stickman physics inspired by classic *Xiao Xiao* animations, featuring dynamic hurtboxes, starburst spark particles, slow-motion hit freeze-frames, and wall bounces.
- **Authentic Macromedia Flash MX Chrome**: Windows XP retro window chrome, CRT horizontal scanlines, phosphor glow, and an interactive 2021 kill-switch bypass flow.
- **Zero-Dependency Procedural Web Audio**: 8-bit punches, heavy crunch kicks, metallic guard deflections, and mechanical terminal typewriter clicks synthesized live via Web Audio API.
- **Real-Time Gemma 3:4B Combat Telemetry**: Tracks jump-kicks, ground jabs, defensive block duration, and player playstyle classifications.
- **Dynamic AI Counter-Adaptation**:
  - *Spamming jump-kicks?* Gemma tunes `antiAirPriority: 0.95`, instructing the Ghost to punish airborne attacks with rising dragon kicks.
  - *Turtling behind guard?* Gemma raises `guardBreakRate: 0.85` to unleash aggressive guard-crushing low sweeps.
- **Día de los Muertos Flash Cemetery (Ofrenda)**: An interactive memorial altar honoring fallen Flash classics (*Club Penguin*, *Xiao Xiao*, *Line Rider*, *Fancy Pants*, *Alien Hominid*). Lighting a candle invokes Gemma 3 4B to compose a custom *calaverita literaria* (satirical Day of the Dead rhyming epitaph).

---

## 🕹️ Controls

| Action | Primary Keys | Alternate Keys |
| :--- | :--- | :--- |
| **Move Left / Right** | `A` / `D` | `Left` / `Right` Arrow |
| **Jump** | `W` | `Up` Arrow |
| **Crouch / Duck** | `S` | `Down` Arrow |
| **Light Jab** | `J` | `Z` |
| **Heavy Roundhouse Kick** | `K` | `X` |
| **Xiao Xiao Flying Jump-Kick** | `W + K` (Airborne) | `Up + X` |
| **Defensive Shield Guard** | `L` (Hold) | `C` (Hold) |

---

## 🧠 Gemma 3:4B Architecture & Necromancy Loop

```
+-----------------------------------------------------------------------+
| ROUND 1: 60 FPS Combat Engine (Player vs Ghost)                        |
| - TelemetryTracker records: jumpKicks, punches, blocks, whiffRate      |
+-----------------------------------------------------------------------+
                                  |
                                  v (Round End / K.O.)
+-----------------------------------------------------------------------+
| FLASH RETRO CRT TERMINAL                                              |
| - Streams streaming HTTP POST to local Ollama (127.0.0.1:11434)       |
| - Model: gemma3:4b (hybrid Vulkan/CPU on GeForce MX250)               |
+-----------------------------------------------------------------------+
                                  |
                                  v (Structured JSON Extraction)
+-----------------------------------------------------------------------+
| 1. Sarcastic Flash Roast: Typewriter audio streamed character-by-char |
| 2. Combat Adaptation: antiAirPriority, aggression, guardBreakRate     |
+-----------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------+
| ROUND 2: Adapted AI State Machine intercepts player habits in real-time|
+-----------------------------------------------------------------------+
```

---

## 🛠️ Quickstart (Running Locally)

### Prerequisites
1. **Node.js** (v18+)
2. **Ollama** installed with `gemma3:4b`:
   ```bash
   ollama pull gemma3:4b
   ollama serve
   ```

### Launch the Game
```bash
# Clone the repository
git clone https://github.com/SahooShuvranshu/KillSwitch.swf.git
cd KillSwitch.swf

# Install dependencies (cached on Drive D:)
npm install

# Start Vite dev server with Ollama proxy
npm run dev
```

Open your browser at `http://127.0.0.1:5173/` and click **⚡ BYPASS KILL-SWITCH & FIGHT**!

---

## 🕯️ Why Open Innovation Matters (The Hacktoberfest Prompt)

When Adobe shut down Flash Player in 2021, twenty-five years of digital art, browser gaming history, and indie creator culture were extinguished with a single proprietary kill-switch. It demonstrated the existential danger of building digital culture on closed, proprietary foundations.

`KillSwitch.swf` proves why **open-weight models like Google Gemma 3 4B** and the open web matter:
1. **Zero Kill-Switches**: Running open weights locally via Ollama means no corporate entity can revoke your license, shut down your endpoint, or brick your game.
2. **100% Offline & Private**: Telemetry and player combat habits never leave your local machine; inference runs at 60 FPS offline with zero cloud telemetry.
3. **Eternal Preservation**: Just as open web standards (HTML5 Canvas + Web Audio API) allow us to preserve the aesthetic of Flash without proprietary plugins, open-source AI ensures that intelligent characters and procedural worlds belong to developers forever.

---

## 📜 License
MIT License • Created for DEV x MLH Hacktoberfest 2026.
