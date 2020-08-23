import { Vector } from "asciiflow/client/vector";
import { ExtendedCellContext } from "asciiflow/client/common";
import * as constants from "asciiflow/client/constants";

export interface ILayerView {
  get(position: Vector): string;
  context(position: Vector): ExtendedCellContext;
}

abstract class AbstractLayer implements ILayerView {
  abstract get(position: Vector): string;

  context(position: Vector): ExtendedCellContext {
    const left = constants.ALL_SPECIAL_VALUES.includes(
      this.get(position.left())
    );
    const right = constants.ALL_SPECIAL_VALUES.includes(
      this.get(position.right())
    );
    const up = constants.ALL_SPECIAL_VALUES.includes(this.get(position.up()));
    const down = constants.ALL_SPECIAL_VALUES.includes(
      this.get(position.down())
    );
    const leftup = constants.ALL_SPECIAL_VALUES.includes(
      this.get(position.left().up())
    );
    const leftdown = constants.ALL_SPECIAL_VALUES.includes(
      this.get(position.left().down())
    );
    const rightup = constants.ALL_SPECIAL_VALUES.includes(
      this.get(position.right().up())
    );
    const rightdown = constants.ALL_SPECIAL_VALUES.includes(
      this.get(position.right().down())
    );
    return new ExtendedCellContext(
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
}

export class Layer extends AbstractLayer {
  public static serialize = (value: Layer) => {
    return JSON.stringify([...value.map.entries()]);
  };

  public static deserialize = (value: string) => {
    const layer = new Layer();
    layer.map = new Map(JSON.parse(value));
    return layer;
  };

  private map = new Map<string, string>();

  public delete(position?: Vector) {
    this.map.delete(position.toString());
  }

  public clear() {
    this.map.clear();
  }

  public set(position: Vector, value: string) {
    this.map.set(position.toString(), value);
  }

  public get(position: Vector) {
    const key = position.toString();
    return this.map.has(key) ? this.map.get(position.toString()) : null;
  }

  public has(position: Vector) {
    return this.map.has(position.toString());
  }

  public entries(): [Vector, string][] {
    return [...this.map.entries()].map(([key, value]) => [
      Vector.fromString(key),
      value,
    ]);
  }

  public size() {
    return this.map.size;
  }

  /**
   * Applies another layer to this layer, and returns the new layer and a layer that can be applied to undo the operation.
   */
  public apply(otherLayer: Layer): [Layer, Layer] {
    const newLayer = new Layer();
    newLayer.map = new Map(this.map.entries());
    const undoLayer = new Layer();
    Array.from(otherLayer.map.entries()).forEach(([key, newValue]) => {
      const oldValue = this.map.get(key);
      if (newValue === "") {
        newLayer.map.delete(key);
      } else {
        newLayer.map.set(key, newValue);
      }
      if (oldValue !== newValue) {
        undoLayer.map.set(key, !!oldValue ? oldValue : "");
      }
    });
    return [newLayer, undoLayer];
  }
}

export class LayerView extends AbstractLayer {
  public constructor(private layers: Layer[]) {
    super();
  }

  get(position: Vector): string {
    for (let i = this.layers.length; i >= 0; i--) {
      if (this.layers[i] && this.layers[i].has(position)) {
        return this.layers[i].get(position);
      }
    }
    return null;
  }
}
