

const WIDTH = 256;
const HEIGHT = 256;

// Helper to set a pixel in our flat array
const setPixel = (data: string[], x: number, y: number, color: string) => {
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
        data[y * WIDTH + x] = color;
    }
};

// Bresenham's line algorithm for drawing lines
const drawLine = (data: string[], x0: number, y0: number, x1: number, y1: number, color: string) => {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while(true) {
        setPixel(data, x0, y0, color);
        if ((x0 === x1) && (y0 === y1)) break;
        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }
};

// Draw a filled circle
const drawCircle = (data: string[], xc: number, yc: number, r: number, color: string) => {
    for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
            if (x * x + y * y <= r * r) {
                setPixel(data, xc + x, yc + y, color);
            }
        }
    }
};

// Simple procedural generation based on keywords
export const generatePixelArtFromDescription = async (description: string): Promise<string> => {
    return new Promise(resolve => {
        const data = new Array(WIDTH * HEIGHT).fill('#000000');
        const desc = description.toLowerCase();

        // Background
        if (desc.includes('sky')) {
            let skyColor = '#87CEEB'; // Light blue default
            if (desc.includes('night') || desc.includes('purple')) skyColor = '#483D8B';
            if (desc.includes('sunset') || desc.includes('orange')) skyColor = '#FFA500';
            if (desc.includes('red')) skyColor = '#8B0000';
            for (let y = 0; y < HEIGHT; y++) {
                for (let x = 0; x < WIDTH; x++) {
                    setPixel(data, x, y, skyColor);
                }
            }
        }
        
        // Ground
        if (desc.includes('ground') || desc.includes('hill') || desc.includes('field')) {
            let groundColor = '#228B22'; // Forest green
            if (desc.includes('sand') || desc.includes('desert')) groundColor = '#F4A460';
            if (desc.includes('snow')) groundColor = '#FFFAFA';

            for (let y = Math.floor(HEIGHT * 0.7); y < HEIGHT; y++) {
                 for (let x = 0; x < WIDTH; x++) {
                    const hillOffset = Math.sin(x / 50) * 10;
                    if (y > HEIGHT * 0.7 + hillOffset) {
                        setPixel(data, x, y, groundColor);
                    }
                }
            }
        }

        // Celestial bodies
        if (desc.includes('sun')) {
            drawCircle(data, WIDTH * 0.8, HEIGHT * 0.2, 30, '#FFFF00');
        }
        if (desc.includes('moon')) {
            drawCircle(data, WIDTH * 0.2, HEIGHT * 0.2, 25, '#F0E68C');
            drawCircle(data, WIDTH * 0.2 + 10, HEIGHT * 0.2 - 5, 25, '#483D8B'); // Crescent
        }
        
        // Features
        if (desc.includes('tree')) {
            const treeX = Math.floor(WIDTH / 2);
            const treeY = Math.floor(HEIGHT * 0.7);
            // Trunk
            for (let y = treeY - 50; y <= treeY; y++) {
                for (let x = treeX - 5; x <= treeX + 5; x++) {
                    setPixel(data, x, y, '#8B4513');
                }
            }
            // Leaves
            drawCircle(data, treeX, treeY - 70, 40, '#006400');
            drawCircle(data, treeX - 20, treeY - 60, 30, '#2E8B57');
            drawCircle(data, treeX + 20, treeY - 60, 30, '#2E8B57');
        }

         if (desc.includes('tower')) {
            const towerX = Math.floor(WIDTH / 2);
            const groundY = Math.floor(HEIGHT * 0.7);
            for (let y = groundY - 150; y <= groundY; y++) {
                for (let x = towerX - 20; x <= towerX + 20; x++) {
                    setPixel(data, x, y, '#696969');
                }
            }
             for (let i=0; i < 4; i++) {
                 setPixel(data, towerX - 20 + i*13, groundY - 160, '#A9A9A9')
                 setPixel(data, towerX - 19 + i*13, groundY - 160, '#A9A9A9')
                 setPixel(data, towerX - 20 + i*13, groundY - 159, '#A9A9A9')
                 setPixel(data, towerX - 19 + i*13, groundY - 159, '#A9A9A9')
             }
        }


        resolve(JSON.stringify(data));
    });
};