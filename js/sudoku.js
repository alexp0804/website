
const boardLength = 9;
const canvasSize = 700;
const cellSize = canvasSize / boardLength;

var amSolving = false;
var isSolved = false;
var startSolving = false;

var bgColor = 255;
var fgColor = 0;

var boards = [
    [[5, 3, 4, 6, 7, 0, 9, 1, 0],
     [0, 0, 2, 0, 9, 0, 0, 0, 0],
     [0, 9, 0, 0, 4, 2, 0, 6, 0],
     [8, 0, 0, 0, 6, 0, 0, 0, 3],
     [4, 0, 0, 8, 0, 3, 0, 0, 1],
     [7, 0, 0, 0, 2, 0, 0, 0, 6],
     [0, 6, 0, 0, 0, 0, 2, 8, 0],
     [0, 0, 0, 4, 1, 9, 0, 0, 5],
     [0, 0, 0, 0, 8, 0, 0, 7, 9]],

    [[3, 0, 0, 8, 0, 1, 0, 0, 2],
     [2, 0, 1, 0, 3, 0, 6, 0, 4],
     [0, 0, 0, 2, 0, 4, 0, 0, 0],
     [8, 0, 9, 0, 0, 0, 0, 0, 0],
     [0, 6, 0, 0, 0, 0, 0, 0, 0],
     [7, 0, 2, 0, 0, 0, 0, 0, 0],
     [0, 0, 0, 5, 0, 9, 0, 0, 0],
     [9, 0, 4, 0, 8, 0, 7, 0, 5],
     [6, 0, 0, 1, 0, 7, 0, 0, 3]],

    [[6, 0, 9, 0, 0, 4, 0, 0, 1],
     [8, 0, 0, 0, 5, 0, 0, 0, 0],
     [0, 3, 5, 1, 0, 9, 0, 0, 8],
     [0, 0, 8, 0, 0, 0, 0, 0, 4],
     [0, 5, 0, 0, 0, 0, 0, 3, 0],
     [4, 0, 0, 0, 7, 0, 0, 5, 2],
     [0, 0, 0, 0, 0, 1, 0, 0, 0],
     [0, 0, 1, 0, 4, 0, 0, 0, 0],
     [7, 6, 0, 0, 3, 0, 0, 0, 0]],

    [[1, 0, 0, 0, 0, 9, 0, 0, 0],
     [5, 6, 0, 0, 1, 7, 0, 3, 9],
     [0, 0, 8, 6, 0, 0, 1, 0, 4],
     [6, 0, 9, 0, 0, 0, 0, 0, 0],
     [3, 8, 0, 0, 2, 0, 0, 7, 6],
     [0, 0, 0, 0, 0, 0, 2, 0, 8],
     [4, 0, 5, 0, 0, 1, 6, 0, 0],
     [2, 1, 0, 8, 5, 0, 0, 4, 3],
     [0, 0, 0, 3, 0, 0, 0, 0, 1]],

    [[1, 0, 0, 0, 0, 0, 0, 0, 0],
     [0, 0, 0, 0, 0, 0, 0, 0, 0],
     [0, 0, 0, 0, 0, 0, 0, 0, 0],
     [0, 0, 0, 0, 0, 0, 0, 0, 0],
     [0, 0, 0, 0, 0, 0, 0, 0, 0],
     [0, 0, 0, 0, 0, 0, 0, 0, 0],
     [0, 0, 0, 0, 0, 0, 0, 0, 0],
     [0, 0, 0, 0, 0, 0, 0, 0, 0],
     [0, 0, 0, 0, 0, 0, 0, 0, 0]],
];
var board = boards[0];

// Gets the most up-to-date colors from the CSS, in case of dark-mode to light-mode theme change.
function getColors()
{
    var docGetter = getComputedStyle(document.documentElement);

    bgColor = docGetter.getPropertyValue('--bg-color');
    fgColor = docGetter.getPropertyValue('--text-color');
}

let drawBoard = () => { drawAllCells(); drawGridLines() };

