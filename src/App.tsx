import React from 'react';
import { countByCategory, markedAssets } from './integrations/markedAssets';

export function App() {
  const categoryCounts = countByCategory();

  return (
    <main style={{ fontFamily: 'Inter, sans-serif', padding: '2rem', lineHeight: 1.5 }}>
      <h1>AiAlive Recovery Console</h1>
      <p>
        Recovery assets are now consolidated and tracked through a runtime manifest so previously parked modules
        are visible as staged integrations.
      </p>
      <p>
        Run <code>npm run merge:recovery-artifacts</code> to regenerate the unified heal/patch bundle.
      </p>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Marked Asset Integration Overview</h2>
        <ul>
          <li>Legacy UI assets tracked: {categoryCounts['legacy-ui']}</li>
          <li>Python subsystem assets tracked: {categoryCounts['python-subsystems']}</li>
          <li>State/artifact assets tracked: {categoryCounts['state-artifacts']}</li>
        </ul>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Integrated Asset Manifest</h3>
        <ul>
          {markedAssets.map((asset) => (
            <li key={asset.path}>
              <code>{asset.path}</code> — {asset.category} ({asset.integration})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
