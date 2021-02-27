import { Layer } from "asciiflow/client/layer";
import {
  DrawingStringifier,
  IDrawing,
} from "asciiflow/client/store/drawing_stringifier";
import { Vector } from "asciiflow/client/vector";
import { suite, test } from "asciiflow/testing";
import { expect } from "chai";
import { basename } from "path";

suite(basename(__filename), () => {
  test("reserialize", () => {
    const layer = new Layer();
    layer.set(new Vector(5, 10), "X");
    const drawing: IDrawing = {
      name: "name",
      layer,
    };
    const encoded = new DrawingStringifier().serialize(drawing);
    const decoded = new DrawingStringifier().deserialize(encoded);

    expect(decoded.name).equals(drawing.name);
    expect(decoded.layer.get(new Vector(5, 10))).equals("X");
  });
});
