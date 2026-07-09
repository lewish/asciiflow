import {
  connects,
  connections,
  isArrow,
  isBoxDrawing,
} from "#asciiflow/client/characters";
import { Box } from "#asciiflow/client/common";
import { UNICODE } from "#asciiflow/client/constants";
import { Direction } from "#asciiflow/client/direction";
import { Layer } from "#asciiflow/client/layer";
import { snap } from "#asciiflow/client/snap";
import { Vector } from "#asciiflow/client/vector";

const H = UNICODE.lineHorizontal;
const V = UNICODE.lineVertical;

/** A cell holds something other than empty/space. */
export function isContent(value: string) {
  return value != null && value !== "" && value !== " ";
}

/** A printable, non-box-drawing character — i.e. label/text content. */
export function isText(value: string) {
  return isContent(value) && !isBoxDrawing(value);
}

// ---------------------------------------------------------------------------
// Word detection — a maximal horizontal run of text characters.
// ---------------------------------------------------------------------------

export function detectWord(layer: Layer, position: Vector): Vector[] | null {
  if (!isText(layer.get(position))) {
    return null;
  }
  let left = position;
  let right = position;
  while (isText(layer.get(left.left()))) {
    left = left.left();
  }
  while (isText(layer.get(right.right()))) {
    right = right.right();
  }
  const cells: Vector[] = [];
  for (let x = left.x; x <= right.x; x++) {
    cells.push(new Vector(x, position.y));
  }
  return cells;
}

// ---------------------------------------------------------------------------
// Line-tip detection — the free end of a line/arrow, for extension.
// ---------------------------------------------------------------------------

export interface LineTip {
  tip: Vector;
  axis: "horizontal" | "vertical";
  /** Direction from the tip toward the rest of the line. */
  bodyDir: Direction;
  /** Arrow head character at the tip, if any. */
  arrow: string | null;
}

export function detectLineTip(layer: Layer, position: Vector): LineTip | null {
  const value = layer.get(position);
  let axis: "horizontal" | "vertical" | null = null;
  if (value === H) {
    axis = "horizontal";
  } else if (value === V) {
    axis = "vertical";
  } else if (isArrow(value)) {
    axis =
      value === UNICODE.arrowLeft || value === UNICODE.arrowRight
        ? "horizontal"
        : "vertical";
  } else {
    return null;
  }

  const dirs =
    axis === "horizontal"
      ? [Direction.LEFT, Direction.RIGHT]
      : [Direction.UP, Direction.DOWN];

  // A tip connects to the line body on exactly one side.
  const connected = dirs.filter((d) =>
    connects(layer.get(position.add(d)), d.opposite())
  );
  if (connected.length !== 1) {
    return null;
  }
  return {
    tip: position,
    axis,
    bodyDir: connected[0],
    arrow: isArrow(value) ? value : null,
  };
}

/**
 * Walks a line from its `tip` toward the body and stops at the **first** bend —
 * the pivot. Returns the cells from the tip up to and including that corner (or
 * the far end of a straight line), so a tip drag reshapes only the last segment
 * and "turns" it, leaving the rest of the line untouched.
 */
export function traceLineFromTip(
  layer: Layer,
  tip: Vector,
  bodyDir: Direction
): { cells: Vector[]; anchor: Vector } {
  const cells: Vector[] = [tip];
  let current = tip.add(bodyDir);
  for (let steps = 0; steps < 1000; steps++) {
    const value = layer.get(current);
    if (value === straightCharFor(bodyDir)) {
      cells.push(current);
      current = current.add(bodyDir);
      continue;
    }
    // First corner → it's the pivot; include it and stop.
    if (BENDS.has(value) && connects(value, bodyDir.opposite())) {
      cells.push(current);
      return { cells, anchor: current };
    }
    break; // terminal (junction / arrow / box / empty)
  }
  return { cells, anchor: cells[cells.length - 1] };
}

// ---------------------------------------------------------------------------
// Box detection — the closed rectangle enclosing a point (border or interior).
// ---------------------------------------------------------------------------

function isVerticalBorder(value: string) {
  return (
    isBoxDrawing(value) &&
    (connects(value, Direction.UP) || connects(value, Direction.DOWN))
  );
}

function isHorizontalBorder(value: string) {
  return (
    isBoxDrawing(value) &&
    (connects(value, Direction.LEFT) || connects(value, Direction.RIGHT))
  );
}

const RAY_LIMIT = 400;

function ray(
  layer: Layer,
  from: Vector,
  direction: Direction,
  predicate: (value: string) => boolean
): Vector | null {
  let position = from;
  for (let i = 0; i < RAY_LIMIT; i++) {
    position = position.add(direction);
    if (predicate(layer.get(position))) {
      return position;
    }
  }
  return null;
}

