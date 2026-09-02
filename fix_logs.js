const fs = require('fs');
let code = fs.readFileSync('api/index.ts', 'utf8');
code = code.replace(/console.error\\\(\`\\\[Gemini API\\\] Error with model/g, 'console.warn(`[Gemini API] Warning with model');
fs.writeFileSync('api/index.ts', code);
