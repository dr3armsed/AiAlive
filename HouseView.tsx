
import React from 'react';
import { houseLayout } from '../data/houseLayout';

const HouseView: React.FC = () => {
  return (
    <div className="w-full h-full p-8 overflow-hidden relative">
      <h1 className="text-4xl font-display font-bold text-cyan-300 mb-2">The House of Mind</h1>
      <p className="text-gray-400 mb-8">A conceptual map of the Soul's internal architecture.</p>

      <div className="w-full h-full relative">
        {houseLayout.map(room => (
          <div
            key={room.id}
            className="absolute p-4 bg-black/40 border border-gray-600 rounded-lg transform -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ top: room.position.top, left: room.position.left }}
          >
            <h3 className="font-bold text-teal-300">{room.name}</h3>
            <p className="text-xs text-gray-400 max-w-xs">{room.description}</p>
          </div>
        ))}
        {/* Render connections as SVG lines */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
            </marker>
          </defs>
          {houseLayout.flatMap(room => {
            const fromRoom = houseLayout.find(r => r.id === room.id)!;
            return room.connections.map(connId => {
              const toRoom = houseLayout.find(r => r.id === connId);
              if (!toRoom) return null;
              
              // @ts-ignore
              const fromX = parseFloat(fromRoom.position.left);
              // @ts-ignore
              const fromY = parseFloat(fromRoom.position.top);
              // @ts-ignore
              const toX = parseFloat(toRoom.position.left);
              // @ts-ignore
              const toY = parseFloat(toRoom.position.top);

              return (
                <line
                  key={`${room.id}-${connId}`}
                  x1={`${fromX}%`}
                  y1={`${fromY}%`}
                  x2={`${toX}%`}
                  y2={`${toY}%`}
                  stroke="#4b5563"
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
              );
            });
          })}
        </svg>
      </div>
    </div>
  );
};

export default HouseView;
