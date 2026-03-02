
import React from 'react';
import { useState, useCallback } from '../../packages/react-chimera-renderer/index.ts';
import { motion, AnimatePresence } from 'framer-motion';
import UploadIcon from '../icons/UploadIcon.tsx';
import Spinner from '../Spinner.tsx';
import ShieldCheckIcon from '../icons/ShieldCheckIcon.tsx';
import XIcon from '../icons/XIcon.tsx';

const MotionDiv = motion.div as any;

interface LoreIngestorProps {
  onIngest: (content: string) => Promise<void>;
}

const LoreIngestor: React.FC<LoreIngestorProps> = ({ onIngest }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelection = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || status === 'processing') return;
    const file = Array.from(fileList).find(f => f.type.startsWith('text/') || f.name.endsWith('.md') || f.name.endsWith('.txt'));
    if (!file) {
      setErrorMessage('Invalid file type. Please use TXT or MD.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }
    
    setStatus('processing');
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        await onIngest(content);
        setStatus('success');
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to process shard.');
        setStatus('error');
      } finally {
        setTimeout(() => setStatus('idle'), 4000);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>, over: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== 'processing') setIsDragOver(over);
  }, [status]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDrag(e, false);
    if (status !== 'processing' && e.dataTransfer.files) {
      handleFileSelection(e.dataTransfer.files);
    }
  }, [status, handleFileSelection]);
  
  const handleClick = () => {
      if (status !== 'processing') {
          fileInputRef.current?.click();
      }
  };

  return (
    <div className="glass-panel p-4">
      <h3 className="text-lg font-bold text-white mb-4">Ingest Data Shard</h3>
      <MotionDiv
        onClick={handleClick}
        className="relative flex flex-col items-center justify-center w-full p-6 transition-all duration-300 bg-[var(--color-surface-inset)] rounded-xl border border-dashed cursor-pointer"
        onDragEnter={(e: any) => handleDrag(e, true)}
        onDragLeave={(e: any) => handleDrag(e, false)}
        onDragOver={(e: any) => handleDrag(e, true)}
        onDrop={handleDrop}
        variants={{
            initial: { borderColor: 'var(--color-border-secondary)' },
            hover: { borderColor: 'var(--color-border-interactive)', scale: 1.02 },
            drag: { borderColor: 'var(--color-border-glow)', scale: 1.05, background: 'rgba(188, 140, 255, 0.05)' }
        }}
        initial="initial"
        whileHover={status === 'processing' ? '' : 'hover'}
        animate={isDragOver ? 'drag' : 'initial'}
      >
        <input ref={fileInputRef} type="file" accept=".txt,.md" className="hidden" onChange={(e) => handleFileSelection(e.target.files)} />
        <AnimatePresence mode="wait">
          <MotionDiv
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center text-center"
          >
            {status === 'idle' && (
              <>
                <UploadIcon className="w-8 h-8 text-[var(--color-text-tertiary)] mb-3" />
                <p className="text-[var(--color-text-secondary)] text-sm">Drop a TXT or MD file here</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">or click to browse</p>
              </>
            )}
             {status === 'processing' && (
              <>
                <Spinner size="sm" />
                <p className="text-sm text-[var(--color-text-secondary)] mt-3">Analyzing shard...</p>
              </>
            )}
            {status === 'success' && (
              <>
                <ShieldCheckIcon className="w-8 h-8 text-green-400" />
                <p className="text-sm text-green-300 mt-3">Lore ingested successfully!</p>
              </>
            )}
            {status === 'error' && (
              <div className="flex flex-col items-center text-center">
                <XIcon className="w-8 h-8 text-red-400 mb-3" />
                <p className="text-sm text-red-400 max-w-xs">{errorMessage}</p>
              </div>
            )}
          </MotionDiv>
        </AnimatePresence>
      </MotionDiv>
    </div>
  );
};

export default LoreIngestor;
