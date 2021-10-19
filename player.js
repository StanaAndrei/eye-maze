export default class Player {
    constructor(i, j) {
        this.i = i;
        this.j = j;
    }

    move(dir, n, m) {
        if (!dir) {
            throw new Error('!OK DIR!');
        }
        let isInside = true;
        isInside &= 0 <= this.i + dir.deltaI && this.i + dir.deltaI <= n;
        isInside &= 0 <= this.j + dir.deltaJ && this.j + dir.deltaJ <= m;
        
        if (isInside) {
            this.i += dir.deltaI
            this.j += dir.deltaJ;
        }
    }

    static get DIRS() {
        return {
            RIGHT: { deltaI: 0, deltaJ: 1 },
            LEFT: { deltaI: 0, deltaJ: -1 },
            UP: { deltaI: -1, deltaJ: 0 },
            DOWN: { deltaI: 1, deltaJ: 0 },
        }
    }

    draw(p5context, cells, color) {
        const { i, j } = this;
        cells[i][j].highlight(p5context, color);
    }
}