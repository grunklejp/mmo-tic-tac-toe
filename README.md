Current goal:

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
- [x] 🐞 after a long time x's start to overwrite Os, no clue why.
  - SOLVED: when loading the snapshot we were loading the Os in to the X bitset, thus flushing the buffer to disk wrote them back into the X's byte range. It was intermittent because if we didnt have a snapshot we'd never call loadSnapshot.
- [x] fetch delta
- [x] 🐞 fetching delta not working fast enough on page refresh
  - SOLVED: just needed to trigger a rerender
- [x] show "disconnected" message and button to reconnect (refetch latest snapshot and resync)
- [x] set team cookie
- [x] make move from the client
- [x] check win
  - [x] don't let user click on boards that are won
  - [x] don't let user click or submit for entire sections that are won
- [x] recursively check win & update state on the server
  - [x] test this
- [x] define level specific updates for protocol
- [x] level selector
- [x] make levels show proper state
- [x] make non max level board not trigger a move
- [x] check for stalemate
- [x] clear boards recursively on stalemate
- [x] validate on server that users can only make moves on the highest level (6)
- [x] empty cells in won boards should be greyed out
- [ ] cell tint color (i level < max_level) should be determined by number of number of wins in that section in higher levels
- [x] jump to correct board grid when clicking on higher level cell & highlight correct board
- [x] rerender screen when a board resets
- [x] stalemates cause scroll to update
- [x] team indicator
- [ ] 🐞 clients aren't recieving messages that were sent just before connecting
  - [ ] test if this has been fixed
- [x] 🐞 higher level grids aren't aligned
  - need to assign boardIds based on the alignment
- [x] 🐞 memory on client continues to grow...
  - looks like it was cause by memory leak in react dev tools????
- [x] reverse levels & make playable level the default
- [x] only show tint on level 1 for users own team
- [x] make level picker mobile friendly
- [x] board search

POLISH 🇵🇱

- [x] pick more playful font
- [ ] resize & center level 0 & 1 boards
- [x] dim all unplayable boards

For launch

- [ ] write a "how to play" info icon
- [ ] track player stats (cells played, wins triggered)
- [ ] snapshot + syncing loading state
- [ ] rate limitter
- [ ] make live canvas of game state
