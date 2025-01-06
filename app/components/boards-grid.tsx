import { FixedSizeGrid as Grid } from "react-window";
import { useState } from "react";
import { useTeam } from "./team-provider";
import { useProtocol } from "./sync-state-provider";
import { useBoardStore } from "~/hooks/use-board-store";
import { getNextTurn } from "~/utils";
import { hasWinner } from "~/state";
import { useLevels } from "./level-selector";

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
            {new Array(level === 0 ? 1 : 9).fill(0).map((_, i) => {
              const boardIndex = getBoardIndexFromGrid(
                props.columnIndex,
                props.rowIndex,
                sideCount,
                i
              );
              return (
                <Board
                  level={level}
                  key={`board-${boardIndex}`}
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
  level: number;
};

function Board({ boardIndex, level }: BoardProps) {
  const team = useTeam();
  const protocol = useProtocol();
  const { board } = useBoardStore(boardIndex, level);
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

type LevelBoardProps = {
  disabled: boolean;
  level: number;
};

// TODO:
// if board is disabled clicking does nothing
// if not disabled clicking increments the level and scrolls until that cells board is in focus on the next level
// cell tint color should be determined by number of number of wins in that section in higher levels
//  >> it should be normalized by the level (maybe it should skip a level? )
// function LevelBoard({ boardIndex, disabled }: LevelBoardProps) {
//   // const team = useTeam();
//   // const protocol = useProtocol();
//   const { board } = useBoardStore(boardIndex);
//   const turn = getNextTurn(board, boardIndex);
//   // const isPlayerTurn = turn === team;
//   // const turnDependentClasses = turn === "x" ? "bg-red-100" : "bg-blue-100";

//   return (
//     <div className={"grid grid-cols-3 grid-rows-3 m-2 relative "}>
//       {board.map((piece, i) => {
//         return (
//           <Cell
//             key={`cell-${boardIndex}-${i}`}
//             state={piece}
//             index={i}
//             onMove={(cb) => {
//               console.log(boardIndex, i, turn);
//               if () {
//                 // before moving on, lets make sure this board hasn't already won

//                 if (hasWinner(boardIndex)) {
//                   console.log("That board is already finished");
//                   return null;
//                 }

//                 protocol.move({
//                   level: 6,
//                   board: boardIndex,
//                   cell: i,
//                   value: turn,
//                 });
//                 cb(turn);
//               }
//             }}
//           />
//         );
//       })}
//       {/* <span className="pointer-events-none left-1/2 top-1/2 absolute m-auto bg-red-200 z-10">
//         {boardIndex}
//       </span> */}
//     </div>
//   );
// }
