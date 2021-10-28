import Player from "./player.js";
import globalVars from "./globalVars.js";

const handleMovement = (dial, player, cells) => {
    let { i: pi, j: pj } = player;
    switch (dial) {
        case 0:
            if (!cells[pi][pj].walls[0]) {
                player.move(Player.DIRS.UP, globalVars.n, globalVars.m);
            }
            break;
        case 1:
            if (!cells[pi][pj].walls[1]) {
                player.move(Player.DIRS.RIGHT, globalVars.n, globalVars.m);
            }
            break;
        case 2:
            if (!cells[pi][pj].walls[2]) {
                player.move(Player.DIRS.DOWN, globalVars.n, globalVars.m);
            }
            break;
        case 3:
            if (!cells[pi][pj].walls[3]) {
                player.move(Player.DIRS.LEFT, globalVars.n, globalVars.m);
            }
            break;
    }
}

export default handleMovement;