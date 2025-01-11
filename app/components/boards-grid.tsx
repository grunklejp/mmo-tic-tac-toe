import { FixedSizeGrid, FixedSizeGrid as Grid } from "react-window";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import { useTeam } from "./team-provider";
import { useProtocol } from "./sync-state-provider";
import { useBoardStore } from "~/hooks/use-board-store";
import { getNextTurn } from "~/utils";
import { useLevels } from "./level-selector";
import { MAX_LEVEL } from "config";
import { calculateBoardId, getGridRowColFromBoardId } from "~/grid-layout";

type Props = {
  key?: React.Key;
  dims: {
    h: number;
    w: number;
  };
};

export function BoardsGrid({ ...props }: Props) {
  const [updateScrollTo, setUpdateScrollTo] = useState<{
    columnIndex: number;
    rowIndex: number;
  } | null>(null);
  const levelctx = useLevels();
  const gridRef = useRef<FixedSizeGrid<any>>(null);
  const [lastClicked, setLastClicked] = useState<number>();

  if (!levelctx) return null;
  const { level, levels, setLevel } = levelctx;

  const boardGroupsThisLevel = Math.pow(9, level - 1);
  const sideCount = Math.sqrt(boardGroupsThisLevel);

  useEffect(() => {
    if (updateScrollTo !== null) {
      gridRef.current?.scrollToItem({
        align: "smart",
        ...updateScrollTo,
      });
      setUpdateScrollTo(null);
    }
  }, [updateScrollTo]);

  return (
    <Grid
      ref={gridRef}
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
        // although this is for calculating the boardID it works fine to calculate the grid ID
        const gridIndex = calculateBoardId(
          level,
          props.rowIndex,
          props.columnIndex
        );

        return (
          <div
            style={props.style}
            className={`grid grid-cols-3 grid-rows-3 relative ${
              level !== 0 ? "border" : ""
            } border-gray-400 p-2`}
          >
            <span className="pointer-events-none top-0 font-medium text-gray-400 left-0.5 absolute m-auto z-10 text-xs">
              {gridIndex} __
              {props.rowIndex}, {props.columnIndex}
            </span>
            {level === 0 ? (
              <Board
                level={level}
                setLevel={setLevel}
                key={`board-${0}`}
                boardIndex={0}
                shouldFlash={lastClicked === 0}
                scrollAfterClick={(offset) => {
                  setUpdateScrollTo({
                    columnIndex: 0,
                    rowIndex: 0,
                  });
                  setLastClicked(0 + offset);
                }}
              />
            ) : (
              new Array(level === 0 ? 1 : 9).fill(0).map((_, i) => {
                const boardIndex = getBoardIndexFromGridId(gridIndex, i);

                return (
                  <Board
                    level={level}
                    key={`board-${level}-${boardIndex}`}
                    boardIndex={boardIndex}
                    setLevel={setLevel}
                    shouldFlash={lastClicked === boardIndex}
                    scrollAfterClick={(offset) => {
                      const { row, col } = getGridRowColFromBoardId(
                        level + 1,
                        boardIndex
                      );

                      setUpdateScrollTo({
                        rowIndex: row,
                        columnIndex: col,
                      });
                      setLastClicked(boardIndex * 9 + offset);
                    }}
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
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  scrollAfterClick: (clickedOffset: number) => void;
  shouldFlash?: boolean;
};
function Board({
  boardIndex,
  level,
  setLevel,
  scrollAfterClick,
  shouldFlash = false,
}: BoardProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const team = useTeam();
  const protocol = useProtocol();
  let { board, winner, hasAncestralWinner } = useBoardStore(boardIndex, level);
  const hasWinner = winner !== null;
  const turn = getNextTurn(board, boardIndex);
  const isPlayerTurn = turn === team;

  let statefulClasses = "";

  if (hasAncestralWinner || hasWinner) {
    statefulClasses = "bg-gray-100";
  } else if (level !== MAX_LEVEL) {
    statefulClasses = "bg-white border border-gray-300";
  } else if (turn === "x") {
    statefulClasses = "bg-red-100";
  } else if (turn) {
    statefulClasses = "bg-blue-100";
  }

  useEffect(() => {
    if (shouldFlash) {
      setIsFlashing(true);
      const timeout = setTimeout(() => {
        setIsFlashing(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [shouldFlash]);

  return (
    <div
      className={"grid grid-cols-3 grid-rows-3 m-2 relative " + statefulClasses}
    >
      {hasWinner && (
        <div className="flex w-full h-full absolute inset-0 bg-gray-300/50 items-center justify-center">
          <span
            className={`uppercase font-semibold text-7xl ${
              winner === "x" ? "text-red-500" : "text-blue-500"
            }`}
          >
            {winner}
          </span>
        </div>
      )}

      {isFlashing && (
        <div className="w-3/4 h-3/4 absolute inset-0 m-auto bg-yellow-300/50 animate-ping"></div>
      )}

      {board.map((piece, i) => {
        return (
          // todo fix hot spot
          <Cell
            disabled={hasAncestralWinner}
            key={`cell-${boardIndex}-${i}`}
            state={piece}
            index={i}
            onMove={(onAfterMove) => {
              console.log(boardIndex, i, turn);
              if (level === MAX_LEVEL) {
                if (piece === null && isPlayerTurn && protocol?.move) {
                  protocol.move({
                    level: 6,
                    board: boardIndex,
                    cell: i,
                    value: turn,
                  });
                  onAfterMove(turn);
                }
              } else {
                //TODO: setPreviousClickedCell
                setLevel((l) => l + 1);
                scrollAfterClick(i);
                // setPrevClicked({ level: level, board: boardIndex, cell: i });
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
      className={`w-full h-full border border-gray-500 uppercase text-xl font-normal ${colorClass} ${bgColor}`}
    >
      {state ?? memodValue}
    </button>
  );
}

export function getBoardIndexFromGridId(gridId: number, offset: number) {
  const boardIdx = gridId * 9 + offset;
  return boardIdx;
}
