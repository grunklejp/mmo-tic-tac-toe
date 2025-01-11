export function calculateBoardId(
  level: number,
  row: number,
  col: number
): number {
  const blocksPerSide = Math.pow(3, level - 1);

  if (level === 0) {
    return 0;
  }

  const blockRow = Math.floor(row / blocksPerSide);
  const blockCol = Math.floor(col / blocksPerSide);
  const containingBlock = blockRow * 3 + blockCol;

  const gridsInLevel = Math.pow(9, level);
  const gridsPerBlock = gridsInLevel / 9;

  const containingBlockStart = gridsPerBlock * containingBlock;

  const offsetRow = row % blocksPerSide;
  const offsetCol = col % blocksPerSide;

  if (level === 1) {
    // base case
    return containingBlockStart;
  } else {
    return (
      containingBlockStart + calculateBoardId(level - 1, offsetRow, offsetCol)
    );
  }
}

export function getGridRowColFromBoardId(
  level: number,
  boardId: number
): { row: number; col: number } {
  if (level === 0) {
    return { row: 0, col: 0 };
  }

  const gridsInLevel = Math.pow(9, level); // total cells for this level
  const gridsPerBlock = gridsInLevel / 9; // cells per one of the 9 blocks
  const containingBlock = Math.floor(boardId / gridsPerBlock);
  const blockRow = Math.floor(containingBlock / 3);
  const blockCol = containingBlock % 3;

  // offset within that block
  const offsetInBlock = boardId % gridsPerBlock;

  if (level === 1) {
    // base case
    return { row: blockRow, col: blockCol };
  } else {
    // recursively get offset row & col
    const { row, col } = getGridRowColFromBoardId(level - 1, offsetInBlock);
    const blocksPerSide = Math.pow(3, level - 1);

    // add the block offset
    return {
      row: blockRow * blocksPerSide + row,
      col: blockCol * blocksPerSide + col,
    };
  }
}