function drawGridLines()
{
    strokeWeight(4);

    stroke(fgColor);
    for (let i = 1; i <= 2; i++) 
    {
        line(cellSize * 3 * i, 0, cellSize * 3 * i, canvasSize);
        line(0, cellSize * 3 * i, canvasSize, cellSize * 3 * i);
    }

    strokeWeight(1);
}
function drawAllCells()
{
    for (let row = 0; row < boardLength; row++)
    {
        for (let col = 0; col < boardLength; col++)
        {
            drawCellAt(row, col);
        }
    }
}
function drawCellAt(x, y) 
{
    let value = board[y][x];

    let x_corner = x * cellSize,
        y_corner = y * cellSize,
        x_middle = x_corner + cellSize * 0.5
        y_middle = y_corner + cellSize * 0.5;

    // Clear cell
    fill(bgColor);
    rectMode(CORNER);
    rect(x_corner, y_corner, cellSize);

    // Draw text onto cell
    fill(fgColor);
    rectMode(CENTER);
    if (value != 0)
        text(value.toString(), x_middle, y_middle + 3);
}

// Returns true if placing the key at the cell x, y would not violate any Sudoku rules.
function isValid(x, y, key) 
{
    // Check current row and column
    for (let i = 0; i < boardLength; i++) 
    {
        if (i != y && board[x][i] == key)
        {
            return false;
        }

        if (i != x && board[i][y] == key)
        {
            return false;
        }
    }

    // Checks the subgrid that the given x,y falls inside.
    let subX = Math.floor(x / 3), subY = Math.floor(y / 3);

    for (let i = subX * 3; i < subX * 3 + 3; i++) 
    {
        for (let j = subY * 3; j < subY * 3 + 3; j++)
        {
            if (board[i][j] == key && x != i && y != j)
            {
                return false;
            }
        }
    }

    return true;
}

// Finds the first empty cell on the board.
function nextCell() 
{
    for (let row = 0; row < boardLength; row++)
    {
        for (let col = 0; col < boardLength; col++)
        {
            if (board[row][col] == 0)
            {
                return [row, col];
            }
        }
    }

    return false;
}

// Returns true if all cells on the board are non-zero.
function full() 
{
    for (let i = 0; i < boardLength; i++)
    {
        for (let j = 0; j < boardLength; j++)
        {
            if (board[i][j] == 0)
            {
                return false;
            }
        }
    }

    return true;
}

// Sleeps for the given number of milliseconds.
function sleep(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function solve(row, col) 
{
    // If the current board is invalid, go back and try another one.
    if (!isValid(row, col, board[row][col]))
        return false;

    // If the board is full it is solved.
    if (full())
        return true;

    let [nextRow, nextCol] = nextCell();

    for (let i = 1; i < 10; i++) 
    {
        // Try this possibility.
        board[nextRow][nextCol] = i;

        // Artificially slow down the program to make the drawing visible.
        await sleep(0.1);

        // We solved the board!
        if (await solve(nextRow, nextCol)) 
            return true;

        // We didn't solve the board. Undo our change.
        board[nextRow][nextCol] = 0;
    }

    // This will never happen as if the sudoku is properly formed.
    return false;
}

function setup() 
{
    var canvas = createCanvas(canvasSize, canvasSize);
    canvas.parent("display-canvas");

    textSize(40);
    textAlign(CENTER, CENTER);
    textFont('monospace');

    // Drop-down for selecting puzzle
    puzzleSelect = createSelect();
    puzzleSelect.parent("button-container");

    // 1, 2, ..., num boards - 1
    options = [...Array(boards.length).keys()];
    // Construct the drop-down
    options.map(x => puzzleSelect.option(`Puzzle #${x+1}`));

    // Start button for starting the solve
    startSolve = createButton("Start");
    startSolve.parent("button-container");

    // Process drop-down change
    puzzleSelect.changed(() => {
        if (amSolving) return;
        let n = parseInt(puzzleSelect.value().replace(/\D/g, ""));
        board = boards[n-1];
    });

    // Process start button pressed
    startSolve.mousePressed(() => {
        if (amSolving) return;
        startSolving = true;
    });
}

function draw() 
{
    getColors();

    if (startSolving) 
    {
        solve(0, 0).then(() => isSolved = true);
        puzzleSelect.disable();
        startSolving = false;
        amSolving = true;
    }

    if (isSolved)
    {
        puzzleSelect.removeAttribute('disabled');
        amSolving = isSolved = false;
    }

    drawBoard();
}