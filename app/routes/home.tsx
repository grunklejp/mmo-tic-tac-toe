import type { Route } from "./+types/home";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { TeamProvider } from "~/components/team-provider";
import { SyncStateProvider } from "~/components/sync-state-provider";
import { BoardsGrid } from "~/components/boards-grid";
import { LevelProvider, LevelSelector } from "~/components/level-selector";
import { LEVELS } from "config";
import { TeamIndicator } from "~/components/team-indicator";

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
          <LevelProvider levels={LEVELS}>
            <div className="flex flex-col h-screen bg-gray-100">
              <header className="flex mx-4 flex-col md:flex-row justify-between items-center">
                <div></div>
                <div className="flex flex-col align-center items-center m-4 gap-3">
                  <h1 className="text-4xl font-bold">MMO Tic-Tac-Toe</h1>
                  <LevelSelector />
                </div>
                <div className="self-end">
                  <TeamIndicator />
                </div>
              </header>
              <DynamicContainer className="relative sm:mx-4 bg-white border border-gray-400 rounded-sm shadow-inner overflow-hidden">
                {(dims) => <BoardsGrid dims={dims} key={renderKey} />}
              </DynamicContainer>
            </div>
          </LevelProvider>
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
