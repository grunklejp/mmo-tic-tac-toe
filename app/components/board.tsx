import { BOARD_COUNT } from "config";
import { useState } from "react";
import type { GridChildComponentProps } from "react-window";
import { useBoardStore } from "~/hooks/use-board-store";
import { getNextTurn } from "~/utils";
import { useTeam } from "./team-provider";
import { useProtocol } from "./sync-state-provider";
import { hasWinner } from "~/state";

export const boardsSquared = Math.sqrt(BOARD_COUNT);

type BoardProps = GridChildComponentProps<any>;

export function Board({
  style,
  isScrolling,
  columnIndex,
  rowIndex,
}: BoardProps) {
  const team = useTeam();
  const protocol = useProtocol();
  const boardIdx = getBoardIndexFromGrid(columnIndex, rowIndex, boardsSquared);
  const { board } = useBoardStore(boardIdx);
  const turn = getNextTurn(board, boardIdx);
  const isPlayerTurn = turn === team;

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
            onMove={(cb) => {
              console.log(boardIdx, i, turn);
              if (b === null && isPlayerTurn && protocol?.move) {
                // before moving on, lets make sure this board hasn't already won

                if (hasWinner(boardIdx)) {
                  console.log("That board is already finished");
                  return null;
                }

                protocol.move({
                  board: boardIdx,
                  cell: i,
                  value: turn,
                });
                cb(turn);
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
  onMove: (cb: (arg: "x" | "o") => void) => void;
  nextTurn: "x" | "o";
};

function GameCell({ state, onMove, nextTurn }: GameCellProps) {
  const [memodValue, setMemodValue] = useState<"x" | "o" | null>(null);
  const colorClass =
    state === "x" || memodValue === "x" ? "text-red-500" : "text-blue-500";
  const bgColor =
    state !== null || memodValue !== null
      ? "bg-white border-gray-500"
      : nextTurn === "x"
      ? "bg-red-50 border-red-700"
      : "bg-blue-50 border-blue-700";

  return (
    <button
      onClick={(e) => {
        onMove((val) => {
          // After attempting a move we assume the move went through for 2 seconds
          setMemodValue(val);
          setTimeout(() => setMemodValue(null), 2000);
        });
      }}
      className={`w-full h-full border uppercase font-semibold ${colorClass} ${bgColor}`}
    >
      {state ?? memodValue}
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
