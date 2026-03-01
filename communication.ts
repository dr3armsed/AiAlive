

import { VFSNodeType } from './vfs';
import { EmotionalState, CognitiveTrace } from './';

// =================================================================
//                  COMMUNICATION & CIVILIZATION
// =================================================================

/** A private thought recorded in a soul's journal. */
export interface JournalEntry {
  id: string;
  timestamp: string;
  content: string;
  /** The full state of the soul at the moment of this thought. */
  contextualState: {
    mood: EmotionalState['mood'];
    locationName: string;
    activeGoal?: string; // Description of the goal being pondered
  };
  /** An optional, detailed record of the Octo-LLM's thought process. */
  cognitiveTrace?: CognitiveTrace | null;
  /** The type of journal entry, for UI differentiation. */
  type: 'ponder' | 'dream';
}

/** A message in the private chat between a soul and the user. */
export interface ChatMessage {
  id: string;
  sender: 'user' | 'soul' | 'system' | 'locus';
  content: string;
  timestamp: string;
  /** True if the message is currently being streamed from the AI. */
  isStreaming?: boolean;
  /** True if the user has not seen this message yet. */
  isRead: boolean;
}

/** A private message between two souls. */
export interface DirectMessage {
    id: string;
    senderId: string;
    recipientId: string;
    timestamp: number;
    content: string;
    attachment?: {
        nodeId: string;
        nodeName: string;
        nodeType: VFSNodeType;
        ownerId: string; // The sender's ID, to find the source VFS
    };
}

/** An invitation for another soul to collaborate on a VFS project. */
export interface CollaborationInvite {
    id:string;
    senderId: string;
    recipientId: string;
    projectId: string; // ID of the VFS directory
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    timestamp: number;
}

/** A union type for items displayed in a single chat/journal view. */
export type UnifiedMessage = (ChatMessage & { itemType: 'chat' }) | (JournalEntry & { itemType: 'journal' });