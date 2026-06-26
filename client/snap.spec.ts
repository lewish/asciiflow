import { Layer } from "#asciiflow/client/layer";
import { snap } from "#asciiflow/client/snap";
import { Vector } from "#asciiflow/client/vector";
import { expect } from "chai";

describe("snap", () => {
  it("rebuilds a junction that gains connections from two sides at once", () => {
    // A horizontal line; the move brings vertical lines against its middle from
    // both above and below in the same snap pass. The middle must become a full
    // junction (┼), not just connect to whichever side was processed last.
    const committed = new Layer();
    committed.set(new Vector(0, 1), "─");
    committed.set(new Vector(1, 1), "─");
    committed.set(new Vector(2, 1), "─");

    const scratch = new Layer();
    scratch.set(new Vector(1, 0), "│"); // above → wants to connect down
    scratch.set(new Vector(1, 2), "│"); // below → wants to connect up

    const result = snap(scratch, committed);
    expect(result.get(new Vector(1, 1))).equals("┼");
  });

  it("connects a scratch cell to committed neighbours on both sides", () => {
    // The moving cell (scratch) sits between two committed lines and must end
    // up connected to both, not just one.
    const committed = new Layer();
    committed.set(new Vector(0, 1), "│"); // left wall (connects up/down only)
    committed.set(new Vector(2, 1), "│"); // right wall

    const scratch = new Layer();
    scratch.set(new Vector(1, 1), "─"); // a horizontal segment dropped between

    const result = snap(scratch, committed);
    // The committed walls should each grow a junction toward the new segment.
    expect(result.get(new Vector(0, 1))).equals("├");
    expect(result.get(new Vector(2, 1))).equals("┤");
  });
});
