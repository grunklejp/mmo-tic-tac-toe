import { Board, boardsSquared } from "~/components/board";
import type { Route } from "./+types/home";
import { FixedSizeGrid as Grid } from "react-window";
import { useEffect, useState } from "react";
import { TeamProvider } from "~/components/team-provider";
import { SyncStateProvider } from "~/components/sync-state-provider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MMO Tic-Tac-Toe" },
    { name: "description", content: "Start playing!" },
  ];
}

export default function Home() {
  const [dims, setDims] = useState({ h: 1000, w: 1000 });

  // TODO: dynamically resize on window resize
  useEffect(() => {
    setDims({
      h: document.documentElement.clientHeight ?? 0,
      w: document.documentElement.clientWidth ?? 0,
    });
  }, []);

  return (
    <TeamProvider>
      <SyncStateProvider>
        {(renderKey) => (
          <Grid
            key={renderKey}
            overscanColumnCount={1}
            overscanRowCount={1}
            columnCount={boardsSquared}
            rowCount={boardsSquared}
            columnWidth={100}
            rowHeight={100}
            height={dims.h}
            width={dims.w}
          >
            {(props) => {
              return <Board {...props} />;
            }}
          </Grid>
        )}
      </SyncStateProvider>
    </TeamProvider>
  );
}
