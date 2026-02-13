import React, { useState } from 'react';
import { countByCategory, markedAssets } from './integrations/markedAssets';
import { GenesisPanel } from './runtime/components/GenesisPanel';
import { PrivateWorldsPanel } from './runtime/components/PrivateWorldsPanel';
import { CreationsPanel } from './runtime/components/CreationsPanel';
import { useMetacosmRuntime } from './runtime/hooks/useMetacosmRuntime';

type Tab = 'genesis' | 'private-worlds' | 'creations' | 'integration';

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('genesis');
  const categoryCounts = countByCategory();
  const runtime = useMetacosmRuntime();

  return (
    <main style={{ fontFamily: 'Inter, sans-serif', padding: '2rem', lineHeight: 1.5 }}>
      <h1>AiAlive Runtime Console</h1>
      <p>
        Active vertical slice is now wired for Genesis → Private Worlds → Creations while still tracking legacy
        integration coverage.
      </p>

      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => setActiveTab('genesis')}>Genesis</button>
        <button onClick={() => setActiveTab('private-worlds')}>Private Worlds</button>
        <button onClick={() => setActiveTab('creations')}>Creations</button>
        <button onClick={() => setActiveTab('integration')}>Integration Manifest</button>
      </nav>

      {activeTab === 'genesis' && <GenesisPanel onCreate={runtime.createFromGenesis} />}
      {activeTab === 'private-worlds' && (
        <PrivateWorldsPanel egregores={runtime.egregores} worlds={runtime.privateWorlds} />
      )}
      {activeTab === 'creations' && (
        <CreationsPanel creations={runtime.creations} egregores={runtime.egregores} onForge={runtime.forgeCreation} />
      )}

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
