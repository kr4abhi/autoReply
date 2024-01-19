// tokens.js
const fs = require('fs').promises;
const path = require('path');
const process = require('process');

const TOKEN_PATH = path.join(process.cwd(), 'tokens.json');

async function readTokens() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

async function writeTokens(tokens) {
  const content = JSON.stringify(tokens);
  await fs.writeFile(TOKEN_PATH, content);
}

module.exports = {
  readTokens,
  writeTokens,
  TOKEN_PATH,  // Export TOKEN_PATH for reference in other modules
};
