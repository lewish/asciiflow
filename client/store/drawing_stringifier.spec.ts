import { Layer } from "#asciiflow/client/layer";
import {
  DrawingStringifier,
  IDrawing,
} from "#asciiflow/client/store/drawing_stringifier";
import { layerToText } from "#asciiflow/client/text_utils";
import { Vector } from "#asciiflow/client/vector";
import { expect } from "chai";

describe("drawing_stringifier", () => {
  it("reserialize", () => {
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

  it("converts v1 to v2", () => {
    const v1Encoded =
      '{"x":987,"y":286,"text":"    ┼       \\n┼┼┼┼┼┼┼┼┼┼┼┼\\n┼   ┼  Hi  ┼\\n┼   ┼      ┼\\n┼   ┼┼┼┼┼┼►┼\\n┼          ┼\\n┼┼┼┼┼┼┼┼┼┼┼┼"}';
    const decoded = Layer.deserialize(v1Encoded);
    const asText = layerToText(decoded);
    expect(asText).equals(`    │       
┌───┼──────┐
│   │  Hi  │
│   │      │
│   └─────►│
│          │
└──────────┘`);
  });
});
