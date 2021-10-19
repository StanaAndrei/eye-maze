import globalVars from "./globalVars.js";

export default class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.walls = new Array(4).fill(true);
        this.vis = false;
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
        p5context.stroke('white');
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
        if (this.vis) {
            p5context.noStroke();
            p5context.fill('blue');
            p5context.rect(startX, startY, globalVars.CELL_W, globalVars.CELL_H);
        }
    }
}