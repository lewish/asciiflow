import { Vector } from "asciiflow/client/vector";

export class Layer {
  private values = new Map<string, string>();

  public clear(position: Vector) {
    this.values.delete(position.toString());
  }

  public set(position: Vector, value: string) {
    this.values.set(position.toString(), value);
  }

  public get(position: Vector) {
    const key = position.toString();
    return this.values.has(key) ? this.values.get(position.toString()) : null;
  }

  public entries() {
    return this.values.entries();
  }

  /**
   * Applies another layer to this layer, and returns a layer that can be applied to undo the operation.
   */
  public apply(otherLayer: Layer) {
    const undoLayer = new Layer();
    Array.from(otherLayer.entries()).forEach(([key, newValue]) => {
      const oldValue = this.values.get(key);
      this.values.set(key, newValue);
      if (oldValue !== newValue) {
        undoLayer.values.set(key, oldValue);
      }
    });
    return undoLayer;
  }
}
