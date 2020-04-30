const canvasDrawers = drawers();
const randUnits = units();

let loggger = document.getElementById("logger");
let currentXTilt = 0;
let currentYTilt = 0;

let popUPtab = document.querySelector('.victoryTab')
let title = document.querySelector('.title');
let personalTime = document.querySelector('.yourTime');
const restartGame = document.querySelector('.restart');

restartGame.onclick = () => {
    popUPtab.style.display = "none"
    document.location.reload();
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
        loggger.innerHTML = "Y = " + y.toFixed(2) + " " + "X = " + x.toFixed(2);
        currentXTilt = x;
        currentYTilt = y;
    }
}

let maze = [
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0],
    [1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1],
    [0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1],
    [0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0],
    [1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
    [0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]
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
            "Hole", 550, 550
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
        let futureX = this.ball.x + this.ball.velocity.horizontal / 4;
        let futureY = this.ball.y + this.ball.velocity.vertical / 4;
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
        //can move inside maze
    }
    overlapsKey() {
        if (canvasDrawers.isOverlapping(this.ball, this.key)) {
            this.keyObtained = true;
            document.getElementById("showHint").innerHTML = "You got the key";
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
        let mazeX = Math.floor((this.ball.x + (this.ball.velocity.horizontal)) / 50);
        let mazeY = Math.floor((this.ball.y + (this.ball.velocity.vertical)) / 50);
        //console.log(mazeX)
        //console.log(mazeY)

        if (maze[mazeX][mazeY] == 1) {
            clearInterval(this.gameLoop);
            popUPtab.style.display = "block"
            title.innerHTML = "Game Over!";
        }

        //if (canvasDrawers.isOverlapping(this.ball, this.trapHole1))
        // clearInterval(this.gameLoop);
        // popUPtab.style.display = "block"
        // title.innerHTML = "Game Over!";

    }

    writeTime() {
        const endTime = new Date(this.startTime).getTime() + 400 * 1000;
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
        this.drawMaze();
        this.checkVictoryCondidtions();
        this.checkGameOverCondidtions();
    }
}

const game = new Game();

// const canvasDrawers = drawers();
// const randUnits = units();

// let loggger = document.getElementById("logger");
// let currentXTilt = 0;
// let currentYTilt = 0;

// let popUPtab = document.querySelector('.victoryTab')
// let title = document.querySelector('.title');
// let personalTime = document.querySelector('.yourTime');
// const restartGame = document.querySelector('.restart');

// let maze = [
//     [0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
//     [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
//     [1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0],
//     [1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1],
//     [0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1],
//     [0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0],
//     [1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1],
//     [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
//     [0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
//     [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]
// ]

// restartGame.onclick = () => {
//     popUPtab.style.display = "none"
//     document.location.reload();
// }

// window.addEventListener("deviceorientation", handleOrientationChange, true);

// function handleOrientationChange(e) {
//     let y = e.beta; // In degree in the range [-180,180] Front Back
//     let x = e.gamma; // In degree in the range [-90,90] Left Right
//     if (y > 90) {
//         y = 90;
//     }
//     if (y < -90) {
//         y = -90;
//     }
//     if (y !== null && x !== null) {
//         loggger.innerHTML = "Y = " + y.toFixed(2) + " " + "X = " + x.toFixed(2);
//         currentXTilt = x;
//         currentYTilt = y;
//     }
// }

// class GameObject {
//     constructor(name, x = 0, y = 0) {
//         this.name = name;
//         this.x = x;
//         this.y = y;
//     }
// }

// class Ball extends GameObject {
//     constructor(x = 0, y = 0) {
//         super("Ball", x, y); //wywołuje konstruktor game object
//         this.velocity = { vertical: 0, horizontal: 0 };
//     }
// }

// class Game {
//     constructor() {
//         this.startTime = new Date().getTime();
//         this.keyObtained = false;
//         this.ball = new Ball(canvasDrawers.boardWidth / 2, canvasDrawers.boardHeight / 2);
//         this.key = new GameObject(
//             "Key", 50, 50
//         );
//         this.hole = new GameObject(
//             "Hole", 550, 550
//         );
//         this.mazeObjects = [];
//         this.gameLoop = setInterval(() => this.render(), 100);
//     }

