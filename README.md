# Stargate Game

In this project, I developed a cooperative desert exploration game based on the Stargate universe, where the IK-1 team must locate and retrieve missing parts from a downed scout plane on planet EIK-235. The game is set on a 5x5 grid representing a harsh desert terrain. Players begin with 6 units of water and must take turns to explore the terrain using three actions per turn, which can be either Move or Dig.

Under the sand are hidden: clues, plane parts, empty tiles, and oases—of which one is a mirage. Clues help players locate the exact grid cell of each part, using a pair of coordinates—one clue reveals the row, and another the column. Once both clues for a part are uncovered, players can dig at the intersecting tile to collect the part. Digging an oasis may restore water (if real), but the mirage does nothing.

After each player’s three actions, their water level decreases by one. Players must plan moves carefully to balance exploration with survival. The game ends in victory if all three parts are found. However, if any player runs out of water, the entire team loses.

I implemented game mechanics such as turn-based logic, randomized board setup, fog-of-war-style tile reveals, and player status tracking. The UI displays the map grid, revealed tiles, oases, and player stats like water and actions left. The game supports 1 to 4 players and encourages strategic teamwork.

How to Use:
Start the game and choose 1–4 players.
Each player starts with 6 water units and takes 3 actions per turn (Move or Dig).
Use Move to go up/down/left/right; use Dig to uncover hidden tiles.
Discover clues to locate 3 missing plane parts. Collect parts by digging where the clues intersect.
Digging a real oasis restores water; a mirage does nothing.
Win by collecting all 3 parts. Lose if any player’s water reaches zero.
