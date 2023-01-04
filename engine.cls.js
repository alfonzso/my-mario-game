import { fillTextMultiLine, prec } from "./common.fn.js";
import { choseSpriteImage } from "./common.fn.js";

export class MyEngine {
  frame = 0;
  numFrames = 0;
  frameWidth = 0;
  frameHeight = 0;
  frameInterval = 0;
  lastFrameTime = 0;

  oMario = null
  ctx = null
  canvas = null
  images = null

  shapes = null

  constructor(oMario, ctx, canvas, images) {
    // Set up the animation variables
    this.frame = 0;
    this.numFrames = 4;
    this.frameWidth = 113;
    this.frameHeight = 113;
    this.frameInterval = 100; // Delay between frames, in milliseconds
    this.lastFrameTime = 0; // Timestamp of the last frame

    this.oMario = oMario
    this.ctx = ctx
    this.canvas = canvas
    this.images = images
  }

  setShape(myShapes) {
    this.shapes = myShapes
  }

  gameLoop(timestamp) {
    // Calculate the elapsed time since the last frame
    const elapsedTime = timestamp - this.lastFrameTime;

    // Update the animation frame if the interval has passed
    if (this.oMario.xVelocity !== 0 && elapsedTime > this.frameInterval) {
      // Increment the frame
      this.frame = (frame + 1) % this.numFrames;
      // Reset the last frame time
      this.lastFrameTime = timestamp;
    } else if (this.oMario.xVelocity === 0 && elapsedTime > this.frameInterval) {
      this.frame = 0
    }

    this.oMario.move()

    // if (frame % 4 === 0)
    //   console.log(this.oMario.isDoNothing())

    if (this.oMario.isDoNothing()) {
      this.oMario.xVelocity = 0

      // console.log("nope");
    }

    if (this.oMario.yVelocity < 0 || this.oMario.yVelocity > 0) {
      if (this.oMario.xVelocityBeforeJump === 0) {
        this.oMario.xVelocityBeforeJump = this.oMario.xVelocity
      }
      this.oMario.xVelocity = this.oMario.xVelocityBeforeJump
    }

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.images[2], 0, 0);

    // redShapeBottom.map(shape => drawPixel(context, shape.x, shape.y, "black"))

    this.oMario.yVelocity += GRAVITY;

    let [onShape, underShape] = this.shapes.checkShape(this.oMario)

    if (this.oMario.y + this.oMario.height >= this.canvas.height || onShape !== false || underShape !== false) {
      if (this.oMario.isJumping()) {
        this.oMario.xVelocityBeforeJump = 0
        if (!(this.oMario.isRunningLeft() || this.oMario.isRunningRight())) {
          this.oMario.xVelocity = 0
        }
        this.oMario.removeJumpAction()
      }
      this.oMario.yVelocity = 0;
      this.oMario.y = (onShape !== false ? onShape.y : this.canvas.height) - this.oMario.height;
    }

    // debugMessage = JSON.stringify({
    let marioActions = this.oMario.action.length > 0 ? this.oMario.action.join(', ') : "DoNothing"
    let debugMessage = `
      redShapeXAvg: ${redShapeCorner.map(v => v.x).reduce((p, c) => p + c) / redShapeCorner.length}
      redShapeYAvg: ${redShapeCorner.map(v => v.y).reduce((p, c) => p + c) / redShapeCorner.length}
      code: ${this.oMario.debugCode}
      GRAVITY: ${prec(GRAVITY)}
      Frame: ${frame}
      Mario X: ${prec(this.oMario.x)}
      Mario Y: ${prec(this.oMario.y)}
      Action: ${marioActions}
      xVelocityBeforeJump: ${this.oMario.xVelocityBeforeJump}
      DeltaV: X ${prec(this.oMario.xVelocity)} Y ${prec(this.oMario.yVelocity)} Yb ${prec(this.oMario.xVelocityBeforeJump)}
    `
    // this.ctx.fillText(debugMessage, 10, 50);


    fillTextMultiLine(ctx, debugMessage, 10, 50)

    let spriteSheet = this.oMario.xVelocity < 0 ? this.images[1] : this.images[0]

    this.ctx.drawImage(
      spriteSheet,
      choseSpriteImage(spriteSheet, frame, frameWidth, oMario), // x position of the frame on the sprite sheet
      165, // y position of the frame on the sprite sheet
      frameWidth, // width of the frame
      frameHeight, // height of the frame
      this.oMario.x, // x position on the canvas to draw the frame
      this.oMario.y, // y position on the canvas to draw the frame
      this.oMario.width, // width to draw the frame on the canvas
      this.oMario.height // height to draw the frame on the canvas
    );


    // Request the next frame of the game loop
    requestAnimationFrame(this.gameLoop);
  }

}