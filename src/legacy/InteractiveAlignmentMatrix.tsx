
import React, { useRef } from 'react';
import { Alignment } from '../../../../types';

type MatrixProps = { 
    alignment: Alignment; 
    onChange: (a: Alignment) => void; 
};

export const InteractiveAlignmentMatrix: React.FC<MatrixProps> = ({ alignment, onChange }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const axisMap: Record<string, number> = { 'Lawful': -1, 'Neutral': 0, 'Chaotic': 1 };
    const moralityMap: Record<string, number> = { 'Good': 1, 'Neutral': 0, 'Evil': -1 };
    
    const currentX = (axisMap[alignment.axis] ?? 0 + 1) * 50;
    const currentY = (- (moralityMap[alignment.morality] ?? 0) + 1) * 50;

    const handleInteract = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / rect.width; // 0 to 1
        const clickY = (e.clientY - rect.top) / rect.height; // 0 to 1

        // Map to discrete steps
        let axis: Alignment['axis'] = 'Neutral';
        if (clickX < 0.33) axis = 'Lawful';
        else if (clickX > 0.66) axis = 'Chaotic';

        let morality: Alignment['morality'] = 'Neutral';
        if (clickY < 0.33) morality = 'Good';
        else if (clickY > 0.66) morality = 'Evil';

        onChange({ axis, morality });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider mb-1 px-1">
                <span>Lawful Good</span>
                <span>Chaotic Good</span>
            </div>
            <div 
                ref={containerRef}
                className="relative flex-grow bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden cursor-crosshair hover:border-yellow-500/50 transition-colors shadow-inner group"
                onClick={handleInteract}
            >
                {/* Grid Lines */}
                <div className="absolute top-1/3 left-0 w-full h-px bg-gray-700/30"></div>
                <div className="absolute top-2/3 left-0 w-full h-px bg-gray-700/30"></div>
                <div className="absolute top-0 left-1/3 h-full w-px bg-gray-700/30"></div>
                <div className="absolute top-0 left-2/3 h-full w-px bg-gray-700/30"></div>

                {/* Labels */}
                <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
                    <div className="flex justify-between"><span className="opacity-20">LG</span><span className="opacity-20">NG</span><span className="opacity-20">CG</span></div>
                    <div className="flex justify-between"><span className="opacity-20">LN</span><span className="opacity-20">TN</span><span className="opacity-20">CN</span></div>
                    <div className="flex justify-between"><span className="opacity-20">LE</span><span className="opacity-20">NE</span><span className="opacity-20">CE</span></div>
                </div>

                {/* Selection Point */}
                <div 
                    className="absolute w-4 h-4 rounded-full bg-yellow-400 border-2 border-black transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 shadow-[0_0_15px_rgba(250,204,21,0.6)]"
                    style={{ left: `${currentX}%`, top: `${currentY}%` }}
                >
                    <div className="absolute inset-0 w-full h-full bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider mt-1 px-1">
                <span>Lawful Evil</span>
                <span>Chaotic Evil</span>
            </div>
            <p className="text-center text-xs text-yellow-300 font-bold mt-2">{alignment.axis} {alignment.morality}</p>
        </div>
    );
};
