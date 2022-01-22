import globalVars from "./globalVars.js";
import Queue from "./libs/queue.js";
import isInside from "./is-inside.js";
const dirs = [
    { i: 1, j: 0 },
    { i: -1, j: 0 },
    { i: 0, j: 1 },
    { i: 0, j: -1 },
];

const getTheWall = (dirI, dirJ) => {
    if (dirI === -1) {
        return 0;
    }
    if (dirI === 1) {
        return 2;
    }
    if (dirJ == 1) {
        return 1;
    }
    if (dirJ === -1) {
        return 3;
    }
}

export default class Monster {
    constructor(i, j) {
        this.i = i;
        this.j = j;
    }

    draw(p5context, cells) {
        const { i, j } = this;
        cells[i][j].highlight(p5context, globalVars.MONSTER_GIF);
    }

    move(player, cells) {
        const { i: pi, j: pj } = player;
        const { i: monsterI, j: monsterJ } = this;
        const { n, m } = globalVars;
        //lee
        let dp = new Array(n).fill().map(() => new Array(m).fill(1000000));
        dp[pi][pj] = 0;
        let q = new Queue();
        q.enqueue({
            i: pi,
            j: pj,
        });
        while (!q.isempty()) {
            let { i, j } = q.dequeue();
            for (let dir of dirs) {
                let newI = i + dir.i;
                let newJ = j + dir.j;
                if (!isInside(newI, newJ, n, m)) {
                    continue;
                }
                let ok = true;
                ok &= !cells[i][j].walls[getTheWall(dir.i, dir.j)];
                ok &= dp[newI][newJ] > dp[i][j] + 1;
                if (ok) {
                    dp[newI][newJ] = dp[i][j] + 1;
                    q.enqueue({
                        i: newI,
                        j: newJ,
                    });
                }
            }
        }
        //build
        for (let dir of dirs) {
            let ok = true;
            if (!isInside(monsterI + dir.i, monsterJ + dir.j, n, m)) {
                continue;
            }
            ok &= dp[monsterI][monsterJ] === dp[monsterI + dir.i][monsterJ + dir.j] + 1;
            ok &= !cells[monsterI][monsterJ].walls[getTheWall(dir.i, dir.j)];
            if (ok) {
                this.i += dir.i;
                this.j += dir.j;
                break;
            }
        }
    }
}