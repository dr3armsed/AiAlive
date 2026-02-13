import React, { useState } from 'react';
import { countByCategory, markedAssets } from './integrations/markedAssets';
import { GenesisPanel } from './runtime/components/GenesisPanel';
import { PrivateWorldsPanel } from './runtime/components/PrivateWorldsPanel';
import { CreationsPanel } from './runtime/components/CreationsPanel';
import { ConversationPanel } from './runtime/components/ConversationPanel';
import { ArchitectTwinPanel } from './runtime/components/ArchitectTwinPanel';
import { SystemsPanel } from './runtime/components/SystemsPanel';
import { useMetacosmRuntime } from './runtime/hooks/useMetacosmRuntime';

type Tab =
  | 'genesis'
  | 'architect-twin'
  | 'conversation'
  | 'private-worlds'
  | 'creations'
  | 'systems'
  | 'integration';

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('architect-twin');
  const [latestTwinId, setLatestTwinId] = useState<string | undefined>(undefined);
  const categoryCounts = countByCategory();
  const runtime = useMetacosmRuntime();

  return (
    <main style={{ fontFamily: 'Inter, sans-serif', padding: '2rem', lineHeight: 1.5 }}>
      <h1>AiAlive Runtime Console</h1>
      <p>
        Active slice now includes Architect Twin deep-conversation protocol and a legendary systems orchestration
        layer, alongside Genesis, Conversation, Private Worlds, and Creations.
      </p>

      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('architect-twin')}>Architect Twin</button>
        <button onClick={() => setActiveTab('genesis')}>Genesis</button>
        <button onClick={() => setActiveTab('conversation')}>Conversation</button>
        <button onClick={() => setActiveTab('private-worlds')}>Private Worlds</button>
        <button onClick={() => setActiveTab('creations')}>Creations</button>
        <button onClick={() => setActiveTab('systems')}>Systems</button>
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
        />
      )}
      {activeTab === 'private-worlds' && (
        <PrivateWorldsPanel egregores={runtime.egregores} worlds={runtime.privateWorlds} />
      )}
      {activeTab === 'creations' && (
        <CreationsPanel creations={runtime.creations} egregores={runtime.egregores} onForge={runtime.forgeCreation} />
      )}
      {activeTab === 'systems' && <SystemsPanel systems={runtime.systems} telemetry={runtime.telemetry} />}

      {activeTab === 'integration' && (
        <section>
          <h2>Marked Asset Integration Overview</h2>
          <ul>
            <li>Legacy UI assets tracked: {categoryCounts['legacy-ui']}</li>
            <li>Python subsystem assets tracked: {categoryCounts['python-subsystems']}</li>
            <li>State/artifact assets tracked: {categoryCounts['state-artifacts']}</li>
          </ul>
          <h3>Integrated Asset Manifest</h3>
          <ul>
            {markedAssets.map((asset) => (
              <li key={asset.path}>
                <code>{asset.path}</code> — {asset.category} ({asset.integration})
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
