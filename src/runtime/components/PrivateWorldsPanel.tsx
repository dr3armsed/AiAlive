import React from 'react';
import { RuntimeEgregore, RuntimePrivateWorld } from '../types';

interface Props {
  egregores: RuntimeEgregore[];
  worlds: RuntimePrivateWorld[];
}

export function PrivateWorldsPanel({ egregores, worlds }: Props) {
  return (
    <section>
      <h2>Private Worlds</h2>
      {worlds.length === 0 ? (
        <p>No private worlds yet. Run a Genesis cycle first.</p>
      ) : (
        <ul>
          {worlds.map((world) => {
            const owner = egregores.find((e) => e.id === world.egregoreId);
            return (
              <li key={world.id}>
                <strong>{owner?.name ?? world.egregoreId}</strong> — {world.dominantTheme}, {world.roomCount} rooms
                <br />
                <span>{world.summary}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
