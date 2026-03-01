// =================================================================
//                  VIRTUAL FILE SYSTEM (VFS)
// =================================================================

export type VFSNodeType = 'FILE' | 'DIRECTORY';
export type PermissionLevel = 'owner' | 'write' | 'read';

/** Base interface for all nodes in the virtual file system. */
interface VFSNodeBase {
  id: string;
  name: string;
  type: VFSNodeType;
  parentId: string | null;
  createdAt: number;
  modifiedAt: number;
  /** A map of Soul IDs to their permission level for this node. */
  permissions: Map<string, PermissionLevel>;
}

export interface VFile extends VFSNodeBase {
  type: 'FILE';
  content: string; // Can be raw text or base64 for binary files
  mimeType: string; // e.g., 'text/plain', 'application/javascript', 'image/png+lore'
  versionHistory: { timestamp: number; content: string }[];
  size: number; // in bytes
}

export interface VDirectory extends VFSNodeBase {
  type: 'DIRECTORY';
  children: VFSNode[];
}

export type VFSNode = VFile | VDirectory;

export type VFSAction = 
    | { type: 'CREATE_FILE', payload: { parentId: string, name: string, content?: string, mimeType?: string } }
    | { type: 'MODIFY_FILE', payload: { nodeId: string, newContent: string } }
    | { type: 'CREATE_DIRECTORY', payload: { parentId: string, name: string } }
    | { type: 'RENAME', payload: { nodeId: string, newName: string } }
    | { type: 'DELETE', payload: { nodeId: string } }
    | { type: 'MOVE', payload: { draggedId: string, targetId: string }};
