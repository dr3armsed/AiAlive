import React, { useState } from 'react';
import { EmotionMeter } from '../../legacy/EmotionMeter';
import { RuntimeSystem, RuntimeTelemetry } from '../types';

interface Props {
  systems: RuntimeSystem[];
  telemetry: RuntimeTelemetry;
}

type SystemsViewMode = 'cards' | 'list';

function emotionToProfile(emotion: string) {
  const normalized = emotion.toLowerCase();
  if (normalized === 'warm') return { warmth: 0.9, focus: 0.5, vigilance: 0.2, curiosity: 0.6 };
  if (normalized === 'vigilant') return { warmth: 0.2, focus: 0.8, vigilance: 0.95, curiosity: 0.5 };
  if (normalized === 'curious') return { warmth: 0.5, focus: 0.7, vigilance: 0.4, curiosity: 0.95 };
  return { warmth: 0.4, focus: 0.9, vigilance: 0.5, curiosity: 0.6 };
}

export function SystemsPanel({ systems, telemetry }: Props) {
  const [viewMode, setViewMode] = useState<SystemsViewMode>('cards');
  const emotionProfile = telemetry.lastSignals ? emotionToProfile(telemetry.lastSignals.emotion) : null;

  return (
    <section>
      <h2>Legendary Systems Orchestrator</h2>
      <p>Integrated systems and subsystems currently wired into the active runtime slice.</p>
      <label style={{ display: 'inline-grid', gap: '0.25rem', marginBottom: '0.5rem' }}>
        Systems view mode
        <select value={viewMode} onChange={(event) => setViewMode(event.target.value as SystemsViewMode)}>
          <option value="cards">Diagnostic Cards</option>
          <option value="list">Classic List</option>
        </select>
      </label>

      <p>
        Telemetry — total messages: <strong>{telemetry.totalMessages}</strong>, Unknown messages:{' '}
        <strong>{telemetry.unknownMessages}</strong>, dialogue source: <strong>{telemetry.lastDialogueSource}</strong>
      </p>
      <p>
        Runtime diagnostics — latency: <strong>{telemetry.lastLatencyMs ?? 'n/a'}ms</strong>, model:{' '}
        <strong>{telemetry.lastModel ?? 'n/a'}</strong>, errors: <strong>{telemetry.errorCount}</strong>
      </p>
      <p>
        Browser persistence — snapshots: <strong>{telemetry.storageStats.snapshotCount}</strong>, history entries:{' '}
        <strong>{telemetry.storageStats.historyCount}</strong>, created artifacts:{' '}
        <strong>{telemetry.storageStats.createdContentCount}</strong>
      </p>
      <p>
        Substrate health — egregores: <strong>{telemetry.substrateHealth.egregoreCount}</strong>, worlds:{' '}
        <strong>{telemetry.substrateHealth.worldCount}</strong>, creations:{' '}
        <strong>{telemetry.substrateHealth.creationCount}</strong>, coherence issues:{' '}
        <strong>{telemetry.substrateHealth.coherenceIssueCount}</strong>
      </p>

      {telemetry.lastError && (
        <p>
          Last dialogue error: <strong>{telemetry.lastError}</strong>
        </p>
      )}

      {telemetry.lastSignals && (
        <>
          <p>
            Last dialogue signals — emotion: <strong>{telemetry.lastSignals.emotion}</strong>, id desires:{' '}
            <strong>{telemetry.lastSignals.id_desire_count}</strong>, superego rules:{' '}
            <strong>{telemetry.lastSignals.superego_rule_count}</strong>, ego filter:{' '}
            <strong>{telemetry.lastSignals.ego_filter_strength}</strong>
          </p>
          {emotionProfile && (
            <div style={{ display: 'grid', gap: '0.4rem', maxWidth: 360, marginBottom: '0.75rem' }}>
              {Object.entries(emotionProfile).map(([label, value]) => (
                <EmotionMeter key={label} label={label} value={value} />
              ))}
            </div>
          )}
        </>
      )}

      {viewMode === 'cards' ? (
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {systems.map((system) => (
            <article key={system.id} style={{ border: '1px solid #334155', borderRadius: 12, padding: '0.9rem' }}>
              <strong>{system.name}</strong> — {system.status}
              <p>{system.description}</p>
              <ul>
                {system.subsystems.map((subsystem) => (
                  <li key={subsystem.id}>
                    • {subsystem.name} ({subsystem.status})
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        <ul>
          {systems.map((system) => (
            <li key={system.id} style={{ marginBottom: '0.75rem' }}>
              <strong>{system.name}</strong> — {system.status}
              <br />
              <span>{system.description}</span>
              <ul>
                {system.subsystems.map((subsystem) => (
                  <li key={subsystem.id}>
                    • {subsystem.name} ({subsystem.status})
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
