import { FixedSizeGrid as Grid } from "react-window";
import { useState } from "react";
import { useTeam } from "./team-provider";
import { useProtocol } from "./sync-state-provider";
import { useBoardStore } from "~/hooks/use-board-store";
import { getNextTurn } from "~/utils";
import { hasWinner } from "~/state";

type Props = {
  key?: React.Key;
  level: number;
  dims: {
    h: number;
    w: number;
  };
};

export function BoardsGrid({ level, ...props }: Props) {
  const boardGroupsThisLevel = Math.pow(9, level - 1);
  const sideCount = Math.sqrt(boardGroupsThisLevel);

  return (
    <Grid
      key={props.key}
      overscanColumnCount={3}
      overscanRowCount={3}
      columnCount={sideCount}
      rowCount={sideCount}
      columnWidth={350}
      rowHeight={350}
      height={props.dims.h}
      width={props.dims.w}
    >
      {(props) => {
        return (
          <div
            style={props.style}
            className={
              "grid grid-cols-3 grid-rows-3 relative border border-gray-400 p-2"
            }
          >
            {/* <span className="pointer-events-none top-1 left-1 absolute m-auto bg-green-200 z-10">
              c{props.columnIndex} x r{props.rowIndex}
            </span> */}
            {new Array(level === 1 ? 1 : 9).fill(0).map((_, i) => {
              const boardIndex = getBoardIndexFromGrid(
                props.columnIndex,
                props.rowIndex,
                sideCount,
                i
              );
              // console.log(boardIndex);
              return (
                <Board
                  key={`board-${boardIndex}`}
                  nextTurn="x"
                  boardIndex={boardIndex}
                />
              );
            })}
          </div>
        );
      }}
    </Grid>
  );
}

type BoardProps = {
  boardIndex: number;
  nextTurn: "x" | "o" | null;
};

function Board({ boardIndex, nextTurn }: BoardProps) {
  const team = useTeam();
  const protocol = useProtocol();
  const { board } = useBoardStore(boardIndex);
  const turn = getNextTurn(board, boardIndex);
  const isPlayerTurn = turn === team;
  const turnDependentClasses = turn === "x" ? "bg-red-100" : "bg-blue-100";

  return (
    <div
      className={
        "grid grid-cols-3 grid-rows-3 m-2 relative " + turnDependentClasses
      }
    >
      {board.map((piece, i) => {
        return (
          <Cell
            key={`cell-${boardIndex}-${i}`}
            state={piece}
            index={i}
            onMove={(cb) => {
              console.log(boardIndex, i, turn);
              if (piece === null && isPlayerTurn && protocol?.move) {
                // before moving on, lets make sure this board hasn't already won

                if (hasWinner(boardIndex)) {
                  console.log("That board is already finished");
                  return null;
                }

                protocol.move({
                  level: 6,
                  board: boardIndex,
                  cell: i,
                  value: turn,
                });
                cb(turn);
              }
            }}
          />
        );
      })}
      <span className="pointer-events-none left-1/2 top-1/2 absolute m-auto bg-red-200 z-10">
        {boardIndex}
      </span>
    </div>
  );
}

type CellProps = {
  state: "x" | "o" | null;
  index: number;
  onMove: (cb: (arg: "x" | "o") => void) => void;
};

function Cell({ state, onMove }: CellProps) {
  const [memodValue, setMemodValue] = useState<"x" | "o" | null>(null);
  const colorClass =
    state === "x" || memodValue === "x" ? "text-red-500" : "text-blue-500";
  const bgColor =
    state !== null || memodValue !== null ? "bg-white" : "bg-transparent";

  return (
    <button
      onClick={(e) => {
        onMove((val) => {
          // After attempting a move we assume the move went through for 2 seconds
          setMemodValue(val);
          setTimeout(() => setMemodValue(null), 2000);
        });
      }}
      className={`w-full h-full border border-gray-500 uppercase font-semibold ${colorClass} ${bgColor}`}
    >
      {state ?? memodValue}
    </button>
  );
}

export function getBoardIndexFromGrid(
  columnIndex: number,
  rowIndex: number,
  gridSideSize: number,
  offset: number
) {
  const gridIndex = rowIndex * gridSideSize + columnIndex;
  const boardIdx = gridIndex * 9 + offset;
  return boardIdx;
}
