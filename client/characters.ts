import { UNICODE } from "#asciiflow/client/constants";
import { Direction } from "#asciiflow/client/direction";

export const BOX_DRAWING_VALUES = new Set([
  "┌",
  "┐",
  "┘",
  "└",
  "─",
  "│",
  "┬",
  "┴",
  "┤",
  "├",
  "┼",
  "◄",
  "►",
  "▲",
  "▼",
]);

interface IBoxDrawingCharacterInfo {
  connections: Set<Direction>;
  connectables: Set<Direction>;
}

const BOX_DRAWING_INFO: { [key: string]: IBoxDrawingCharacterInfo } = {
  "┌": {
    connections: new Set([Direction.DOWN, Direction.RIGHT]),
    connectables: new Set(Direction.ALL),
  },
  "┐": {
    connections: new Set([Direction.DOWN, Direction.LEFT]),
    connectables: new Set(Direction.ALL),
  },
  "┘": {
    connections: new Set([Direction.UP, Direction.LEFT]),
    connectables: new Set(Direction.ALL),
  },
  "└": {
    connections: new Set([Direction.UP, Direction.RIGHT]),
    connectables: new Set(Direction.ALL),
  },
  "─": {
    connections: new Set([Direction.LEFT, Direction.RIGHT]),
    connectables: new Set(Direction.ALL),
  },
  "│": {
    connections: new Set([Direction.UP, Direction.DOWN]),
    connectables: new Set(Direction.ALL),
  },
  "┬": {
    connections: new Set([Direction.DOWN, Direction.LEFT, Direction.RIGHT]),
    connectables: new Set(Direction.ALL),
  },
  "┴": {
    connections: new Set([Direction.UP, Direction.LEFT, Direction.RIGHT]),
    connectables: new Set(Direction.ALL),
  },
  "┤": {
    connections: new Set([Direction.UP, Direction.DOWN, Direction.LEFT]),
    connectables: new Set(Direction.ALL),
  },
  "├": {
    connections: new Set([Direction.UP, Direction.DOWN, Direction.RIGHT]),
    connectables: new Set(Direction.ALL),
  },
  "┼": {
    connections: new Set([
      Direction.UP,
      Direction.DOWN,
      Direction.LEFT,
      Direction.RIGHT,
    ]),
    connectables: new Set(Direction.ALL),
  },
  "◄": {
    connections: new Set([Direction.RIGHT]),
    connectables: new Set([Direction.RIGHT]),
  },
  "►": {
    connections: new Set([Direction.LEFT]),
    connectables: new Set([Direction.LEFT]),
  },
  "▲": {
    connections: new Set([Direction.DOWN]),
    connectables: new Set([Direction.DOWN]),
  },
  "▼": {
    connections: new Set([Direction.UP]),
    connectables: new Set([Direction.UP]),
  },
};

export function connectsDown(value: string): boolean {
  return BOX_DRAWING_INFO[value]?.connections.has(Direction.DOWN);
}

export function connectsUp(value: string): boolean {
  return BOX_DRAWING_INFO[value]?.connections.has(Direction.UP);
}

export function connectsLeft(value: string): boolean {
  return BOX_DRAWING_INFO[value]?.connections.has(Direction.LEFT);
}

export function connectsRight(value: string): boolean {
  return BOX_DRAWING_INFO[value]?.connections.has(Direction.RIGHT);
}

export function isBoxDrawing(value: string): boolean {
  return BOX_DRAWING_VALUES.has(value);
}

export function isArrow(value: string): boolean {
  return (
    value === UNICODE.arrowLeft ||
    value === UNICODE.arrowRight ||
    value === UNICODE.arrowUp ||
    value === UNICODE.arrowDown
  );
}

export function connects(value: string, direction: Direction): boolean {
  return BOX_DRAWING_INFO[value]?.connections.has(direction);
}

export function connectable(value: string, direction: Direction): boolean {
  return BOX_DRAWING_INFO[value]?.connectables.has(direction);
}

export function connections(value: string): Set<Direction> {
  return BOX_DRAWING_INFO[value]?.connections ?? new Set();
}