function verifyPerimeter(layer: Layer, box: Box): boolean {
  const left = box.left();
  const right = box.right();
  const top = box.top();
  const bottom = box.bottom();
  for (let x = left; x <= right; x++) {
    if (!isBoxDrawing(layer.get(new Vector(x, top)))) return false;
    if (!isBoxDrawing(layer.get(new Vector(x, bottom)))) return false;
  }
  for (let y = top; y <= bottom; y++) {
    if (!isBoxDrawing(layer.get(new Vector(left, y)))) return false;
    if (!isBoxDrawing(layer.get(new Vector(right, y)))) return false;
  }
  return true;
}

/** Ray-cast a rectangle from an interior seed cell. */
function boxFromSeed(layer: Layer, seed: Vector): Box | null {
  const left = ray(layer, seed, Direction.LEFT, isVerticalBorder);
  const right = ray(layer, seed, Direction.RIGHT, isVerticalBorder);
  const up = ray(layer, seed, Direction.UP, isHorizontalBorder);
  const down = ray(layer, seed, Direction.DOWN, isHorizontalBorder);
  if (!left || !right || !up || !down) {
    return null;
  }
  const box = new Box(new Vector(left.x, up.y), new Vector(right.x, down.y));
  // A real box has area.
  if (box.right() - box.left() < 1 || box.bottom() - box.top() < 1) {
    return null;
  }
  if (!verifyPerimeter(layer, box)) {
    return null;
  }
  return box;
}

function area(box: Box) {
  return (box.right() - box.left()) * (box.bottom() - box.top());
}

const DIAGONALS = [
  new Vector(-1, -1),
  new Vector(1, -1),
  new Vector(-1, 1),
  new Vector(1, 1),
];

const COMPONENT_LIMIT = 4000;

/**
 * The connected component of box-drawing cells reachable from `start` (4-way
 * adjacency). Returns null if it grows past a sane bound.
 */
function borderComponent(layer: Layer, start: Vector): Vector[] | null {
  const seen = new Set<string>([start.toString()]);
  const stack = [start];
  const cells: Vector[] = [];
  while (stack.length > 0) {
    const current = stack.pop();
    cells.push(current);
    if (cells.length > COMPONENT_LIMIT) {
      return null;
    }
    for (const d of Direction.ALL) {
      const next = current.add(d);
      const key = next.toString();
      if (!seen.has(key) && isBoxDrawing(layer.get(next))) {
        seen.add(key);
        stack.push(next);
      }
    }
  }
  return cells;
}

/**
 * Finds the closed box enclosing `position`. Works whether the grabbed cell is
 * on the border (corner or edge) or in the interior, and for boxes with no
 * interior (e.g. two rows tall). Returns null if there's no clean rectangle.
 * When boxes nest, the smallest enclosing one wins.
 */
export function findBox(layer: Layer, position: Vector): Box | null {
  const candidates: Box[] = [];

  // Ray-cast from interior seeds — robust for boxes with an interior, and the
  // only option when the grabbed cell is inside the box.
  const seeds: Vector[] = [];
  if (!isBoxDrawing(layer.get(position))) {
    seeds.push(position);
  } else {
    // On a border cell: seed from any neighbour off the border (a corner's
    // interior is diagonal, an edge's is orthogonal).
    for (const d of [...Direction.ALL, ...DIAGONALS]) {
      const neighbour = position.add(d);
      if (!isBoxDrawing(layer.get(neighbour))) {
        seeds.push(neighbour);
      }
    }
  }
  for (const seed of seeds) {
    const box = boxFromSeed(layer, seed);
    if (box && box.contains(position)) {
      candidates.push(box);
    }
  }

  // Trace the connected border — robust for thin boxes with no interior. The
  // bounding box of an isolated rectangle is the rectangle itself; if lines are
  // attached the bbox over-grows and the perimeter check rejects it.
  if (isBoxDrawing(layer.get(position))) {
    const component = borderComponent(layer, position);
    const bounds = component && boundingBox(component);
    if (
      bounds &&
      bounds.right() - bounds.left() >= 1 &&
      bounds.bottom() - bounds.top() >= 1 &&
      bounds.contains(position) &&
      verifyPerimeter(layer, bounds)
    ) {
      candidates.push(bounds);
    }
  }

  let best: Box | null = null;
  for (const box of candidates) {
    if (!best || area(box) < area(best)) {
      best = box;
    }
  }
  return best;
}

/** All content cells (border + interior text) within a box. */
export function cellsInBox(layer: Layer, box: Box): Vector[] {
  return layer
    .keys()
    .filter((key) => box.contains(key) && isContent(layer.get(key)));
}

// ---------------------------------------------------------------------------
// Generic move — translate a set of cells by a delta, with snapping.
// ---------------------------------------------------------------------------

