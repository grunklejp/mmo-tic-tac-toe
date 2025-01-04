import type { Route } from "./+types/home";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { TeamProvider } from "~/components/team-provider";
import { SyncStateProvider } from "~/components/sync-state-provider";
import { BoardsGrid } from "~/components/boards-grid";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MMO Tic-Tac-Toe" },
    { name: "description", content: "Start playing!" },
  ];
}

export default function Home() {
  return (
    <TeamProvider>
      <SyncStateProvider>
        {(renderKey) => (
          <div className="flex flex-col h-screen">
            <header className="flex flex-col align-center m-4">
              <h1 className="text-4xl font-bold">MMO Tic-Tac-Toe</h1>
            </header>
            <DynamicContainer className="m-4 relative bg-white border border-gray-400 rounded-sm shadow-inner overflow-hidden">
              {(dims) => <BoardsGrid dims={dims} key={renderKey} level={6} />}
            </DynamicContainer>
          </div>
        )}
      </SyncStateProvider>
    </TeamProvider>
  );
}

type Dimensions = {
  h: number;
  w: number;
};

function DynamicContainer({
  children,
  className,
}: {
  children: (dims: Dimensions) => ReactNode;
  className: string;
}) {
  const [dims, setDims] = useState<Dimensions>({ h: 1000, w: 1000 });
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // TODO: dynamically resize on window resize
  useEffect(() => {
    if (gridContainerRef.current) {
      setDims({
        h: gridContainerRef.current.clientHeight ?? 0,
        w: gridContainerRef.current.clientWidth ?? 0,
      });
    }
  }, []);

  const renderChildren = children(dims);

  return (
    <div className={className} ref={gridContainerRef}>
      {renderChildren}
    </div>
  );
}