export function connect(
  value: string,
  direction: Direction | Direction[]
): string {
  if (Array.isArray(direction)) {
    return direction.reduce(
      (value, direction) => connect(value, direction),
      value
    );
  }
  if (connects(value, direction)) {
    return value;
  }
  if (direction === Direction.UP) {
    if (value === UNICODE.lineHorizontal) {
      return UNICODE.junctionUp;
    }
    if (value === UNICODE.cornerTopLeft) {
      return UNICODE.junctionRight;
    }
    if (value === UNICODE.cornerTopRight) {
      return UNICODE.junctionLeft;
    }
    if (value === UNICODE.junctionDown) {
      return UNICODE.junctionAll;
    }
  }
  if (direction === Direction.DOWN) {
    if (value === UNICODE.lineHorizontal) {
      return UNICODE.junctionDown;
    }
    if (value === UNICODE.cornerBottomLeft) {
      return UNICODE.junctionRight;
    }
    if (value === UNICODE.cornerBottomRight) {
      return UNICODE.junctionLeft;
    }
    if (value === UNICODE.junctionUp) {
      return UNICODE.junctionAll;
    }
  }
  if (direction === Direction.LEFT) {
    if (value === UNICODE.lineVertical) {
      return UNICODE.junctionLeft;
    }
    if (value === UNICODE.cornerTopLeft) {
      return UNICODE.junctionDown;
    }
    if (value === UNICODE.cornerBottomLeft) {
      return UNICODE.junctionUp;
    }
    if (value === UNICODE.junctionRight) {
      return UNICODE.junctionAll;
    }
  }
  if (direction === Direction.RIGHT) {
    if (value === UNICODE.lineVertical) {
      return UNICODE.junctionRight;
    }
    if (value === UNICODE.cornerTopRight) {
      return UNICODE.junctionDown;
    }
    if (value === UNICODE.cornerBottomRight) {
      return UNICODE.junctionUp;
    }
    if (value === UNICODE.junctionLeft) {
      return UNICODE.junctionAll;
    }
  }
  throw new Error(`Can't connect ${value} in direction ${direction}`);
}

export function disconnect(
  value: string,
  direction: Direction | Direction[]
): string {
  if (Array.isArray(direction)) {
    return direction.reduce(
      (value, direction) => disconnect(value, direction),
      value
    );
  }
  if (!connects(value, direction)) {
    return value;
  }
  if (direction === Direction.UP) {
    if (value === UNICODE.junctionUp) {
      return UNICODE.lineHorizontal;
    }
    if (value === UNICODE.junctionRight) {
      return UNICODE.cornerTopLeft;
    }
    if (value === UNICODE.junctionLeft) {
      return UNICODE.cornerTopRight;
    }
    if (value === UNICODE.junctionAll) {
      return UNICODE.junctionDown;
    }
  }
  if (direction === Direction.DOWN) {
    if (value === UNICODE.junctionDown) {
      return UNICODE.lineHorizontal;
    }
    if (value === UNICODE.junctionRight) {
      return UNICODE.cornerBottomLeft;
    }
    if (value === UNICODE.junctionLeft) {
      return UNICODE.cornerBottomRight;
    }
    if (value === UNICODE.junctionUp) {
      return UNICODE.junctionDown;
    }
  }
  if (direction === Direction.LEFT) {
    if (value === UNICODE.junctionLeft) {
      return UNICODE.lineVertical;
    }
    if (value === UNICODE.junctionDown) {
      return UNICODE.cornerTopLeft;
    }
    if (value === UNICODE.junctionUp) {
      return UNICODE.cornerBottomLeft;
    }
    if (value === UNICODE.junctionRight) {
      return UNICODE.junctionLeft;
    }
  }
  if (direction === Direction.RIGHT) {
    if (value === UNICODE.junctionRight) {
      return UNICODE.lineVertical;
    }
    if (value === UNICODE.junctionDown) {
      return UNICODE.cornerTopRight;
    }
    if (value === UNICODE.junctionUp) {
      return UNICODE.cornerBottomRight;
    }
    if (value === UNICODE.junctionLeft) {
      return UNICODE.junctionRight;
    }
  }
  // There are a few cases where we just can't do this, and that has to be OK.
  return value;
}
