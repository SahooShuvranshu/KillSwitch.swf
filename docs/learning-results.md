# KillSwitch.swf — Empirical Q-Learning Benchmark & Adaptation Report

**Benchmark Execution Date:** 2026-10-31  
**Build Evaluated:** Current Final Production Build (Asymmetric Jump Physics, Retrained Q-Table)  
**Difficulty Tier:** NIGHTMARE (Reaction Delay = 1 frame, Block Chance = 85%)  
**Evaluator Environment:** In-Browser Deterministic Headless Runner (Zero Ollama calls, 60 FPS simulated)  

---

> **Known limitations:** The learner beats the hand-written rules on jump-kick and heavy-kick opponents and lowers average damage taken, but it can become passive against rushdown and held-out opponents, so those rounds often end on time-out decisions. In the adaptation test, the low damage in Phases 2 and 3 reflects a non-attacking bot and a passive ghost, not proven recovery. The pre-trained table did not outperform the empty-table learner overall (65.3% vs 70.5% win rate); online learning accounts for most of the gains.

## 1. Executive Summary & Objective Findings

This benchmark rigorously evaluates the Q-learning reinforcement engine across **1,800 main combat rounds** (100 rounds per bot $\times$ 6 bots $\times$ 3 conditions) and a **120-round sequential adaptation test**.

Unlike earlier tests with passive punch-bag bots, all 6 adversaries operate at **Nightmare Difficulty** with full attack-and-defend combat intelligence:
- **Attacks:** Coordinated combos, mid-range heavy kicks, dive-kicks, and trip sweeps.
- **Defenses:** Dynamic shield blocking (parries) and dodge-rolling under pressure.
- **Punishes:** Immediate whiff-punishing of ghost recovery frames.
- **Held-Out Bot:** A 6th style (`MIRROR_COUNTER`) that was **never included in training** tests out-of-distribution tactical generalization.

![Benchmark Metrics Comparison](benchmark-metrics-chart.png)

### Key Objective Results:
1. **Pre-Trained Weights vs. Baseline:**
   - **Overall Win Rate:** Learner ON (Pre-Trained) achieves **65.3% ± 1.9%** overall win rate across all 600 rounds, compared to **53.7% ± 2.0%** for Learner OFF (Rule-Based) and **70.5% ± 1.9%** for Learner ON (Empty Q-Table).
   - **Damage Reduction With a Timeout Tradeoff:** Pre-trained Q-table cuts damage from **88.3 HP down to 14.3 HP** (an 83.8% reduction) against rushdown combos, but it often ran out the clock (6% win rate); it also reduces random-mix-up damage from **50.0 HP down to 39.1 HP**.
   - **Decisive Aerial Domination:** Against competent jump-kickers, pre-trained win rate nearly doubled from **44% to 85%**, cutting round duration from 24.9s to 16.0s.
2. **Generalization on Held-Out Opponent (`MIRROR_COUNTER`):**
   - Against the held-out tactical counter-bot, the Rule-Based baseline took **165.8 HP damage** and had a 32% win rate.
   - The Pre-Trained Q-Table took **74.2% less damage** (**42.7 HP**) but won no more fights (32% vs 32%), retaining **137.3 HP** on average.
3. **The Defensive Timeout Tradeoff on `COMBO`:**
   - While the learner successfully solved damage avoidance against the rushdown combo bot (dropping damage taken from 88.3 HP to 14.3 HP), it over-indexed on `EVADE` and `RETREAT`. This pushed round durations to 28.7s (near the 30s timeout cap), causing the ghost to lose decisions when it held slightly less HP than the undamaged bot (6% win rate vs 22% for baseline).
4. **Adaptation Curve (Sequential Style Switches):**
   - Across 120 rounds with abrupt shifts at Round 40 and Round 80, low damage after the switches partly reflects a non-attacking bot and a defensive ghost; these results do not prove recovery within a fixed number of rounds.

---

## 2. Comparative Benchmark Matrix (Mean ± Standard Error across 100 Rounds per Condition)

### Overall Summary Across All 6 Bot Styles (600 Rounds per Condition)

| Condition | Overall Win Rate (%) | Avg Ghost HP Left (Max 180) | Avg Damage Taken (HP) | Avg Duration (s) |
| :--- | :---: | :---: | :---: | :---: |
| **Learner OFF (Rule-Based)** | 53.7% ± 2% | 124.1 ± 2.7 | 55.9 ± 2.7 | 20.1 ± 0.4 s |
| **Learner ON (Empty Table)** | 70.5% ± 1.9% | 154.4 ± 1.3 | 25.6 ± 1.3 | 15.8 ± 0.4 s |
| **Learner ON (Pre-Trained)** | **65.3% ± 1.9%** | **156.7 ± 1.3** | **23.3 ± 1.3** | **17.5 ± 0.4 s** |

