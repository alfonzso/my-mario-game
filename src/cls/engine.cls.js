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


    this.globalDataDump = null

  }

  setShape(myShapes) {
    this.shapes = myShapes
  }

  gameLoop(timestamp) {
    this.inGameLoop(timestamp)
  }

  inGameLoop(timestamp) {
    // this.getCenter() = {
    //   x: this.oMario.x + (this.oMario.width / 2),
    //   y: this.oMario.y + (this.oMario.height / 2),
    // }
    // console.log(
    //   this.oMario.x ,this.oMario.width, (this.oMario.width / 2)
    // )
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
      var a = x1 - x2;
      var b = y1 - y2;
      return Math.sqrt(a * a + b * b)
      // return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
    }

    // const inteceptCircleLineSeg = (x0, y0, x1, y1, cx, cy, cr) => {
    //   var a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
    //   v1 = {};
    //   v2 = {};
    //   v1.x = x1 - x0;
    //   v1.y = y1 - y0;
    //   v2.x = x0 - cx;
    //   v2.y = y0 - cy;
    //   b = (v1.x * v2.x + v1.y * v2.y);
    //   c = 2 * (v1.x * v1.x + v1.y * v1.y);
    //   b *= -2;
    //   d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - cr * cr));
    //   u1 = (b - d) / c;
    //   u2 = (b + d) / c;
    //   return [u1 <= 1 && u1 >= 0, u2 <= 1 && u2 >= 0, x0 + (x1 - x0) * 0.5, y0 + (y1 - y0) * 0.5]
    // }

    const inteceptCircleLineSeg = (A, B, C, cr) => {
      let b, c, d, u1, u2, v1, v2;
      v1 = {
        x: B.x - A.x,
        y: B.y - A.y
      };
      v2 = {
        x: A.x - C.x,
        y: A.y - C.y
      };

      b = (v1.x * v2.x + v1.y * v2.y);
      c = 2 * (v1.x * v1.x + v1.y * v1.y);
      b *= -2;
      d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - cr * cr));
      u1 = (b - d) / c;
      u2 = (b + d) / c;
      let avgX = A.x + (B.x - A.x) * 0.5
      let avgY = A.y + (B.y - A.y) * 0.5
      return [u1 <= 1 && u1 >= 0, u2 <= 1 && u2 >= 0, avgX, avgY, A, B]
    }

    const res = this.shapes.shape2DList.map(shapes => {
      return shapes.allPixelArray
        // .filter(shape => calcDistance(this.getCenter().x, this.getCenter().y, shape.pixel.x, shape.pixel.y) - 38 < 20)
        // .filter(shape => {

        //   const dist = calcDistance(this.getCenter().x, this.getCenter().y, shape.pixel.x, shape.pixel.y) - (38 + this.oMario.xVelocity)
        //   return
        // })
        .find(e => {
          let dist = calcDistance(this.oMario.getCenter().x, this.oMario.getCenter().y, e.pixel.x, e.pixel.y) - 38
          let halfVx = Math.abs(this.oMario.xVelocity) / 2
          // dist -= (38 - this.oMario.xVelocity)
          // dist -= 38
          if (dist < 20) {
            // console.log(".............. ", dist)
          }
          let intersect = dist >= -1 * halfVx && dist <= 1 * halfVx
          if (intersect) {
            drawPixel(this.ctx, e.pixel.x, e.pixel.y, "purple", 5)
          }
          return intersect
        })
      // .map(e => {
      //   let dist = calcDistance(this.getCenter().x, this.getCenter().y, e.pixel.x, e.pixel.y)
      //   dist -= (38 - this.oMario.xVelocity)
      //   // dist -= 38
      //   return dist >= -1 && dist <= 1
      //   // return {
      //   //   "x": v.pixel.x,
      //   //   "y": v.pixel.y,
      //   // }
      // })
    }).flat().filter(v => v !== undefined).length > 0

    if (this.oMario.isRunningLeft() || this.oMario.isRunningRight()) {
      // let trigger = res.includes(true)
      // let trigger = di.includes(true)
      // let trigger = 0
      console.log("=====q= LEFT 1 ========> ", res, this.oMario.xVelocity)
      if (res) {
        this.oMario.x -= this.oMario.xVelocity
        // debugger
      }
    }

    // if (JSON.stringify(res) !== JSON.stringify(this.globalDataDump)) {
    //   console.log(res)
      // res.forEach(e => {
      //   let dist = calcDistance(this.getCenter().x, this.getCenter().y, e.x, e.y)
      //   console.log(
      //     e, this.getCenter().x, this.getCenter().y, this.oMario.x, this.oMario.y,
      //     dist,
      //     dist - 38,
      //   )
    //   // });
    // }
    // this.globalDataDump = res

    // if (res.length > 0) {
    //   this.oMario.speed = 0.15
    // } else {
    //   this.oMario.speed = 10
    // }

    // res.forEach((e) => {
    //   let dist = calcDistance(this.getCenter().x, this.getCenter().y, e.x, e.y)
    //   // if ( 0 <= dist <= 1) {
    //   drawPixel(this.ctx, e.x, e.y, "purple", 5)
    //   drawPixel(this.ctx, this.oMario.x - 150, this.oMario.y - 150, "#efe4b0", 500, 30)
    //   // this.ctx.stroke();
    //   // this.ctx.fontColor = "purple"
    //   this.ctx.fillStyle = "black"
    //   let msg = `
    //     dist: ${dist}
    //     distR: ${dist - 38}
    //     oMario.x: ${this.oMario.x}
    //     oMario.y: ${this.oMario.y}
    //     getCenter().x: ${this.getCenter().x}
    //     getCenter().y: ${this.getCenter().y}
    //     X: ${this.getCenter().x - e.x}
    //     Y: ${this.getCenter().y - e.y}
    //     e.x: ${e.x}
    //     e.y: ${e.y}
    //   `
    //   dist -= (38 + this.oMario.xVelocity)
    //   fillTextMultiLine(this.ctx, msg, this.oMario.x - 150, this.oMario.y - 150)

    //   if (dist >= -1 && dist <= 1) {
    //     // if (this.oMario.isRunningLeft()) {
    //     //   // this.oMario.x -= dist + this.oMario.xVelocity
    //     //   this.oMario.xVelocity = 0
    //     // }
    //     if (this.oMario.isRunningRight()) {
    //       console.log("====== RIGHT 0 ========> ", dist)
    //       // this.oMario.xVelocity = 0
    //       // this.oMario.x -= Math.abs(dist) + this.oMario.xVelocity
    //       this.oMario.x -= 500
    //     }
    //   }
    // })

    // if (this.oMario.isRunningRight()) {
    //   let trigger = res.map(e => {
    //     let dist = calcDistance(this.getCenter().x, this.getCenter().y, e.x, e.y)
    //     dist -= (38 + this.oMario.xVelocity)
    //     return dist >= -1 && dist <= 1
    //   }).includes(true)
    //   console.log("====== RIGHT 1 ========> ", trigger)
    //   if (trigger) {
    //     debugger
    //   }
    // }

    this.ctx.beginPath();
    this.ctx.rect(this.oMario.x, this.oMario.y, 64, 64);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(
      this.oMario.getCenter().x, this.oMario.getCenter().y, 38, 0, 2 * Math.PI
    );
    this.ctx.stroke();
    /*
        res.reduce((current, next) => {
          const [u1Check, u2Check, avgX, avgY, A, B] = inteceptCircleLineSeg(current, next, this.getCenter(), 38)
          if (u1Check || u2Check) {
            // console.log(
            //   "--------------> ", u1Check, u2Check, avgX, avgY
            // )
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
            drawPixel(this.ctx, A.x, A.y, "white", 5)
            drawPixel(this.ctx, avgX, avgY, "purple", 5)
            drawPixel(this.ctx, B.x, B.y, "black", 5)
            // drawPixel(this.ctx, getCenter().x, getCenter().y, "black", 5)
            // u1Check, u2Check, avgX, avgY
            let dist = calcDistance(this.getCenter().x, this.getCenter().y, avgX, avgY)
            let msg = `
              u1Check: ${u1Check}
              u2Check: ${u2Check}
              avgX: ${avgX}
              avgY: ${avgY}
              dist: ${dist}
              dist: ${dist - 38}
              oMario.x: ${this.oMario.x}
              oMario.y: ${this.oMario.y}
              getCenter().x: ${this.getCenter().x}
              getCenter().y: ${this.getCenter().y}
            `
            fillTextMultiLine(this.ctx, msg, this.oMario.x - 150, this.oMario.y - 150)

            // this.ctx.beginPath();
            // this.ctx.rect(this.oMario.x, this.oMario.y, 64, 64);
            // this.ctx.stroke();

            // // drawPixel(this.ctx, this.oMario.x, this.oMario.y, "purple", 64)

            // this.ctx.beginPath();
            // this.ctx.arc(
            //   this.getCenter().x, this.getCenter().y,
            //   38, 0,
            //   2 * Math.PI
            // );
            // this.ctx.stroke();

            // oMario.x + (oMario.width / 2),
            // oMario.y + (oMario.height / 2),
            // 36,
            // 0, 2 * Math.PI);

            // const topOrBottom = Math.atan2(avgY - getCenter().y, avgX - getCenter().x) * (180 / Math.PI)

            // if ((this.oMario.x + this.oMario.width) >= avgX && getCenter().y > avgY) {
            //   console.log("==>", topOrBottom)
            //   this.oMario.x = this.oMario.x - (this.oMario.width / 2);
            // }
            // if ((this.oMario.x + this.oMario.width) <= avgX && getCenter().y > avgY) {
            //   console.log("<===", topOrBottom)
            //   this.oMario.x = this.oMario.x + (this.oMario.width / 2);
            // }

            // this.oMario.x = this.oMario.x - this.oMario.width;

            // if (this.oMario.y <= current.y) {
            //   this.oMario.y = current.y - this.oMario.height;
            // } else {
            //   this.oMario.y = current.y + this.oMario.height;
            // }
            // console.log(Math.atan2(avgY - getCenter().y, avgX - getCenter().x) * (180 / Math.PI))
            // if (this.oMario.y < avgY) {,

            // if (topOrBottom > 0) {
            //   this.oMario.y = avgY - this.oMario.height;
            // } else {
            //   if (this.oMario.isGoingUp()) {
            //     this.oMario.y = avgY + this.oMario.height;
            //   } else {
            //     this.oMario.y = avgY - this.oMario.height;
            //   }
            // }

          }
          return next
        }, 0)
    */
    // let [onShape, underShape] = this.shapes.checkShape(this.oMario)

    // if (this.oMario.y + this.oMario.height >= this.canvas.height - 10 || onShape.res !== false || underShape.res !== false) {
    if (this.oMario.y + this.oMario.height >= this.canvas.height - 2.5) {

      if (this.oMario.isJumping()) {
        this.oMario.xVelocityBeforeJump = 0
        if (!(this.oMario.isRunningLeft() || this.oMario.isRunningRight())) {
          this.oMario.xVelocity = 0
        }
        this.oMario.removeJumpAction()
      }
      this.oMario.yVelocity = 0;
      // this.oMario.y = (onShape.res !== false ? onShape.y : this.canvas.height - 10) - this.oMario.height ;
      this.oMario.y = this.canvas.height - 2.5 - this.oMario.height;
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

    drawPixel(this.ctx, this.oMario.getCenter().x, this.oMario.getCenter().y, "black", 5)

    // const isDist = () => {
    //   return res.map(e => {
    //     let dist = calcDistance(this.getCenter().x, this.getCenter().y, e.x, e.y)
    //     dist -= (38 + this.oMario.xVelocity)
    //     return dist >= -1 && dist <= 1
    //   })
    // }

    // const di = isDist()

    // if (this.oMario.isRunningRight()) {
    //   console.log("====== RIGHT 1 ========> ", res)
    //   if (res) {
    //     this.oMario.x -= this.oMario.xVelocity
    //   }
    // }



    // this.oMario.getCenter() = {
    //   x: this.oMario.x + (this.oMario.width / 2),
    //   y: this.oMario.y + (this.oMario.height / 2),
    // }

    // this.ctx.beginPath();
    // this.ctx.rect(100, 100, 64, 64);
    // // this.ctx.stroke();

    // // this.ctx.beginPath();
    // this.ctx.arc(
    //   132, 132,
    //   32, 0,
    //   2 * Math.PI
    // );
    // this.ctx.stroke();

  }

}