import http from 'http';

export async function askGemma(prompt, system = "You are Google Gemma 3:4B, an expert TypeScript and HTML5 Canvas game systems engineer.") {
  const payload = JSON.stringify({
    model: 'gemma3:4b',
    system,
    prompt,
    stream: true,
    options: {
      temperature: 0.7,
      top_p: 0.9,
      num_predict: 600
    }
  });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let fullText = '';
      res.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.response) {
              process.stdout.write(data.response);
              fullText += data.response;
            }
          } catch {}
        }
      });
      res.on('end', () => {
        console.log('\n--- [END OF GEMMA 3:4B GENERATION] ---');
        resolve(fullText);
      });
    });

    req.on('error', (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

// CLI entry point
const inputPrompt = process.argv.slice(2).join(' ');
if (inputPrompt) {
  console.log(`[Task Dispatched to Local Gemma 3:4B]: ${inputPrompt}\n---`);
  askGemma(inputPrompt).catch(console.error);
}