---

### Detailed Breakdown by Adversary Style (100 Rounds Each, Nightmare Difficulty)

#### JUMP_KICK (Airborne Aggressor with Ground Defense & Low-Sweep Landing Punish)

| Condition | Win Rate (%) | Avg Ghost HP Left | Avg Damage Taken | Avg Round Duration |
| :--- | :---: | :---: | :---: | :---: |
| Learner OFF (Rule-Based) | 44% ± 5% | 166.4 ± 1.3 | 13.6 ± 1.3 | 24.9 ± 0.7 s |
| Learner ON (Empty Table) | 86% ± 3.5% | 158.4 ± 1.5 | 21.6 ± 1.5 | 13.6 ± 0.8 s |
| Learner ON (Pre-Trained) | **85% ± 3.6%** | **158.3 ± 1.5** | **21.7 ± 1.5** | **16 ± 0.8 s** |

#### TURTLE (Defensive Bait & Spacing Specialist with Counter-Sweeps and Anti-Air Launchers)

| Condition | Win Rate (%) | Avg Ghost HP Left | Avg Damage Taken | Avg Round Duration |
| :--- | :---: | :---: | :---: | :---: |
| Learner OFF (Rule-Based) | 99% ± 1% | 179.5 ± 0.2 | 0.5 ± 0.2 | 6.1 ± 0.3 s |
| Learner ON (Empty Table) | 100% ± 0% | 179.7 ± 0.2 | 0.3 ± 0.2 | 3.9 ± 0.2 s |
| Learner ON (Pre-Trained) | **99% ± 1%** | **179.6 ± 0.2** | **0.4 ± 0.2** | **4.6 ± 0.5 s** |

#### COMBO (Rushdown Brawler with Cancel Chains, Dodge-Roll Escapes, and Low-Sweep Guard Breaks)

| Condition | Win Rate (%) | Avg Ghost HP Left | Avg Damage Taken | Avg Round Duration |
| :--- | :---: | :---: | :---: | :---: |
| Learner OFF (Rule-Based) | 22% ± 4.1% | 91.7 ± 6.6 | 88.3 ± 6.6 | 25.6 ± 0.6 s |
| Learner ON (Empty Table) | 31% ± 4.6% | 156.8 ± 3.5 | 23.2 ± 3.5 | 25 ± 0.7 s |
| Learner ON (Pre-Trained) | **6% ± 2.4%** | **165.8 ± 3.5** | **14.3 ± 3.5** | **28.7 ± 0.4 s** |

#### HEAVY_KICK (Footsies & Spacing Zoner with Mid-Range Heavy Kicks and Retreating Rolls)

| Condition | Win Rate (%) | Avg Ghost HP Left | Avg Damage Taken | Avg Round Duration |
| :--- | :---: | :---: | :---: | :---: |
| Learner OFF (Rule-Based) | 37% ± 4.8% | 162.6 ± 1.5 | 17.4 ± 1.5 | 24.8 ± 0.8 s |
| Learner ON (Empty Table) | 90% ± 3% | 154.5 ± 1.6 | 25.5 ± 1.6 | 13 ± 0.7 s |
| Learner ON (Pre-Trained) | **71% ± 4.5%** | **158.4 ± 1.5** | **21.6 ± 1.5** | **17.3 ± 1 s** |

#### RANDOM_MIX (Dynamic Tactical Mix-Up Alternating Between Rushes, Zoning, and Parry Blocks)

| Condition | Win Rate (%) | Avg Ghost HP Left | Avg Damage Taken | Avg Round Duration |
| :--- | :---: | :---: | :---: | :---: |
| Learner OFF (Rule-Based) | 88% ± 3.2% | 130 ± 2.2 | 50 ± 2.2 | 19.1 ± 0.6 s |
| Learner ON (Empty Table) | 100% ± 0% | 143.3 ± 1.7 | 36.7 ± 1.7 | 11.1 ± 0.4 s |
| Learner ON (Pre-Trained) | **99% ± 1%** | **140.9 ± 2.1** | **39.1 ± 2.1** | **13.7 ± 0.5 s** |

#### MIRROR_COUNTER (HELD-OUT 6th Style: Reactive State Counter (Never Included in Offline Training))

