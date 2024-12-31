Current goal:

- Represent state in server memory
- create bootstrapping process
  - [x] design flow chart
  - [x] generate random snapshotfile
  - [x] read snapshot file
  - [x] in dev mode, read from snapshot on startup on the server
  - [x] build testing websocket client app
  - [x] broadcast updates
  - [x] fix snapshot size bug
    - what should size be? (4bytes sequence num) math.ceil((boardcount _ 9) / 8) _ 2 = 1,195,748 bytes
    - is server or client setting wrong size? server
  - [x] store moves with sequence number
  - [ ] 🐞 after a long time x's start to overwrite Os, no clue why.
    - it doesn't look like a race condition, but could be?
    - it appears to only start when refreshing, might have to do with loading the snapshot?
    - begin by inspecting snapshot binary value, could be bitset implementation bug on the client?
    - ... having trouble reproducing it now..
  - [x] fetch delta
  - [ ] snapshot + syncing loading state
  - [ ] show "disconnected" message and button to reconnect (refetch latest snapshot and resync)
  - [x] set team cookie
