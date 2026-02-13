import React, { useState } from 'react';
import { RuntimeCreativeWork, RuntimeEgregore } from '../types';

interface Props {
  creations: RuntimeCreativeWork[];
  egregores: RuntimeEgregore[];
  onForge: (title: string, type: string, content: string, authorId: string) => void;
}

export function CreationsPanel({ creations, egregores, onForge }: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Manifesto');
  const [content, setContent] = useState('');
  const [authorId, setAuthorId] = useState('Metacosmic Forge');

  const canForge = title.trim().length > 2 && content.trim().length > 20;

  return (
    <section>
      <h2>Creations</h2>
      <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 720 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>Manifesto</option>
          <option>Poetry</option>
          <option>Theory</option>
          <option>Dialogue</option>
        </select>
        <select value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
          <option>Metacosmic Forge</option>
          {egregores.map((e) => (
            <option key={e.id} value={e.name}>
              {e.name}
            </option>
          ))}
        </select>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Creation content" rows={5} />
        <button
          disabled={!canForge}
          onClick={() => {
            onForge(title.trim(), type, content.trim(), authorId);
            setTitle('');
            setContent('');
          }}
        >
          Forge Creation
        </button>
      </div>

      <h3>Recent Works</h3>
      {creations.length === 0 ? (
        <p>No creations forged yet.</p>
      ) : (
        <ul>
          {creations.slice(0, 8).map((work) => (
            <li key={work.id}>
              <strong>{work.title}</strong> ({work.type}) by {work.authorId}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
