import React from 'react';

type Props = {
    liveState: 'idle' | 'connecting' | 'active' | 'error';
    onStop: () => void;
}

const WaveformVisualizer: React.FC = () => (
    <div className="flex items-center justify-center gap-1 h-8">
        {Array.from({ length: 7 }).map((_, i) => (
            <div
                key={i}
                className="waveform-bar w-1 bg-cyan-300 rounded-full"
                style={{ animationDelay: `${i * 150}ms` }}
            ></div>
        ))}
    </div>
);

export const LiveModeFooter: React.FC<Props> = ({ liveState, onStop }) => {
    
    const getStatusContent = () => {
        switch(liveState) {
            case 'connecting':
                return <p className="text-yellow-300 animate-pulse">Connecting to Cognitive Conduit...</p>;
            case 'active':
                return <WaveformVisualizer />;
            case 'error':
                 return <p className="text-red-400">Connection Error. Please try again.</p>;
            case 'idle':
                return <p className="text-gray-500">Session ended.</p>;
        }
    };
    
    return (
        <footer className="p-4 border-t border-purple-400/10 bg-gray-900/50 flex flex-col items-center justify-center gap-4">
            <div className="w-48 h-12 flex items-center justify-center">
                {getStatusContent()}
            </div>
            <div className="flex items-center gap-4">
                 <button
                    onClick={onStop}
                    className="px-6 py-3 text-lg font-bold bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                    End Session
                </button>
            </div>
             <p className="text-xs text-gray-500 mt-2">
                {liveState === 'active' ? 'Your microphone is live. Speak naturally.' : ' '}
            </p>
        </footer>
    );
};
