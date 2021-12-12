
var canvasSize = 700;
var numCells = 30;
var cellSize = canvasSize / numCells;
var cells = [];
var stack = [];
var nextCell;
var currentCell;
var neighbors = [];
var myCell;
var generators = [];

class Cell 
{
    constructor(x, y)
    {
      this.x = x;
      this.y = y;

      this.walls = [true, true, true, true] // Top, left, right, bottom
      this.visited = false;
    }

    drawCell() {
        strokeWeight(1);

        var tl = [this.x * cellSize, this.y * cellSize], 
            tr = [(this.x + 1) * cellSize, this.y * cellSize], 
            bl = [this.x * cellSize, (this.y + 1) * cellSize], 
            br = [(this.x + 1) * cellSize, (this.y + 1) * cellSize];


        if (this.walls[0])
            line(tl[0], tl[1], tr[0], tr[1]);

        if (this.walls[1])
            line(bl[0], bl[1], tl[0], tl[1]);

        if (this.walls[2])
            line(tr[0], tr[1], br[0], br[1]);

        if (this.walls[3])
            line(br[0], br[1], bl[0], bl[1]);
    }
}

function newMaze() 
{
    for (let i = 0; i < numCells; i++) 
    {
        for (let j = 0; j < numCells; j++) {
            cells[i][j].visited = false;

            for (let k = 0; k < cells[i][j].walls.length; k++)
                cells[i][j].walls[k] = true;
        }
    }

    stack = [];
    generators.push(genNextCell());
    currentCell = cells[0][0];

    background(255);
    loop();
}

function removeWalls(cellA, cellB) 
{
    let x1 = cellA.x, y1 = cellA.y, x2 = cellB.x, y2 = cellB.y;

    if (x1 - x2 == -1) {
        cellA.walls[2] = false
        cellB.walls[1] = false
    }
    if (x1 - x2 == 1) {
        cellA.walls[1] = false
        cellB.walls[2] = false
    }
    if (y1 - y2 == -1) {
        cellA.walls[3] = false
        cellB.walls[0] = false
    }
    if (y1 - y2 == 1) {
        cellA.walls[0] = false
        cellB.walls[3] = false
    }
}

function inRange(x, y, range) {
    return (x >= 0 && x < range) && (y >= 0 && y < range);
}

function findNeighbors(cells, x, y) {
    let neighbors = [];
    let vals = [-1, 1];

    // Gets cell above, below, to the right and left of the current cell.
    for (const val of vals) {
        if (inRange(x - val, y, cells.length) && !cells[x - val][y].visited) {
            neighbors.push(cells[x - val][y]);
        }
        if (inRange(x, y - val, cells.length) && !cells[x][y - val].visited) {
            neighbors.push(cells[x][y - val]);
        }
    }

    return neighbors;
}

function* genNextCell() {
    currentCell.visited = true;
    stack.push(currentCell);

    while (stack.length > 0) {
        currentCell = stack.pop();

        for (let i = 0; i < stack.length; i++) {
            circle(stack[i].x * cellSize + cellSize / 2, stack[i].y * cellSize + cellSize / 2, 10);
        }

        yield currentCell;

        neighbors = findNeighbors(cells, currentCell.x, currentCell.y);

        if (neighbors.length > 0) {
            stack.push(currentCell);

            nextCell = random(neighbors);
            nextCell.visited = true;
            removeWalls(currentCell, nextCell);

            stack.push(nextCell);
        }
    }
}

function setup()
{
    var canvas = createCanvas(canvasSize, canvasSize);
    canvas.parent("display-canvas");

    var clearButton = createButton("New Maze");
    clearButton.mousePressed(newMaze);
    clearButton.parent("button-container");

    for (var i = 0; i < numCells; i++) {
        cells[i] = [];
        for (var j = 0; j < numCells; j++) {
            cells[i].push(new Cell(i, j));
        }
    }

    currentCell = cells[0][0];
    frameRate(40);

    generators.push(genNextCell());
}

function draw()
{
    background(255);

    for (let i = 0; i < numCells; i++)
        for (let j = 0; j < numCells; j++)
            cells[i][j].drawCell();

    myCell = generators[generators.length - 1].next().value;

    if (!myCell)
        noLoop();

    myCell.drawCell();
    fill(color('#17223B'));
    rect(myCell.x * cellSize, myCell.y * cellSize, cellSize);
}
