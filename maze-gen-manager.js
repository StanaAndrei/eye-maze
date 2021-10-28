import globalVars from "./globalVars.js";
import isInside from "./is-inside.js";
import { getRandomInt } from "./libs/random.js";

export default class MazeMaker {
    static #getNeighbour = ({ i, j }, vis) => {
        let neighbours = [];
        let top, bottom, left, right;
        const { n, m } = globalVars;
        if (isInside(i - 1, j, n, m))
            top = {i: i - 1, j};
        if (isInside(i + 1, j, n, m))
            bottom = {i: i + 1, j};
        if (isInside(i, j - 1, n, m))
            left = {i, j: j - 1};
        if (isInside(i, j + 1, n, m))
            right = {i, j: j + 1};
    
        if (top && vis[top.i][top.j] !== globalVars.MAX_VIS) {
            neighbours.push(top);
        }
        if (bottom && vis[bottom.i][bottom.j] !== globalVars.MAX_VIS) {
            neighbours.push(bottom);
        }
        if (left && vis[left.i][left.j] !== globalVars.MAX_VIS) {
            neighbours.push(left);
        }
        if (right && vis[right.i][right.j] !== globalVars.MAX_VIS) {
            neighbours.push(right);
        }
    
        if (neighbours.length) {
            const rp = getRandomInt(0, neighbours.length);
            return neighbours[rp];
        }
        return null;
    }

    static #areAllVis(vis) {
        for (let line of vis) {
            for (let field of line) {
                if (field === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    static genMaze({ n, m }) {
        let stack = [];
        let nrVis;
        let mazeWay;
        let vis;
        let genFinished;
        do {
            nrVis = 1;
            mazeWay = [];
            let currCell = { i: 0, j: 0 };
            vis = new Array(n).fill().map(() => new Array(m).fill(0));
            vis[currCell.i][currCell.j]++;
            genFinished = (nrVis > n * m && !stack.length);
            while (!genFinished) {
                mazeWay.push({
                    i: currCell.i,
                    j: currCell.j,
                })
                const nextCell = MazeMaker.#getNeighbour(currCell, vis);
                if (nextCell) {
                    vis[nextCell.i][nextCell.j]++;
                    nrVis++;
                    stack.push(currCell);
                    currCell = nextCell;
                } else if (stack.length) {
                    currCell = stack.pop();
                }
                genFinished = (nrVis > n * m && !stack.length);
            }
        } while (!MazeMaker.#areAllVis(vis));
        return mazeWay;
    }
}