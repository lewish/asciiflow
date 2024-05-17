import {
  connect,
  connectable,
  connects,
  disconnect,
  isBoxDrawing,
} from "#asciiflow/client/characters";
import { Direction } from "#asciiflow/client/direction";
import { Layer, LayerView } from "#asciiflow/client/layer";

export function snap(scratch: Layer, committed: Layer) {
  const layer = new Layer();
  const modifiedScratch = new LayerView([scratch, layer]);
  for (const position of scratch.keys()) {
    const value = scratch.get(position);
    if (!isBoxDrawing(value)) {
      continue;
    }
    for (const direction of Direction.ALL) {
      const adjacentPosition = position.add(direction);
      // Don't snap to other scratch box drawing characters.
      if (scratch.has(adjacentPosition)) {
        continue;
      }
      const adjacentValue = committed.get(adjacentPosition);
      // Only snap to box drawing characters.
      if (!isBoxDrawing(adjacentValue)) {
        continue;
      }
      // Connect to adjacent box drawing characters.
      if (
        connects(adjacentValue, direction.opposite()) &&
        !connects(value, direction) &&
        connectable(value, direction)
      ) {
        layer.set(
          position,
          connect(modifiedScratch.get(position), [direction])
        );
      }
      // Connect adjacent box drawing characters to this character.
      if (
        connects(value, direction) &&
        !connects(adjacentValue, direction.opposite()) &&
        connectable(adjacentValue, direction.opposite())
      ) {
        layer.set(
          adjacentPosition,
          connect(adjacentValue, [direction.opposite()])
        );
      }
    }
  }
  // Unsnap from any characters that have been deleted.
  for (const position of scratch.keys()) {
    const value = scratch.get(position);
    if (value !== "" && value !== " ") {
      continue;
    }
    for (const direction of Direction.ALL) {
      const adjacentPosition = position.add(direction);
      if (scratch.has(adjacentPosition)) {
        continue;
      }
      const adjacentValue = committed.get(adjacentPosition);
      if (!isBoxDrawing(adjacentValue)) {
        continue;
      }
      if (connects(adjacentValue, direction.opposite())) {
        layer.set(
          adjacentPosition,
          disconnect(adjacentValue, direction.opposite())
        );
      }
    }
  }
  return layer;
}
