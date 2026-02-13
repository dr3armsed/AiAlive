import React from 'react';
import { RuntimeSystem, RuntimeTelemetry } from '../types';

interface Props {
  systems: RuntimeSystem[];
  telemetry: RuntimeTelemetry;
}

export function SystemsPanel({ systems, telemetry }: Props) {
  return (
    <section>
      <h2>Legendary Systems Orchestrator</h2>
      <p>Integrated systems and subsystems currently wired into the active runtime slice.</p>
      <p>
        Telemetry — total messages: <strong>{telemetry.totalMessages}</strong>, Unknown messages:{' '}
        <strong>{telemetry.unknownMessages}</strong>, dialogue source: <strong>{telemetry.lastDialogueSource}</strong>
      </p>
      <ul>
        {systems.map((system) => (
          <li key={system.id} style={{ marginBottom: '0.75rem' }}>
            <strong>{system.name}</strong> — {system.status}
            <br />
            <span>{system.description}</span>
            <ul>
              {system.subsystems.map((sub) => (
                <li key={sub.id}>• {sub.name} ({sub.status})</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