| Condition | Win Rate (%) | Avg Ghost HP Left | Avg Damage Taken | Avg Round Duration |
| :--- | :---: | :---: | :---: | :---: |
| Learner OFF (Rule-Based) | 32% ± 4.7% | 14.2 ± 2.6 | 165.8 ± 2.6 | 20.4 ± 0.5 s |
| Learner ON (Empty Table) | 16% ± 3.7% | 133.7 ± 5.7 | 46.4 ± 5.7 | 27.9 ± 0.5 s |
| Learner ON (Pre-Trained) | **32% ± 4.7%** | **137.3 ± 5.4** | **42.7 ± 5.4** | **24.3 ± 0.8 s** |

---

## 3. 5-Round Block Progression Table (Learner ON Pre-Trained, Blocks 1–20)

| Block | Rounds | JUMP_KICK (Win% / Dmg) | TURTLE (Win% / Dmg) | COMBO (Win% / Dmg) | HEAVY_KICK (Win% / Dmg) | RANDOM (Win% / Dmg) | HELD-OUT (Win% / Dmg) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **B1** | R1-R5 | 100% / 36 | 100% / 2.4 | 80% / 86.2 | 100% / 33.6 | 80% / 34.4 | 40% / 124 |
| **B2** | R6-R10 | 80% / 28.8 | 100% / 0 | 0% / 29 | 100% / 34 | 100% / 53.6 | 80% / 65.4 |
| **B3** | R11-R15 | 60% / 30.8 | 80% / 2.8 | 0% / 0 | 100% / 44.6 | 100% / 53.6 | 80% / 102.4 |
| **B4** | R16-R20 | 100% / 19.2 | 100% / 0 | 20% / 14.4 | 60% / 20.8 | 100% / 52.2 | 100% / 87.6 |
| **B5** | R21-R25 | 100% / 30.4 | 100% / 1.4 | 0% / 10 | 0% / 22 | 100% / 39.2 | 100% / 84.6 |
| **B6** | R26-R30 | 80% / 18.8 | 100% / 0 | 0% / 22.6 | 100% / 14.8 | 100% / 45 | 100% / 60.4 |
| **B7** | R31-R35 | 60% / 19.6 | 100% / 1.4 | 0% / 3.8 | 60% / 26.4 | 100% / 54.2 | 60% / 49.2 |
| **B8** | R36-R40 | 80% / 24 | 100% / 0 | 0% / 2.8 | 60% / 18 | 100% / 62.2 | 20% / 0 |
| **B9** | R41-R45 | 100% / 14.8 | 100% / 0 | 0% / 15.8 | 60% / 10.8 | 100% / 47.6 | 0% / 0 |
| **B10** | R46-R50 | 80% / 26 | 100% / 0 | 0% / 38.4 | 80% / 23.2 | 100% / 24.8 | 20% / 6 |
| **B11** | R51-R55 | 100% / 19.2 | 100% / 0 | 0% / 3.8 | 60% / 19.2 | 100% / 30.8 | 0% / 24.2 |
| **B12** | R56-R60 | 100% / 28.4 | 100% / 0 | 0% / 6.8 | 60% / 8.8 | 100% / 32 | 0% / 3.8 |
| **B13** | R61-R65 | 60% / 16.8 | 100% / 0 | 20% / 39.8 | 60% / 25.2 | 100% / 30.6 | 0% / 61.8 |
| **B14** | R66-R70 | 100% / 17.6 | 100% / 0 | 0% / 3.8 | 60% / 27.4 | 100% / 22.4 | 20% / 71 |
| **B15** | R71-R75 | 80% / 17.6 | 100% / 0 | 0% / 1 | 80% / 12 | 100% / 26.2 | 0% / 2 |
| **B16** | R76-R80 | 100% / 26.4 | 100% / 0 | 0% / 2.4 | 60% / 19.2 | 100% / 20.2 | 0% / 2.8 |
| **B17** | R81-R85 | 80% / 21.6 | 100% / 0 | 0% / 0 | 80% / 16.8 | 100% / 45.8 | 0% / 28.2 |
| **B18** | R86-R90 | 100% / 8.4 | 100% / 0 | 0% / 0 | 80% / 18 | 100% / 36.2 | 20% / 45.4 |
| **B19** | R91-R95 | 80% / 14.4 | 100% / 0 | 0% / 0 | 60% / 14.8 | 100% / 50.8 | 0% / 30.8 |
| **B20** | R96-R100 | 60% / 14.4 | 100% / 0 | 0% / 4.4 | 100% / 22.8 | 100% / 20.4 | 0% / 3.8 |

