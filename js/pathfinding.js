
const canvasSize = 700;
const numNodes = 60;
const nodeSize = canvasSize / numNodes;

var nodes = [];
var prevWall;

var startPlaced = false;
var endPlaced = false;
var startNode;
var endNode;

var bgColor;
var endPointColor;
const searchedColor = 'darkgrey';
const wallColor = 'black';
var colorChanged = false;

var finished = false;

class Node 
{
    constructor(x, y) 
    {
        this.x = x;
        this.y = y;

        this.fScore = 0;
        this.gScore = Infinity;

        this.wall = false;
        this.visited = false;
        this.searched = false;
        this.previous = null;
    }

    drawNode(color) 
    {
        fill(color);
        rect(this.x * nodeSize, this.y * nodeSize, nodeSize);
    }
}

// We don't need the *actual* euclidean distance between two nodes as long as 
// the comparisons are equivalent. This saves plenty of sqrt() calculations!
function distance(nodeA, nodeB) 
{
    return (nodeB.x - nodeA.x) ** 2 + (nodeB.y - nodeA.y) ** 2;
}

// Tests if a given x, y coordinate is in bounds of the global node grid.
function inBounds(x, y) 
{
    return (x >= 0 && x < numNodes) && (y >= 0 && y < numNodes);
}

// Used to create delay in asynchronous functions, or namely just aStar().
function sleep(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Returns a list of surrounding nodes (excluding diagonal neighbors), given a node.
function findNeighbors(node) 
{
    let x = node.x, y = node.y, neighbors = [];

    // Add up/down, left/right neighbors.
    // We exclude the already visited nodes as well as any walls.
    for (let i = -1; i <= 1; i += 2) 
    {
        if (inBounds(x, y+i) && !nodes[x][y+i].visited && !nodes[x][y+i].wall)
            neighbors.push(nodes[x][y + i]);

        if (inBounds(x+i, y) && !nodes[x+i][y].visited && !nodes[x+i][y].wall)
            neighbors.push(nodes[x + i][y]);
    }

    return neighbors;
}

// See https://en.wikipedia.org/wiki/A*_search_algorithm#Description for a
// detailed explanation.
async function aStar(startNode, endNode) 
{
    let openSet = [startNode];

    startNode.gScore = 0;
    startNode.fScore = distance(startNode, endNode);

    while (openSet.length > 0) 
    {
        openSet.sort((a, b) => (a.fScore - b.fScore));

        let current = openSet[0];
        openSet.shift();

        let neighbors = findNeighbors(current);

        if (current == endNode)
            return;

        for (let i = 0; i < neighbors.length; i++) 
        {
            let testGScore = current.gScore + distance(current, neighbors[i]);

            if (testGScore < neighbors[i].gScore) 
            {
                let n = neighbors[i];

                await sleep(0.5);

                n.drawNode(color('darkgrey'));
                n.searched = true;

                n.previous = current;
                n.gScore = testGScore;
                n.fScore = n.gScore + distance(n, endNode);

                if (!openSet.includes(n))
                    openSet.push(n);
            }
        }
    }
}

// Gets the x,y coordinate of the cell that the mouse is over.
function getMouseCellXY()
{
    return [Math.floor(mouseX / nodeSize), y = Math.floor(mouseY / nodeSize)];
}

// Places the start node. Returns true if placement successful.
function placeStart() 
{
    let [x, y] = getMouseCellXY();

    if (inBounds(x, y)) 
    {
        startNode = nodes[x][y];
        return true;
    }

    return false;
}

// Places the end node. Returns true if placement successful.
function placeEnd() 
{
    let [x, y] = getMouseCellXY();

    // Only place the end node if it's not in the same location as the start node.
    if (inBounds(x, y) && nodes[x][y] != startNode) 
    {
        endNode = nodes[x][y];
        return true;
    }

    return false;
}

// Places wall node on mouse location.
function placeWall() 
{
    let [x, y] = getMouseCellXY();

    // Only place wall if its within bounds, and not a start or end node. 
    // Also prevents from changing the wall that was 
    // just changed, to avoid flickering.
    if (inBounds(x, y) && ![prevWall, startNode, endNode].includes(nodes[x][y]))
    {
        nodes[x][y].wall = true;
        prevWall = nodes[x][y];
    }
}

// Calls A* once both start and end nodes are placed.
function start() 
{
    if (startPlaced && endPlaced)
        aStar(startNode, endNode);
}

// Resets all nodes and walls.
function reset() 
{

    background(color(bgColor));

    for (let i = 0; i < numNodes; i++) 
    {
        for (let j = 0; j < numNodes; j++) 
        {
            nodes[i][j].fScore = 0
            nodes[i][j].gScore = Infinity;
            nodes[i][j].wall = false;
            nodes[i][j].visited = false;
            nodes[i][j].previous = null;
            nodes[i][j].searched = false;
            nodes[i][j].drawNode(color(bgColor));
        }
    }

    finished = false;
    startNode = null;
    startPlaced = false
    endNode = null;
    endPlaced = false;
}

function getColors()
{
    var docGetter = getComputedStyle(document.documentElement);

    bgColor = docGetter.getPropertyValue('--bg-color');
    endPointColor = docGetter.getPropertyValue('--cursor-color');
}

function setup() 
{
    getColors();

    var canvas = createCanvas(canvasSize, canvasSize);
    canvas.parent("display-canvas");

    var startButton = createButton("Start");
    startButton.mousePressed(start);
    startButton.parent("button-container");

    var resetButton = createButton("Reset");
    resetButton.mousePressed(reset);
    resetButton.parent("button-container");

    strokeWeight(0.05);

    // Fills the nodes[][] matrix with new nodes.
    for (let i = 0; i < numNodes; i++) 
    {
        nodes.push([]);

        for (let j = 0; j < numNodes; j++) 
        {
            nodes[i][j] = new Node(i, j);
            nodes[i][j].drawNode(color(bgColor));
        }
    }
}

function draw() 
{
    // If the user switched from dark to light mode we need to draw bg again.
    prevBgColor = bgColor;
    getColors()
    colorChanged = (prevBgColor != bgColor);
    if (colorChanged) background(bgColor);

    // Logic for node/wall placement.
    if (!startPlaced && mouseIsPressed)
        startPlaced = placeStart();

    else if (startPlaced && !endPlaced && mouseIsPressed)
        endPlaced = placeEnd();

    else if (startPlaced && endPlaced && mouseIsPressed && !finished)
        placeWall();

    // Test if the end node has a path linked behind it. If it does, the 
    // algorithm has finished, so draw the path.
    let p = endNode;
    while (p && p.previous) 
    {
        finished = true;
        p = p.previous;
        p.drawNode(color('grey'));
    }

    // Draw all nodes.
    for (let i = 0; i < numNodes; i++) 
    {
        for (let j = 0; j < numNodes; j++) 
        {
            let curr = nodes[i][j];
            let col = null;

            if (curr == startNode || curr == endNode)
                col = endPointColor;

            else if (curr.wall)
                col = wallColor;

            else if (colorChanged)
                col = curr.searched ? searchedColor : bgColor;

            if (col == null) continue;

            curr.drawNode(color(col));
        }
    }
}
