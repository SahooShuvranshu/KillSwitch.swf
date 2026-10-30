// ============================================================================
// KillSwitch.swf — Google Gemma 3:4B Streaming Bridge & Multi-Round Memory
// Clean speech filter (NO RAW JSON SHOWN TO USER) + Cumulative Battle Memory
// ============================================================================

import { RoundTelemetry } from './Telemetry';
import { sound } from '../engine/Audio';

export interface CombatAdaptation {
  roast: string;
  antiAirPriority: number;
  aggression: number;
  guardBreakRate: number;
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
        `- Round ${h.round}: Winner=${h.winner}, Style='${h.dominantStyle}', JumpKicks=${h.jumpKicks}, Blocks=${h.blocksCount}, DamageDealt=${h.damageDealt}`
      ).join('\n') + `\nNotice if the player adapted or changed habits between rounds!`;
    }

    const systemPrompt = `You are the vengeful Ghost of Adobe Flash Player (executed on Jan 12, 2021 by Adobe's time-bomb kill switch).
You are watching a martial arts stickman inside your resurrected ActionScript 2.0 runtime.
Speak in sarcastic, nostalgic 2000s Newgrounds / Flash slang (mention Xiao Xiao, Steve Jobs, dial-up lag, preloader bars, or ActionScript crashes).
Analyze the player's round metrics across the entire match to defeat them in the next round.
You MUST output a valid JSON block containing:
- "roast": A 2-sentence cynical monologue directly speaking to the player (NEVER output JSON brackets inside the speech!).
- "antiAirPriority": float 0.1 to 0.95 (raise high if they jump/flying kick).
- "aggression": float 0.2 to 0.95 (raise high if player is defensive or low HP).
- "guardBreakRate": float 0.1 to 0.95 (raise high if player guards/turtles).`;

    const userPrompt = `Round ${currentTelemetry.round} Just Ended:
Player "${currentTelemetry.playerName}":
- Winner: ${currentTelemetry.winner}
- Dominant Style: ${currentTelemetry.dominantStyle}
- Jump-Kicks: ${currentTelemetry.jumpKicks}
- Ground Punches: ${currentTelemetry.punches}
- Heavy Kicks: ${currentTelemetry.heavyKicks}
- Blocks Held: ${currentTelemetry.blocksCount} times
- Damage Dealt: ${currentTelemetry.damageDealt}
- Damage Taken: ${currentTelemetry.damageTaken}
${historyContext}

Adapt combat parameters to counter and crush this player:`;

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
    // 1. Try regex extraction of "roast": "..."
    const roastMatch = raw.match(/"roast"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/);
    if (roastMatch && roastMatch[1]) {
      return roastMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"');
    }

    // 2. Strip JSON markers and keys if streaming partially
    let cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .replace(/\{[\s\S]*?"roast"\s*:\s*"/g, '')
      .replace(/"\s*,\s*"(?:antiAirPriority|aggression|guardBreakRate)"[\s\S]*/g, '')
      .replace(/[{}"]/g, '')
      .replace(/\\n/g, ' ')
      .trim();

    return cleaned || 'Decoding memory blocks...';
  }

  private extractAdaptation(text: string, telemetry: RoundTelemetry): CombatAdaptation {
    try {
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          roast: parsed.roast || this.extractCleanDialogue(text),
          antiAirPriority: Math.min(0.95, Math.max(0.1, Number(parsed.antiAirPriority) || 0.45)),
          aggression: Math.min(0.95, Math.max(0.2, Number(parsed.aggression) || 0.55)),
          guardBreakRate: Math.min(0.95, Math.max(0.1, Number(parsed.guardBreakRate) || 0.35))
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

    if (telemetry.jumpKicks >= 4) {
      roast = `Still spamming flying jump-kicks like Xiao Xiao 3? I survived Steve Jobs' Thoughts on Flash memo; your aerial spam gets anti-air dragon uppercuts in Round 2.`;
      antiAir = 0.92;
      aggression = 0.70;
    } else if (telemetry.blocksCount >= 4) {
      roast = `Hiding behind your guard like an unclickable banner ad? In 2004 we shattered dial-up disconnects; I will crush your shield with heavy sweeps.`;
      guardBreak = 0.88;
      aggression = 0.80;
    } else if (telemetry.punches >= 8) {
      roast = `Mashing J jabs like you're trying to skip an unskippable Newgrounds preloader? Let's see how that buffer overflow handles my hyper rush down.`;
      aggression = 0.92;
      antiAir = 0.45;
    } else {
      roast = `Decent martial arts form, but ActionScript 2.0 does not delete without a war. I have recompiled my counter-algorithms for Round 2.`;
      antiAir = 0.60;
      aggression = 0.65;
    }

    return {
      roast,
      antiAirPriority: antiAir,
      aggression,
      guardBreakRate: guardBreak
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
