import Vector from './vector';

export const MAX_GRID_WIDTH = 2000;
export const MAX_GRID_HEIGHT = 600;

export const SPECIAL_VALUE = '+';
export const ALT_SPECIAL_VALUE = '^';
export const SPECIAL_ARROW_LEFT = '<';
export const SPECIAL_ARROW_UP = '^';
export const SPECIAL_ARROW_RIGHT = '>';
export const SPECIAL_ARROW_DOWN = 'v';
export const SPECIAL_VALUES = ['+', '\u2012', '\u2013', '-', '|'];
export const ALT_SPECIAL_VALUES = ['>', '<', '^', 'v'];
export const ALL_SPECIAL_VALUES = SPECIAL_VALUES.concat(ALT_SPECIAL_VALUES);

export const MAX_UNDO = 50;

export const SPECIAL_LINE_H = '-';
export const SPECIAL_LINE_V = '|';

export const ERASE_CHAR = '\u2009';

export const DRAG_LATENCY = 150; // Milliseconds.
export const DRAG_ACCURACY = 6; // Pixels.

export const CHAR_PIXELS_H = 9;
export const CHAR_PIXELS_V = 17;

export const RENDER_PADDING_CELLS = 3;

export const KEY_RETURN = '<enter>';
export const KEY_BACKSPACE = '<backspace>';
export const KEY_COPY = '<copy>';
export const KEY_PASTE = '<paste>';
export const KEY_CUT = '<cut>';
export const KEY_UP = '<up>';
export const KEY_DOWN = '<down>';
export const KEY_LEFT = '<left>';
export const KEY_RIGHT = '<right>';

// http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
export const TOUCH_ENABLED =
    'ontouchstart' in window ||
    'onmsgesturechange' in window;

export const DIR_LEFT  = new Vector(-1,  0);
export const DIR_RIGHT = new Vector( 1,  0);
export const DIR_UP    = new Vector( 0, -1);
export const DIR_DOWN  = new Vector( 0,  1);

export const DIRECTIONS = [DIR_LEFT, DIR_RIGHT, DIR_UP, DIR_DOWN];

export const CSS_VAR_CANVAS_BG = '--canvas-bg';
export const CSS_VAR_CELL_BG = '--cell-bg';
export const CSS_VAR_CELL_BG_EDITING = '--cell-bg-editing';
export const CSS_VAR_GRID_STROKE_COLOR = '--grid-stroke-color';
export const CSS_VAR_DRAW_AS_LINES_COLOR = '--draw-as-lines-color';
export const CSS_VAR_DRAW_AS_TEXT_COLOR = '--draw-as-text-color';