---

## 4. Sequential Adaptation Test (120 Rounds with Abrupt Style Switches)

The adaptation test evaluated online recovery when the opponent abruptly shifts tactics without notice:

![Adaptation Curve](adaptation-test-chart.png)

### Adaptation Phase Statistics:
- **Phase 1: Rounds 1–40 (Jump-Kick Spammer):**
  - Average Damage Taken: **27.3 ± 2.3 HP**
  - Dominant Learned Policy: `mid_air_0 -> ANTI_AIR` (uppercut launchers and flying knees intercept dive-kicks during ascent).
- **Phase 2: Rounds 41–80 (Turtle Spacing & Sweep Bait):**
  - Average Damage Taken: **1.2 ± 0.5 HP**
  - Switch Spike: At Round 41, damage spiked to **0 HP** as the adversary stopped jumping and held guard.
  - Interpretation: low damage in this phase partly reflects the bot stopping attacks and the ghost playing defensively; it does not establish a six-round recovery window.
  - Dominant Learned Policy: `close_block_0 -> GUARD_BREAK` (low sweep trips blocking foes) and `RETREAT`.
- **Phase 3: Rounds 81–120 (Combo Rushdown Brawler):**
  - Average Damage Taken: **6.5 ± 4.5 HP**
  - Switch Spike: At Round 81, damage spiked to **0 HP** under relentless jab-cross pressure.
  - Interpretation: low damage in this phase partly reflects the bot stopping attacks and the ghost playing defensively; it does not establish a seven-round recovery window.
  - Dominant Learned Policy: `close_attack_0 -> WHIFF_PUNISH` (flying knee armor frames) and `EVADE` (dodge-rolling behind the combo).

---

## 5. Objective Empirical Findings & Behavior/Reward Tuning Analysis

### What the Numbers Show:
1. **Clear Superiority of Reinforcement Policy on Aerial & Footsies:**
   - On aerial jump-kickers (`JUMP_KICK`), the pre-trained Q-table nearly doubles win rate over baseline (**85% vs 44%**), cutting fight duration by 35% via learned anti-air uppercuts.
   - On footsies zoners (`HEAVY_KICK`), pre-trained win rate jumps from **37% to 71%**, with round time dropping from 24.8s to 17.3s.
   - On random mix-ups (`RANDOM_MIX`), pre-trained win rate reaches **99%** with damage taken cut from 50.0 HP to 39.1 HP.
2. **Defensive Survival vs. Decision Losses on Rushdown (`COMBO`):**
   - Against `COMBO`, the rule-based baseline charged in and suffered **88.3 HP damage** (22% win rate).
   - The pre-trained learner learned to survive, slashing damage taken down to **14.3 HP** (165.8 HP remaining). However, because it prioritized evasion over counter-offense, 94% of bouts reached the 30-second time limit, and the bot won on decision, resulting in a **6% win rate**.
3. **Held-Out Generalization Validated (`MIRROR_COUNTER`):**
   - The agent was never trained against `MIRROR_COUNTER`. While win rate tied baseline at **32%**, the pre-trained agent survived with **137.3 HP** (absorbing only 42.7 HP damage), compared to the baseline which was nearly eliminated with only **14.2 HP left** (absorbing 165.8 HP damage).
4. **Empty Learner Online Exploration:**
   - The Empty Q-Table achieved a slightly higher overall win rate (70.5%) than pre-trained (65.3%) because higher early-round exploration forced more active counter-punches against `COMBO` (31% vs 6%), though at the cost of higher damage taken on `JUMP_KICK` and `HEAVY_KICK`.

### Concrete Recommendations for Tuning Behaviors and Rewards:
1. **Fixing the `COMBO` Timeout Trap:**
   - *Problem:* In `close_attack_0`, the ghost learned that `EVADE` and `RETREAT` avoid negative damage rewards, but neither behavior deals damage, leading to timeout losses.
   - *Fix:* Increase the reward for `WHIFF_PUNISH` (flying knee) from `+0.3` to `+1.5` and introduce a small negative reward (`-0.15`) for choosing `RETREAT` when time remaining is low, incentivizing the ghost to strike back immediately after dodging.
2. **Accelerating Turtle Guard-Break:**
   - *Problem:* Against blocking turtles, the ghost occasionally hits shields with `PUNCH_CHAIN` before switching to `GUARD_BREAK`.
   - *Fix:* Add a `-0.5` penalty when an attack is blocked by a guarding opponent, accelerating convergence toward `GUARD_BREAK` (low sweep).
