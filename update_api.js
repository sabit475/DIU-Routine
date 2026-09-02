const fs = require('fs');
let code = fs.readFileSync('api/index.ts', 'utf8');

// Update models
code = code.replace(/const primaryModel = "gemini-2.5-flash";/g, 'const primaryModel = "gemini-3.7-flash";');
code = code.replace(/const fallbackModel = "gemini-2.5-pro";/g, 'const fallbackModel = "gemini-3.1-pro-preview";');

// Update JSON parse and markdown strip
const jsonParseTarget = `    const jsonStr = response?.text?.trim() || "{}";
    const data = JSON.parse(jsonStr);
    res.json(data);`;
const jsonParseReplacement = `    let jsonStr = response?.text?.trim() || "{}";
    if (jsonStr.startsWith("\`\`\`json")) {
      jsonStr = jsonStr.replace(/^\`\`\`json\\s*/, "").replace(/\\s*\`\`\`$/, "");
    } else if (jsonStr.startsWith("\`\`\`")) {
      jsonStr = jsonStr.replace(/^\`\`\`\\s*/, "").replace(/\\s*\`\`\`$/, "");
    }
    
    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (e) {
      console.error("[Gemini API] Failed to parse JSON:", jsonStr);
      throw new Error("Invalid JSON response from AI");
    }
    
    res.json({ success: true, data: data });`;
code = code.replace(jsonParseTarget, jsonParseReplacement);

fs.writeFileSync('api/index.ts', code);
