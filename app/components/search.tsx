import { getGridRowColFromBoardId } from "~/grid-layout";
import { useLevels } from "./level-selector";
import { useGridCoordinateSelection } from "./grid-coordinate-selection-manager";
import { useRef, useState } from "react";

export function Search() {
  const levelctx = useLevels();
  const autoScrollCtx = useGridCoordinateSelection();
  const [boardId, setBoardId] = useState<number>();
  const ref = useRef<HTMLInputElement>(null);

  if (!levelctx || !autoScrollCtx) return null;
  const { level } = levelctx;
  const { setLastClickedPos, setUpdateScrollTo } = autoScrollCtx;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        if (boardId === undefined) {
          throw new Error(
            "Invaraint failed: boardId is required, did you set required on the html input element?"
          );
        }

        const newId = Math.floor(boardId / 9);
        const offset = boardId % 9;

        const { row, col } = getGridRowColFromBoardId(level, newId);

        if (ref.current) {
          ref.current.value = "";
        }

        setUpdateScrollTo({
          rowIndex: row,
          columnIndex: col,
        });
        setLastClickedPos({
          board: newId,
          cell: offset,
          level: level - 1,
        });
      }}
      className="flex gap-1 items-center w-full"
    >
      <input
        ref={ref}
        type="number"
        step={1}
        min={0}
        max={Math.pow(9, level) - 1}
        className="border p-1 w-36"
        placeholder="Seach board id"
        name="search"
        value={boardId}
        required
        onChange={(e) => {
          const value = parseInt(e.target.value);

          if (isNaN(value)) {
            setBoardId(undefined);
          }

          setBoardId(value);
        }}
      />
      <button
        type="submit"
        aria-label="search"
        className="bg-purple-700 hover:bg-purple-500 text-white py-1 px-2 shadow"
      >
        Go
      </button>
    </form>
  );
}
