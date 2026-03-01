
import { Room } from '../types';

export function generateMetacosm(width: number, height: number, depth: number): Room[] {
  const rooms: Room[] = [];
  const minSize = 20;

  function split(x: number, y: number, w: number, h: number, currentDepth: number) {
    if (currentDepth <= 0 || (w < minSize * 2 && h < minSize * 2)) {
      rooms.push({
        id: Math.random().toString(36).substr(2, 9),
        x: x + 2,
        y: y + 2,
        width: w - 4,
        height: h - 4,
        type: 'Chamber',
        label: getRandomRoomLabel()
      });
      return;
    }

    const splitHorizontal = w > h ? false : h > w ? true : Math.random() > 0.5;
    
    if (splitHorizontal) {
      const splitAt = minSize + Math.random() * (h - 2 * minSize);
      split(x, y, w, splitAt, currentDepth - 1);
      split(x, y + splitAt, w, h - splitAt, currentDepth - 1);
    } else {
      const splitAt = minSize + Math.random() * (w - 2 * minSize);
      split(x, y, splitAt, h, currentDepth - 1);
      split(x + splitAt, y, w - splitAt, h, currentDepth - 1);
    }
  }

  split(0, 0, width, height, depth);
  return rooms;
}

function getRandomRoomLabel() {
  const labels = [
    'Heartforge', 'Fading Archive', 'Void Repository', 
    'Aetheric Altar', 'Nexus Core', 'Ghost Terminal',
    'Cognitive Hub', 'Spectral Sanctum', 'Onospheric Port'
  ];
  return labels[Math.floor(Math.random() * labels.length)];
}
