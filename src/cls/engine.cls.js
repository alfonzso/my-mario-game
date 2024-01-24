import { choseSpriteImage, drawPixel, fillTextMultiLine, prec } from "../tools/common.fn.js";

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

    this.frame = 0;
    this.numFrames = 4;
    this.frameWidth = 113;
    this.frameHeight = 113;
    this.frameInterval = 100;

    this.lastFrameTime = 0;

    this.oMario = oMario
    this.ctx = ctx
    this.canvas = canvas
    this.images = images
  }

  setShape(myShapes) {
    this.shapes = myShapes
  }

  gameLoop(timestamp) {
    this.inGameLoop(timestamp)
  }

  inGameLoop(timestamp) {
    const elapsedTime = timestamp - this.lastFrameTime;

    if (elapsedTime > this.frameInterval) {
      this.frame = (this.frame + 1) % this.numFrames;
      this.lastFrameTime = timestamp;
    }

    this.oMario.move()

    if (this.oMario.isDoNothing()) {
      this.oMario.xVelocity = 0
    }

    if (this.oMario.yVelocity < 0 || this.oMario.yVelocity > 0) {
      if (this.oMario.xVelocityBeforeJump === 0) {
        this.oMario.xVelocityBeforeJump = this.oMario.xVelocity
      }
      this.oMario.xVelocity = this.oMario.xVelocityBeforeJump
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.images[2], 0, 0);


    this.oMario.yVelocity += GRAVITY;

    let [onShape, underShape] = this.shapes.checkShape(this.oMario)

    if (this.oMario.y + this.oMario.height >= this.canvas.height || onShape.res !== false || underShape.res !== false) {

      if (this.oMario.isJumping()) {
        this.oMario.xVelocityBeforeJump = 0
        if (!(this.oMario.isRunningLeft() || this.oMario.isRunningRight())) {
          this.oMario.xVelocity = 0
        }
        this.oMario.removeJumpAction()
      }
      this.oMario.yVelocity = 0;
      this.oMario.y = (onShape.res !== false ? onShape.y : this.canvas.height) - this.oMario.height;
    }

    let marioActions = this.oMario.action.length > 0 ? this.oMario.action.join(', ') : "DoNothing"

    let debugMessage = `
      shapeData: ${JSON.stringify(onShape.data)}
      code: ${this.oMario.debugCode}
      GRAVITY: ${prec(GRAVITY)}
      Frame: ${this.frame}
      Mario X: ${prec(this.oMario.x)}
      Mario Y: ${prec(this.oMario.y)}
      Action: ${marioActions}
      xVelocityBeforeJump: ${this.oMario.xVelocityBeforeJump}
      DeltaV: X ${prec(this.oMario.xVelocity)} Y ${prec(this.oMario.yVelocity)} Yb ${prec(this.oMario.xVelocityBeforeJump)}
    `

    fillTextMultiLine(this.ctx, debugMessage, 10, 50)

    let spriteSheet = this.oMario.xVelocity < 0 ? this.images[1] : this.images[0]

    this.ctx.drawImage(
      spriteSheet,
      choseSpriteImage(spriteSheet, this.frame, this.frameWidth, this.oMario),
      165,
      this.frameWidth,
      this.frameHeight,
      this.oMario.x,
      this.oMario.y,
      this.oMario.width,
      this.oMario.height
    );

  }

}