export function moveCells(
  committed: Layer,
  cells: Vector[],
  delta: Vector
): Layer {
  const layer = new Layer();
  // Erase originals first.
  for (const cell of cells) {
    layer.set(cell, "");
  }
  // Then draw the translated content (overwriting erasures where they overlap).
  const protect = new Set<string>();
  for (const cell of cells) {
    const value = committed.get(cell);
    if (isContent(value)) {
      const target = cell.add(delta);
      layer.set(target, value);
      protect.add(target.toString());
    }
  }
  // Don't re-snap the moved content itself, only the structure around it.
  layer.setFrom(snap(layer, committed, protect));
  return layer;
}

// ---------------------------------------------------------------------------
// Box move that keeps attached lines connected.
// ---------------------------------------------------------------------------

export interface BoxAttachment {
  /** Border cell of the box the line attaches to. */
  anchor: Vector;
  /** Outward direction, away from the box. */
  out: Direction;
  /** The fixed endpoint the connector must still reach (arrow / junction / other box). */
  far: Vector;
  /** All connector cells between the box and `far`, including corners (erased and redrawn). */
  runCells: Vector[];
  /** The line ends in an arrow head pointing *into* the box, which rides along on a move. */
  arrowIntoBox?: boolean;
}

const BENDS = new Set([
  UNICODE.cornerTopLeft,
  UNICODE.cornerTopRight,
  UNICODE.cornerBottomRight,
  UNICODE.cornerBottomLeft,
]);

/** Where a corner turns to, given the direction we arrived travelling. */
function turnFrom(value: string, dir: Direction): Direction | null {
  for (const d of connections(value)) {
    if (d !== dir.opposite()) {
      return d;
    }
  }
  return null;
}

function straightCharFor(out: Direction) {
  return out === Direction.LEFT || out === Direction.RIGHT ? H : V;
}

/** Perimeter cells of a box paired with their outward direction(s). */
function perimeter(box: Box): Array<[Vector, Direction]> {
  const out: Array<[Vector, Direction]> = [];
  for (let x = box.left(); x <= box.right(); x++) {
    out.push([new Vector(x, box.top()), Direction.UP]);
    out.push([new Vector(x, box.bottom()), Direction.DOWN]);
  }
  for (let y = box.top(); y <= box.bottom(); y++) {
    out.push([new Vector(box.left(), y), Direction.LEFT]);
    out.push([new Vector(box.right(), y), Direction.RIGHT]);
  }
  return out;
}

/**
 * Finds lines leaving the box and follows each one — through any corners — to
 * its true terminal (an arrow, another box, a junction, or a free end). The
 * whole path (including corners) is recorded so it can be redrawn after a move.
 */
export function traceBoxAttachments(layer: Layer, box: Box): BoxAttachment[] {
  const attachments: BoxAttachment[] = [];
  for (const [anchor, out] of perimeter(box)) {
    const first = anchor.add(out);
    const firstValue = layer.get(first);

    // Case A: a straight line leaving the box, pointing back at it.
    const straightOut =
      firstValue === straightCharFor(out) &&
      connects(firstValue, out.opposite());
    // Case B: an arrow head pointing into the box, with a line behind it.
    const behind = first.add(out);
    const arrowIntoBox =
      firstValue === ARROWS.get(out.opposite()) &&
      layer.get(behind) === straightCharFor(out) &&
      connects(layer.get(behind), out.opposite());

    if (!straightOut && !arrowIntoBox) {
      continue;
    }

    const runCells: Vector[] = [];
    let dir = out;
    // For an arrow attachment, keep the arrow cell and start tracing behind it.
    let current = first;
    if (arrowIntoBox) {
      runCells.push(first);
      current = behind;
    }
    for (let steps = 0; steps < 1000; steps++) {
      const value = layer.get(current);
      if (value === straightCharFor(dir)) {
        runCells.push(current);
        current = current.add(dir);
        continue;
      }
      // Follow a corner round the bend.
      if (BENDS.has(value) && connects(value, dir.opposite())) {
        const next = turnFrom(value, dir);
        if (!next) {
          break;
        }
        runCells.push(current);
        dir = next;
        current = current.add(dir);
        continue;
      }
      break; // terminal: arrow, junction, another box, or empty
    }
    attachments.push({ anchor, out, far: current, runCells, arrowIntoBox });
  }
  return attachments;
}

const CORNERS: { [key: string]: string } = {
  "left,up": UNICODE.cornerBottomRight, // ┘
  "left,down": UNICODE.cornerTopRight, // ┐
  "right,up": UNICODE.cornerBottomLeft, // └
  "right,down": UNICODE.cornerTopLeft, // ┌
};

