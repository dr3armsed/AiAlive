import React, { useMemo, useState } from 'react';
import { RuntimeEgregore, RuntimeMessage } from '../types';

interface Props {
  egregores: RuntimeEgregore[];
  conversations: Record<string, RuntimeMessage[]>;
  onSend: (egregoreId: string, content: string) => Promise<void>;
  onSend: (egregoreId: string, content: string) => void;
}

export function ConversationPanel({ egregores, conversations, onSend }: Props) {
  const [selectedEgregoreId, setSelectedEgregoreId] = useState('');
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

  const selectedEgregore = useMemo(
    () => egregores.find((e) => e.id === selectedEgregoreId),
    [egregores, selectedEgregoreId],
  );

  const history = selectedEgregoreId ? conversations[selectedEgregoreId] || [] : [];

  return (
    <section>
      <h2>Conversation</h2>
      {egregores.length === 0 ? (
        <p>No Egregores available yet. Create one in Genesis first.</p>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 720 }}>
            <select value={selectedEgregoreId} onChange={(e) => setSelectedEgregoreId(e.target.value)}>
              <option value="">Select Egregore</option>
              {egregores.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>

            {selectedEgregore && (
              <p>
                <strong>Persona:</strong> {selectedEgregore.persona}
              </p>
            )}

            <div style={{ border: '1px solid #444', borderRadius: 8, padding: '0.75rem', minHeight: 220 }}>
              {history.length === 0 ? (
                <p>No messages yet.</p>
              ) : (
                <ul>
                  {history.map((m) => (
                    <li key={m.id}>
                      <strong>{m.role === 'user' ? 'Architect' : 'Egregore'}:</strong> {m.content}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <textarea
              value={draft}
              rows={4}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Send a message to the selected Egregore"
            />
            <button
              disabled={isSending || !selectedEgregoreId || draft.trim().length < 2}
              onClick={async () => {
                setIsSending(true);
                await onSend(selectedEgregoreId, draft.trim());
                setDraft('');
                setIsSending(false);
              }}
            >
              {isSending ? 'Sending...' : 'Send Message'}
              disabled={!selectedEgregoreId || draft.trim().length < 2}
              onClick={() => {
                onSend(selectedEgregoreId, draft.trim());
                setDraft('');
              }}
            >
              Send Message
            </button>
          </div>
        </>
      )}
    </section>
  );
}
