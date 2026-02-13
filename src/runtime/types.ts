export interface RuntimeEgregore {
  id: string;
  name: string;
  persona: string;
  sourceMaterial: string;
  createdAt: string;
}

export interface RuntimePrivateWorld {
  id: string;
  egregoreId: string;
  roomCount: number;
  dominantTheme: string;
  summary: string;
  createdAt: string;
}

export interface RuntimeCreativeWork {
  id: string;
  title: string;
  type: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface RuntimeMessage {
  id: string;
  egregoreId: string;
  role: 'user' | 'egregore';
  content: string;
  timestamp: string;
}

export interface RuntimeSubsystem {
  id: string;
  name: string;
  status: 'online' | 'warming' | 'offline';
}

export interface RuntimeSystem {
  id: string;
  name: string;
  status: 'online' | 'warming' | 'offline';
  description: string;
  subsystems: RuntimeSubsystem[];
}

export interface RuntimeTelemetry {
  totalMessages: number;
  unknownMessages: number;
  lastDialogueSource: 'python-bridge' | 'local-fallback' | 'none';
}
