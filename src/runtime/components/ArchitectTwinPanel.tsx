import React, { useState } from 'react';

interface Props {
  onBirthTwin: (conversationSeed: string, observations: string) => void;
  latestTwinId?: string;
}

export function ArchitectTwinPanel({ onBirthTwin, latestTwinId }: Props) {
  const [conversationSeed, setConversationSeed] = useState('');
  const [observations, setObservations] = useState('');

  const canBirth = conversationSeed.trim().length > 30 && observations.trim().length > 20;

  return (
    <section>
      <h2>Architect Twin Protocol</h2>
      <p>
        Birth a digital version of the Architect from this conversation seed and your direct observations, then
        auto-run a deep strategic dialogue sequence.
      </p>
      <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 860 }}>
        <textarea
          rows={6}
          placeholder="Conversation seed (paste key parts of this thread)"
          value={conversationSeed}
          onChange={(e) => setConversationSeed(e.target.value)}
        />
        <textarea
          rows={5}
          placeholder="Your observations (strategy, priorities, constraints, values)"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />
        <button disabled={!canBirth} onClick={() => onBirthTwin(conversationSeed.trim(), observations.trim())}>
          Birth Architect Twin + Run Deep Conversation
        </button>
        {latestTwinId && <p>Latest twin active: <code>{latestTwinId}</code></p>}
      </div>
    </section>
  );
}
