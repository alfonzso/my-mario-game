import { choseSpriteImage, drawPixel, fillTextMultiLine, prec, sleep } from "../tools/common.fn.js";

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
    // this.frameHeight = 213;
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


    const calcDistance = (x1, y1, x2, y2) => {
      return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
    }

    const inteceptCircleLineSeg = (x0, y0, x1, y1, cx, cy, cr) => {
      var a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
      v1 = {};
      v2 = {};
      v1.x = x1 - x0;
      v1.y = y1 - y0;
      v2.x = x0 - cx;
      v2.y = y0 - cy;
      b = (v1.x * v2.x + v1.y * v2.y);
      c = 2 * (v1.x * v1.x + v1.y * v1.y);
      b *= -2;
      d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - cr * cr));
      u1 = (b - d) / c;
      u2 = (b + d) / c;
      return [u1 <= 1 && u1 >= 0, u2 <= 1 && u2 >= 0, x0 + (x1 - x0) * 0.5, y0 + (y1 - y0) * 0.5]
    }

    const MarioCenter = {
      // x: 390,
      // x: 428.25,
      x: this.oMario.x + (this.oMario.width / 2),
      y: this.oMario.y + (this.oMario.height / 2),
    }

    const res = this.shapes.shape2DList.map(shapes => {
      return shapes.allPixelArray.filter(shape => calcDistance(MarioCenter.x, MarioCenter.y, shape.pixel.x, shape.pixel.y) < 100)
    })

    const newRes = res.flat().map(v => {
      return {
        "x": v.pixel.x,
        "y": v.pixel.y,
      }
    })

    newRes.reduce((current, next) => {
      const [u1Check, u2Check, avgX, avgY] = inteceptCircleLineSeg(current.x, current.y, next.x, next.y, MarioCenter.x, MarioCenter.y, 38)
      if (u1Check || u2Check) {
        // console.log(
        // "--------------> ", u1, u2
        // )
        //  await sleep(5000)
        // debugger;
        if (this.oMario.isJumping()) {
          this.oMario.xVelocityBeforeJump = 0
          if (!(this.oMario.isRunningLeft() || this.oMario.isRunningRight())) {
            this.oMario.xVelocity = 0
          }
          this.oMario.removeJumpAction()
        }

        this.oMario.yVelocity = 0;
        // this.oMario.y = (onShape.res !== false ? onShape.y : this.canvas.height - 10) - this.oMario.height ;
        // this.oMario.y = this.canvas.height - 10 - this.oMario.height;


        // console.log(this.oMario.x, this.oMario.x + this.oMario.width, current.x)
        // if ((this.oMario.x + this.oMario.width) > current.x) {
        //   console.log("==>")
        //   this.oMario.x = this.oMario.x + (this.oMario.width / 2);
        // } else {
        //   console.log("<===")
        //   this.oMario.x = this.oMario.x - (this.oMario.width / 2);
        //   // this.oMario.x = this.oMario.x + this.oMario.width;
        // }

        // console.log(this.oMario.x, this.oMario.x + this.oMario.width, current.x)
        // console.log(avgX, avgY)
        drawPixel(this.ctx, avgX, avgY, "purple", 5)
        const topOrBottom = Math.atan2(avgY - MarioCenter.y, avgX - MarioCenter.x) * (180 / Math.PI)

        // if ((this.oMario.x + this.oMario.width) >= avgX && MarioCenter.y > avgY) {
        //   console.log("==>", topOrBottom)
        //   this.oMario.x = this.oMario.x - (this.oMario.width / 2);
        // }
        // if ((this.oMario.x + this.oMario.width) <= avgX && MarioCenter.y > avgY) {
        //   console.log("<===", topOrBottom)
        //   this.oMario.x = this.oMario.x + (this.oMario.width / 2);
        // }

        // this.oMario.x = this.oMario.x - this.oMario.width;

        // if (this.oMario.y <= current.y) {
        //   this.oMario.y = current.y - this.oMario.height;
        // } else {
        //   this.oMario.y = current.y + this.oMario.height;
        // }
        // console.log(Math.atan2(avgY - MarioCenter.y, avgX - MarioCenter.x) * (180 / Math.PI))
        // if (this.oMario.y < avgY) {,

        if (topOrBottom > 0) {
          this.oMario.y = avgY - this.oMario.height;
        } else {
          if (this.oMario.isGoingUp()) {
            this.oMario.y = avgY + this.oMario.height;
          } else {
            this.oMario.y = avgY - this.oMario.height;
          }
        }

      }
      return next
    }, 0)

    // let [onShape, underShape] = this.shapes.checkShape(this.oMario)

    // if (this.oMario.y + this.oMario.height >= this.canvas.height - 10 || onShape.res !== false || underShape.res !== false) {
    if (this.oMario.y + this.oMario.height >= this.canvas.height - 10) {

      if (this.oMario.isJumping()) {
        this.oMario.xVelocityBeforeJump = 0
        if (!(this.oMario.isRunningLeft() || this.oMario.isRunningRight())) {
          this.oMario.xVelocity = 0
        }
        this.oMario.removeJumpAction()
      }
      this.oMario.yVelocity = 0;
      // this.oMario.y = (onShape.res !== false ? onShape.y : this.canvas.height - 10) - this.oMario.height ;
      this.oMario.y = this.canvas.height - 10 - this.oMario.height;
    }

    let marioActions = this.oMario.action.length > 0 ? this.oMario.action.join(', ') : "DoNothing"

    // shapeData: ${JSON.stringify(onShape.data)}
    let debugMessage = `
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
      10 + choseSpriteImage(spriteSheet, this.frame, this.frameWidth, this.oMario),
      175,
      this.frameWidth,
      100,
      this.oMario.x,
      this.oMario.y,
      this.oMario.width,
      this.frameWidth / 1.7,
      this.frameHeight / 1.7,
    );

  }

}