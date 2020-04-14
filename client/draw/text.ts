import { ERASE_CHAR } from "asciiflow/client/constants";
import { IDrawFunction } from "asciiflow/client/draw/function";
import { drawText } from "asciiflow/client/draw/utils";
import { CanvasStore } from "asciiflow/client/canvas_store";
import { Vector } from "asciiflow/client/vector";

/**
 * @implements {DrawFunction}
 */
export class DrawText implements IDrawFunction {
  private startPosition: Vector;
  private endPosition: Vector;
  constructor(public state: CanvasStore) {
    this.state = state;
  }

  start(position: Vector) {
    this.state.commitDraw();
    // $("#text-tool-input").val("");
    this.startPosition = position;

    // TODO: Not working yet, needs fixing so that it can
    // remove the underlying text completely.
    // this.loadExistingText(position);

    // Effectively highlights the starting cell.
    var currentValue = this.state.getCell(this.startPosition).getRawValue();
    this.state.drawValue(
      this.startPosition,
      currentValue == null ? ERASE_CHAR : currentValue
    );
  }

  move(position: Vector) {}

  end() {
    if (this.startPosition != null) {
      this.endPosition = this.startPosition;
      this.startPosition = null;
      // Valid end click/press, show the textbox and focus it.
      // $("#text-tool-widget").hide(0, () => {
      //   $("#text-tool-widget").show(0, () => {
      //     $("#text-tool-input").focus();
      //   });
      // });
    }
  }

  getCursor(position: Vector) {
    return "pointer";
  }

  handleKey(value: string) {
    // var text = String($("#text-tool-input").val());
    // this.state.clearDraw();
    // drawText(this.state, this.endPosition, text);
  }

  /**
   * Loads any existing text if it is present.
   * TODO: This is horrible, and does not quite work, fix it.
   */
  loadExistingText(position: Vector) {
    var currentPosition = position.clone();
    var cell = this.state.getCell(position);
    var spacesCount = 0;
    // Go back to find the start of the line.
    while (
      (!cell.isSpecial() && cell.getRawValue() != null) ||
      spacesCount < 1
    ) {
      if (cell.getRawValue() == null) {
        spacesCount++;
      } else if (!cell.isSpecial()) {
        spacesCount = 0;
      }
      currentPosition.x--;
      cell = this.state.getCell(currentPosition);
    }
    this.startPosition = currentPosition.right(spacesCount + 1);
    var text = "";
    spacesCount = 0;
    currentPosition = this.startPosition.clone();
    // Go forward to load the text.
    while (
      (!cell.isSpecial() && cell.getRawValue() != null) ||
      spacesCount < 1
    ) {
      cell = this.state.getCell(currentPosition);
      if (cell.getRawValue() == null) {
        spacesCount++;
        text += " ";
      } else if (!cell.isSpecial()) {
        spacesCount = 0;
        text += cell.getRawValue();
        this.state.drawValue(currentPosition, cell.getRawValue());
      }
      currentPosition.x++;
    }
    // $("#text-tool-input").val(text.substr(0, text.length - 1));
  }
}
