import { LegacyRenderLayer } from "#asciiflow/client/render_layer";
import { layerToText, textToLayer } from "#asciiflow/client/text_utils";
import { Vector } from "#asciiflow/client/vector";

export interface ILayerView {
  get(position: Vector): string;
  keys(): Vector[];
  entries(): [Vector, string][];
}

interface ILayerJSON {
  version: number;
  x: number;
  y: number;
  text: string;
}
export class Layer implements ILayerView {
  public static serialize(value: Layer) {
    // Most efficient format seems to be to just store the drawing as plain text with an offset.
    return JSON.stringify({
      version: 2,
      x: value
        .entries()
        .reduce((acc, [key]) => Math.min(acc, key.x), Number.MAX_SAFE_INTEGER),
      y: value
        .entries()
        .reduce((acc, [key]) => Math.min(acc, key.y), Number.MAX_SAFE_INTEGER),
      text: layerToText(value),
    } as ILayerJSON);
  }

  public static deserialize(value: string) {
    const object = JSON.parse(value) as ILayerJSON;
    // The original version of the serialized layer did not have a version number.
    if (!object.version) {
      const fixedLayer = new Layer();
      const legacyRenderedLayer = new LegacyRenderLayer(
        textToLayer(object.text, new Vector(object.x, object.y))
      );
      fixedLayer.setFrom(legacyRenderedLayer);
      return fixedLayer;
    }
    return textToLayer(object.text, new Vector(object.x, object.y));
  }

  public entries() {
    return this.keys().map((key) => [key, this.get(key)] as [Vector, string]);
  }
  public map = new Map<string, string>();

  public delete(position?: Vector) {
    this.map.delete(position.toString());
  }

  public clear() {
    this.map.clear();
  }

  public set(position: Vector, value: string) {
    this.map.set(position.toString(), value);
  }

  public setFrom(layer: ILayerView) {
    for (const [key, value] of layer.entries()) {
      this.set(key, value);
    }
  }

  public get(position: Vector) {
    const key = position.toString();
    return this.map.has(key) ? this.map.get(position.toString()) : null;
  }

  public has(position: Vector) {
    return this.map.has(position.toString());
  }

  public keys(): Vector[] {
    return [...this.map.keys()].map((key) => Vector.fromString(key));
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
      // Spaces and empty strings are deletion characters.
      if (newValue === "" || newValue === " ") {
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

export class LayerView implements ILayerView {
  public constructor(private layers: Layer[]) {}

  keys(): Vector[] {
    const keys = new Set<string>();
    for (const layer of this.layers) {
      [...layer.map.keys()].forEach((key) => keys.add(key));
    }
    return [...keys].map((key) => Vector.fromString(key));
  }

  get(position: Vector): string {
    for (let i = this.layers.length; i >= 0; i--) {
      if (this.layers[i] && this.layers[i].has(position)) {
        const val = this.layers[i].get(position);
        if (val === "" || val === " ") {
          return null;
        }
        return val;
      }
    }
    return null;
  }

  public entries() {
    return this.keys().map((key) => [key, this.get(key)] as [Vector, string]);
  }
}
