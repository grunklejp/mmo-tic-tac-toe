import type { Position } from "~/utils";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

type Context = {
  updateScrollTo: {
    columnIndex: number;
    rowIndex: number;
  } | null;
  setUpdateScrollTo: React.Dispatch<
    React.SetStateAction<{
      columnIndex: number;
      rowIndex: number;
    } | null>
  >;
  lastClickedPos: Position | undefined;
  setLastClickedPos: React.Dispatch<React.SetStateAction<Position | undefined>>;
} | null;

const context = createContext<Context>(null);

export function useGridCoordinateSelection() {
  return useContext(context);
}

export function GridCoordinateSelectionManager({
  children,
}: {
  children: ReactNode;
}) {
  const [updateScrollTo, setUpdateScrollTo] = useState<{
    columnIndex: number;
    rowIndex: number;
  } | null>(null);
  const [lastClickedPos, setLastClickedPos] = useState<Position>();

  return (
    <context.Provider
      value={{
        lastClickedPos,
        setLastClickedPos,
        setUpdateScrollTo,
        updateScrollTo,
      }}
    >
      {children}
    </context.Provider>
  );
}
