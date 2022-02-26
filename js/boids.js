// Alexander Peterson
// May 19, 2021
// Implementation of "Boids" in P5.js 

// Heavily inspired from the algorithm created by Craig Reynolds
// as described by Conrad Parker in his blog:
// http://www.kfish.org/~conrad/boids/pseudocode.html

var canvasSize = 700;
var flockSize = 250;
var flock = [];

// Rule Parameters
// [Range, Dividing Factor]
var parameters = [[30, 500], [2, 180], [8, 310], [0, 1000]];

var speedLimit = 9;

var numSquares = 100;
var squareLength = canvasSize / numSquares;

// Builds a 2D array with empty entries.
var spatialGrid = [...Array(numSquares)].map(e => Array(numSquares));
for (let i = 0; i < numSquares; i++)
    for (let j = 0; j < numSquares; j++)
        spatialGrid[i][j] = []

function getGridCell(x, y)
{
    return [Math.floor(y / squareLength), Math.floor(x / squareLength)];
}

function removeBird(grid, object)
{
    let [row, col] = getGridCell(object.r.x, object.r.y);
    let list = grid[row][col];
    
    let index = list.indexOf(object);

    if (index > -1)
        list.splice(index, 1);
}

function addBird(grid, object)
{
    let [row, col] = getGridCell(object.r.x, object.r.y);
    grid[row][col].push(object);
}

function getNeighbors(grid, row, col, radius)
{
    let result = []; 

    for (let i = row - radius; i <= row + radius; i++)
    {
        for (let j = col - radius; j <= col + radius; j++)
        {
            if (i < 0 || i >= numSquares || j < 0 || j >= numSquares)
                continue;

            result.push(...grid[i][j]);
        }
    }

    return result;
}

class Bird
{
    constructor()
    {
        // Position and velocity
        this.r = createVector(random(0, canvasSize), random(0, canvasSize));

        let [row, col] = getGridCell(this.r.x, this.r.y);
        spatialGrid[row][col].push(this);

        this.v = createVector(0, 0);
    }

    // Teleport bird to opposite side if reached a border
    bound()
    {
        // Along right or left border
        if (this.r.x < 0)
            this.r.x = canvasSize - 1;

        else if (this.r.x > canvasSize)
            this.r.x = 0;

        // Along top or bottom border
        if (this.r.y <= 0)
            this.r.y = canvasSize - 1;

        else if (this.r.y > canvasSize)
            this.r.y = 0;
    }

    update()
    {
        // Add vectors from each rule to the velocity vector of this bird
        this.v.add(rule1(this));
        this.v.add(rule2(this));
        this.v.add(rule3(this));
        this.v.add(rule4(this));

        // Limit speed
        if (this.v.mag() > speedLimit)
            this.v.setMag(speedLimit);

        // Remove from grid, update position
        removeBird(spatialGrid, this);
        this.r.add(this.v);

        // If out of bounds, teleport back
        this.bound();

        // Put the bird back onto the grid and draw.
        addBird(spatialGrid, this);

        fill(255, 255, 255, 150);
        circle(this.r.x, this.r.y, 5);
    }
}

// Steer towards perceived center of mass
function rule1(b)
{
    let v = createVector(0, 0);

    let [row, col] = getGridCell(b.r.x, b.r.y);
    let neighbors = getNeighbors(spatialGrid, row, col, parameters[0][0]);

    if (neighbors.length == 0)
        return v; 

    // Sum positions of close birds
    for (let i = 0; i < neighbors.length; i++)
        v.add(neighbors[i].r);
    
    // Find average velocity of flock 
    v.div(neighbors.length);

    // Subtract from current position to get vector pointing to average location
    v.sub(b.r);

    // Divide by factor (this smooths the transition to new position)
    v.div(parameters[0][1]);

    return v;
}

// Birds try to avoid each other
function rule2(b)
{
    let c = createVector(0, 0);

    let [x, y] = getGridCell(b.r.x, b.r.y);
    let neighbors = getNeighbors(spatialGrid, x, y, parameters[1][0]);

    for (let i = 0; i < neighbors.length; i++)
        c = c.sub(p5.Vector.sub(neighbors[i].r, b.r));

    // Divide by a factor to smooth velocity transition.
    c.div(parameters[1][1]);

    return c;
}

// Birds match nearby velocities
function rule3(b)
{
    let v = createVector(0, 0);

    // Get neighboring birds
    let [x, y] = getGridCell(b.r.x, b.r.y);
    let neighbors = getNeighbors(spatialGrid, x, y, parameters[2][0]);

    // If no neighbors, return the zero vector.
    if (neighbors.length == 0)
        return v;

    // Get the average velocity of the neighboring birds.
    for (let i = 0; i < neighbors.length; i++)
        v.add(neighbors[i].v);

    v.div(neighbors.length);

    v.sub(b.v);

    // Divide by a factor to smooth velocity transition.
    v.div(parameters[2][1]);

    return v;
}

// Steer towards mouse position
function rule4(b)
{
    // Get mouse position as p5 vector.
    let m = createVector(mouseX, mouseY);

    // Vector from mouse to bird position.
    let v = p5.Vector.sub(m, b.r);

    // Divide by a factor to smooth velocity transition.
    v.div(parameters[3][1]);

    return v;
}

function setup()
{
    var canvas = createCanvas(canvasSize, canvasSize);
    canvas.parent("display-canvas");

    for (let i = 0; i < flockSize; i++)
        flock.push(new Bird());

    frameRate(60);
    fill(color('#BBBBBB'));
    noStroke();
}

function draw()
{
    background(color('#131313'));
    flock.forEach(bird => bird.update());
}
