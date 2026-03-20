import React, { useState } from 'react';
import { ArchitectTwinPanel } from './runtime/components/ArchitectTwinPanel';
import { ConversationPanel } from './runtime/components/ConversationPanel';
import { CreationsPanel } from './runtime/components/CreationsPanel';
import { GenesisPanel } from './runtime/components/GenesisPanel';
import { PrivateWorldsPanel } from './runtime/components/PrivateWorldsPanel';
import { SystemsPanel } from './runtime/components/SystemsPanel';
import { LegacyReactivationPanel } from './runtime/components/LegacyReactivationPanel';
import { useMetacosmRuntime } from './runtime/hooks/useMetacosmRuntime';

type Tab = 'genesis' | 'architect-twin' | 'conversation' | 'private-worlds' | 'creations' | 'systems' | 'legacy-reactivation' | 'integration';

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('architect-twin');
  const [latestTwinId, setLatestTwinId] = useState<string | undefined>(undefined);
  const runtime = useMetacosmRuntime();

  return (
    <main style={{ fontFamily: 'Inter, sans-serif', padding: '2rem', lineHeight: 1.5 }}>
      <h1>AiAlive Runtime Console</h1>
      <p>
        Active slice now includes Architect Twin deep-conversation protocol and a systems orchestration layer,
        alongside Genesis, Conversation, Private Worlds, and Creations.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0 1rem' }}>
        <button
          style={{ fontWeight: runtime.experienceMode === 'guided' ? 700 : 400 }}
          onClick={() => runtime.setExperienceMode('guided')}
        >
          Guided Experience
        </button>
        <button
          style={{ fontWeight: runtime.experienceMode === 'console' ? 700 : 400 }}
          onClick={() => runtime.setExperienceMode('console')}
        >
          Full Console
        </button>
      </div>

      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('architect-twin')}>Architect Twin</button>
        <button onClick={() => setActiveTab('genesis')}>Genesis</button>
        <button onClick={() => setActiveTab('conversation')}>Conversation</button>
        <button onClick={() => setActiveTab('private-worlds')}>Private Worlds</button>
        <button onClick={() => setActiveTab('creations')}>Creations</button>
        <button onClick={() => setActiveTab('systems')}>Systems</button>
        <button onClick={() => setActiveTab('legacy-reactivation')}>Legacy Reactivation</button>
        <button onClick={() => setActiveTab('integration')}>Integration Manifest</button>
      </nav>

      {activeTab === 'architect-twin' && (
        <ArchitectTwinPanel
          latestTwinId={latestTwinId}
          onBirthTwin={(seed, observations) => {
            const twin = runtime.birthArchitectTwin(seed, observations);
            setLatestTwinId(twin.id);
            setActiveTab('conversation');
          }}
        />
      )}

      {activeTab === 'genesis' && <GenesisPanel onCreate={runtime.createFromGenesis} />}
      {activeTab === 'conversation' && (
        <ConversationPanel
          egregores={runtime.egregores}
          conversations={runtime.conversations}
          onSend={runtime.sendMessage}
          lastDialogueSource={runtime.telemetry.lastDialogueSource}
          preferences={runtime.preferences}
          onPreferencesChange={runtime.setPreferences}
        />
      )}
      {activeTab === 'private-worlds' && (
        <PrivateWorldsPanel
          egregores={runtime.egregores}
          worlds={runtime.privateWorlds}
          worldPresenceByEgregore={runtime.worldPresenceByEgregore}
          onSetWorldMode={runtime.setEgregoreWorldMode}
        />
      )}
      {activeTab === 'creations' && (
        <CreationsPanel creations={runtime.creations} egregores={runtime.egregores} onForge={runtime.forgeCreation} />
      )}
      {activeTab === 'systems' && <SystemsPanel systems={runtime.systems} telemetry={runtime.telemetry} />}
      {activeTab === 'legacy-reactivation' && <LegacyReactivationPanel />}

      {activeTab === 'integration' && (
        <section>
          <h2>Marked Asset Integration Overview</h2>
          <ul>
            <li>Runtime UI assets: active in the Vite client.</li>
            <li>Dialogue adapter: active with local fallback and bridge handoff.</li>
            <li>Browser persistence: active for snapshots, history, and created content.</li>
            <li>Legacy reactivation: staged through deterministic adapter payloads.</li>
          </ul>

          <h3>Assets not yet integrated properly</h3>
          <ul>
            <li><code>src/legacy/*</code> — preserved for progressive migration into the runtime shell.</li>
            <li><code>scripts/python/*</code> — bridge-ready, but still selectively activated.</li>
          </ul>


          <h3>Legacy UI Reactivation Queue</h3>
          <ul>
            <li><code>src/legacy/GenesisAltar.tsx</code> — next step: runtime-safe adapter + route-level harness.</li>
            <li><code>src/legacy/MemoryExplorerView.tsx</code> — next step: storage browser integration.</li>
          </ul>

          <h3>Python + Artifact Upgrade Status</h3>
          <p>
            Runtime bridge now consumes integrated Python services (dialogue/entity/persistence/oracle/theory formation)
            and stitches artifact context from recovery bundles into dialogue hints.
          </p>

          <h3>Integration Manifest</h3>
          <ul>
            <li><code>src/runtime/components/*</code> — active runtime experience panels.</li>
            <li><code>src/runtime/services/clientPersistence.ts</code> — browser-local persistence spine.</li>
            <li><code>src/runtime/services/memoryPipeline.ts</code> — conversation memory event archive.</li>
          </ul>
        </section>
      )}
    </main>
  );
}
