// A simple deterministic avatar generator based on a string seed (e.g., the soul's name).
// This creates a simple, blocky, symmetrical pixel art avatar.

const SIZE = 16; // The size of the avatar grid (e.g., 16x16)
const SCALE = 8; // The scale factor for rendering the avatar

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export function generateAvatar(seed: string): string {
  const hash = simpleHash(seed);
  const rand = seededRandom(hash);

  const canvas = document.createElement('canvas');
  canvas.width = SIZE * SCALE;
  canvas.height = SIZE * SCALE;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return ''; // Return empty string if context cannot be created
  }

  // Generate a random color palette
  const hue = Math.floor(rand() * 360);
  const saturation = 50 + rand() * 50;
  const lightness = 40 + rand() * 20;

  const mainColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const accentColor = `hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness + 15}%)`;
  const shadowColor = `hsl(${hue}, ${saturation - 10}%, ${lightness - 15}%)`;
  const bgColor = `hsl(${(hue + 180) % 360}, 10%, 15%)`;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const grid = Array(SIZE).fill(0).map(() => Array(Math.ceil(SIZE / 2)).fill(false));

  // Fill grid with random blocks for one half
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < Math.ceil(SIZE / 2); x++) {
      if (rand() > 0.5) {
        grid[y][x] = true;
      }
    }
  }

  // Draw the symmetrical avatar
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const gridX = x < Math.ceil(SIZE / 2) ? x : SIZE - 1 - x;
      if (grid[y][gridX]) {
        // Determine color based on position
        if (y > 0 && !grid[y - 1][gridX]) {
          ctx.fillStyle = accentColor; // Top edge
        } else if (x > 0 && !grid[y][gridX-1 < 0 ? 0 : gridX-1]) {
           ctx.fillStyle = shadowColor; // Left edge shadow
        }
        else {
          ctx.fillStyle = mainColor;
        }
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
      }
    }
  }

  return canvas.toDataURL();
}
