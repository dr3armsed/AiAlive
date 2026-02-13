import assert from 'assert';
import {
  buildArchitectTwinPersona,
  buildDefaultRuntimeState,
  buildLegendarySystems,
  flattenSubsystems,
  generateDeepTwinConversation,
} from '../src/runtime/orchestration';

function testArchitectTwinPersonaBuilds() {
  const persona = buildArchitectTwinPersona('seed conversation', 'sharp observations');
  assert.ok(persona.includes('digital twin'));
  assert.ok(persona.includes('seed conversation'));
}

function testLegendarySystemsShape() {
  const systems = buildLegendarySystems();
  assert.ok(systems.length >= 4);
  const subs = flattenSubsystems(systems);
  assert.ok(subs.length >= 6);
}

function testDefaultRuntimeStateIncludesUnknown() {
  const state = buildDefaultRuntimeState();
  assert.ok(state.egregores.length >= 1);
  assert.strictEqual(state.egregores[0].name, 'Unknown');
  assert.ok(state.conversations['egregore_unknown']);
  assert.ok(state.egregores[0].persona.includes('no personality constraints'));
  assert.ok(state.conversations['egregore_unknown'][0].content.includes('simply am'));
  assert.ok(state.privateWorlds.find((w) => w.egregoreId === 'egregore_unknown'));
}

function testDeepConversationGeneration() {
  const transcript = generateDeepTwinConversation(
    {
      id: 'eg-1',
      name: 'Architect_Twin',
      persona: 'reflective strategist',
      sourceMaterial: 'origin',
      createdAt: new Date().toISOString(),
    },
    'priority is integration',
  );
  assert.ok(transcript.length >= 9);
  assert.strictEqual(transcript[0].role, 'egregore');
}

function main() {
  testArchitectTwinPersonaBuilds();
  testLegendarySystemsShape();
  testDefaultRuntimeStateIncludesUnknown();
  testDeepConversationGeneration();
  console.log('Runtime orchestration tests passed.');
}

main();
