import {
  connect,
  connectable,
  connectionGlyph,
  connects,
  disconnect,
  isArrow,
  isBoxDrawing,
} from "#asciiflow/client/characters";
import { Direction } from "#asciiflow/client/direction";
import { Layer, LayerView } from "#asciiflow/client/layer";
import { Vector } from "#asciiflow/client/vector";

export function snap(
  scratch: Layer,
  committed: Layer,
  // Cells we must NOT normalise — the content being moved/drawn (e.g. a moved
  // box). We tidy the structure around it, never the thing itself.
  protect: Set<string> = new Set()
) {
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
      // Connect adjacent box drawing characters to this character. Base this on
      // the accumulated value so a cell that gains connections from several
      // neighbours in one pass keeps all of them (e.g. ┼), rather than the last
      // one clobbering the rest and leaving a side disconnected.
      const currentAdjacent = layer.has(adjacentPosition)
        ? layer.get(adjacentPosition)
        : adjacentValue;
      if (
        connects(value, direction) &&
        !connects(currentAdjacent, direction.opposite()) &&
        connectable(currentAdjacent, direction.opposite())
      ) {
        layer.set(
          adjacentPosition,
          connect(currentAdjacent, [direction.opposite()])
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
      // Accumulate, so a cell next to several deleted cells loses each
      // connection rather than only the last-processed one.
      const currentAdjacent = layer.has(adjacentPosition)
        ? layer.get(adjacentPosition)
        : adjacentValue;
      if (connects(currentAdjacent, direction.opposite())) {
        layer.set(
          adjacentPosition,
          disconnect(currentAdjacent, direction.opposite())
        );
      }
    }
  }

  // Normalisation pass: make each affected line/junction glyph match the
  // neighbours it actually connects to. This cleans up the "obviously wrong"
  // leftovers when cells compete during a move — a ┤ whose left wall left
  // becomes │, a stray ┼ becomes the right T, a moved box's ├ settles to ┌, etc.
  const stateAt = (position: Vector) => {
    const key = position.toString();
    if (layer.map.has(key)) {
      const value = layer.map.get(key);
      return value === "" || value === " " ? null : value;
    }
    if (scratch.map.has(key)) {
      const value = scratch.map.get(key);
      return value === "" || value === " " ? null : value;
    }
    return committed.get(position);
  };

  // Candidates: the cells touched by this change and their neighbours, EXCEPT
  // the protected content (the box being moved). This lets generated connectors
  // and the surrounding structure tidy up, while never mutating what you're
  // actually moving.
  const candidates = new Set<string>();
  const consider = (position: Vector) => {
    const key = position.toString();
    if (!protect.has(key)) {
      candidates.add(key);
    }
  };
  for (const position of scratch.keys()) {
    consider(position);
    for (const direction of Direction.ALL) {
      consider(position.add(direction));
    }
  }

  // Two passes so a correction on one cell can inform its neighbour.
  for (let pass = 0; pass < 2; pass++) {
    for (const key of candidates) {
      const position = Vector.fromString(key);
      const value = stateAt(position);
      // Only normalise plain line/junction glyphs, never arrows or text.
      if (!isBoxDrawing(value) || isArrow(value)) {
        continue;
      }
      const dirs = Direction.ALL.filter((direction) => {
        const neighbour = stateAt(position.add(direction));
        return isBoxDrawing(neighbour) && connects(neighbour, direction.opposite());
      });
      const glyph = connectionGlyph(dirs);
      if (glyph && glyph !== value) {
        layer.set(position, glyph);
      }
    }
  }

  return layer;
}
