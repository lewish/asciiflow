import { Layer } from "asciiflow/client/layer";
import {
  IStringifier,
  JSONStringifier,
} from "asciiflow/client/store/persistent";
import * as pako from "pako";

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
    const deflatedString = new TextDecoder("utf8").decode(deflatedBytes);
    return btoa(unescape(encodeURIComponent(deflatedString)));
  }
  public deserialize(value: string) {
    const deflatedString = decodeURIComponent(escape(atob(value)));
    const deflatedBytes = new TextEncoder().encode(deflatedString);
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
