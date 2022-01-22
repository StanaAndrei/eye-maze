import "https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js";
import initP5 from "./sketch.js";
import globalVars from "./globalVars.js";

window.onload = () => {
    localStorage.keybd = false;
    completeCurrMode();
}

document.querySelector('#size-setter > input').focus();
document.querySelector('#size-setter').addEventListener('submit', e => {
    e.preventDefault();
    const size = Number(document.querySelector('#dims').value);
    globalVars.n = globalVars.m = size;
    new p5(initP5, document.querySelector('#maze-area'));
    document.querySelector('#initial-phase').style.display = 'none';
    document.querySelector('#maze-area').style.display = 'block';
})

function completeCurrMode() {
    let mode;
    if (localStorage.keybd === 'true') {
        mode = 'keyboard';
    } else {
        mode = 'eyes-controlled';
    }
    document.querySelector('#curr-mode').innerHTML = `Current input mode: <span id="curr-mode-val">${mode}! </span>`;
}

document.querySelector('#switch-modes').addEventListener('click', e => {
    e.preventDefault();
    if (localStorage.keybd === 'true') {
        localStorage.keybd = false;
    } else {
        localStorage.keybd = true;
    }
    completeCurrMode();
})