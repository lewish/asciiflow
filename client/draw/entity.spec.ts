import {
  cellsInBox,
  detectLineTip,
  detectWord,
  findBox,
  moveCells,
  traceLineFromTip,
} from "#asciiflow/client/draw/entity";
import { Layer } from "#asciiflow/client/layer";
import { layerToText, textToLayer } from "#asciiflow/client/text_utils";
import { Vector } from "#asciiflow/client/vector";
import { expect } from "chai";

function fromText(...lines: string[]) {
  return textToLayer(lines.join("\n"));
}

function apply(committed: Layer, scratch: Layer) {
  const [next] = committed.apply(scratch);
  return next;
}

describe("entity", () => {
  describe("detectWord", () => {
    it("selects a contiguous run of text, stopping at spaces", () => {
      const layer = fromText("hi there");
      const word = detectWord(layer, new Vector(4, 0));
      expect(word?.map((v) => v.toString())).deep.equals([
        "3:0",
        "4:0",
        "5:0",
        "6:0",
        "7:0",
      ]);
    });

    it("returns null on empty / box-drawing cells", () => {
      const layer = fromText("┌─┐");
      expect(detectWord(layer, new Vector(0, 0))).equals(null);
      expect(detectWord(layer, new Vector(50, 50))).equals(null);
    });

    it("moves a word", () => {
      const layer = fromText("hi there");
      const word = detectWord(layer, new Vector(0, 0)); // "hi"
      const moved = apply(layer, moveCells(layer, word, new Vector(0, 3)));
      expect(moved.get(new Vector(0, 0))).equals(null);
      expect(moved.get(new Vector(0, 3))).equals("h");
      expect(moved.get(new Vector(1, 3))).equals("i");
      // "there" untouched.
      expect(moved.get(new Vector(3, 0))).equals("t");
    });
  });

  describe("findBox", () => {
    const layer = fromText("┌───┐", "│ x │", "└───┘");

    it("finds the box from the interior", () => {
      const box = findBox(layer, new Vector(3, 1));
      expect(box?.left()).equals(0);
      expect(box?.top()).equals(0);
      expect(box?.right()).equals(4);
      expect(box?.bottom()).equals(2);
    });

    it("finds the box from a corner and an edge", () => {
      for (const p of [new Vector(0, 0), new Vector(2, 0), new Vector(4, 2)]) {
        const box = findBox(layer, p);
        expect(box?.left(), `from ${p}`).equals(0);
        expect(box?.right(), `from ${p}`).equals(4);
      }
    });

    it("returns null when there is no enclosing rectangle", () => {
      expect(findBox(fromText("hello"), new Vector(2, 0))).equals(null);
      expect(findBox(layer, new Vector(40, 40))).equals(null);
    });

    it("moves the whole box and its contents", () => {
      const box = findBox(layer, new Vector(2, 0));
      const moved = apply(layer, moveCells(layer, cellsInBox(layer, box), new Vector(10, 5)));
      expect(layerToText(moved)).equals(["┌───┐", "│ x │", "└───┘"].join("\n"));
      // ...now living at the shifted origin.
      expect(moved.get(new Vector(10, 5))).equals("┌");
      expect(moved.get(new Vector(12, 6))).equals("x");
      expect(moved.get(new Vector(0, 0))).equals(null);
    });
  });

  describe("line tips", () => {
    it("detects an arrow tip and not the middle", () => {
      const layer = fromText("───►");
      const tip = detectLineTip(layer, new Vector(3, 0));
      expect(tip?.axis).equals("horizontal");
      expect(tip?.arrow).equals("►");
      expect(detectLineTip(layer, new Vector(1, 0))).equals(null);
    });

    it("traces a straight line from the tip back to its anchor", () => {
      const layer = fromText("───►");
      const tip = detectLineTip(layer, new Vector(3, 0));
      const { cells, anchor } = traceLineFromTip(layer, tip.tip, tip.bodyDir);
      expect(anchor.toString()).equals("0:0");
      expect(cells.length).equals(4); // ► ─ ─ ─
    });

    it("stops at the first bend (the pivot), keeping the rest of the line", () => {
      // ► tip at (3,0) → left along the top → first corner ┌ at (0,0); the
      // vertical leg below it is left alone.
      const l = fromText("┌──►", "│");
      const tip = detectLineTip(l, new Vector(3, 0));
      const { cells, anchor } = traceLineFromTip(l, tip.tip, tip.bodyDir);
      expect(anchor.toString()).equals("0:0"); // pivot is the first corner
      expect(cells.length).equals(4); // ► ─ ─ ┌
    });
  });
});
