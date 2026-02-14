import React, { useMemo, useState } from 'react';
import { buildGenesisLegacyAdapterPayload } from '../services/legacyAdapter';

export function LegacyReactivationPanel() {
  const [originStorySeed, setOriginStorySeed] = useState('A guardian spark wakes inside the metacosm.');
  const [personaAnchor, setPersonaAnchor] = useState('steady curiosity');

  const payload = useMemo(
    () =>
      buildGenesisLegacyAdapterPayload({
        legacyPath: 'src/legacy/GenesisAltar.tsx',
        originStorySeed,
        personaAnchor,
      }),
    [originStorySeed, personaAnchor],
  );

  return (
    <section>
      <h2>Legacy Reactivation Adapter (GenesisAltar)</h2>
      <p>
        This route-level harness keeps legacy migration deterministic by converting runtime inputs into a stable adapter
        payload before any deep legacy wiring.
      </p>

      <label style={{ display: 'block', marginBottom: '0.75rem' }}>
        Origin story seed
        <textarea
          value={originStorySeed}
          onChange={(event) => setOriginStorySeed(event.target.value)}
          rows={3}
          style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
        />
      </label>

      <label style={{ display: 'block', marginBottom: '0.75rem' }}>
        Persona anchor
        <input
          value={personaAnchor}
          onChange={(event) => setPersonaAnchor(event.target.value)}
          style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
        />
      </label>

      <h3>Deterministic adapter payload</h3>
      <pre
        style={{
          background: '#0f172a',
          color: '#e2e8f0',
          borderRadius: '8px',
          padding: '0.75rem',
          overflowX: 'auto',
        }}
      >
        {JSON.stringify(payload, null, 2)}
      </pre>
    </section>
  );
}
