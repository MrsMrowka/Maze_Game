const canvasDrawers = drawers();
const randUnits = units();
let handleMaze = createMaze();

let currentXTilt = 0;
let currentYTilt = 0;

let popUPtab = document.querySelector('.popUpTab')
let hint = document.querySelector("#showHint")
let title = document.querySelector('.title');
let personalTime = document.querySelector('.yourTime');
const restartGame = document.querySelector('.restart');

restartGame.onclick = () => {
    popUPtab.style.display = "none";
    personalTime.innerHTML = "";

    //document.location.reload();
    hint.innerHTML = "Hint: get the key";
    handleMaze = createMaze();
    const game = new Game();
}

window.addEventListener("deviceorientation", handleOrientationChange, true);

function handleOrientationChange(e) {
    let y = e.beta; // in degree in the range [-180,180] Front Back
    let x = e.gamma; // in degree in the range [-90,90] Left Right
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
        switch (handleMaze.pathRand) {
            case 1:
                this.randGameObjPosition(5 * canvasDrawers.objectSize, 8 * canvasDrawers.objectSize, canvasDrawers.objectSize, canvasDrawers.objectSize, 9 * canvasDrawers.objectSize, 15 * canvasDrawers.objectSize);
                break;
            case 2:
                this.randGameObjPosition(6 * canvasDrawers.objectSize, 2 * canvasDrawers.objectSize, canvasDrawers.objectSize, 11 * canvasDrawers.objectSize, 7 * canvasDrawers.objectSize, 13 * canvasDrawers.objectSize)
                break;
            case 3:
                this.randGameObjPosition(canvasDrawers.objectSize, canvasDrawers.objectSize, 6 * canvasDrawers.objectSize, 7 * canvasDrawers.objectSize, 3 * canvasDrawers.objectSize, 12 * canvasDrawers.objectSize)
                break;
            case 4:
                this.randGameObjPosition(canvasDrawers.objectSize, 15 * canvasDrawers.objectSize, 8 * canvasDrawers.objectSize, 10 * canvasDrawers.objectSize, 5 * canvasDrawers.objectSize, 2 * canvasDrawers.objectSize)
                break;
        }
        this.gameLoop = setInterval(() => this.render(), 100);
    }

    randGameObjPosition(ballX, ballY, keyX, keyY, holeX, holeY) {
        switch (Math.floor(Math.random() * 6) + 1) {
            case 1:
                this.ball = new Ball(ballX, ballY);
                this.key = new GameObject(
                    "Key", keyX, keyY
                );
                this.hole = new GameObject(
                    "Hole", holeX, holeY
                );
                break;
            case 2:
                this.ball = new Ball(ballX, ballY);
                this.key = new GameObject(
                    "Key", holeX, holeY
                );
                this.hole = new GameObject(
                    "Hole", keyX, keyY
                );
                break;
            case 3:
                this.ball = new Ball(keyX, keyY);
                this.key = new GameObject(
                    "Key", ballX, ballY
                );
                this.hole = new GameObject(
                    "Hole", holeX, holeY
                );
                break;
            case 4:
                this.ball = new Ball(holeX, holeY);
                this.key = new GameObject(
                    "Key", ballX, ballY
                );
                this.hole = new GameObject(
                    "Hole", keyX, keyY
                );
                break;
            case 5:
                this.ball = new Ball(keyX, keyY);
                this.key = new GameObject(
                    "Key", holeX, holeY
                );
                this.hole = new GameObject(
                    "Hole", ballX, ballY
                );
                break;
            case 6:
                this.ball = new Ball(holeX, holeY);
                this.key = new GameObject(
                    "Key", keyX, keyY
                );
                this.hole = new GameObject(
                    "Hole", ballX, ballY
                );
                break;

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
        if (this.ball.velocity.horizontal > -12 && this.ball.velocity.horizontal < 12) {
            futureX = this.ball.x + this.ball.velocity.horizontal / 4;
        } else if (this.ball.velocity.horizontal < -20 && this.ball.velocity.horizontal > 20) {
            futureX = this.ball.x + this.ball.velocity.horizontal / 2;
        } else {
            futureX = this.ball.x + this.ball.velocity.horizontal / 3;
        }

        if (this.ball.velocity.vertical > -12 && this.ball.velocity.vertical < 12) {
            futureY = this.ball.y + this.ball.velocity.vertical / 4;
        } else if (this.ball.velocity.vertical < -20 && this.ball.velocity.vertical > 20) {
            futureY = this.ball.y + this.ball.velocity.vertical / 2;
        } else {
            futureY = this.ball.y + this.ball.velocity.vertical / 3;
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
            hint.innerHTML = "Head towards the exit";
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
        let mazeX = Math.floor((this.ball.x + (this.ball.velocity.horizontal)) / canvasDrawers.objectSize);
        let mazeY = Math.floor((this.ball.y + (this.ball.velocity.vertical)) / canvasDrawers.objectSize);
        if (this.ball.velocity.horizontal > -8 && this.ball.velocity.horizontal < 8) {
            mazeX = Math.floor((this.ball.x + (canvasDrawers.half / 10 * this.ball.velocity.horizontal)) / canvasDrawers.objectSize);
        }
        else if (this.ball.velocity.horizontal < -18 && this.ball.velocity.horizontal > 18) {
            mazeX = Math.floor((this.ball.x + (this.ball.velocity.horizontal / 4)) / canvasDrawers.objectSize);
        }

        if (this.ball.velocity.vertical > -8 && this.ball.velocity.vertical < 8) {
            mazeY = Math.floor((this.ball.y + (canvasDrawers.half / 10 * this.ball.velocity.vertical)) / canvasDrawers.objectSize);
        }
        if (this.ball.velocity.vertical < -18 - 20 && this.ball.velocity.vertical > 18) {
            mazeY = Math.floor((this.ball.y + (this.ball.velocity.vertical / 4)) / canvasDrawers.objectSize);
        }

        //console.log('your cords ' + mazeX + ' , ' + mazeY)

        if (handleMaze.maze[mazeY][mazeX] === 1) {
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
        canvasDrawers.clearBoard();
        this.writeTime();
        this.calculateBallVelocity();
        this.movePlayer();
        this.overlapsKey();
        canvasDrawers.drawPlayer(this.ball.x, this.ball.y);
        if (!this.keyObtained) canvasDrawers.drawKey(this.key.x, this.key.y);
        canvasDrawers.drawHole(this.hole.x, this.hole.y, this.keyObtained);
        handleMaze.drawMaze();
        this.checkVictoryCondidtions();
        this.checkGameOverCondidtions();
    }
}

const game = new Game();