import React, { useMemo, useState } from 'react';
import { RuntimeEgregore, RuntimePrivateWorld, RuntimeWorldMode } from '../types';
import { buildIsometricRoomLayout, getIsometricViewport } from '../services/worldVisualization';

interface Props {
  egregores: RuntimeEgregore[];
  worlds: RuntimePrivateWorld[];
  worldPresenceByEgregore: Record<string, RuntimeWorldMode>;
  onSetWorldMode: (egregoreId: string, targetMode: RuntimeWorldMode) => void;
}

type WorldViewMode = 'summary' | 'isometric';

function IsometricWorldMap({ world }: { world: RuntimePrivateWorld }) {
  const nodes = useMemo(() => buildIsometricRoomLayout(world), [world]);
  const viewport = useMemo(() => getIsometricViewport(nodes), [nodes]);

  return (
    <svg
      viewBox={`${viewport.minX} ${viewport.minY} ${viewport.width} ${viewport.height}`}
      style={{ width: '100%', maxWidth: 460, border: '1px solid #2d3748', borderRadius: 8, background: '#0f172a' }}
      role="img"
      aria-label={`${world.id} isometric room map`}
    >
      {nodes.map((node) => {
        const sizeX = 28;
        const sizeY = 14;
        const points = [
          `${node.isoX},${node.isoY - sizeY}`,
          `${node.isoX + sizeX},${node.isoY}`,
          `${node.isoX},${node.isoY + sizeY}`,
          `${node.isoX - sizeX},${node.isoY}`,
        ].join(' ');

        return (
          <g key={node.id}>
            <polygon points={points} fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            <text x={node.isoX} y={node.isoY + 4} textAnchor="middle" fill="#e2e8f0" fontSize="8">
              {node.gridX + 1}:{node.gridY + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function PrivateWorldsPanel({ egregores, worlds, worldPresenceByEgregore, onSetWorldMode }: Props) {
  const [viewMode, setViewMode] = useState<WorldViewMode>('summary');

  return (
    <section>
      <h2>Private Worlds</h2>
      <p>Egregores can transition between the shared world and their own private world.</p>
      <label style={{ display: 'inline-grid', gap: '0.25rem', marginBottom: '0.75rem' }}>
        World view mode
        <select value={viewMode} onChange={(event) => setViewMode(event.target.value as WorldViewMode)}>
          <option value="summary">Top-down Summary</option>
          <option value="isometric">2.5D Isometric</option>
        </select>
      </label>
      {worlds.length === 0 ? (
        <p>No private worlds yet. Run a Genesis cycle first.</p>
      ) : (
        <ul>
          {worlds.map((world) => {
            const owner = egregores.find((e) => e.id === world.egregoreId);
            const mode = worldPresenceByEgregore[world.egregoreId] ?? 'shared-world';
            const isInPrivateWorld = mode === 'private-world';
            return (
              <li key={world.id} style={{ marginBottom: '0.75rem' }}>
                <strong>{owner?.name ?? world.egregoreId}</strong> — {world.dominantTheme}, {world.roomCount} rooms
                <br />
                <span>{world.summary}</span>
                <div style={{ marginTop: '0.35rem' }}>
                  <small>
                    Current location: <strong>{isInPrivateWorld ? 'Private World' : 'Shared World'}</strong>
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => onSetWorldMode(world.egregoreId, 'shared-world')}
                    disabled={!isInPrivateWorld}
                  >
                    Return to Shared World
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetWorldMode(world.egregoreId, 'private-world')}
                    disabled={isInPrivateWorld}
                  >
                    Enter Private World
                  </button>
                </div>
                {viewMode === 'isometric' && <IsometricWorldMap world={world} />}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
