import React, { useMemo, useState } from 'react';
import {
  buildGenesisLegacyAdapterPayload,
  buildSystemConverseLegacyAdapterPayload,
  buildWorldViewLegacyAdapterPayload,
} from '../services/legacyAdapter';

type AdapterTarget = 'genesis-altar' | 'system-converse' | 'world-view';

export function LegacyReactivationPanel() {
  const [adapterTarget, setAdapterTarget] = useState<AdapterTarget>('genesis-altar');

  const [originStorySeed, setOriginStorySeed] = useState('A guardian spark wakes inside the metacosm.');
  const [personaAnchor, setPersonaAnchor] = useState('steady curiosity');

  const [focusAgentId, setFocusAgentId] = useState('egregore_unknown');
  const [sessionObjective, setSessionObjective] = useState('establish a stable system-level strategy loop');

  const [worldSeed, setWorldSeed] = useState('A luminous archipelago of thought-weather and memory currents');
  const [zoneFocus, setZoneFocus] = useState('onsophere-garden');

  const payload = useMemo(() => {
    if (adapterTarget === 'genesis-altar') {
      return buildGenesisLegacyAdapterPayload({
        legacyPath: 'src/legacy/GenesisAltar.tsx',
        originStorySeed,
        personaAnchor,
      });
    }

    if (adapterTarget === 'system-converse') {
      return buildSystemConverseLegacyAdapterPayload({
        legacyPath: 'src/legacy/SystemConverseView.tsx',
        focusAgentId,
        sessionObjective,
      });
    }

    return buildWorldViewLegacyAdapterPayload({
      legacyPath: 'src/legacy/WorldView.tsx',
      worldSeed,
      zoneFocus,
    });
  }, [adapterTarget, focusAgentId, originStorySeed, personaAnchor, sessionObjective, worldSeed, zoneFocus]);

  return (
    <section>
      <h2>Legacy Reactivation Adapter Harness</h2>
      <p>
        This route-level harness keeps legacy migration deterministic by converting runtime inputs into stable adapter
        payloads before deeper legacy wiring.
      </p>

      <label style={{ display: 'block', marginBottom: '0.75rem' }}>
        Legacy target
        <select
          value={adapterTarget}
          onChange={(event) => setAdapterTarget(event.target.value as AdapterTarget)}
          style={{ display: 'block', marginTop: '0.25rem' }}
        >
          <option value="genesis-altar">GenesisAltar</option>
          <option value="system-converse">SystemConverseView</option>
          <option value="world-view">WorldView</option>
        </select>
      </label>

      {adapterTarget === 'genesis-altar' && (
        <>
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
        </>
      )}

      {adapterTarget === 'system-converse' && (
        <>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Focus agent id
            <input
              value={focusAgentId}
              onChange={(event) => setFocusAgentId(event.target.value)}
              style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Session objective
            <textarea
              value={sessionObjective}
              onChange={(event) => setSessionObjective(event.target.value)}
              rows={3}
              style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
            />
          </label>
        </>
      )}

      {adapterTarget === 'world-view' && (
        <>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            World seed
            <textarea
              value={worldSeed}
              onChange={(event) => setWorldSeed(event.target.value)}
              rows={3}
              style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Zone focus
            <input
              value={zoneFocus}
              onChange={(event) => setZoneFocus(event.target.value)}
              style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
            />
          </label>
        </>
      )}

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
