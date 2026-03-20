import React, { useEffect, useMemo, useState } from 'react';
import { RuntimeEgregore, RuntimeInteractionPreferences, RuntimeMessage, DialogueSource } from '../types';

interface Props {
  egregores: RuntimeEgregore[];
  conversations: Record<string, RuntimeMessage[]>;
  onSend: (egregoreId: string, content: string) => Promise<void>;
  lastDialogueSource: DialogueSource;
  preferences: RuntimeInteractionPreferences;
  onPreferencesChange: (next: RuntimeInteractionPreferences) => void;
}

const QUICK_PROMPTS = [
  'Unknown, summarize your current strategic stance in three bullets.',
  'What changed in your emotional profile after the last exchange?',
  'Propose one concrete next action and one associated risk.',
];

export function ConversationPanel({
  egregores,
  conversations,
  onSend,
  lastDialogueSource,
  preferences,
  onPreferencesChange,
}: Props) {
  const [selectedEgregoreId, setSelectedEgregoreId] = useState('');
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!selectedEgregoreId && egregores.length > 0) {
      setSelectedEgregoreId(egregores[0].id);
    }
  }, [egregores, selectedEgregoreId]);

  const selectedEgregore = useMemo(
    () => egregores.find((egregore) => egregore.id === selectedEgregoreId),
    [egregores, selectedEgregoreId],
  );

  const history = selectedEgregoreId ? conversations[selectedEgregoreId] || [] : [];
  const conversationStats = useMemo(() => {
    const userMessages = history.filter((message) => message.role === 'user').length;
    const egregoreMessages = history.length - userMessages;
    const approxTokens = Math.round(history.reduce((acc, message) => acc + message.content.length / 4, 0));

    return {
      userMessages,
      egregoreMessages,
      totalMessages: history.length,
      approxTokens,
    };
  }, [history]);

  return (
    <section>
      <h2>Conversation</h2>
      {egregores.length === 0 ? (
        <p>No Egregores available yet. Create one in Genesis first.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 760 }}>
          <select value={selectedEgregoreId} onChange={(event) => setSelectedEgregoreId(event.target.value)}>
            <option value="">Select Egregore</option>
            {egregores.map((egregore) => (
              <option key={egregore.id} value={egregore.id}>
                {egregore.name}
              </option>
            ))}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <label>
              Style mode
              <select
                value={preferences.styleMode}
                onChange={(event) =>
                  onPreferencesChange({ ...preferences, styleMode: event.target.value as RuntimeInteractionPreferences['styleMode'] })
                }
              >
                <option value="adaptive">Adaptive</option>
                <option value="poetic">Poetic</option>
                <option value="tactical">Tactical</option>
              </select>
            </label>
            <label>
              Source mode
              <select
                value={preferences.sourceMode}
                onChange={(event) =>
                  onPreferencesChange({ ...preferences, sourceMode: event.target.value as RuntimeInteractionPreferences['sourceMode'] })
                }
              >
                <option value="auto">Auto</option>
                <option value="external-first">External-first</option>
                <option value="local-first">Local-first</option>
              </select>
            </label>
            <label>
              Memory depth ({preferences.memoryDepth})
              <input
                type="range"
                min={1}
                max={10}
                value={preferences.memoryDepth}
                onChange={(event) => onPreferencesChange({ ...preferences, memoryDepth: Number(event.target.value) })}
              />
            </label>
          </div>

          {selectedEgregore && (
            <div style={{ display: 'grid', gap: '0.25rem' }}>
              <p>
                <strong>Persona:</strong> {selectedEgregore.persona}
              </p>
              <p>
                <strong>Dialogue source:</strong> {lastDialogueSource}
              </p>
              <p>
                <strong>Messages:</strong> {conversationStats.totalMessages} ({conversationStats.userMessages} user /{' '}
                {conversationStats.egregoreMessages} egregore) · approx tokens {conversationStats.approxTokens}
              </p>
            </div>
          )}

          <div style={{ border: '1px solid #444', borderRadius: 8, padding: '0.75rem', minHeight: 220 }}>
            {history.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              <ul style={{ display: 'grid', gap: '0.5rem' }}>
                {history.map((message) => (
                  <li key={message.id}>
                    <strong>{message.role === 'user' ? 'Architect' : 'Egregore'}:</strong> {message.content}
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{new Date(message.timestamp).toLocaleTimeString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <textarea
            value={draft}
            rows={4}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={async (event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                if (isSending || !selectedEgregoreId || draft.trim().length < 2) return;
                setIsSending(true);
                await onSend(selectedEgregoreId, draft.trim());
                setDraft('');
                setIsSending(false);
              }
            }}
            placeholder="Send a message to the selected Egregore"
          />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt} type="button" onClick={() => setDraft(prompt)} style={{ fontSize: '0.85rem' }}>
                Use prompt
              </button>
            ))}
          </div>
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
          </button>
          <small>Tip: press Ctrl/Cmd + Enter to send quickly.</small>
        </div>
      )}
    </section>
  );
}
