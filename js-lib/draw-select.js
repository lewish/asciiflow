/**
 * @implements {ascii.DrawFunction}
 */
ascii.DrawSelect = class {
  /**
   * @param {ascii.State} state
   */
  constructor(state) {
    this.state = state;
    /** @type {ascii.Vector} */
    this.startPosition = null;
    /** @type {ascii.Vector} */
    this.endPosition = null;
    /** @type {ascii.Vector} */
    this.dragStart = null;
    /** @type {ascii.Vector} */
    this.dragEnd = null;

    /** @type {boolean} */
    this.finished = true;

    /** @type {!Array<ascii.MappedValue>} */
    this.selectedCells = [];
  }

  /** @inheritDoc */
  start(position) {
    // Must be dragging.
    if (this.startPosition != null &&
        this.endPosition != null &&
        this.getSelectedBox().contains(position)) {
      this.dragStart = position;
      this.copyArea();
      this.dragMove(position);
    } else {
      this.startPosition = position;
      this.endPosition = null;
      this.finished = false;
      this.move(position);
    }
  }

  getSelectedBox() {
    return new ascii.Box(this.startPosition, this.endPosition);
  }

  copyArea() {
    var nonEmptyCells = this.state.scratchCells.filter(function(value) {
      var rawValue = value.cell.getRawValue();
      return value.cell.getRawValue() != null && value.cell.getRawValue() != ERASE_CHAR;
    });
    var topLeft = this.getSelectedBox().topLeft();
    this.selectedCells = nonEmptyCells.map(function(value) {
      return new ascii.MappedValue(value.position.subtract(topLeft), value.cell.getRawValue());
    });
  }

  /** @inheritDoc */
  move(position) {
    if (this.dragStart != null) {
      this.dragMove(position);
      return;
    }

    if (this.finished == true) {
      return;
    }
    this.endPosition = position;
    this.state.clearDraw();

    var box = new ascii.Box(this.startPosition, position);

    for (var i = box.startX; i <= box.endX; i++) {
      for (var j = box.startY; j <= box.endY; j++) {
        var current = new ascii.Vector(i, j);
        // Effectively highlights the cell.
        var currentValue = this.state.getCell(current).getRawValue();
        this.state.drawValue(current,
            currentValue == null ? ERASE_CHAR : currentValue);
      }
    }
  }

  dragMove(position) {
    this.dragEnd = position;
    this.state.clearDraw();
    var eraser = new ascii.DrawErase(this.state);
    eraser.start(this.startPosition);
    eraser.move(this.endPosition);
    var startPos = this.dragEnd.subtract(this.dragStart).add(this.getSelectedBox().topLeft());
    this.drawSelected(startPos);
  }

  drawSelected(startPos) {
    for (var { position, value } of this.selectedCells) {
      this.state.drawValue(position.add(startPos), value);
    }
  }

  /** @inheritDoc */
  end() {
    if (this.dragStart != null) {
      this.state.commitDraw();
      this.startPosition = null;
      this.endPosition = null;
    }
    this.dragStart = null;
    this.dragEnd = null;
    this.finished = true;
  }

  /** @inheritDoc */
  getCursor(position) {
    if (this.startPosition != null &&
        this.endPosition != null &&
        new ascii.Box(this.startPosition, this.endPosition).contains(position)) {
      return 'pointer';
    }
    return 'default';
  }

  /** @inheritDoc */
  handleKey(value) {
    if (this.startPosition != null &&
        this.endPosition != null) {
      if (value == KEY_COPY || value == KEY_CUT) {
        this.copyArea();
      }
      if (value == KEY_CUT) {
        var eraser = new ascii.DrawErase(this.state);
        eraser.start(this.startPosition);
        eraser.move(this.endPosition);
        this.state.commitDraw();
      }
    }
    if (value == KEY_PASTE) {
      this.drawSelected(this.startPosition);
      this.state.commitDraw();
    }
  }
}
