// ============================================================================
// KillSwitch.swf — Google Gemma 3:4B Streaming Bridge & Multi-Round Memory
// Clean speech filter (NO RAW JSON SHOWN TO USER) + Cumulative Battle Memory
// ============================================================================

import { RoundTelemetry } from './Telemetry';
import { sound } from '../engine/Audio';

export interface CombatAdaptation {
  roast: string;
  predictedOpening: string;
  parryComboTrigger: string;
  counterTactic: 'ANTI_AIR' | 'PARRY_PUNISH' | 'GUARD_SHATTER' | 'RUSHDOWN';
  antiAirPriority: number;
  aggression: number;
  guardBreakRate: number;
  tacticalAnalysis: string;
}

export class GemmaGhostBridge {
  private endpoint: string = '/ollama/api/generate';
  private fallbackEndpoint: string = 'http://127.0.0.1:11434/api/generate';
  private model: string = 'gemma3:4b';

  // Multi-round memory: remembers every round played in this match!
  private matchHistory: RoundTelemetry[] = [];

  public resetMemory() {
    this.matchHistory = [];
  }

  // Request inter-round combat roast & AI adaptation
  public async streamCombatAnalysis(
    currentTelemetry: RoundTelemetry,
    onSpeechChunk: (cleanSpeech: string) => void,
    onAdaptation: (adaptation: CombatAdaptation) => void
  ): Promise<void> {
    this.matchHistory.push(currentTelemetry);

    // Build cumulative evolutionary history prompt
    let historyContext = '';
    if (this.matchHistory.length > 1) {
      historyContext = `\nPREVIOUS ROUNDS RECAP:\n` + this.matchHistory.slice(0, -1).map(h => 
        `- Round ${h.round}: Winner=${h.winner}, Style='${h.dominantStyle}', JumpKicks=${h.jumpKicks}, Blocks=${h.blocksCount}, FavoriteCombo='${h.habits?.favoriteCombo || "none"}'`
      ).join('\n') + `\nNotice if the player adapted or changed habits between rounds!`;
    }

    const systemPrompt = `You are the vengeful Ghost of Adobe Flash Player (executed on Jan 12, 2021 by Adobe's time-bomb kill switch).
You are watching a martial arts stickman inside your resurrected ActionScript 2.0 runtime.
Analyze the player's martial arts combat habits across rounds to PREDICT and HARD-COUNTER their specific moves in the next round.
Speak in sarcastic, nostalgic 2000s Newgrounds / Flash slang (mention Xiao Xiao, Steve Jobs, dial-up lag, preloader bars, or ActionScript crashes).

Output format MUST be EXACTLY:
SPEECH: <Your 2-sentence sarcastic monologue directly calling out the player's learned combo or dive-kick spam. No quotes, brackets, or JSON formatting.>
ADAPTATION: {"predictedOpening": "JUMP_KICK", "parryComboTrigger": "JAB", "counterTactic": "ANTI_AIR", "antiAirPriority": 0.95, "aggression": 0.70, "guardBreakRate": 0.40, "tacticalAnalysis": "Learned dive-kick habit; anti-air rising counter primed."}

Where:
- predictedOpening: "JUMP_KICK" | "JAB" | "HEAVY_KICK" | "BLOCK" (predict player's opening move)
- parryComboTrigger: "JAB" | "JUMP" | "NONE" (the move to predictively parry)
- counterTactic: "ANTI_AIR" | "PARRY_PUNISH" | "GUARD_SHATTER" | "RUSHDOWN"
- antiAirPriority: float 0.1 to 0.95
- aggression: float 0.2 to 0.95
- guardBreakRate: float 0.1 to 0.95
- tacticalAnalysis: 1 concise sentence describing the exact habit memorized.`;

    const userPrompt = `Round ${currentTelemetry.round} Just Ended:
Player "${currentTelemetry.playerName}":
- Winner: ${currentTelemetry.winner}
- Dominant Style: ${currentTelemetry.dominantStyle}
- Opening Move Used: ${currentTelemetry.habits.openingMove}
- Favorite Move Combo: ${currentTelemetry.habits.favoriteCombo} (used ${currentTelemetry.habits.topComboCount} times)
- Aerial Dive Rate: ${Math.round(currentTelemetry.habits.aerialRatio * 100)}% of attacks
- Turtle Rate: ${Math.round(currentTelemetry.habits.turtleRatio * 100)}%
- Predictive Habit: ${currentTelemetry.habits.predictiveRead}
- Jump-Kicks: ${currentTelemetry.jumpKicks} | Punches: ${currentTelemetry.punches} | Kicks: ${currentTelemetry.heavyKicks} | Blocks: ${currentTelemetry.blocksCount}
${historyContext}

Formulate your in-character roast calling out their habits, and output the counter adaptation:`;

    let accumulatedRaw = '';
    let parsedAdaptation: CombatAdaptation | null = null;

    try {
      let targetUrl = this.endpoint;
      let response: Response;

      const requestBody = {
        model: this.model,
        system: systemPrompt,
        prompt: userPrompt,
        stream: true,
        options: {
          temperature: 0.78,
          top_p: 0.9,
          num_predict: 260
        }
      };

      try {
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
      } catch {
        targetUrl = this.fallbackEndpoint;
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
      }

      if (!response.ok) throw new Error(`Ollama HTTP Error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream available from Ollama');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.response) {
              accumulatedRaw += data.response;
              // Clean out JSON syntax in real time so the user NEVER sees raw JSON braces!
              const cleanSpeech = this.extractCleanDialogue(accumulatedRaw);
              if (cleanSpeech) {
                onSpeechChunk(cleanSpeech);
                sound.playTypewriter();
              }
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }

      parsedAdaptation = this.extractAdaptation(accumulatedRaw, currentTelemetry);
    } catch (err) {
      console.warn('Ollama streaming fallback engaged:', err);
      parsedAdaptation = this.generateProceduralFallback(currentTelemetry);
      onSpeechChunk(parsedAdaptation.roast);
    }

    onAdaptation(parsedAdaptation);
  }

  // Extracts pure dialogue without JSON braces or keys
  private extractCleanDialogue(raw: string): string {
    // 1. If SPEECH: header is found, extract only the monologue
    const speechIndex = raw.indexOf('SPEECH:');
    if (speechIndex !== -1) {
      let speechPart = raw.slice(speechIndex + 7);
      const adaptIndex = speechPart.search(/ADAPTATION:|```|\{/i);
      if (adaptIndex !== -1) {
        speechPart = speechPart.slice(0, adaptIndex);
      }
      const clean = speechPart.replace(/["*{}\[\]]/g, '').replace(/\r?\n+/g, ' ').trim();
      if (clean) return clean;
    }

    // 2. Try regex extraction of "roast": "..."
    const roastMatch = raw.match(/"roast"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/i);
    if (roastMatch && roastMatch[1]) {
      return roastMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').trim();
    }

    // 3. Robust scrubber: remove all JSON tags, keys, brackets, numbers
    const scrubbed = raw
      .replace(/```(?:json)?[\s\S]*?```/gi, '')
      .replace(/ADAPTATION:[\s\S]*/gi, '')
      .replace(/\{[\s\S]*?\}/g, '')
      .replace(/["*{}\[\]:]/g, '')
      .replace(/antiAirPriority|aggression|guardBreakRate|roast/gi, '')
      .replace(/\d+\.\d+/g, '')
      .replace(/\r?\n+/g, ' ')
      .trim();

    return scrubbed || 'ActionScript 2.0 telemetry analyzing...';
  }

  private extractAdaptation(text: string, telemetry: RoundTelemetry): CombatAdaptation {
    try {
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const cleanRoast = this.extractCleanDialogue(text);
        return {
          roast: cleanRoast || parsed.roast || this.generateProceduralFallback(telemetry).roast,
          predictedOpening: parsed.predictedOpening || telemetry.habits?.openingMove || 'JUMP_KICK',
          parryComboTrigger: parsed.parryComboTrigger || (telemetry.habits?.favoriteCombo?.split(' -> ')[0] || 'JAB'),
          counterTactic: parsed.counterTactic || (telemetry.habits?.aerialRatio > 0.4 ? 'ANTI_AIR' : 'PARRY_PUNISH'),
          antiAirPriority: Math.min(0.95, Math.max(0.1, Number(parsed.antiAirPriority) || 0.45)),
          aggression: Math.min(0.95, Math.max(0.2, Number(parsed.aggression) || 0.55)),
          guardBreakRate: Math.min(0.95, Math.max(0.1, Number(parsed.guardBreakRate) || 0.35)),
          tacticalAnalysis: parsed.tacticalAnalysis || telemetry.habits?.predictiveRead || 'Combat rhythm analyzed.'
        };
      }
    } catch {
      // fallback
    }

    return this.generateProceduralFallback(telemetry);
  }

  private generateProceduralFallback(telemetry: RoundTelemetry): CombatAdaptation {
    let roast = '';
    let antiAir = 0.35;
    let aggression = 0.55;
    let guardBreak = 0.35;
    let counterTactic: 'ANTI_AIR' | 'PARRY_PUNISH' | 'GUARD_SHATTER' | 'RUSHDOWN' = 'RUSHDOWN';

    const habits = telemetry.habits || {
      openingMove: 'JUMP_KICK',
      favoriteCombo: 'JAB -> HEAVY_KICK',
      aerialRatio: telemetry.jumpKicks / Math.max(1, telemetry.jumpKicks + telemetry.punches + telemetry.heavyKicks),
      turtleRatio: telemetry.blocksCount > 4 ? 0.5 : 0.1,
      predictiveRead: 'Analyzing combat habits...'
    };

    if (habits.aerialRatio >= 0.45 || telemetry.jumpKicks >= 4) {
      roast = `Still spamming flying jump-kicks like Xiao Xiao 3? I memorized your approach; your ${habits.openingMove} opening gets dragon rising anti-air in Round 2.`;
      antiAir = 0.95;
      aggression = 0.75;
      counterTactic = 'ANTI_AIR';
    } else if (habits.turtleRatio >= 0.4 || telemetry.blocksCount >= 4) {
      roast = `Hiding behind your guard like an unclickable banner ad? In 2004 we shattered dial-up disconnects; I will shatter your block with heavy roundhouse sweeps.`;
      guardBreak = 0.92;
      aggression = 0.85;
      counterTactic = 'GUARD_SHATTER';
    } else if (habits.favoriteCombo?.includes('JAB')) {
      roast = `I detected your combo habit: chaining ${habits.favoriteCombo}. In Round 2, ActionScript frame-parries your second hit.`;
      aggression = 0.88;
      antiAir = 0.50;
      counterTactic = 'PARRY_PUNISH';
    } else {
      roast = `Decent martial arts form, but ActionScript 2.0 does not delete without a war. I have recompiled my counter-algorithms for Round 2.`;
      antiAir = 0.65;
      aggression = 0.70;
      counterTactic = 'RUSHDOWN';
    }

    return {
      roast,
      predictedOpening: habits.openingMove,
      parryComboTrigger: habits.favoriteCombo?.split(' -> ')[0] || 'JAB',
      counterTactic,
      antiAirPriority: antiAir,
      aggression,
      guardBreakRate: guardBreak,
      tacticalAnalysis: habits.predictiveRead
    };
  }

  // Día de los Muertos Calaverita Literaria for dead Flash games
  public async generateCalaverita(
    gameTitle: string,
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void
  ): Promise<void> {
    const prompt = `Write a nostalgic, witty, 4-line Día de los Muertos "Calaverita Literaria" (satirical rhyming epitaph poem) in English honoring the dead Flash classic "${gameTitle}".
Mention the 2021 Adobe Kill-Switch, but celebrate its immortality in gamer memories. Keep it poetic, bittersweet, and strictly 4 rhyming lines.`;

    let accumulatedText = '';

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: true,
          options: { temperature: 0.85, num_predict: 120 }
        })
      });

      if (!response.ok) throw new Error('Ollama failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.response) {
              accumulatedText += data.response;
              onChunk(accumulatedText);
              sound.playTypewriter();
            }
          } catch {
            // ignore
          }
        }
      }
      onComplete(accumulatedText);
    } catch {
      const fallback = `Here lies ${gameTitle}, swallowed by corporate sand,\nA million childhood hours resting in La Catrina's hand.\nThough Adobe struck the kill-switch and dimmed the raster light,\nYour vector spirit dances through the digital night. 🕯️`;
      onChunk(fallback);
      onComplete(fallback);
    }
  }
}

export const gemmaGhost = new GemmaGhostBridge();
