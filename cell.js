import globalVars from "./globalVars.js";

export default class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.walls = new Array(4).fill(true);
        this.vis = 0;
        this.hasCoin = i && j && Math.random() < .25;
    }

    highlight(p5context, color) {
        const startX = this.j * globalVars.CELL_W;
        const startY = this.i * globalVars.CELL_H;
        p5context.noStroke();
        p5context.fill(color);
        p5context.rect(startX, startY, globalVars.CELL_W - 3, globalVars.CELL_H - 5);
    }

    draw(p5context) {
        const startX = this.j * globalVars.CELL_W;
        const startY = this.i * globalVars.CELL_H;
        p5context.stroke(255, 255, 255, 200);
        p5context.strokeWeight(4);
        //walls
        if (this.walls[0] === true) {
            p5context.line(startX, startY, startX + globalVars.CELL_W, startY);
        }
        if (this.walls[1] === true) {
            p5context.line(startX + globalVars.CELL_W, startY, startX + globalVars.CELL_W,
                 startY + globalVars.CELL_H);//*/
        }
        if (this.walls[2] === true) {
            p5context.line(startX + globalVars.CELL_W, startY + globalVars.CELL_H, startX,
                 startY + globalVars.CELL_H);
        }
        if (this.walls[3] === true) {
            p5context.line(startX, startY + globalVars.CELL_H, startX, startY);
        } 
        //cell
        if (this.vis > 0) {
            p5context.noStroke();
            p5context.fill(0, 0, 255, 200);//blue
            p5context.rect(startX, startY, globalVars.CELL_W, globalVars.CELL_H);
        }
        //coin
        if (this.hasCoin) {
            p5context.push();
            p5context.fill(255, 251, 0, 200);
            p5context.circle(
                startX + globalVars.CELL_W / 2,
                startY + globalVars.CELL_H / 2,
                globalVars.CELL_W / 8
            );
            p5context.pop();
        }
    }
}