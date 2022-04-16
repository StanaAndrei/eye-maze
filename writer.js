export default class Writer {
    static writeTime(p5context, timeElapsed) {//in ms
        p5context.textSize(25);
        p5context.fill(255, 255, 0, 180);

        let ms = timeElapsed % 1000;
        ms = Math.trunc(ms);
        const msF = `${ms < 100 ? 0 : ''}${ms < 10 ? 0 : ''}${ms}`;

        let secs = (timeElapsed / 1000) % 60;
        secs = Math.trunc(secs);
        const secsF = `${secs < 10 ? 0 : ''}${secs}`;

        let mins = (timeElapsed / 1000) / 60;
        mins = Math.trunc(mins);
        const minsF = `${mins < 10 ? 0 : ''}${mins}`;

        p5context.text(`time-elapsed: ${minsF}:${secsF}.${msF}`,
            5, p5context.height - 10);
    }

    static writeDefeat(p5context) {
        p5context.textSize(50);
        p5context.fill('red');
        p5context.text(`YOU LOST!\n(a monster ate you)`, p5context.width / 2 - 200, p5context.height / 2);
    }

    static writeWon(p5context) {
        p5context.textSize(50);
        p5context.fill('CYAN');
        p5context.text(`YOU WON!`, p5context.width / 2 - 200, p5context.height / 2);
    }
}