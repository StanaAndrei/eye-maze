import webgazer from "./libs/webgazer.js";
import globalVars from "./globalVars.js";
import Cell from "./cell.js";
import Player from "./player.js";
import Monster from "./monster.js";
import { getDial } from "./geometry.js";
let cells;
let stack = [];
let currCell;
let nrVis = 1;
let player;
let lastDial = -1, timer = 0, lastTimer = 0, timeElapsed = 0;
let startTime = 0;
let wginit = false;
let coins = 0;
let monsters = new Array(3).fill(null);
let eaten = false;

const getNeighbour = ({ i, j }, p5context) => {
    let neighbours = [];
    const top = cells[i - 1]?.[j];
    const bottom = cells[i + 1]?.[j];
    const left = cells[i]?.[j - 1];
    const right = cells[i]?.[j + 1];

    if (top?.vis !== globalVars.MAX_VIS) {
        neighbours.push(top);
    }
    if (bottom?.vis !== globalVars.MAX_VIS) {
        neighbours.push(bottom);
    }
    if (left?.vis !== globalVars.MAX_VIS) {
        neighbours.push(left);
    }
    if (right?.vis !== globalVars.MAX_VIS) {
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

const initP5 = p5context => {
    p5context.setup = () => {
        globalVars.DEBUG = (new URLSearchParams(window.location.search)).has('debug');
        const startX = globalVars.DEBUG ? 0 : 340;
        p5context.frameRate(60);
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
        currCell.vis++;
        player = new Player(0, 0);
        if (globalVars.n > 15) monsters[0] = new Monster(0, globalVars.m - 1);
        if (globalVars.n > 10) monsters[1] = new Monster(globalVars.n - 1, 0);
        monsters[2] = new Monster(globalVars.n - 1, globalVars.m - 1);
    }
    p5context.draw = async () => {
        if (eaten) {
            p5context.textSize(50);
            p5context.fill('red');
            p5context.text(`YOU LOST!\n(a monster ate you)`, p5context.width / 2 - 200, p5context.height / 2);
            p5context.noLoop();
            for (let monster of monsters) {
                monster?.draw(p5context, cells);
            }
            return;
        }
        const genFinished = (nrVis > globalVars.n * globalVars.m && !stack.length);
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
                nextCell.vis++;
                nrVis++;
                stack.push(currCell);
                removeWalls(currCell, nextCell);
                currCell = nextCell;
            } else if (stack.length) {
                currCell = stack.pop();
            }
        } else {
            if (p5context.frameCount % globalVars.MONSTERS_UPDATE_INT === 0) {
                for (let monster of monsters) {
                    monster?.move(player, cells);
                }
            }
            for (let monster of monsters) {
                monster?.draw(p5context, cells);
            }
            coins = player.updateCoinsLogic(cells, coins);
            timeElapsed = startTime ? p5context.millis() - startTime - coins * 3e3 : 0;
            timeElapsed = Math.max(timeElapsed, 0);
            for (let monster of monsters) {
                if (monster && monster.i === player.i && monster.j === player.j) {
                    eaten = true;
                } else {
                    player.draw(p5context, cells, 'green');
                }
            }
            if (player.i === globalVars.n - 1 && player.j === globalVars.m - 1) {
                p5context.textSize(50);
                p5context.fill('CYAN');
                p5context.text(`YOU WON!\n(${timeElapsed}ms)`, p5context.width / 2 - 200, p5context.height / 2);
                p5context.noLoop();
                return;
            }
        }

        //#endregion
        //#region player
        p5context.textSize(25);
        p5context.fill(255, 255, 0, 180);
        p5context.text(`time-elapsed:${timeElapsed}ms`,
            5, p5context.height - 10);
        if (!genFinished) {
            return;
        }
        //console.log(globalVars.MONSTERS_UPDATE_INT);
        //#endregion
        //#region check cells
        if (cells[globalVars.n - 1][0].vis === 0) {
            cells[globalVars.n - 1][0].vis = globalVars.MAX_VIS;;
            cells[globalVars.n - 1][0].walls[0] = cells[globalVars.n - 1][0].walls[1] = false;
            cells[globalVars.n - 2][2].walls[0] = cells[globalVars.n - 1][1].walls[3] = false;
        }
        if (cells[0][globalVars.m - 1].vis === 0) {
            cells[0][globalVars.m - 1].vis = globalVars.MAX_VIS;
            cells[0][globalVars.m - 1].walls[2] = cells[0][globalVars.m - 1].walls[3] = false;
            cells[0][globalVars.m - 2].walls[1] = cells[1][globalVars.m - 1].walls[0] = false;
        }
        if (cells[globalVars.n - 1][globalVars.m - 1] === 0) {
            cells[globalVars.n - 1][globalVars.m - 1] = globalVars.MAX_VIS;
            cells[globalVars.n - 1][globalVars.m - 1].walls[0] =
                cells[globalVars.n - 1][globalVars.m - 1].walls[3] = false;
            cells[globalVars.n - 2][globalVars.m - 1].walls[2] =
                cells[globalVars.n - 1][globalVars.m - 2].walls[1] = false;
        }
        //#endregion
        if (!globalVars.DEBUG && !wginit) {
            webgazer.begin();
            wginit = true;
            globalVars.MONSTERS_UPDATE_INT = 35;
        }

        if (!startTime) {
            startTime = p5context.millis();
        }

        let dial;
        if (!globalVars.DEBUG) {
            const prediction = await webgazer.getCurrentPrediction();
            if (prediction) {
                let { x: eyeX, y: eyeY } = prediction;
                eyeX = Math.abs(eyeX);
                eyeY = Math.abs(eyeY);
                //console.log(eyeX, eyeY);
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

export default initP5;