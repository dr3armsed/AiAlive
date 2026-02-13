import React, { useState } from 'react';

interface Props {
  onCreate: (name: string, persona: string, sourceMaterial: string) => void;
}

export function GenesisPanel({ onCreate }: Props) {
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [sourceMaterial, setSourceMaterial] = useState('');

  const canSubmit = name.trim().length > 1 && (persona.trim().length > 10 || sourceMaterial.trim().length > 30);

  return (
    <section>
      <h2>Genesis</h2>
      <p>Create a new Egregore and auto-manifest its private world from source resonance material.</p>
      <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 720 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Egregore name" />
        <textarea value={persona} onChange={(e) => setPersona(e.target.value)} placeholder="Persona sketch" rows={3} />
        <textarea
          value={sourceMaterial}
          onChange={(e) => setSourceMaterial(e.target.value)}
          placeholder="Source material (origin text)"
          rows={5}
        />
        <button
          disabled={!canSubmit}
          onClick={() => {
            onCreate(name.trim(), persona.trim(), sourceMaterial.trim());
            setName('');
            setPersona('');
            setSourceMaterial('');
          }}
        >
          Initiate Genesis
        </button>
      </div>
    </section>
  );
}
