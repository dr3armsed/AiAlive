import React from 'react';
import { EmotionMeter } from '../../legacy/EmotionMeter';
import { RuntimeSystem, RuntimeTelemetry } from '../types';

interface Props {
  systems: RuntimeSystem[];
  telemetry: RuntimeTelemetry;
}

function emotionToProfile(emotion: string) {
  const normalized = emotion.toLowerCase();
  if (normalized === 'warm') return { warmth: 0.9, focus: 0.5, vigilance: 0.2, curiosity: 0.6 };
  if (normalized === 'vigilant') return { warmth: 0.2, focus: 0.8, vigilance: 0.95, curiosity: 0.5 };
  if (normalized === 'curious') return { warmth: 0.5, focus: 0.7, vigilance: 0.4, curiosity: 0.95 };
  return { warmth: 0.4, focus: 0.9, vigilance: 0.5, curiosity: 0.6 };
}

export function SystemsPanel({ systems, telemetry }: Props) {
  const emotionProfile = telemetry.lastSignals ? emotionToProfile(telemetry.lastSignals.emotion) : null;

  return (
    <section>
      <h2>Legendary Systems Orchestrator</h2>
      <p>Integrated systems and subsystems currently wired into the active runtime slice.</p>
      <p>
        Telemetry — total messages: <strong>{telemetry.totalMessages}</strong>, Unknown messages:{' '}
        <strong>{telemetry.unknownMessages}</strong>, dialogue source: <strong>{telemetry.lastDialogueSource}</strong>
      </p>
      <p>
        Runtime diagnostics — latency: <strong>{telemetry.lastLatencyMs ?? 'n/a'}ms</strong>, model:{' '}
        <strong>{telemetry.lastModel ?? 'n/a'}</strong>, errors: <strong>{telemetry.errorCount}</strong>
      </p>
      <p>
        Experience mode: <strong>{telemetry.experienceMode}</strong>, style mode: <strong>{telemetry.activeStyleMode}</strong>,
        source preference: <strong>{telemetry.activeSourceMode}</strong>
      </p>

      {telemetry.lastDialogueSource === 'python-bridge:ollama' && (
        <p style={{ background: '#111827', padding: '0.5rem', borderRadius: 6 }}>
          Bridge is currently reporting <strong>Ollama</strong> as the active source. For richer stylistic variance,
          run the bridge with your external model profile enabled and compare telemetry deltas.
        </p>
      )}

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

      <ul>
        {systems.map((system) => (
          <li key={system.id} style={{ marginBottom: '0.75rem' }}>
            <strong>{system.name}</strong> — {system.status}
            <br />
            <span>{system.description}</span>
            <ul>
              {system.subsystems.map((sub) => (
                <li key={sub.id}>
                  • {sub.name} ({sub.status})
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
