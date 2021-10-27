import globalVars from "./globalVars.js";

export const getNeighbour = ({ i, j }, p5context, cells) => {
    let neighbours = [];
    const top = cells?.[i - 1]?.[j];
    const bottom = cells?.[i + 1]?.[j];
    const left = cells?.[i]?.[j - 1];
    const right = cells?.[i]?.[j + 1];

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


export const removeWalls = (cell1, cell2) => {
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
