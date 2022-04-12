export default class Writer {
    static writeTime(p5context, timeElapsed) {
        p5context.textSize(25);
        p5context.fill(255, 255, 0, 180);
        p5context.text(`time-elapsed: ${timeElapsed}ms`,
            5, p5context.height - 10);
    }

    static writeDefeat(p5context) {
        p5context.textSize(50);
        p5context.fill('red');
        p5context.text(`YOU LOST!\n(a monster ate you)`, p5context.width / 2 - 200, p5context.height / 2);
    }

    static writeWon(p5context, timeElapsed) {
        p5context.textSize(50);
        p5context.fill('CYAN');
        p5context.text(`YOU WON!\n(${timeElapsed}ms)`, p5context.width / 2 - 200, p5context.height / 2);
    }
}