//     // drawMaze() {
//     //     let maze = [
//     //         [0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
//     //         [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
//     //         [1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0],
//     //         [1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0],
//     //         [0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1],
//     //         [0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1],
//     //         [0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0],
//     //         [1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
//     //         [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1],
//     //         [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
//     //         [0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
//     //         [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]
//     //     ]
//     //     for (let i = 0; i < maze.length; i++) {
//     //         for (let j = 0; j < maze[i].length; j++) {
//     //             if (maze[i][j] == 1) {
//     //                 let x = j * 50;
//     //                 let y = i * 50;

//     //                 this.MazeWall = new GameObject(
//     //                     "MazeWall", x, y
//     //                 );

//     //                 this.mazeObjects.push(this.MazeWall);

//     //                 canvasDrawers.drawTrapHole(x, y);
//     //             }
//     //         }
//     //     }
//     // }

//     calculateBallVelocity() {
//         const velocity = randUnits.getTiltDirection(currentXTilt, currentYTilt);
//         this.ball.velocity.horizontal += velocity.horizontal;
//         this.ball.velocity.vertical += velocity.vertical;
//     }

//     movePlayer() {
//         let futureX = this.ball.x + this.ball.velocity.horizontal;
//         let futureY = this.ball.y + this.ball.velocity.vertical;
//         if (canvasDrawers.canMoveX(futureX) && canvasDrawers.canMoveY(futureY)) {
//             this.ball.x = futureX;
//             this.ball.y = futureY;
//         } else if (canvasDrawers.canMoveX(futureX)) {
//             this.ball.x = futureX;
//             this.ball.velocity.vertical = 0;
//         } else if (canvasDrawers.canMoveY(futureY)) {
//             this.ball.y = futureY;
//             this.ball.velocity.horizontal = 0;
//         } else {
//             this.ball.velocity.vertical = 0;
//             this.ball.velocity.horizontal = 0;
//         }
//     }
//     overlapsKey() {
//         if (canvasDrawers.isOverlapping(this.ball, this.key)) {
//             this.keyObtained = true;
//             document.getElementById("showHint").innerHTML = "You got the key";
//         }
//     }

//     checkVictoryCondidtions() {
//         const endTime = new Date(this.startTime).getTime();
//         const now = new Date().getTime();
//         if (
//             canvasDrawers.isOverlapping(this.ball, this.hole) &&
//             this.keyObtained
//         ) {
//             clearInterval(this.gameLoop);
//             popUPtab.style.display = "block"
//             title.innerHTML = "You won!";
//             personalTime.innerHTML = "Your Time was: " + Math.abs((endTime - now) / 1000).toFixed(1) + "s";
//         }
//     }

//     // checkGameOverCondidtions(obj1, obj2) {
//     //     if (canvasDrawers.isOverlapping(obj1, obj2)) {
//     //         clearInterval(this.gameLoop);
//     //         popUPtab.style.display = "block"
//     //         title.innerHTML = "Game Over!";
//     //     }
//     // }

//     writeTime() {
//         const endTime = new Date(this.startTime).getTime() + 600 * 1000;
//         const now = new Date().getTime();
//         if (endTime - now > 0) {
//             document.getElementById("showTimer").innerHTML =
//                 "Remaining time: " + ((endTime - now) / 1000).toFixed(1) + "s";
//         } else {
//             clearInterval(this.gameLoop);
//             popUPtab.style.display = "block"
//             title.innerHTML = "Game Over!";
//         }
//     }

//     render() {
//         canvasDrawers.clearBoard();
//         this.writeTime();
//         this.calculateBallVelocity();
//         this.movePlayer();
//         this.overlapsKey();
//         this.drawMaze();
//         canvasDrawers.drawPlayer(this.ball.x, this.ball.y);
//         if (!this.keyObtained) canvasDrawers.drawKey(this.key.x, this.key.y);
//         canvasDrawers.drawHole(this.hole.x, this.hole.y, this.keyObtained);
//         this.checkVictoryCondidtions();
//         // for (let i = 0; i < this.mazeObjects.length; i++) {
//         //     this.checkGameOverCondidtions(this.ball, this.mazeObjects[i]);
//         // }
//     }
// }

// const game = new Game();