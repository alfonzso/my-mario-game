const MarioActions = {
    nothing: "nothing",
    jumping: "jumping",
    runningLeft: "runLeft",
    runningRight: "runRight",
}

class Mario {
    x = 0;
    y = 0;
    width = 32 * 2;
    height = 32 * 2;
    xVelocity = 0;
    yVelocity = 0;
    action = []
    // oldAction = []
    debugCode = ""
    xVelocityBeforeJump = 0

    // Constructor to set up the initial state of Mario
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    addAction(doing) {
        if (!this.action.includes(doing))
            this.action.push(doing)
    }

    removeJumpAction() {
        this.action = this.action.filter(item => item != MarioActions.jumping)
    }

    removeLeftOrRightAction(doing) {
        this.action = this.action.filter(item => item != doing)
    }

    isRunningLeft() {
        return this.action.includes(MarioActions.runningLeft)
    }

    isRunningRight() {
        return this.action.includes(MarioActions.runningRight)
    }

    isDoNothing() {
        return this.action === []
    }

    isJumping() {
        return this.action.includes(MarioActions.jumping)
    }

    // Method to move Mario based on his velocity
    move() {
        if (this.xVelocity !== 0 || this.yVelocity !== 0) {
            this.x += this.xVelocity;
            this.y += this.yVelocity;
        }
    }

    // Method to handle Mario's jumping behavior
    jump() {
        if (this.yVelocity === 0) {
            this.yVelocity = -10;
        }
    }
}
