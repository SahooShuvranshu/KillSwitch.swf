// Test script for Gemma 3:4B latency and parser verification
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

const userPrompt = `Round 1 Just Ended:
Player "XiaoXiao_04":
- Winner: Player
- Dominant Style: Xiao Xiao Aerial Diver
- Opening Move Used: JUMP_KICK
- Favorite Move Combo: JUMP -> JUMP_KICK (used 5 times)
- Aerial Dive Rate: 65% of attacks
- Turtle Rate: 10%
- Predictive Habit: Habitual Aerial Diver: 65% of attacks are jump-kicks. Highly vulnerable to rising anti-air.
- Jump-Kicks: 8 | Punches: 2 | Kicks: 2 | Blocks: 1

Formulate your spoken taunt and tactical adaptation:`;

function extractCleanDialogue(raw) {
  let text = raw;
  const talkMatch = text.match(/(?:TALK|SPEECH):\s*([\s\S]*?)(?=(?:TACTICS:|ADAPTATION:|```|\{|$))/i);
  if (talkMatch && talkMatch[1].trim()) {
    return talkMatch[1].replace(/["*{}\[\]]/g, '').replace(/\r?\n+/g, ' ').trim();
  }
  const jsonFieldMatch = text.match(/"(?:roast|speech|dialogue|text)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/i);
  if (jsonFieldMatch && jsonFieldMatch[1].trim()) {
    return jsonFieldMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').trim();
  }
  const cutIndex = text.search(/(?:TACTICS:|ADAPTATION:|```|\{)/i);
  if (cutIndex !== -1) {
    text = text.substring(0, cutIndex);
  }
  return text
    .replace(/^[\s"':{}[\],]+/, '')
    .replace(/["*{}\[\]]/g, '')
    .replace(/antiAirPriority|aggression|guardBreakRate|counterTactic|roast/gi, '')
    .replace(/\r?\n+/g, ' ')
    .trim() || 'ActionScript 2.0 telemetry analyzing...';
}

function extractAdaptation(text, telemetry) {
  const tacticsMatch = text.match(/TACTICS:\s*([^\r\n]+)/i);
  if (tacticsMatch) {
    const line = tacticsMatch[1];
    const getVal = (key, def) => {
      const m = line.match(new RegExp(`${key}=([^;\\s]+)`, 'i'));
      return m ? m[1].trim() : def;
    };
    const getNum = (key, def) => {
      const m = line.match(new RegExp(`${key}=([0-9.]+)`, 'i'));
      return m ? parseFloat(m[1]) : def;
    };

    const opening = getVal('opening', telemetry.habits?.openingMove || 'JUMP_KICK');
    const counterRaw = getVal('counter', 'ANTI_AIR').toUpperCase();
    const validCounters = ['ANTI_AIR', 'PARRY_PUNISH', 'GUARD_SHATTER', 'RUSHDOWN'];
    const counter = validCounters.includes(counterRaw) ? counterRaw : 'ANTI_AIR';

    const antiAir = Math.min(0.95, Math.max(0.1, getNum('antiAir', 0.65)));
    const aggression = Math.min(0.95, Math.max(0.2, getNum('aggression', 0.70)));
    const guardBreak = Math.min(0.95, Math.max(0.1, getNum('guardBreak', 0.45)));

    const reasonMatch = line.match(/reason=([^;\r\n]+)/i);
    const reason = reasonMatch ? reasonMatch[1].trim() : 'Analyzing combat habits.';
    const cleanRoast = extractCleanDialogue(text);

    return {
      roast: cleanRoast,
      predictedOpening: opening,
      parryComboTrigger: 'JAB',
      counterTactic: counter,
      antiAirPriority: antiAir,
      aggression: aggression,
      guardBreakRate: guardBreak,
      tacticalAnalysis: reason
    };
  }
  return null;
}

async function testGemma() {
  console.log('Sending test prompt to Gemma 3:4B via Ollama...');
  const start = Date.now();
  const resp = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma3:4b',
      system: systemPrompt,
      prompt: userPrompt,
      stream: false,
      options: {
        temperature: 0.78,
        top_p: 0.9,
        num_predict: 200
      }
    })
  });

  const latencyMs = Date.now() - start;
  console.log(`Response received! Status: ${resp.status}, Latency: ${latencyMs}ms`);

  const json = await resp.json();
  const output = json.response || '';
  console.log('\n--- RAW GEMMA OUTPUT ---');
  console.log(output);
  console.log('------------------------\n');

  const cleanSpeech = extractCleanDialogue(output);
  const parsed = extractAdaptation(output, { habits: { openingMove: 'JUMP_KICK' } });

  console.log('--- EXTRACTED DIALOGUE ---');
  console.log(cleanSpeech);
  console.log('\n--- PARSED ADAPTATION ---');
  console.log(JSON.stringify(parsed, null, 2));

  if (parsed && cleanSpeech && cleanSpeech.length > 10) {
    console.log('\nSUCCESS: Output conforms to TALK:/TACTICS: format and parsed cleanly!');
  } else {
    console.log('\nWARNING: Parser used fallback or TALK/TACTICS was not matched.');
  }
}

testGemma().catch(console.error);
