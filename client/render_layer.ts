import { CellContext } from "#asciiflow/client/common";
import { Characters } from "#asciiflow/client/constants";
import { ILayerView } from "#asciiflow/client/layer";
import { store } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";
import * as constants from "#asciiflow/client/constants";

export class LegacyRenderLayer implements ILayerView {
  constructor(private baseLayer: ILayerView) {}
  keys(): Vector[] {
    return this.baseLayer.keys();
  }

  public entries() {
    return this.keys().map((key) => [key, this.get(key)] as [Vector, string]);
  }
  get(position: Vector): string {
    const characterSet = store.characters;

    const combined = this.baseLayer;
    const value = combined.get(position);
    const isLine = Characters.isLine(value);
    const isArrow = Characters.isArrow(value);

    if (isArrow) {
      // In some situations, we can be certain about arrow orientation.
      const context = cellContext(position, combined);

      if (context.sum() === 1) {
        if (context.up) {
          return characterSet.arrowDown;
        }
        if (context.down) {
          return characterSet.arrowUp;
        }
        if (context.left) {
          return characterSet.arrowRight;
        }
        if (context.right) {
          return characterSet.arrowLeft;
        }
      }

      if (context.sum() === 2) {
        if (
          context.left &&
          context.right &&
          !context.rightup &&
          !context.rightdown
        ) {
          return characterSet.arrowLeft;
        }
        if (
          context.left &&
          context.right &&
          !context.leftup &&
          !context.leftdown
        ) {
          return characterSet.arrowRight;
        }
        if (context.up && context.down && !context.leftup && !context.rightup) {
          return characterSet.arrowDown;
        }
        if (
          context.up &&
          context.down &&
          !context.leftdown &&
          !context.rightdown
        ) {
          return characterSet.arrowUp;
        }
      }

      if (context.sum() === 3) {
        if (!context.up) {
          return characterSet.arrowUp;
        }
        if (!context.down) {
          return characterSet.arrowDown;
        }
        if (!context.left) {
          return characterSet.arrowLeft;
        }
        if (!context.right) {
          return characterSet.arrowRight;
        }
      }
    }

    if (isLine) {
      const context = cellContext(position, combined);

      // Terminating character in a line.
      if (context.sum() === 1) {
        if (context.left || context.right) {
          return characterSet.lineHorizontal;
        }
        if (context.up || context.down) {
          return characterSet.lineVertical;
        }
      }
      // Line sections or corners.
      if (context.sum() === 2) {
        if (context.left && context.right) {
          return characterSet.lineHorizontal;
        }
        if (context.up && context.down) {
          return characterSet.lineVertical;
        }
        if (context.right && context.down) {
          return characterSet.cornerTopLeft;
        }
        if (context.left && context.down) {
          return characterSet.cornerTopRight;
        }
        if (context.right && context.up) {
          return characterSet.cornerBottomLeft;
        }
        if (context.left && context.up) {
          return characterSet.cornerBottomRight;
        }
      }

      // Three way junctions.
      if (context.sum() === 3) {
        if (!context.right && context.leftup && context.leftdown) {
          return characterSet.lineVertical;
        }
        if (!context.left && context.rightup && context.rightdown) {
          return characterSet.lineVertical;
        }
        if (!context.down && context.leftup && context.rightup) {
          return characterSet.lineHorizontal;
        }
        if (!context.up && context.rightdown && context.leftdown) {
          return characterSet.lineHorizontal;
        }

        if (
          context.up &&
          context.left &&
          context.right &&
          context.leftup &&
          context.rightup
        ) {
          return characterSet.lineHorizontal;
        }
        if (
          context.down &&
          context.left &&
          context.right &&
          context.leftdown &&
          context.rightdown
        ) {
          return characterSet.lineHorizontal;
        }
        // Special cases here are to not put junctions when there is
        // an adjacent connection arrow that doesn't embed into the line.
        const up = combined.get(position.up());
        const down = combined.get(position.down());
        const left = combined.get(position.left());
        const right = combined.get(position.right());
        if (context.left && context.right && context.down) {
          if (Characters.isArrow(down)) {
            return characterSet.lineHorizontal;
          }
          if (Characters.isArrow(right)) {
            return characterSet.cornerTopRight;
          }
          if (Characters.isArrow(left)) {
            return characterSet.cornerTopLeft;
          }
          return characterSet.junctionDown;
        }
        if (context.left && context.right && context.up) {
          if (Characters.isArrow(up)) {
            return characterSet.lineHorizontal;
          }
          if (Characters.isArrow(left)) {
            return characterSet.cornerBottomLeft;
          }
          if (Characters.isArrow(right)) {
            return characterSet.cornerBottomRight;
          }
          return characterSet.junctionUp;
        }
        if (context.left && context.up && context.down) {
          if (Characters.isArrow(left)) {
            return characterSet.lineVertical;
          }
          if (Characters.isArrow(up)) {
            return characterSet.cornerTopRight;
          }
          if (Characters.isArrow(down)) {
            return characterSet.cornerBottomRight;
          }
          return characterSet.junctionLeft;
        }
        if (context.up && context.right && context.down) {
          if (Characters.isArrow(right)) {
            return characterSet.lineVertical;
          }
          if (Characters.isArrow(up)) {
            return characterSet.cornerTopLeft;
          }
          if (Characters.isArrow(down)) {
            return characterSet.cornerBottomLeft;
          }
          return characterSet.junctionRight;
        }
        return constants.SPECIAL_VALUE;
      }

      // Four way junctions.
      if (context.sum() === 4) {
        const upIsArrow = Characters.isArrow(combined.get(position.up()));
        const downIsArrow = Characters.isArrow(combined.get(position.down()));
        const leftIsArrow = Characters.isArrow(combined.get(position.left()));
        const rightIsArrow = Characters.isArrow(combined.get(position.right()));
        // Single arrows.
        if (upIsArrow && !downIsArrow && !leftIsArrow && !rightIsArrow) {
          return characterSet.junctionDown;
        }
        if (!upIsArrow && downIsArrow && !leftIsArrow && !rightIsArrow) {
          return characterSet.junctionUp;
        }
        if (!upIsArrow && !downIsArrow && leftIsArrow && !rightIsArrow) {
          return characterSet.junctionRight;
        }
        if (!upIsArrow && !downIsArrow && !leftIsArrow && rightIsArrow) {
          return characterSet.junctionLeft;
        }
        // Two arrows.
        if (upIsArrow && downIsArrow && !leftIsArrow && !rightIsArrow) {
          return characterSet.lineHorizontal;
        }
        if (upIsArrow && !downIsArrow && leftIsArrow && !rightIsArrow) {
          return characterSet.cornerTopLeft;
        }
        if (upIsArrow && !downIsArrow && !leftIsArrow && rightIsArrow) {
          return characterSet.cornerTopRight;
        }
        if (!upIsArrow && downIsArrow && leftIsArrow && !rightIsArrow) {
          return characterSet.cornerBottomLeft;
        }
        if (!upIsArrow && downIsArrow && !leftIsArrow && rightIsArrow) {
          return characterSet.cornerBottomRight;
        }
        if (!upIsArrow && !downIsArrow && leftIsArrow && rightIsArrow) {
          return characterSet.lineVertical;
        }
        return characterSet.junctionAll;
      }
    }

    return value;
  }
}

export function cellContext(position: Vector, layer: ILayerView): CellContext {
  const left = constants.ALL_SPECIAL_VALUES.includes(
    layer.get(position.left())
  );
  const right = constants.ALL_SPECIAL_VALUES.includes(
    layer.get(position.right())
  );
  const up = constants.ALL_SPECIAL_VALUES.includes(layer.get(position.up()));
  const down = constants.ALL_SPECIAL_VALUES.includes(
    layer.get(position.down())
  );
  const leftup = constants.ALL_SPECIAL_VALUES.includes(
    layer.get(position.left().up())
  );
  const leftdown = constants.ALL_SPECIAL_VALUES.includes(
    layer.get(position.left().down())
  );
  const rightup = constants.ALL_SPECIAL_VALUES.includes(
    layer.get(position.right().up())
  );
  const rightdown = constants.ALL_SPECIAL_VALUES.includes(
    layer.get(position.right().down())
  );
  return new CellContext(
    left,
    right,
    up,
    down,
    leftup,
    leftdown,
    rightup,
    rightdown
  );
}