function cornerFor(a: Direction, b: Direction) {
  const horizontal = a === Direction.LEFT || a === Direction.RIGHT ? a : b;
  const vertical = a === Direction.UP || a === Direction.DOWN ? a : b;
  const h = horizontal === Direction.LEFT ? "left" : "right";
  const v = vertical === Direction.UP ? "up" : "down";
  return CORNERS[`${h},${v}`];
}

function drawStraight(layer: Layer, from: Vector, to: Vector, excludeEnd: boolean) {
  const step = new Vector(Math.sign(to.x - from.x), Math.sign(to.y - from.y));
  const char = step.x !== 0 ? H : V;
  let p = from;
  while (true) {
    if (!(excludeEnd && p.equals(to))) {
      layer.set(p, char);
    }
    if (p.equals(to)) {
      break;
    }
    p = p.add(step);
  }
}

const ARROWS = new Map<Direction, string>([
  [Direction.LEFT, UNICODE.arrowLeft],
  [Direction.RIGHT, UNICODE.arrowRight],
  [Direction.UP, UNICODE.arrowUp],
  [Direction.DOWN, UNICODE.arrowDown],
]);

/**
 * Draws an L-shaped connector from `from` (leaving the box) to `to`. `to` is
 * never overwritten unless it was an arrow head, in which case it's re-pointed
 * to match the direction the connector now approaches it from.
 */
function drawConnector(
  layer: Layer,
  from: Vector,
  to: Vector,
  out: Direction,
  farValue: string
) {
  if (from.equals(to)) {
    return;
  }
  const horizontalFirst = out === Direction.LEFT || out === Direction.RIGHT;
  const bend = horizontalFirst
    ? new Vector(to.x, from.y)
    : new Vector(from.x, to.y);

  // First leg leaves the box; exclude `bend` if it coincides with the far end.
  drawStraight(layer, from, bend, bend.equals(to));
  let approach = out;
  if (!bend.equals(to)) {
    drawStraight(layer, bend, to, true);
    approach = new Vector(
      Math.sign(to.x - bend.x),
      Math.sign(to.y - bend.y)
    ) as Direction;
  }
  if (!bend.equals(from) && !bend.equals(to)) {
    const next = horizontalFirst
      ? to.y > bend.y
        ? Direction.DOWN
        : Direction.UP
      : to.x > bend.x
      ? Direction.RIGHT
      : Direction.LEFT;
    layer.set(bend, cornerFor(out.opposite(), next));
  }
  // Keep an arrow head pointing the way the line now arrives.
  if (isArrow(farValue)) {
    for (const [dir, char] of ARROWS) {
      if (dir.x === approach.x && dir.y === approach.y) {
        layer.set(to, char);
      }
    }
  }
}

/**
 * Moves a box (border + contents) by `delta`, redrawing each attached line so it
 * stays connected: the far end stays put and the connector reflows (with a bend
 * when the move isn't parallel to the line).
 */
export function moveBoxWithAttachments(
  committed: Layer,
  box: Box,
  attachments: BoxAttachment[],
  delta: Vector
): Layer {
  const layer = new Layer();
  const content = cellsInBox(committed, box);

  // Erase the box and the old connector runs.
  for (const cell of content) {
    layer.set(cell, "");
  }
  for (const attachment of attachments) {
    for (const cell of attachment.runCells) {
      layer.set(cell, "");
    }
  }
  // Redraw the box at its new home.
  for (const cell of content) {
    const value = committed.get(cell);
    if (isContent(value)) {
      layer.set(cell.add(delta), value);
    }
  }
  // Reconnect each attachment from the moved edge to its (fixed) far end.
  for (const attachment of attachments) {
    const newAnchor = attachment.anchor.add(attachment.out).add(delta);
    drawConnector(
      layer,
      newAnchor,
      attachment.far,
      attachment.out,
      committed.get(attachment.far)
    );
    // An arrow that terminates into the box rides along, still pointing in.
    if (attachment.arrowIntoBox) {
      layer.set(newAnchor, ARROWS.get(attachment.out.opposite()));
    }
  }

  // Protect the moved box's own cells from normalisation — only the connectors
  // and the structure left behind should be tidied, never the box itself.
  const protect = new Set(content.map((cell) => cell.add(delta).toString()));
  layer.setFrom(snap(layer, committed, protect));
  return layer;
}

/** Bounding box of an arbitrary set of cells. */
export function boundingBox(cells: Vector[]): Box | null {
  if (cells.length === 0) {
    return null;
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const cell of cells) {
    minX = Math.min(minX, cell.x);
    minY = Math.min(minY, cell.y);
    maxX = Math.max(maxX, cell.x);
    maxY = Math.max(maxY, cell.y);
  }
  return new Box(new Vector(minX, minY), new Vector(maxX, maxY));
}
