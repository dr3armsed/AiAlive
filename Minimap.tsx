
import React from 'react';
import { World, Egregore } from '../types';
import { THEMES } from '../constants';

interface MinimapProps {
  world: World;
  egregores: Egregore[];
  activeFloor: number;
  onCenterView: (coords: {x: number, y: number}) => void;
}

const Minimap: React.FC<MinimapProps> = ({ world, egregores, activeFloor, onCenterView }) => {
  const { bounds, floors } = world;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    onCenterView({ x: svgP.x, y: svgP.y });
  };

  return (
    <div className="w-48 h-40 filigree-border rounded-lg p-1 cursor-pointer">
      <svg viewBox={`0 0 ${bounds.width} ${bounds.height}`} className="w-full h-full bg-black/30" onClick={handleClick}>
        {/* Render all rooms from all floors with varying opacity */}
        {Object.values(floors).map(floor => (
          <g key={`floor-group-${floor.level}`} opacity={floor.level === activeFloor ? 1 : 0.15}>
            {floor.rooms.map(room => (
              <rect
                key={room.id}
                x={room.bounds.x}
                y={room.bounds.y}
                width={room.bounds.width}
                height={room.bounds.height}
                fill={floor.level === activeFloor ? "rgba(17, 94, 89, 0.4)" : "rgba(107, 114, 128, 0.3)"}
                stroke={floor.level === activeFloor ? "rgba(45, 212, 191, 0.5)" : "rgba(156, 163, 175, 0.4)"}
                strokeWidth="2"
              />
            ))}
          </g>
        ))}
        {/* Render Egregores */}
        <g>
          {(egregores || []).map(egregore => {
             // This guard prevents a crash if an egregore has no position data.
             if (!egregore.vector) {
                 return null;
             }
             const theme = THEMES[egregore.themeKey] || THEMES.default;
             const color = theme.baseColor;
             
             return (
              <circle
                key={egregore.id}
                cx={egregore.vector.x}
                cy={egregore.vector.y}
                r="8"
                fill={color}
                stroke="#FFF"
                strokeWidth={egregore.vector.z === activeFloor ? 3 : 1}
                opacity={egregore.vector.z === activeFloor ? 1 : 0.5}
                style={{pointerEvents: 'none'}}
              />
             )
          })}
        </g>
      </svg>
    </div>
  );
};

export default Minimap;