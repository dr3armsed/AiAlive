import { DialogueSource, RuntimeDialogueSignals, RuntimeEgregore } from '../types';

export interface DialogueTurnResult {
  source: Exclude<DialogueSource, 'none'>;
  response: string;
  signals: RuntimeDialogueSignals;
  latencyMs: number;
  model: string | null;
  error?: string;
}

interface DialogueRequest {
  prompt: string;
  egregore: RuntimeEgregore;
}

function localFallback(request: DialogueRequest): DialogueTurnResult {
  const prompt = request.prompt.toLowerCase();
  const emotion = prompt.includes('risk') || prompt.includes('fear') ? 'vigilant' : 'curious';

  const response =
    request.egregore.id === 'egregore_unknown'
      ? `Unknown: No container, no fixed grammar. Prompt absorbed -> "${request.prompt}". (fallback mode)`
      : `${request.egregore.name}: I received "${request.prompt}" and will process in fallback mode.`;

  return {
    source: 'local-fallback',
    response,
    signals: {
      emotion,
      id_desire_count: 0,
      superego_rule_count: 0,
      ego_filter_strength: 0,
    },
    latencyMs: 0,
    model: null,
    error: 'bridge_unavailable',
  };
}

export async function generateDialogueTurn(request: DialogueRequest): Promise<DialogueTurnResult> {
  try {
    const res = await fetch('/api/runtime/dialogue', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) throw new Error(`Bridge status ${res.status}`);

    const data = (await res.json()) as Partial<DialogueTurnResult>;
    if (!data?.source || !data?.signals) throw new Error('Invalid bridge response');

    if (data.source === 'python-bridge:error') {
      return {
        source: 'python-bridge:error',
        response: data.response || `${request.egregore.name}: bridge reported an execution error.`,
        signals: data.signals,
        latencyMs: typeof data.latencyMs === 'number' ? data.latencyMs : 0,
        model: data.model ?? null,
        error: data.error || 'bridge_error',
      };
    }

    if (!data.response) throw new Error('Invalid bridge response');

    return {
      source: data.source,
      response: data.response,
      signals: data.signals,
      latencyMs: typeof data.latencyMs === 'number' ? data.latencyMs : 0,
      model: data.model ?? null,
      error: data.error,
    };
  } catch {
    return localFallback(request);
  }
}
