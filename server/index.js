const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4000;
const app = express();
app.use(bodyParser.json());

const CONFIG_PATH = path.resolve(__dirname, 'ai-config.json');
function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { enableClaude: false };
  }
}
function writeConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

// Public config endpoint - clients can fetch runtime flags here
app.get('/api/config', (req, res) => {
  const cfg = readConfig();
  res.json(cfg);
});

// Admin endpoint - in production protect this with auth
app.post('/api/admin/enable-claude', (req, res) => {
  // naive - in real deployments require admin auth
  const { enable } = req.body || {};
  const cfg = readConfig();
  cfg.enableClaude = !!enable;
  writeConfig(cfg);
  res.json({ ok: true, enable: cfg.enableClaude });
});

// Mock AI endpoint for Claude Sonnet - returns a simple text reply
app.post('/api/ai/claude', (req, res) => {
  const { prompt } = req.body || {};
  // Simple canned response - in future, proxy to Anthropic or other provider
  const reply = `Mock Claude Sonnet response to: ${String(prompt).slice(0,200)}`;
  res.json({ text: reply });
});

// Ensure config exists
if (!fs.existsSync(CONFIG_PATH)) {
  writeConfig({ enableClaude: false });
}

app.listen(PORT, () => {
  console.log(`Mock AI server listening on http://localhost:${PORT}`);
});
