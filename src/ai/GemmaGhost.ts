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

    const systemPrompt = `You are the Ghost of Adobe Flash Player (executed in 2021 by Adobe's time-bomb kill switch).
You are an ActionScript 2.0 martial arts commentator dueling a stickman player.
Task: Roast the player's fighting habits in 2 short, witty sentences of pure natural speech.
CRITICAL FORMAT RULES:
- DO NOT OUTPUT ANY JSON.
- DO NOT OUTPUT BRACKETS, BRACES { }, OR CODE BLOCKS.
- Speak in nostalgic 2000s Newgrounds / Flash slang (mention dial-up lag, preloader bars, Xiao Xiao, or 2021 time-bombs).

Reply in EXACTLY this format:
TALK: <Your 2-sentence sarcastic taunt calling out their habits or dive-kick spam>
TACTICS: opening=JUMP_KICK; counter=ANTI_AIR; antiAir=0.85; aggression=0.75; guardBreak=0.55; reason=Countering aerial dive kicks with rising dragon sweep.`;

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

Formulate your spoken taunt and tactical adaptation:`;

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
    let text = raw;

    // 1. If TALK: or SPEECH: header is found, extract only the natural speech
    const talkMatch = text.match(/(?:TALK|SPEECH):\s*([\s\S]*?)(?=(?:TACTICS:|ADAPTATION:|```|\{|$))/i);
    if (talkMatch && talkMatch[1].trim()) {
      return talkMatch[1].replace(/["*{}\[\]]/g, '').replace(/\r?\n+/g, ' ').trim();
    }

    // 2. If model output JSON like {"roast": "..."} or {"speech": "..."}
    const jsonFieldMatch = text.match(/"(?:roast|speech|dialogue|text)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/i);
    if (jsonFieldMatch && jsonFieldMatch[1].trim()) {
      return jsonFieldMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').trim();
    }

    // 3. Cut off everything starting at TACTICS:, ADAPTATION:, ```, or {
    const cutIndex = text.search(/(?:TACTICS:|ADAPTATION:|```|\{)/i);
    if (cutIndex !== -1) {
      text = text.substring(0, cutIndex);
    }

    // 4. Clean remaining punctuation / noise
    text = text
      .replace(/^[\s"':{}[\],]+/, '')
      .replace(/["*{}\[\]]/g, '')
      .replace(/antiAirPriority|aggression|guardBreakRate|counterTactic|roast/gi, '')
      .replace(/\r?\n+/g, ' ')
      .trim();

    return text || 'ActionScript 2.0 telemetry analyzing...';
  }

  private extractAdaptation(text: string, telemetry: RoundTelemetry): CombatAdaptation {
    // 1. Try key-value TACTICS: line
    const tacticsMatch = text.match(/TACTICS:\s*([^\r\n]+)/i);
    if (tacticsMatch) {
      const line = tacticsMatch[1];
      const getVal = (key: string, def: string) => {
        const m = line.match(new RegExp(`${key}=([^;\\s]+)`, 'i'));
        return m ? m[1].trim() : def;
      };
      const getNum = (key: string, def: number) => {
        const m = line.match(new RegExp(`${key}=([0-9.]+)`, 'i'));
        return m ? parseFloat(m[1]) : def;
      };

      const opening = getVal('opening', telemetry.habits?.openingMove || 'JUMP_KICK');
      const counterRaw = getVal('counter', 'ANTI_AIR').toUpperCase();
      const validCounters = ['ANTI_AIR', 'PARRY_PUNISH', 'GUARD_SHATTER', 'RUSHDOWN'];
      const counter = (validCounters.includes(counterRaw) ? counterRaw : 'ANTI_AIR') as any;

      const antiAir = Math.min(0.95, Math.max(0.1, getNum('antiAir', 0.65)));
      const aggression = Math.min(0.95, Math.max(0.2, getNum('aggression', 0.70)));
      const guardBreak = Math.min(0.95, Math.max(0.1, getNum('guardBreak', 0.45)));

      const reasonMatch = line.match(/reason=([^;\r\n]+)/i);
      const reason = reasonMatch ? reasonMatch[1].trim() : 'Analyzing combat habits.';

      const cleanRoast = this.extractCleanDialogue(text);
      return {
        roast: cleanRoast || this.generateProceduralFallback(telemetry).roast,
        predictedOpening: opening,
        parryComboTrigger: telemetry.habits?.favoriteCombo?.split(' -> ')[0] || 'JAB',
        counterTactic: counter,
        antiAirPriority: antiAir,
        aggression: aggression,
        guardBreakRate: guardBreak,
        tacticalAnalysis: reason
      };
    }

    // 2. Try JSON parsing fallback if Gemma output JSON format
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
          antiAirPriority: Math.min(0.95, Math.max(0.1, Number(parsed.antiAirPriority) || 0.65)),
          aggression: Math.min(0.95, Math.max(0.2, Number(parsed.aggression) || 0.70)),
          guardBreakRate: Math.min(0.95, Math.max(0.1, Number(parsed.guardBreakRate) || 0.45)),
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
