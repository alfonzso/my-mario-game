const MarioActions = {
  nothing: "nothing",
  jumping: "jumping",
  runningLeft: "runLeft",
  runningRight: "runRight",
  goingUp: "goUp",
  goingDown: "goDown",
}

class Mario {
  yB = 0;

  x = 0;
  y = 0;

  // x = 290;
  // y = 833.5;

  width = 64;
  height = 64;
  xVelocity = 0;
  yVelocity = 0;
  speed = 10;
  action = []
  // oldAction = []
  // intersectX = null
  debugCode = ""
  xVelocityBeforeJump = 0
  // MarioCenter = { x: 0, y: 0 }

  // Constructor to set up the initial state of Mario
  constructor(x, y) {
    this.x = x;
    this.y = y;
    // this.MarioCenter = {
    //   x: x + (this.width / 2),
    //   y: y + (this.height / 2),
    // }
  }

  getCenter() {
    return {
      x: this.x + (this.width / 2),
      y: this.y + (this.height / 2),
    }
  }

  addAction(doing) {
    if (!this.action.includes(doing))
      this.action.push(doing)
  }

  removeJumpAction() {
    this.action = this.action.filter(item => item != MarioActions.jumping)
  }

  removeGoingUpOrDown() {
    this.action = this.action.filter(item => item != MarioActions.goingDown)
    this.action = this.action.filter(item => item != MarioActions.goingUp)
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
    return this.action.length === 0
  }

  isJumping() {
    return this.action.includes(MarioActions.jumping)
  }

  isGoingUp() {
    return this.action.includes(MarioActions.goingUp)
  }

  isGoingDown() {
    return this.action.includes(MarioActions.goingDown)
  }

  // Method to move Mario based on his velocity
  move() {
    if (this.xVelocity !== 0 || this.yVelocity !== 0) {
      this.yB = this.y
      this.x += this.xVelocity;
      this.y += this.yVelocity;

      if (this.yB > this.y) {
        this.addAction(MarioActions.goingUp)
      } else if (this.yB < this.y) {
        this.addAction(MarioActions.goingDown)
      } else {
        this.removeGoingUpOrDown()
      }
    } else {
      this.removeGoingUpOrDown()
    }
  }

  // Method to handle Mario's jumping behavior
  jump() {
    if (this.yVelocity === 0) {
      this.yVelocity = -30;
    }
  }
}

export {
  Mario,
  MarioActions
}