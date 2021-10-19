import webgazer from "./res/webgazer.js";
import "https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js";
import globalVars from "./globalVars.js";
import Cell from "./cell.js";
import Player from "./player.js";
let cells;
let stack = [];
let currCell;
let nrVis = 1;
let player;
let lastDial = -1, timer = 0, lastTimer = 0;
let startTime = 0;
let wginit = false;

const getNeighbour = ({ i, j }, p5context) => {
    let neighbours = [];
    const top = cells[i - 1]?.[j];
    const bottom = cells[i + 1]?.[j];
    const left = cells[i]?.[j - 1];
    const right = cells[i]?.[j + 1];

    if (top?.vis === false) {
        neighbours.push(top);
    }
    if (bottom?.vis === false) {
        neighbours.push(bottom);
    }
    if (left?.vis === false) {
        neighbours.push(left);
    }
    if (right?.vis === false) {
        neighbours.push(right);
    }

    if (neighbours.length) {
        const rp = p5context.floor(p5context.random(0, neighbours.length));
        return neighbours[rp];
    }
    return null;
}

const removeWalls = (cell1, cell2) => {
    if (Math.abs(cell1.i - cell2.i) > 1 || Math.abs(cell1.i - cell2.i) > 1) {
        throw new Error('PARAM EXE!');
    }

    const diffI = cell1.i - cell2.i;
    if (diffI === 1) {
        cell1.walls[0] = false;
        cell2.walls[2] = false;
    } else if (diffI === -1) {
        cell1.walls[2] = false;
        cell2.walls[0] = false;
    }

    const diffJ = cell1.j - cell2.j;
    if (diffJ === 1) {
        cell1.walls[3] = false;
        cell2.walls[1] = false;
    } else if (diffJ === -1) {
        cell1.walls[1] = false;
        cell2.walls[3] = false;
    }
}

const getPointSide = (x1, y1, x2, y2, x, y) => {
    if (y1 > y2) {
        [x1, x2] = [x2, x1];
        [y1, y2] = [y2, y1];
    }
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let mx = Math.abs(x - x1);
    let my = Math.abs(y - y1);
    let cross = (dx * my - dy * mx);
    if (cross === 0) {
        return 0;
    }
    let below = cross > 0;
    if (dx) {
        if (dy / dx < 0) {
            below = !below;
        }
    }
    return below ? -1 : 1;
}

const getDial = (i, j, { width, height }) => {
    let sideBesideFi = getPointSide(0, 0, width, height, i, j);
    let sideBesideSe = getPointSide(width, 0, 0, height, i, j);
    if (sideBesideFi === 1) {//over main diag
        if (sideBesideSe === 1) {//over sec diag
            return 0;
        } else {
            return 1;
        }
    } else {
        if (sideBesideSe === 1) {//over sec diag
            return 3;
        } else {
            return 2;
        }
    }
}

const initP5 = p5context => {
    p5context.setup = () => {
        globalVars.DEBUG = (new URLSearchParams(window.location.search)).has('debug');
        player = new Player(0, 0);
        const startX = globalVars.DEBUG ? 0 : 340;
        let canvas = p5context.createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(startX, 0, 'fixed');
        globalVars.CELL_W = (window.innerWidth - startX) / globalVars.n;
        globalVars.CELL_H = window.innerHeight / globalVars.m;
        Math.floor(p5context.width / globalVars.CELL_W);
        Math.floor(p5context.height / globalVars.CELL_H);
        cells = new Array(globalVars.n);
        for (let i = 0; i < globalVars.n; i++) {
            cells[i] = [];
            for (let j = 0; j < globalVars.m; j++) {
                cells[i].push(new Cell(i, j));
            }
        }
        currCell = cells[0][0];
        currCell.vis = true;
    }
    p5context.draw = async () => {
        const genFinished = (nrVis === globalVars.n * globalVars.m && !stack.length);
        p5context.background('black');
        //#region draw maze
        for (let i = 0; i < globalVars.n; i++) {
            for (let j = 0; j < globalVars.m; j++) {
                cells[i][j].draw(p5context);
            }
        }
        //#endregion
        //#region dfs
        if (!genFinished) {
            currCell.highlight(p5context, 'purple');
            const nextCell = getNeighbour(currCell, p5context);
            if (nextCell) {
                nextCell.vis = true;
                nrVis++;
                stack.push(currCell);
                removeWalls(currCell, nextCell);
                currCell = nextCell;
            } else if (stack.length) {
                currCell = stack.pop();
            }
        } else {
            player.draw(p5context, cells, 'green');
            if (player.i === globalVars.n - 1 && player.j === globalVars.m - 1) {
                p5context.textSize(50);
                p5context.fill('CYAN');
                p5context.text(`YOU WON!\n(${p5context.millis() - startTime}ms)`, p5context.width / 2 - 200, p5context.height / 2);
                p5context.noLoop();
                return;
            }
        }

        //#endregion
        //#region player
        p5context.textSize(25);
        p5context.fill(255, 255, 0, 180);
        p5context.text(`time-elapsed:${startTime ? p5context.millis() - startTime : 0}`,
            5, p5context.height - 10);
        if (!genFinished) {
            return;
        }
        if (!globalVars.DEBUG && !wginit) {
            webgazer.begin();
            wginit = true;
        }

        if (!startTime) {
            startTime = p5context.millis();
        }

        let dial;
        if (!globalVars.DEBUG) {
            const prediction = await webgazer.getCurrentPrediction();
            if (prediction) {
                let {x: eyeX, y: eyeY} = prediction;
                eyeX = Math.abs(eyeX);
                eyeY = Math.abs(eyeY);
                console.log(eyeX, eyeY);
                dial = getDial(eyeX, eyeY, p5context);
            }
        } else {
            const { mouseX, mouseY } = p5context;
            dial = getDial(mouseX, mouseY, p5context);
        }
        timer = p5context.millis();
        if (dial === lastDial) {
            if (!(timer >= lastTimer + globalVars.DELTA_TIME)) {
                return;
            }
        } else {
            lastTimer = p5context.millis();
            lastDial = dial;
            return;
        }//*/
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
        lastDial = -1;
        //*/
        //#endregion
    }

}

document.querySelector('#size-setter').addEventListener('submit', e => {
    e.preventDefault();
    const size = Number(document.querySelector('#dims').value);
    globalVars.n = globalVars.m = size;
    new p5(initP5, document.querySelector('#maze-area'));
    document.querySelector('#initial-phase').style.display = 'none';
    document.querySelector('#maze-area').style.display = 'block';
})