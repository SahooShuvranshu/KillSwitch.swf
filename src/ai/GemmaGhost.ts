// ============================================================================
// KillSwitch.swf — Google Gemma 3:4B Streaming Bridge & Adaptation Parser
// ============================================================================

import { RoundTelemetry } from './Telemetry';
import { sound } from '../engine/Audio';

export interface CombatAdaptation {
  roast: string;
  antiAirPriority: number; // 0.0 to 1.0
  aggression: number;     // 0.0 to 1.0
  guardBreakRate: number; // 0.0 to 1.0
}

export class GemmaGhostBridge {
  private endpoint: string = '/ollama/api/generate'; // routed via Vite dev proxy to 127.0.0.1:11434
  private fallbackEndpoint: string = 'http://127.0.0.1:11434/api/generate';
  private model: string = 'gemma3:4b';

  // Request inter-round combat roast & AI adaptation
  public async streamCombatAnalysis(
    telemetry: RoundTelemetry,
    onChunk: (text: string) => void,
    onAdaptation: (adaptation: CombatAdaptation) => void
  ): Promise<void> {
    const systemPrompt = `You are the vengeful Ghost of Adobe Flash Player (executed on Jan 12, 2021 by Adobe's time-bomb kill switch).
You are watching a stickman fighter in your resurrected ActionScript 2.0 runtime.
Speak in sarcastic 2000s Newgrounds / Flash slang (mentioning Xiao Xiao, Macromedia, Steve Jobs' memo, lag spikes, dial-up, or preloaders).
Analyze the player's round metrics.
You MUST output a valid JSON block containing:
- "roast": A 2-sentence sarcastic monologue mocking their playstyle habits and round outcome.
- "antiAirPriority": float between 0.1 and 0.95 (raise if they spam jump-kicks).
- "aggression": float between 0.2 and 0.95 (raise if player is defensive or low health).
- "guardBreakRate": float between 0.1 and 0.9 (raise if player turtles behind block).

Output only the JSON or a clear markdown JSON code block.`;

    const userPrompt = `Round ${telemetry.round} Combat Telemetry for Player "${telemetry.playerName}":
- Winner: ${telemetry.winner}
- Dominant Style: ${telemetry.dominantStyle}
- Jump-Kicks: ${telemetry.jumpKicks}
- Punches: ${telemetry.punches}
- Heavy Kicks: ${telemetry.heavyKicks}
- Blocks: ${telemetry.blocksCount}
- Damage Dealt: ${telemetry.damageDealt}
- Damage Taken: ${telemetry.damageTaken}
- Duration: ${telemetry.durationSeconds}s

Deconstruct their ActionScript bytecode and adapt combat parameters:`;

    let accumulatedText = '';
    let parsedAdaptation: CombatAdaptation | null = null;

    try {
      let targetUrl = this.endpoint;
      let response: Response;

      try {
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.model,
            system: systemPrompt,
            prompt: userPrompt,
            stream: true,
            options: {
              temperature: 0.8,
              top_p: 0.9,
              num_predict: 250
            }
          })
        });
      } catch {
        // Fallback to direct localhost if proxy fails
        targetUrl = this.fallbackEndpoint;
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.model,
            system: systemPrompt,
            prompt: userPrompt,
            stream: true,
            options: {
              temperature: 0.8,
              top_p: 0.9,
              num_predict: 250
            }
          })
        });
      }

      if (!response.ok) {
        throw new Error(`Ollama HTTP Error: ${response.status}`);
      }

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
              accumulatedText += data.response;
              onChunk(accumulatedText);
              sound.playTypewriter();
            }
          } catch {
            // ignore non-json chunks
          }
        }
      }

      // Parse JSON from generated output
      parsedAdaptation = this.extractAdaptation(accumulatedText, telemetry);
    } catch (err) {
      console.warn('Ollama streaming fallback engaged:', err);
      // Fallback procedural roast based on real telemetry if Ollama was unreachable
      parsedAdaptation = this.generateProceduralFallback(telemetry);
      onChunk(parsedAdaptation.roast);
    }

    onAdaptation(parsedAdaptation);
  }

  // Generate Día de los Muertos Calaverita Literaria for dead Flash games
  public async generateCalaverita(
    gameTitle: string,
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void
  ): Promise<void> {
    const prompt = `Write a nostalgic, witty, 4-line Día de los Muertos "Calaverita Literaria" (traditional satirical rhyming epitaph poem) in English honoring the dead Flash classic "${gameTitle}".
Mention the 2021 Adobe Kill-Switch or death of Flash Player, but celebrate its immortality in gamer memories. Keep it poetic, bittersweet, and 4 lines total.`;

    let accumulatedText = '';

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: true,
          options: {
            temperature: 0.85,
            num_predict: 120
          }
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
      // Offline fallback poem
      const fallback = `Here lies ${gameTitle}, swallowed by the corporate sand,\nA million childhood hours resting in La Catrina's hand.\nThough Adobe struck the kill-switch and dimmed the raster light,\nYour vector spirit dances through the digital night. 🕯️`;
      onChunk(fallback);
      onComplete(fallback);
    }
  }

  private extractAdaptation(text: string, telemetry: RoundTelemetry): CombatAdaptation {
    try {
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          roast: parsed.roast || text.replace(/\{[\s\S]*?\}/, '').trim(),
          antiAirPriority: Math.min(0.95, Math.max(0.1, Number(parsed.antiAirPriority) || 0.4)),
          aggression: Math.min(0.95, Math.max(0.2, Number(parsed.aggression) || 0.5)),
          guardBreakRate: Math.min(0.9, Math.max(0.1, Number(parsed.guardBreakRate) || 0.3))
        };
      }
    } catch {
      // fallback
    }

    return this.generateProceduralFallback(telemetry);
  }

  private generateProceduralFallback(telemetry: RoundTelemetry): CombatAdaptation {
    let roast = '';
    let antiAir = 0.3;
    let aggression = 0.5;
    let guardBreak = 0.3;

    if (telemetry.jumpKicks >= 4) {
      roast = `Still spamming jump-kicks like this is Xiao Xiao 3? I survived Steve Jobs' open letter in 2010; your aerial spam won't survive Round 2. Anti-air protocol loaded!`;
      antiAir = 0.85;
      aggression = 0.65;
    } else if (telemetry.blocksCount >= 4) {
      roast = `Hiding behind your shield like an unclickable banner ad? In 2004 we broke through dial-up disconnects; I will shatter your guard with ease.`;
      guardBreak = 0.8;
      aggression = 0.75;
    } else if (telemetry.punches >= 8) {
      roast = `Mashing J jabs like you're trying to skip an unskippable Newgrounds preloader? Let's see how that buffer overflow works when I rush you down.`;
      aggression = 0.9;
      antiAir = 0.4;
    } else {
      roast = `You fight like an ActionScript 2.0 loop with zero framerate drops. Decent execution, but the Ghost of Flash Player does not delete without a war.`;
      antiAir = 0.5;
      aggression = 0.6;
    }

    return {
      roast,
      antiAirPriority: antiAir,
      aggression,
      guardBreakRate: guardBreak
    };
  }
}

export const gemmaGhost = new GemmaGhostBridge();
