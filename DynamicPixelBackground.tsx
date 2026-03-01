import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PIXEL_ART_SIZE = 256;

const drawPixelArt = (canvas: HTMLCanvasElement, pixelData: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
        const colors: string[] = JSON.parse(pixelData);
        if (!Array.isArray(colors) || colors.length !== PIXEL_ART_SIZE * PIXEL_ART_SIZE) {
            ctx.clearRect(0, 0, PIXEL_ART_SIZE, PIXEL_ART_SIZE);
            return;
        }
        ctx.imageSmoothingEnabled = false;
        const imageData = ctx.createImageData(PIXEL_ART_SIZE, PIXEL_ART_SIZE);
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i] || '#000000';
            const r = parseInt(color.slice(1, 3), 16) || 0;
            const g = parseInt(color.slice(3, 5), 16) || 0;
            const b = parseInt(color.slice(5, 7), 16) || 0;
            const index = i * 4;
            imageData.data[index] = r;
            imageData.data[index + 1] = g;
            imageData.data[index + 2] = b;
            imageData.data[index + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
    } catch (error) {
        console.error("Failed to parse or render pixel data:", error);
        ctx.clearRect(0, 0, PIXEL_ART_SIZE, PIXEL_ART_SIZE);
    }
};

interface DynamicPixelBackgroundProps {
    pixelData?: string; // The current background data
}

const DynamicPixelBackground: React.FC<DynamicPixelBackgroundProps> = ({ pixelData }) => {
    const [currentBg, setCurrentBg] = useState<string | undefined>(pixelData);
    const [prevBg, setPrevBg] = useState<string | undefined>(undefined);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const prevCanvasRef = useRef<HTMLCanvasElement>(null);
    const currentCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (pixelData !== currentBg) {
            setPrevBg(currentBg);
            setCurrentBg(pixelData);
            setIsTransitioning(true);
        }
    }, [pixelData, currentBg]);

    useEffect(() => {
        if (prevCanvasRef.current && prevBg) {
            drawPixelArt(prevCanvasRef.current, prevBg);
        }
    }, [prevBg]);

    useEffect(() => {
        if (currentCanvasRef.current && currentBg) {
            drawPixelArt(currentCanvasRef.current, currentBg);
        }
    }, [currentBg]);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
            <AnimatePresence onExitComplete={() => {
                setIsTransitioning(false);
                setPrevBg(undefined);
            }}>
                {isTransitioning && prevBg && (
                    <motion.div
                        key={prevBg}
                        className="absolute inset-0 w-full h-full"
                        exit={{ opacity: 0, transition: { duration: 1.5 } }}
                    >
                         <canvas
                            ref={prevCanvasRef}
                            width={PIXEL_ART_SIZE}
                            height={PIXEL_ART_SIZE}
                            className="w-full h-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                key={currentBg || 'void'}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: isTransitioning ? 0 : 1 }}
                animate={{ opacity: 1, transition: { duration: 1.5 } }}
            >
                {currentBg ? (
                    <canvas
                        ref={currentCanvasRef}
                        width={PIXEL_ART_SIZE}
                        height={PIXEL_ART_SIZE}
                        className="w-full h-full object-cover"
                        style={{ imageRendering: 'pixelated' }}
                    />
                ) : (
                    <div className="w-full h-full bg-[#06080e]"></div>
                )}
            </motion.div>
            
            <AnimatePresence>
            {isTransitioning && (
                <motion.div
                    key="vortex"
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.5 } }}
                    exit={{ opacity: 0, transition: { delay: 1, duration: 0.5 } }}
                    style={{
                        background: 'radial-gradient(circle, transparent 0%, transparent 40%, rgba(0,0,0,0.8) 100%)',
                        maskImage: 'radial-gradient(circle, black 0%, black 40%, transparent 60%)',
                    }}
                >
                    <motion.div
                        className="w-1/2 h-1/2 rounded-full border-4 border-dashed border-cyan-400"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default DynamicPixelBackground;
