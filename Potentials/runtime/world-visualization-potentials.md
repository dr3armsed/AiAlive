# World Visualization Potentials

## Preserved snippet: synthetic isometric room projection

```ts
function projectIsometric(gridX: number, gridY: number) {
  return {
    isoX: (gridX - gridY) * (TILE_WIDTH / 2),
    isoY: (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}

export function buildIsometricRoomLayout(world: RuntimePrivateWorld): WorldRoomNode[] {
  const roomCount = Math.max(1, world.roomCount);
  const columns = Math.max(1, Math.ceil(Math.sqrt(roomCount)));

  return Array.from({ length: roomCount }, (_, index) => {
    const gridX = index % columns;
    const gridY = Math.floor(index / columns);
    const projected = projectIsometric(gridX, gridY);
    return {
      id: `${world.id}_room_${index + 1}`,
      label: `Room ${index + 1}`,
      gridX,
      gridY,
      isoX: projected.isoX,
      isoY: projected.isoY,
    };
  });
}
```

## Why it leads to something else

- Current isometric map is deterministic scaffolding from `roomCount`.
- Next step is rendering canonical room/zone entities and links.

## Promotion criteria

- Add actual `rooms[]` to runtime world schema.
- Render zone metadata, occupancy, and creation links on the map.
