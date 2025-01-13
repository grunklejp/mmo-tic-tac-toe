export const LEVELS = 7;

/**
 * We use 0-indexed levels so the max_level 1 less than the total number of levels
 */
export const MAX_LEVEL = LEVELS - 1;
export const BOARD_COUNT = Math.pow(9, MAX_LEVEL);

export const BYTES_FOR_SEQ_NUM = 4;

export const COLUMN_WIDTH = 350;
export const ROW_HEIGHT = 350;
