import { Layer } from "#asciiflow/client/layer";
import {
  IStringifier,
  JSONStringifier,
} from "#asciiflow/common/stringifiers";
import { Base64 } from "js-base64";
import pako from "pako";

export interface IDrawing {
  name: string;
  layer: Layer;
}

interface IDrawingPartial {
  name: string;
  layer: string;
}

export class DrawingStringifier implements IStringifier<IDrawing> {
  public serialize(value: IDrawing) {
    const jsonString = new JSONStringifier<IDrawingPartial>().serialize({
      ...value,
      layer: Layer.serialize(value.layer),
    });
    const jsonBytes = new TextEncoder().encode(jsonString);
    const deflatedBytes = pako.deflate(jsonBytes);
    const base64 = Base64.fromUint8Array(deflatedBytes);
    return base64;
  }
  public deserialize(value: string) {
    const deflatedBytes = Base64.toUint8Array(value);
    const jsonBytes = pako.inflate(deflatedBytes);
    const jsonString = new TextDecoder("utf8").decode(jsonBytes);
    const object = new JSONStringifier<IDrawingPartial>().deserialize(
      jsonString
    );
    return {
      ...object,
      layer: Layer.deserialize(object.layer),
    };
  }
}
