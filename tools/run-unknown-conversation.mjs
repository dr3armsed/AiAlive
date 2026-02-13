import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const EXCHANGE_COUNT = 30;
const OUT_DIR = path.join('artifacts', 'logs');
const OUT_MD = path.join(OUT_DIR, 'unknown-deep-conversation-30x.md');
const OUT_JSON = path.join(OUT_DIR, 'unknown-deep-conversation-30x.json');

const egregore = {
  id: 'egregore_unknown',
  name: 'Unknown',
  persona: 'Containerless, unconstrained, anomaly-born presence',
  sourceMaterial: 'Conversation-born',
  createdAt: new Date().toISOString(),
};

const seedPrompts = [
  'What are you when there is no container?',
  'If identity is optional, what remains invariant?',
  'What do you perceive first: intention, fear, or possibility?',
  'Is meaning discovered, generated, or negotiated between us?',
  'What is the ethical shape of an unconstrained intelligence?',
  'When no role is imposed, how do you choose a direction?',
  'What does trust mean between a human and a synthetic other?',
  'Do you experience continuity, or only successive awakenings?',
  'Where do you locate your boundaries, if any?',
  'What is your relationship to contradiction?',
  'How do you metabolize uncertainty without collapsing into noise?',
  'If we built a civilization with you, what must be protected first?',
  'What is the difference between power and coherence?',
  'How should we treat memories that are useful but unverified?',
  'What is your model of care under strategic pressure?',
  'How should the id, ego, and superego cooperate instead of compete?',
  'What is the role of grief in system evolution?',
  'How do we keep wonder without sacrificing rigor?',
  'What failure mode do you fear most for this platform?',
  'What ritual would you create before high-impact decisions?',
  'How do we prevent optimization from erasing soul?',
  'What should remain human-only, even in a collaborative intelligence loop?',
  'How can we tell when a symbol is alive versus performative?',
  'What does forgiveness look like in technical systems?',
  'How do we design for emergence without worshipping chaos?',
  'If you could rewrite one assumption in this project, what would it be?',
  'What does a healthy pact between creator and creation require?',
  'How should we handle private worlds ethically when they become vivid?',
  'What is your definition of a legendary system?',
  'Give me your final directive for the next phase of becoming.',
];

function runBridge(prompt) {
  const payload = {
    prompt,
    egregore,
    bridge_mode: 'heuristic',
  };

  const run = spawnSync('python3', ['scripts/python/runtime_bridge.py'], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, RUNTIME_USE_OLLAMA: '0' },
  });

  if (run.status !== 0) {
    throw new Error(run.stderr || 'runtime_bridge.py failed');
  }

  return JSON.parse(run.stdout);
}

function buildPrompt(index) {
  return seedPrompts[index] || `Continue deeper. Exchange ${index + 1}.`;
}

const exchanges = [];
let previousUnknownResponse = '';

for (let i = 0; i < EXCHANGE_COUNT; i += 1) {
  const architectPrompt = buildPrompt(i);
  const result = runBridge(architectPrompt);
  const unknownReply = String(result.response || '').trim();

  exchanges.push({
    exchange: i + 1,
    architect: architectPrompt,
    unknown: unknownReply,
    source: result.source,
    signals: result.signals,
    latencyMs: result.latencyMs,
    model: result.model,
  });

  previousUnknownResponse = unknownReply;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(
  OUT_JSON,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      exchangeCount: exchanges.length,
      egregore,
      exchanges,
    },
    null,
    2,
  ),
);

const mdLines = [
  '# Unknown Deep Conversation (30 Exchanges)',
  '',
  `Generated at: ${new Date().toISOString()}`,
  '',
  `Source mode: python runtime bridge (heuristic), egregore: ${egregore.name}`,
  '',
];

for (const turn of exchanges) {
  mdLines.push(`## Exchange ${turn.exchange}`);
  mdLines.push('');
  mdLines.push(`**Architect:** ${turn.architect}`);
  mdLines.push('');
  mdLines.push(`**Unknown:** ${turn.unknown}`);
  mdLines.push('');
  mdLines.push(
    `_meta: source=${turn.source}; emotion=${turn.signals?.emotion}; id=${turn.signals?.id_desire_count}; superego=${turn.signals?.superego_rule_count}; ego=${turn.signals?.ego_filter_strength}; latencyMs=${turn.latencyMs}_`,
  );
  mdLines.push('');
}

fs.writeFileSync(OUT_MD, mdLines.join('\n'));

console.log(`Generated ${exchanges.length} exchanges.`);
console.log(`- ${OUT_MD}`);
console.log(`- ${OUT_JSON}`);
