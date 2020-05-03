const canvasDrawers = drawers();
const randUnits = units();

let currentXTilt = 0;
let currentYTilt = 0;

let popUPtab = document.querySelector('.popUpTab')
let title = document.querySelector('.title');
let personalTime = document.querySelector('.yourTime');
const restartGame = document.querySelector('.restart');

restartGame.onclick = () => {
    popUPtab.style.display = "none"
    // document.location.reload();
    const game = new Game();
}

window.addEventListener("deviceorientation", handleOrientationChange, true);

function handleOrientationChange(e) {
    let y = e.beta; // In degree in the range [-180,180] Front Back
    let x = e.gamma; // In degree in the range [-90,90] Left Right
    if (y > 90) {
        y = 90;
    }
    if (y < -90) {
        y = -90;
    }
    if (y !== null && x !== null) {
        currentXTilt = x;
        currentYTilt = y;
    }
}

let maze = [
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0, 1, 1],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 1, 0, 0, 1, 1, 1, 0],
    [1, 0, 0, 1, 0, 1, 1, 0, 0, 0],
    [1, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
    [1, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 0, 1, 1, 1, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0]
]

class GameObject {
    constructor(name, x = 0, y = 0) {
        this.name = name;
        this.x = x;
        this.y = y;
    }
}

class Ball extends GameObject {
    constructor(x = 0, y = 0) {
        super("Ball", x, y); //wywołuje konstruktor game object
        this.velocity = { vertical: 0, horizontal: 0 };
    }
}

class Game {
    constructor() {
        this.startTime = new Date().getTime();
        this.keyObtained = false;
        this.ball = new Ball(canvasDrawers.boardWidth / 2, canvasDrawers.boardHeight / 2);
        this.key = new GameObject(
            "Key", 50, 50
        );
        this.hole = new GameObject(
            "Hole", 450, 750
        );
        this.gameLoop = setInterval(() => this.render(), 100);
    }

    drawMaze() {
        for (let i = 0; i < maze.length; i++) {
            for (let j = 0; j < maze[i].length; j++) {
                if (maze[i][j] == 1) {
                    canvasDrawers.drawWall(j * 50, i * 50);
                }
            }
        }
    }

    calculateBallVelocity() {
        const velocity = randUnits.getTiltDirection(currentXTilt, currentYTilt);
        this.ball.velocity.horizontal += velocity.horizontal;
        this.ball.velocity.vertical += velocity.vertical;
    }

    movePlayer() {
        let futureX = 0;
        let futureY = 0;
        // let futureX = this.ball.x + this.ball.velocity.horizontal / 4;
        // let futureY = this.ball.y + this.ball.velocity.vertical / 4;

        //controlls ball velocity
        if (this.ball.velocity.horizontal > -10 && this.ball.velocity.horizontal < 10) {
            futureX = this.ball.x + this.ball.velocity.horizontal / 3;
        } else if (this.ball.velocity.horizontal > -15 && this.ball.velocity.horizontal < 15) {
            futureX = this.ball.x + this.ball.velocity.horizontal / 2;
        } else {
            futureX = this.ball.x + this.ball.velocity.horizontal / 1.4;
        }

        if (this.ball.velocity.vertical > -10 && this.ball.velocity.vertical < 10) {
            futureY = this.ball.y + this.ball.velocity.vertical / 3;
        } else if (this.ball.velocity.vertical > -15 && this.ball.velocity.vertical < 15) {
            futureX = this.ball.x + this.ball.velocity.vertical / 2;
        } else {
            futureX = this.ball.x + this.ball.velocity.vertical / 1.4;
        }

        //can move inside canvas
        if (canvasDrawers.canMoveX(futureX) && canvasDrawers.canMoveY(futureY)) {
            this.ball.x = futureX;
            this.ball.y = futureY;
        } else if (canvasDrawers.canMoveX(futureX)) {
            this.ball.x = futureX;
            this.ball.velocity.vertical = 0;
        } else if (canvasDrawers.canMoveY(futureY)) {
            this.ball.y = futureY;
            this.ball.velocity.horizontal = 0;
        } else {
            this.ball.velocity.vertical = 0;
            this.ball.velocity.horizontal = 0;
        }
    }
    overlapsKey() {
        if (canvasDrawers.isOverlapping(this.ball, this.key)) {
            this.keyObtained = true;
            document.getElementById("showHint").innerHTML = "Head towards the exit";
        }
    }

    checkVictoryCondidtions() {
        const endTime = new Date(this.startTime).getTime();
        const now = new Date().getTime();
        if (
            canvasDrawers.isOverlapping(this.ball, this.hole) &&
            this.keyObtained
        ) {
            clearInterval(this.gameLoop);
            popUPtab.style.display = "block"
            title.innerHTML = "You won!";
            personalTime.innerHTML = "Your Time was: " + Math.abs((endTime - now) / 1000).toFixed(1) + "s";
        }
    }

    checkGameOverCondidtions() {
        //chceck if not in wall
        let mazeX = Math.floor((this.ball.x + (this.ball.velocity.horizontal)) / 50);
        let mazeY = Math.floor((this.ball.y + (this.ball.velocity.vertical)) / 50);
        if (this.ball.velocity.horizontal > -8 && this.ball.velocity.horizontal < 8) {
            mazeX = Math.floor((this.ball.x + (canvasDrawers.half / 10 * this.ball.velocity.horizontal)) / 50);
        }
        if (this.ball.velocity.vertical > -8 && this.ball.velocity.vertical < 8) {
            mazeY = Math.floor((this.ball.y + (canvasDrawers.half / 10 * this.ball.velocity.vertical)) / 50);
        }
        //console.log('your cords ' + mazeX + ' , ' + mazeY)
        //console.log(mazeY)

        if (maze[mazeY][mazeX] === 1) {
            clearInterval(this.gameLoop);
            popUPtab.style.display = "block"
            title.innerHTML = "Game Over!";
        }
    }

    writeTime() {
        const endTime = new Date(this.startTime).getTime() + 200 * 1000;
        const now = new Date().getTime();
        if (endTime - now > 0) {
            document.getElementById("showTimer").innerHTML =
                "Remaining time: " + ((endTime - now) / 1000).toFixed(1) + "s";
        } else {
            clearInterval(this.gameLoop);
            popUPtab.style.display = "block"
            title.innerHTML = "Game Over!";
        }
    }

    render() {
        console.log(this.ball.velocity)
        canvasDrawers.clearBoard();
        this.writeTime();
        this.calculateBallVelocity();
        this.movePlayer();
        this.overlapsKey();
        canvasDrawers.drawPlayer(this.ball.x, this.ball.y);
        if (!this.keyObtained) canvasDrawers.drawKey(this.key.x, this.key.y);
        canvasDrawers.drawHole(this.hole.x, this.hole.y, this.keyObtained);
        this.drawMaze();
        this.checkVictoryCondidtions();
        this.checkGameOverCondidtions();
    }
}

const game = new Game();