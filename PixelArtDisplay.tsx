import React, { useRef, useEffect } from 'react';

const PIXEL_ART_SIZE = 256;

interface PixelArtDisplayProps {
    pixelData: string;
}

const PixelArtDisplay: React.FC<PixelArtDisplayProps> = ({ pixelData }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
            const colors: string[] = JSON.parse(pixelData);
            if (!Array.isArray(colors) || colors.length !== PIXEL_ART_SIZE * PIXEL_ART_SIZE) {
                // Data is invalid, clear canvas
                ctx.clearRect(0, 0, PIXEL_ART_SIZE, PIXEL_ART_SIZE);
                return;
            }
            
            // Disable image smoothing for a crisp pixel art look
            ctx.imageSmoothingEnabled = false;

            const imageData = ctx.createImageData(PIXEL_ART_SIZE, PIXEL_ART_SIZE);
            for (let i = 0; i < colors.length; i++) {
                const color = colors[i];
                // Basic hex to RGBA conversion
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                
                const index = i * 4;
                imageData.data[index] = r;
                imageData.data[index + 1] = g;
                imageData.data[index + 2] = b;
                imageData.data[index + 3] = 255; // Alpha
            }
            
            ctx.putImageData(imageData, 0, 0);

        } catch (error) {
            console.error("Failed to parse or render pixel data:", error);
            // Clear canvas on error
            ctx.clearRect(0, 0, PIXEL_ART_SIZE, PIXEL_ART_SIZE);
        }
    }, [pixelData]);

    return (
        <div className="w-full aspect-square bg-gray-800 rounded-md overflow-hidden">
            <canvas
                ref={canvasRef}
                width={PIXEL_ART_SIZE}
                height={PIXEL_ART_SIZE}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
            />
        </div>
    );
};

export default PixelArtDisplay;
