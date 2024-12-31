import { BOARD_COUNT } from "config";
import React from "react";
import type { GridChildComponentProps } from "react-window";
import { useBoardStore, makeTurnAndRender } from "~/hooks/use-board-store";
import { getNextTurn } from "~/utils";

export const boardsSquared = Math.sqrt(BOARD_COUNT);

type BoardProps = GridChildComponentProps<any>;

export function Board({
  style,
  isScrolling,
  columnIndex,
  rowIndex,
}: BoardProps) {
  const boardIdx = getBoardIndexFromGrid(columnIndex, rowIndex, boardsSquared);
  const { board } = useBoardStore(boardIdx);
  const turn = getNextTurn(board, boardIdx);

  if (isScrolling) {
    return (
      <div className={`bg-gray-00 rounded animate-pulse p-1`} style={style} />
    );
  }

  return (
    <div className="relative grid grid-cols-3 grid-rows-3 p-1" style={style}>
      {board.map((b, i) => {
        return (
          <GameCell
            key={`${rowIndex}${columnIndex}${i}`}
            nextTurn={turn}
            state={b}
            index={i}
            onClick={() => {
              console.log(boardIdx, i, turn);
              if (b === null) {
                makeTurnAndRender({
                  board: boardIdx,
                  cell: i,
                  value: turn,
                });
              }
            }}
          />
        );
      })}
      {/* debug */}
      <div className="absolute bottom-0 text-red-500">
        [{columnIndex}, {rowIndex}] - {boardIdx}
      </div>
    </div>
  );
}

type GameCellProps = {
  state: "x" | "o" | null;
  index: number;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  nextTurn: "x" | "o";
};

function GameCell({ state, onClick, nextTurn }: GameCellProps) {
  const colorClass = state === "x" ? "text-red-500" : "text-blue-500";
  const bgColor =
    state !== null
      ? "bg-white border-gray-500"
      : nextTurn === "x"
      ? "bg-red-50 border-red-700"
      : "bg-blue-50 border-blue-700";

  return (
    <button
      onClick={onClick}
      className={`w-full h-full border uppercase font-semibold ${colorClass} ${bgColor}`}
    >
      {state}
    </button>
  );
}

export function getBoardIndexFromGrid(
  columnIndex: number,
  rowIndex: number,
  gridSize: number
) {
  return rowIndex * gridSize + columnIndex;
}
