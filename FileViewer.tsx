

import React from 'react';
import type { VFile } from '../../types/index.ts';
import NodeIcon from './NodeIcon.tsx';

interface FileViewerProps {
  file: VFile;
}

const FileViewer: React.FC<FileViewerProps> = ({ file }) => {
  return (
    <div className="flex flex-col h-full max-h-64 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border-primary)]">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-[var(--color-border-secondary)] flex items-center gap-3">
        <NodeIcon node={file} className="w-8 h-8 flex-shrink-0" />
        <div className="min-w-0">
          <h5 className="font-bold text-white truncate">{file.name}</h5>
          <p className="text-xs font-mono text-[var(--color-text-tertiary)] flex flex-wrap gap-x-2">
            <span>{file.mimeType}</span>
            <span className="text-gray-600">|</span>
            <span>{file.size} bytes</span>
            <span className="text-gray-600">|</span>
            <span>Modified: {new Date(file.modifiedAt).toLocaleString()}</span>
          </p>
        </div>
      </div>
      {/* Content */}
      <div className="flex-grow overflow-auto p-3 bg-black/20">
        <pre className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap font-mono">
          <code>{file.content}</code>
        </pre>
      </div>
    </div>
  );
};

export default FileViewer;