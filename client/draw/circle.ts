import { AbstractDrawFunction } from "#asciiflow/client/draw/function";
import { Layer } from "#asciiflow/client/layer";
import { store } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";

export class DrawCircle extends AbstractDrawFunction {
  private centerPosition: Vector | null = null;

  start(position: Vector) {
    this.centerPosition = position;
    // Initialize scratch layer. A single point or empty layer.
    // Drawing primarily happens on move.
    const layer = new Layer();
    store.currentCanvas.setScratchLayer(layer);
  }

  move(position: Vector) {
    if (!this.centerPosition) {
      return;
    }
    const layer = new Layer();
    const radiusVector = this.centerPosition.subtract(position);
    const radius = Math.max(0, Math.round(radiusVector.length()));

    if (radius === 0 && this.centerPosition.equals(position)) {
      // If the mouse hasn't moved from the center, draw a single point.
      // Using '-' as a default character for a single point.
      layer.set(this.centerPosition, "-");
      store.currentCanvas.setScratchLayer(layer);
      return;
    }

    // Iterate over a bounding box around the circle.
    // The box is slightly larger to ensure cells on the edge are checked.
    for (let yCurrent = this.centerPosition.y - radius - 1; yCurrent <= this.centerPosition.y + radius + 1; yCurrent++) {
      for (let xCurrent = this.centerPosition.x - radius - 1; xCurrent <= this.centerPosition.x + radius + 1; xCurrent++) {
        const currentCellVector = new Vector(xCurrent, yCurrent);
        // Calculate distance from the circle's center to the *center* of the current cell.
        const cellCenterVector = new Vector(xCurrent + 0.5, yCurrent + 0.5);
        const distToCellCenter = this.centerPosition.subtract(cellCenterVector).length();

        // Check if the cell's center is close to the ideal circumference.
        // Tolerance of < 0.65 helps ensure connectivity without being too thick.
        if (Math.abs(distToCellCenter - radius) < 0.65) {
          let char = "";
          const relX = xCurrent - this.centerPosition.x;
          const relY = yCurrent - this.centerPosition.y; // Screen Y is positive downwards

          // 1. Check for cardinal points (exactly on horizontal or vertical lines from center)
          if (relX === 0 && Math.abs(relY) === radius) { // Top or Bottom point
            char = "-";
          } else if (relY === 0 && Math.abs(relX) === radius) { // Left or Right point
            char = "|";
          } else {
            // 2. If not a cardinal point, it's on a sloped side. Determine quadrant.
            // slash / for the top left and bottom right sides
            // backslash \\ for the top right and the bottom left sides (needs double escape in string)

            if (relY < 0) { // Top half
              if (relX < 0) { // Top-left quadrant
                char = "/";
              } else { // Top-right quadrant (relX > 0)
                char = "\\"; // Escaped backslash
              }
            } else { // Bottom half (relY >= 0, since relY=0 is cardinal)
              if (relX < 0) { // Bottom-left quadrant
                char = "\\"; // Escaped backslash
              } else { // Bottom-right quadrant (relX > 0)
                char = "/";
              }
            }
          }

          if (char) {
            layer.set(currentCellVector, char);
          }
        }
      }
    }
    store.currentCanvas.setScratchLayer(layer);
  }

  end() {
    if (this.centerPosition) {
      // Only commit if a drawing operation was initiated.
      store.currentCanvas.commitScratch();
    } else {
      // If end is called without a proper start/move, ensure scratch is cleared.
      store.currentCanvas.setScratchLayer(new Layer());
    }
    this.centerPosition = null; // Reset for the next drawing operation
  }

  getCursor() {
    return "crosshair";
  }
}
