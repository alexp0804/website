
const CANVAS_SIZE = 700;
const SPEED_LIMIT = 3;
const BIRD_RADIUS = 5;
const FLOCK_SIZE = 100;

const LOCAL_DIST = 25;
const RULE_1_TUNING = 5;
const RULE_2_TUNING = 50;
const RULE_2_DIST = 1;
const RULE_3_TUNING = 20;
const RULE_4_TUNING = 1/10;

let rules = [rule1, rule2, rule3, rule4];
let flock = [];

let bgColor;
let fgColor;

function getColors()
{
    var docGetter = getComputedStyle(document.documentElement);

    bgColor = docGetter.getPropertyValue('--bg-color');
    fgColor = docGetter.getPropertyValue('--text-color');
}

class Bird
{
    constructor()
    {
        this.pos = createVector(random(0, CANVAS_SIZE), random(0, CANVAS_SIZE));
        this.vel = createVector(random(-10, 10), random(-10, 10));
        this.acc = createVector(0, 0);
    }

    limitSpeed()
    {
        if (this.vel.mag() > SPEED_LIMIT)
            this.vel.setMag(SPEED_LIMIT);
    }

    bound()
    {
        if (this.pos.x < 0)
            this.pos.x = CANVAS_SIZE - 1;

        else if (this.pos.x > CANVAS_SIZE)
            this.pos.x = 0;

        if (this.pos.y <= 0)
            this.pos.y = CANVAS_SIZE - 1;

        else if (this.pos.y > CANVAS_SIZE)
            this.pos.y = 0;
    }

    draw()
    {
        fill(color(fgColor));
        circle(this.pos.x, this.pos.y, BIRD_RADIUS);
    }

    update()
    {
        rules.map(rule => rule(this));
        this.pos.add(this.vel);
        this.vel.add(this.acc);

        this.limitSpeed();
        this.bound();
        this.draw();
    }
}

// Dog-leg hypotenuse approximation for hypotenuse of a triangle given the two sides a and b.
// https://forums.parallax.com/discussion/147522/dog-leg-hypotenuse-approximation
function hypot(a, b)
{
    a = abs(a);
    b = abs(b);
    lo = min(a, b);
    hi = max(a, b);

    return hi + 3 * lo / 32 + max(0, 2 * lo - hi) / 8 + max(0, 4 * lo - hi) / 16;
}

// Cohesion
function rule1(boid)
{
    let centerOfMass = createVector(0, 0);
    let nearbyCount = 0;

    flock.forEach(other => {
        if (other == boid) return;

        let ab = p5.Vector.sub(other.pos, boid.pos);
        if (hypot(ab.x, ab.y) < LOCAL_DIST)
        {
            centerOfMass.add(other.pos)
            nearbyCount++;
        }
    });

    if (nearbyCount == 0)
        return createVector(0, 0);
    
    let force = centerOfMass.sub(boid.pos).div(RULE_1_TUNING);

    boid.acc.add(force);
}

// Separation
function rule2(boid)
{
    let result = createVector(0, 0);

    flock.forEach(other => {
        if (other == boid) return;

        let ab = p5.Vector.sub(other.pos, boid.pos);
        if (hypot(ab.x, ab.y) < RULE_2_DIST)
            result = result.sub(ab);
    });

    let force = result.div(RULE_2_TUNING);

    boid.acc.add(force);
}

// Alignment
function rule3(boid) {
    let avgVelocity = createVector(0, 0);
    let nearbyCount = 0;

    flock.forEach(other => {
        if (other == boid) return;

        let ab = p5.Vector.sub(other.pos, boid.pos);
        if (hypot(ab.x, ab.y) < LOCAL_DIST)
        {
            avgVelocity.add(other.vel);
            nearbyCount++;
        }
    });

    if (nearbyCount == 0)
        return createVector(0, 0);

    avgVelocity.div(nearbyCount);
    let force = (avgVelocity.sub(boid.vel)).div(RULE_3_TUNING);

    boid.acc.add(force);
}

// Goal-seeking
function rule4(boid)
{
    let mousePos = createVector(mouseX, mouseY);
    let mousePosToBoid = p5.Vector.sub(mousePos, boid.pos);
    let force = mousePosToBoid.div(RULE_4_TUNING);

    boid.acc.add(force);
}

function setup()
{
    var canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent("display-canvas");

    [...Array(FLOCK_SIZE)].map(() => flock.push(new Bird()));

    frameRate(60);
    getColors();
    fill(color(fgColor));
    noStroke(); 
}

function draw()
{
    getColors();
    background(color(bgColor));
    flock.forEach(bird => bird.update())
}