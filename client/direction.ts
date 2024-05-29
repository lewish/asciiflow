import { Vector } from "#asciiflow/client/vector";

export class Direction extends Vector {
  public static UP = new Direction(0, -1);
  public static DOWN = new Direction(0, 1);
  public static LEFT = new Direction(-1, 0);
  public static RIGHT = new Direction(1, 0);

  public static ALL = [
    Direction.UP,
    Direction.DOWN,
    Direction.LEFT,
    Direction.RIGHT,
  ];

  private constructor(x: number, y: number) {
    super(x, y);
  }

  public opposite(): Direction {
    return Direction.OPPOSITE_MAP.get(this);
  }

  private static readonly OPPOSITE_MAP = new Map([
    [Direction.UP, Direction.DOWN],
    [Direction.DOWN, Direction.UP],
    [Direction.LEFT, Direction.RIGHT],
    [Direction.RIGHT, Direction.LEFT],
  ]);
}
