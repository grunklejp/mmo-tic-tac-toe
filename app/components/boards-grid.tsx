import { FixedSizeGrid as Grid } from "react-window";
import { useState } from "react";
import { useTeam } from "./team-provider";
import { useProtocol } from "./sync-state-provider";
import { useBoardStore } from "~/hooks/use-board-store";
import { getNextTurn } from "~/utils";
import { useLevels } from "./level-selector";
import { MAX_LEVEL } from "config";

type Props = {
  key?: React.Key;
  dims: {
    h: number;
    w: number;
  };
};

export function BoardsGrid({ ...props }: Props) {
  const levelctx = useLevels();
  if (!levelctx) return null;
  const { level, levels } = levelctx;

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
        const boardIndex = getBoardIndexFromGrid(
          props.columnIndex,
          props.rowIndex,
          sideCount,
          0
        );

        // If the level is not a playable level
        return (
          <div
            style={props.style}
            className={`grid grid-cols-3 grid-rows-3 relative ${
              level !== 0 ? "border" : ""
            } border-gray-400 p-2`}
          >
            <span className="pointer-events-none top-0 font-medium text-gray-400 left-0.5 absolute m-auto z-10 text-xs">
              {(boardIndex * Math.pow(9, levels - level - 1)).toLocaleString()}
            </span>
            {level === 0 ? (
              <Board level={level} key={`board-${0}`} boardIndex={0} />
            ) : (
              new Array(level === 0 ? 1 : 9).fill(0).map((_, i) => {
                const bIndex = getBoardIndexFromGrid(
                  props.columnIndex,
                  props.rowIndex,
                  sideCount,
                  i
                );

                return (
                  <Board
                    level={level}
                    key={`board-${level}-${bIndex}`}
                    boardIndex={bIndex}
                  />
                );
              })
            )}
          </div>
        );
      }}
    </Grid>
  );
}

type BoardProps = {
  boardIndex: number;
  level: number;
};

function Board({ boardIndex, level }: BoardProps) {
  const team = useTeam();
  const protocol = useProtocol();
  let { board, winner, hasAncestralWinner } = useBoardStore(boardIndex, level);
  const hasWinner = winner !== null;
  const turn = getNextTurn(board, boardIndex);
  const isPlayerTurn = turn === team;

  let statefulClasses = "";

  if (hasWinner) {
    statefulClasses = "bg-white border border-gray-300";
  } else if (hasAncestralWinner) {
    statefulClasses = "bg-gray-100";
  } else if (turn === "x") {
    statefulClasses = "bg-red-100";
  } else {
    statefulClasses = "bg-blue-100";
  }

  return (
    <div
      className={"grid grid-cols-3 grid-rows-3 m-2 relative " + statefulClasses}
    >
      {hasWinner && (
        <div className="flex w-full h-full absolute inset-0 bg-gray-100/50 items-center justify-center">
          <span
            className={`uppercase font-semibold drop-shadow-lg text-7xl ${
              winner === "x" ? "text-red-500" : "text-blue-500"
            }`}
          >
            {winner}
          </span>
        </div>
      )}
      {board.map((piece, i) => {
        return (
          <Cell
            disabled={hasAncestralWinner}
            key={`cell-${boardIndex}-${i}`}
            state={piece}
            index={i}
            onMove={(cb) => {
              console.log(boardIndex, i, turn);
              if (level === MAX_LEVEL) {
                if (piece === null && isPlayerTurn && protocol?.move) {
                  protocol.move({
                    level: 6,
                    board: boardIndex,
                    cell: i,
                    value: turn,
                  });
                  cb(turn);
                }
              } else {
                console.log("TODO: go to next one");
              }
            }}
          />
        );
      })}
      {/* <span className="pointer-events-none left-1/2 top-1/2 absolute m-auto bg-red-200 z-10">
        {boardIndex}
      </span> */}
    </div>
  );
}

type CellProps = {
  state: "x" | "o" | null;
  index: number;
  onMove: (cb: (arg: "x" | "o") => void) => void;
  disabled: boolean;
};

function Cell({ state, onMove, disabled }: CellProps) {
  const [memodValue, setMemodValue] = useState<"x" | "o" | null>(null);
  const colorClass =
    state === "x" || memodValue === "x" ? "text-red-500" : "text-blue-500";
  const bgColor =
    state !== null || memodValue !== null ? "bg-white" : "bg-transparent";

  return (
    <button
      disabled={disabled}
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
