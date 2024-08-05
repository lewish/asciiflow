import { Layer } from "#asciiflow/client/layer";
import { layerToText } from "#asciiflow/client/text_utils";
import { Vector } from "#asciiflow/client/vector";
import { expect } from "chai";
import { describe, it } from "mocha";

describe("layer", () => {

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

  it("serialize and deserialize v2", () => {
    const layer = new Layer();
    // This should stay as is and not be processed. by the legacy render layer.
    layer.set(new Vector(5, 10), "++");
    const encoded = Layer.serialize(layer);
    expect(JSON.parse(encoded).version).equals(2);
    const decoded = Layer.deserialize(encoded);
    const asText = layerToText(decoded);
    expect(asText).equals(`++`);
  });
});
