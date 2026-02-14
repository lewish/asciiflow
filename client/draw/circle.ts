// In client/draw/circle.ts

import { AbstractDrawFunction } from "#asciiflow/client/draw/function";
import { Layer } from "#asciiflow/client/layer";
import { store } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";

export class DrawCircle extends AbstractDrawFunction {
  // ... start, end, getCursor methods ...
  private centerPosition: Vector | null = null;

  start(position: Vector) {
    this.centerPosition = position;
    const layer = new Layer();
    store.currentCanvas.setScratchLayer(layer);
  }

  move(position: Vector) {
    if (!this.centerPosition) {
      return;
    }
    const layer = new Layer();
    const dragVector = this.centerPosition.subtract(position);
    const geometricRadius = Math.max(0, Math.round(dragVector.length()));

    if (geometricRadius === 0 && this.centerPosition.equals(position)) {
      layer.set(this.centerPosition, "-"); // Default for a single point
      store.currentCanvas.setScratchLayer(layer);
      return;
    }

    const aspectRatio = 2.0;
    const ellipseA = geometricRadius;
    const ellipseB = Math.max(0, Math.round(geometricRadius / aspectRatio));

    for (let yGridOffset = -ellipseB - 1; yGridOffset <= ellipseB + 1; yGridOffset++) {
      for (let xGridOffset = -ellipseA - 1; xGridOffset <= ellipseA + 1; xGridOffset++) {

        const currentX = this.centerPosition.x + xGridOffset;
        const currentY = this.centerPosition.y + yGridOffset;

        const cellCenterXRel = xGridOffset + 0.5;
        const cellCenterYRel = yGridOffset + 0.5;
        const scaledCellCenterYRel = cellCenterYRel * aspectRatio;
        const distInScaledSpace = new Vector(cellCenterXRel, scaledCellCenterYRel).length();

        if (Math.abs(distInScaledSpace - geometricRadius) < 0.75) {
          const currentCellVector = new Vector(currentX, currentY);
          let char = "";

          let angleDegrees = Math.atan2(-scaledCellCenterYRel, cellCenterXRel) * 180 / Math.PI;

          if (angleDegrees > -22.5 && angleDegrees <= 22.5) {
            char = "|";
          } else if (angleDegrees > 22.5 && angleDegrees <= 67.5) {
            char = "\\";
          } else if (angleDegrees > 67.5 && angleDegrees <= 112.5) {
            char = "-";
          } else if (angleDegrees > 112.5 && angleDegrees <= 157.5) {
            char = "/";
          } else if (angleDegrees > 157.5 || angleDegrees <= -157.5) {
            char = "|";
          } else if (angleDegrees > -157.5 && angleDegrees <= -112.5) {
            char = "\\";
          } else if (angleDegrees > -112.5 && angleDegrees <= -67.5) {
            char = "-";
          } else if (angleDegrees > -67.5 && angleDegrees <= -22.5) {
            char = "/";
          } else {
            // Fallback for any angle not perfectly caught, though unlikely with continuous ranges.
            // This case might indicate an issue with angle boundaries if it appears often.
            // For example, exactly -22.5 is caught by the last 'else if', not the first 'if'.
            // Consider if boundaries should be strictly > or >= consistently.
            // The current logic: (-22.5, 22.5], (22.5, 67.5], etc. This is mostly fine.
            // The boundary at 157.5 / -157.5 might need a check.
            // (157.5, 180] and [-180, -157.5]. The combined condition `angleDegrees > 157.5 || angleDegrees <= -157.5` covers this.
            char = "?"; // Fallback
          }

          layer.set(currentCellVector, char);
        }
      }
    }
    store.currentCanvas.setScratchLayer(layer);
  }

  end() {
    if (this.centerPosition) {
      store.currentCanvas.commitScratch();
    } else {
      store.currentCanvas.setScratchLayer(new Layer());
    }
    this.centerPosition = null;
  }

  getCursor() {
    return "crosshair";
  }
}
