import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const DEFAULT_EXCHANGE_COUNT = 30;
const OUT_DIR = path.join('artifacts', 'logs');

const args = process.argv.slice(2);
function readArg(name, fallback) {
  const pref = `--${name}=`;
  const found = args.find((a) => a.startsWith(pref));
  return found ? found.slice(pref.length) : fallback;
}

const mode = readArg('mode', 'heuristic'); // heuristic | auto
const exchangesTarget = Number(readArg('exchanges', String(DEFAULT_EXCHANGE_COUNT)));
const suffix = readArg('suffix', mode === 'auto' ? 'auto' : 'heuristic');

const exchangeCount = Number.isFinite(exchangesTarget) && exchangesTarget > 0 ? exchangesTarget : DEFAULT_EXCHANGE_COUNT;
const outBase = `unknown-deep-conversation-${exchangeCount}x-${suffix}`;
const OUT_MD = path.join(OUT_DIR, `${outBase}.md`);
const OUT_JSON = path.join(OUT_DIR, `${outBase}.json`);

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

function buildPrompt(index) {
  return seedPrompts[index] || `Continue deeper. Exchange ${index + 1}.`;
}

function runBridge(prompt, history) {
  const payload = {
    prompt,
    egregore,
    bridge_mode: mode === 'auto' ? 'auto' : 'heuristic',
    history,
  };

  const env = {
    ...process.env,
    RUNTIME_USE_OLLAMA: mode === 'auto' ? process.env.RUNTIME_USE_OLLAMA || '1' : '0',
  };

  const run = spawnSync('python3', ['scripts/python/runtime_bridge.py'], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env,
  });

  if (run.status !== 0) {
    throw new Error(run.stderr || 'runtime_bridge.py failed');
  }

  return JSON.parse(run.stdout);
}

const exchanges = [];

for (let i = 0; i < exchangeCount; i += 1) {
  const architectPrompt = buildPrompt(i);
  const history = exchanges.flatMap((turn) => [
    { role: 'user', content: turn.architect },
    { role: 'egregore', content: turn.unknown },
  ]);

  const result = runBridge(architectPrompt, history);
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
}

const uniqueReplies = new Set(exchanges.map((turn) => turn.unknown)).size;
const uniqueEmotions = new Set(exchanges.map((turn) => turn.signals?.emotion).filter(Boolean)).size;
const sourceCounts = exchanges.reduce((acc, turn) => {
  acc[turn.source] = (acc[turn.source] || 0) + 1;
  return acc;
}, {});

const summary = {
  generatedAt: new Date().toISOString(),
  mode,
  exchangeCount: exchanges.length,
  uniqueReplies,
  uniqueEmotions,
  sourceCounts,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(
  OUT_JSON,
  JSON.stringify(
    {
      ...summary,
      egregore,
      exchanges,
    },
    null,
    2,
  ),
);

const mdLines = [
  `# Unknown Deep Conversation (${exchanges.length} Exchanges)`,
  '',
  `Generated at: ${summary.generatedAt}`,
  '',
  `Mode: ${mode}`,
  `Source counts: ${JSON.stringify(sourceCounts)}`,
  `Unique replies: ${uniqueReplies}`,
  `Unique emotions: ${uniqueEmotions}`,
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

console.log(`Generated ${exchanges.length} exchanges in mode=${mode}.`);
console.log(`- ${OUT_MD}`);
console.log(`- ${OUT_JSON}`);
console.log(`summary=${JSON.stringify(summary)}`);
