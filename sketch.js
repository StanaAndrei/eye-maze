import 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.1/addons/p5.sound.min.js';
import webgazer from "./libs/webgazer.js";
import globalVars from "./globalVars.js";
import Cell from "./cell.js";
import Player from "./player.js";
import Monster from "./monster.js";
import { getDial } from "./geometry.js";
import MazeMaker from "./maze-gen-manager.js";
import handleMovement from "./handle-movement.js";
import Writer from "./writer.js";
let cells;
let player;
let lastDial = -1;
let timer = 0, lastTimer = 0, timeElapsed = 0, startTime = 0;
let wginit = false;
let coins = 0;
let monsters = new Array(3).fill(null);
let eaten = false;
let poses = [], posesIt = 1;
let mazeSound;

export default function initP5(p5context) {
    p5context.preload = () => {
        globalVars.MINER_IMG = p5context.loadImage(globalVars.MINER_IMG_ADR)
        globalVars.MONSTER_GIF = p5context.loadImage(globalVars.MONSTER_GIF_ADR);
        globalVars.PLAYER_IMG = p5context.loadImage(globalVars.PLAYER_IMG_ADR);

        mazeSound = p5context.loadSound('sound/maze-sound.mp3');
    }

    p5context.setup = () => {
        globalVars.DEBUG = (new URLSearchParams(window.location.search)).has('debug');
        const startX = globalVars.DEBUG || localStorage.keybd === 'true' ? 0 : 340;
        p5context.frameRate(60);
        let canvas = p5context.createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(startX, 0, 'fixed');
        globalVars.CELL_W = (window.innerWidth - startX) / globalVars.n;
        globalVars.CELL_H = window.innerHeight / globalVars.m;
        Math.floor(p5context.width / globalVars.CELL_W);
        Math.floor(p5context.height / globalVars.CELL_H);
        cells = new Array(globalVars.n).fill().map(() => []);
        for (let i = 0; i < globalVars.n; i++) {
            for (let j = 0; j < globalVars.m; j++) {
                cells[i].push(new Cell(i, j));
            }
        }
        player = new Player(0, 0);
        if (globalVars.n > 10) monsters[0] = new Monster(0, globalVars.m - 1);
        if (globalVars.n > 20) monsters[1] = new Monster(globalVars.n - 1, 0);
        if (globalVars.n > 25) monsters[2] = new Monster(globalVars.n - 1, globalVars.m - 1);
        poses = MazeMaker.genMaze(globalVars);

        mazeSound.loop();
    }
    p5context.draw = async () => {
        //return;
        if (eaten) {
            Writer.writeDefeat(p5context);
            p5context.noLoop();
            for (let monster of monsters) {
                monster?.draw(p5context, cells);
            }
            return;
        }
        p5context.background('black');
        //#region draw maze
        for (let i = 0; i < globalVars.n; i++) {
            for (let j = 0; j < globalVars.m; j++) {
                cells[i][j].draw(p5context);
            }
        }
        //#endregion
        //#region dfs
        if (posesIt !== poses.length) {
            const { i: i1, j: j1 } = poses[posesIt - 1];
            const { i: i2, j: j2 } = poses[posesIt];
            cells[i1][j1].highlight(p5context, globalVars.MINER_IMG);
            cells[i1][j1].vis = true;
            Cell.removeWalls(cells[i1][j1], cells[i2][j2]);
            posesIt++;
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
            timeElapsed = startTime ? p5context.millis() - startTime - coins * 1e3 : 0;
            timeElapsed = Math.max(timeElapsed, 0);
            for (let monster of monsters) {
                if (monster && monster.i === player.i && monster.j === player.j) {
                    eaten = true;
                } else {
                    player.draw(p5context, cells, 'green');
                }
            }
            if (player.i === globalVars.n - 1 && player.j === globalVars.m - 1) {
                Writer.writeWon(p5context);
                Writer.writeTime(p5context, Math.trunc(timeElapsed));
                p5context.noLoop();
                return;
            }
        }
        Writer.writeTime(p5context, Math.trunc(timeElapsed));
        if (posesIt !== poses.length) {
            return;
        }
        //init wg
        if (!globalVars.DEBUG && localStorage.keybd !== 'true' && !wginit) {
            webgazer.begin();
            wginit = true;
            globalVars.MONSTERS_UPDATE_INT = 35;
        }

        if (localStorage.keybd === 'true') {
            globalVars.MONSTERS_UPDATE_INT = 15;
        }

        if (!startTime) {
            startTime = p5context.millis();
        }

        let dial;
        if (!globalVars.DEBUG && localStorage.keybd !== 'true') {
            const prediction = await webgazer.getCurrentPrediction();
            if (prediction) {
                let { x: eyeX, y: eyeY } = prediction;
                eyeX = Math.abs(eyeX);
                eyeY = Math.abs(eyeY);
                //console.log(eyeX, eyeY);
                dial = getDial(eyeX, eyeY, p5context);
            }
        } else if (globalVars.DEBUG) {
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
        handleMovement(dial, player, cells);
        lastDial = -1;
    }

    p5context.keyPressed = () => {
        const canUseKb = localStorage.keybd === 'true' && !globalVars.DEBUG;

        //press 'M'
        if (p5context.keyCode === 77) {
            if (mazeSound.isPlaying()) {
                mazeSound.pause();
            } else {
                mazeSound.loop();
            }
            return;
        }

        if (!canUseKb) {
            return;
        }

        const {
            LEFT_ARROW,
            RIGHT_ARROW,
            UP_ARROW,
            DOWN_ARROW
        } = p5context;

        if (p5context.keyCode === UP_ARROW) {
            handleMovement(0, player, cells);
        } else if (p5context.keyCode === RIGHT_ARROW) {
            handleMovement(1, player, cells);
        } else if (p5context.keyCode === DOWN_ARROW) {
            handleMovement(2, player, cells);
        } else if (p5context.keyCode === LEFT_ARROW) {
            handleMovement(3, player, cells);
        }
    }
}