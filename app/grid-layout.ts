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
