import { Board, boardsSquared } from "~/components/board";
import type { Route } from "./+types/home";
import { FixedSizeGrid as Grid } from "react-window";
import { useEffect, useState } from "react";
import { parseSnapshot, snapshotSequenceNum } from "~/state";
import {
  deserializeBatchPatch,
  deserializeMove,
  parseMessage,
  SERVER_MSG,
  type Move,
} from "~/protocol";
import {
  makeTurn,
  makeTurnAndRender,
  toClientMove,
} from "~/hooks/use-board-store";
import { TeamProvider } from "~/components/team-provider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MMO Tic-Tac-Toe" },
    { name: "description", content: "Start playing!" },
  ];
}

export default function Home() {
  const [dims, setDims] = useState({ h: 1000, w: 1000 });
  const [key, setKey] = useState(Math.random());
  const rerender = () => setKey(Math.random());
  const [fetchedSnapshot, setFetchedSnapshot] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  // TODO: dynamically resize on window resize
  useEffect(() => {
    setDims({
      h: document.documentElement.clientHeight ?? 0,
      w: document.documentElement.clientWidth ?? 0,
    });
  }, []);

  // fetch snapshot on page load
  useEffect(() => {
    async function fetchSnapshot() {
      try {
        const response = await fetch(import.meta.env.VITE_SNAPSHOT_FILE_URL);

        if (!response.ok) {
          throw new Error(`got status ${response.status} from the server.`);
        }

        const data = await response.arrayBuffer();
        parseSnapshot(data);
        rerender();
        setFetchedSnapshot(true);
      } catch (e) {
        console.error(e);
      }
    }

    fetchSnapshot();
  }, []);

  useEffect(() => {
    if (!fetchedSnapshot) return;
    const ws = new WebSocket("/ws");
    ws.binaryType = "arraybuffer";
    ws.onopen = (event) => {};
    ws.onmessage = (event) => {
      const msg = parseMessage(new Uint8Array(event.data));

      switch (msg.kind) {
        case SERVER_MSG.PATCH: {
          const orderedMove = deserializeMove(msg.payload);
          const clientMove = toClientMove(orderedMove);
          makeTurnAndRender(clientMove);
          break;
        }
        case SERVER_MSG.BATCH_PATCH: {
          const { sequenceStart, moves } = deserializeBatchPatch(msg.payload);

          // check if our snapshot is out of date
          if (sequenceStart > snapshotSequenceNum) {
            console.log(
              `snapshot sequence ${snapshotSequenceNum} is to far behind start of latest batch sync payload ${sequenceStart}`
            );
            setNeedRefresh(true);
          } else {
            startSync(moves, () => {
              setSyncing(false);
            });
          }
        }
      }
    };
    return () => ws.close();
  }, [fetchedSnapshot]);

  return (
    <TeamProvider>
      <Grid
        key={key}
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
    </TeamProvider>
  );
}

function startSync(moves: Move[], onFinish: () => void) {
  console.log("syncing", moves.length, "moves since snapshot");

  for (let move of moves) {
    makeTurn(toClientMove(move));
  }

  onFinish();
}
