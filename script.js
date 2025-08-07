const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get("mode");
let vsComputer = (mode === "vsComp");

let boxes, reset, newGame, msgContainer, msg;
let turnO = true; // true for O's turn, false for X's turn
let isGameOver = false;
let scores = { X: 0, O: 0, draw: 0 }; // Track scores

// DOM elements for scores and turn display
let currentPlayerDisplay, xScoreDisplay, oScoreDisplay, drawScoreDisplay;

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

document.addEventListener("DOMContentLoaded", () => {
    boxes = document.querySelectorAll(".box");
    reset = document.querySelector("#reset");
    newGame = document.querySelector("#new");
    msgContainer = document.querySelector(".msg-container");
    msg = document.querySelector("#msg");
    
    // Initialize score and turn display elements
    currentPlayerDisplay = document.getElementById("current-player") || createTurnDisplay();
    xScoreDisplay = document.querySelector(".score:nth-child(1) span") || createScoreDisplay();
    oScoreDisplay = document.querySelector(".score:nth-child(2) span") || createScoreDisplay();
    drawScoreDisplay = document.querySelector(".score:nth-child(3) span") || createScoreDisplay();

    boxes.forEach((box, idx) => {
        box.addEventListener("click", () => handleMove(idx));
    });

    reset.addEventListener("click", resetGame);
    newGame.addEventListener("click", newGameHandler);

    // Initialize displays
    updateTurnDisplay();
    updateScores();
    
    resetGame();
});

// Create missing elements if they don't exist in HTML
function createTurnDisplay() {
    const container = document.createElement('div');
    container.className = 'turn-indicator';
    container.innerHTML = `Current turn: <span id="current-player">${turnO ? 'O' : 'X'}</span>`;
    document.querySelector('main').insertBefore(container, document.querySelector('.container'));
    return document.getElementById("current-player");
}

function createScoreDisplay() {
    const scoreContainer = document.createElement('div');
    scoreContainer.className = 'scoreboard';
    scoreContainer.innerHTML = `
        <div class="score">X: <span>0</span></div>
        <div class="score">O: <span>0</span></div>
        <div class="score">Draw: <span>0</span></div>
    `;
    document.querySelector('main').insertBefore(scoreContainer, document.querySelector('.container'));
    return {
        x: document.querySelector('.score:nth-child(1) span'),
        o: document.querySelector('.score:nth-child(2) span'),
        draw: document.querySelector('.score:nth-child(3) span')
    };
}

function handleMove(index) {
    if (boxes[index].innerText !== "" || isGameOver) return;

    boxes[index].innerText = turnO ? "O" : "X";
    turnO = !turnO;
    updateTurnDisplay();
    checkWinner();

    if (vsComputer && !turnO && !isGameOver) {
        setTimeout(() => {
            let bestMove = getBestMove();
            handleMove(bestMove);
        }, 300);
    }
}

function checkWinner() {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (
            boxes[a].innerText !== "" &&
            boxes[a].innerText === boxes[b].innerText &&
            boxes[b].innerText === boxes[c].innerText
        ) {
            const winner = boxes[a].innerText;
            scores[winner]++;
            updateScores();
            showWinner(winner);
            return;
        }
    }

    // Check draw
    if ([...boxes].every(box => box.innerText !== "")) {
        scores.draw++;
        updateScores();
        msg.innerText = "It's a Draw!";
        msgContainer.classList.remove("hide");
        isGameOver = true;
    }
}

function showWinner(winner) {
    msg.innerText = `Winner is ${winner}`;
    msgContainer.classList.remove("hide");
    isGameOver = true;
}

function resetGame() {
    turnO = true;
    isGameOver = false;
    boxes.forEach(box => {
        box.innerText = "";
        box.style.pointerEvents = "auto";
    });
    msgContainer.classList.add("hide");
    updateTurnDisplay();

    if (vsComputer && !turnO) {
        setTimeout(() => {
            let bestMove = getBestMove();
            handleMove(bestMove);
        }, 300);
    }
}

function newGameHandler() {
    resetGame();
    // Don't reset scores for new game
}

function updateTurnDisplay() {
    if (currentPlayerDisplay) {
        currentPlayerDisplay.textContent = turnO ? "O" : "X";
        currentPlayerDisplay.style.color = turnO ? "#ea4335" : "#4285f4";
    }
}

function updateScores() {
    if (xScoreDisplay) xScoreDisplay.textContent = scores.X;
    if (oScoreDisplay) oScoreDisplay.textContent = scores.O;
    if (drawScoreDisplay) drawScoreDisplay.textContent = scores.draw;
}

document.querySelector("#back-home").addEventListener("click", () => {
    window.location.href = "index.html";
});

// AI Functions (keep your existing implementation)
function getBestMove() {
    let bestScore = -Infinity;
    let move = -1;

    boxes.forEach((box, idx) => {
        if (box.innerText === "") {
            box.innerText = "X"; // Computer is 'X'
            let score = minimax(false);
            box.innerText = "";
            if (score > bestScore) {
                bestScore = score;
                move = idx;
            }
        }
    });

    return move;
}

function minimax(isMaximizing) {
    const winner = getGameResult();
    if (winner !== null) {
        if (winner === "X") return 1;
        if (winner === "O") return -1;
        return 0;
    }

    if (isMaximizing) {
        let best = -Infinity;
        boxes.forEach((box, i) => {
            if (box.innerText === "") {
                box.innerText = "X";
                best = Math.max(best, minimax(false));
                box.innerText = "";
            }
        });
        return best;
    } else {
        let best = Infinity;
        boxes.forEach((box, i) => {
            if (box.innerText === "") {
                box.innerText = "O";
                best = Math.min(best, minimax(true));
                box.innerText = "";
            }
        });
        return best;
    }
}

function getGameResult() {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (
            boxes[a].innerText !== "" &&
            boxes[a].innerText === boxes[b].innerText &&
            boxes[b].innerText === boxes[c].innerText
        ) {
            return boxes[a].innerText;
        }
    }

    if ([...boxes].every(box => box.innerText !== "")) {
        return "Draw";
    }

    return null;
}