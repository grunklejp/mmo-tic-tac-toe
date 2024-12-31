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
  - [x] fetch delta
