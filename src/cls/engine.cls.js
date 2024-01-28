import { choseSpriteImage, drawPixel, fillTextMultiLine, prec, sleep } from "../tools/common.fn.js";

let startTime = Date.now();

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
    this.targetFps = 32
    // this.frameInterval = 1000 / this.targetFps;

    this.lastFrameTime = 0;

    this.oMario = oMario
    this.ctx = ctx
    this.canvas = canvas
    this.images = images

    this.frameCount = 0

    this.globalDataDump = null

    this.currentFps = 0
  }

  setShape(myShapes) {
    this.shapes = myShapes
  }

  gameLoop(timestamp,) {
    let now = Date.now();
    const elapsedTime = timestamp - this.lastFrameTime;

    // if (elapsedTime > this.frameInterval) {
    // if (elapsedTime > 1000 / this.targetFps) {
    if (elapsedTime > 100) {
      this.frame = (this.frame + 1) % this.numFrames;
      this.lastFrameTime = timestamp;

      let sinceStart = now - startTime;
      this.currentFps = Math.round(1000 / (sinceStart / ++this.frameCount) * 100) / 100;
      // var currentFps = Math.round(1000 / (sinceStart / ++frameCount) * 100) / 100;

    }
    this.inGameLoop(timestamp)
  }


  calcDistance(x1, y1, x2, y2) {

    // calcDistance = (x1, y1, x2, y2) => {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt(a * a + b * b)
    // return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
  }

  inGameLoop(timestamp,) {
    // this.getCenter() = {
    //   x: this.oMario.x + (this.oMario.width / 2),
    //   y: this.oMario.y + (this.oMario.height / 2),
    // }
    // console.log(
    //   this.oMario.x ,this.oMario.width, (this.oMario.width / 2)
    // )


    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.images[2], 0, 0);

    this.oMario.move()


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
      // console.log(u1, u2)
      return [u1 <= 1 && u1 >= 0, u2 <= 1 && u2 >= 0, avgX, avgY, A, B, u1, u2]
    }

    const leftNright = this.shapes.shape2DList.map(shapes => {
      return shapes.allPixelArray
        .find(e => {
          let dist = this.calcDistance(this.oMario.getCenter().x, this.oMario.getCenter().y, e.pixel.x, e.pixel.y) - 45
          let halfVx = Math.abs(this.oMario.xVelocity) / 2
          let intersect = dist >= -1 * halfVx && dist <= 1 * halfVx
          // drawPixel(this.ctx, e.pixel.x, e.pixel.y, "purple", 5)
          if (intersect) {
            drawPixel(this.ctx, e.pixel.x, e.pixel.y, "purple", 5)
          }
          return intersect
        })
    }).flat().filter(v => v !== undefined)

    // this.shapes.shape2DList.map(shapes => {
    //   return shapes.allPixelArray
    //     // .map(e => {
    //     .reduce((current, next) => {
    //       // let dist = this.calcDistance(
    //       //   this.oMario.getCenter().x, this.oMario.getCenter().y, e.pixel.x, e.pixel.y
    //       // ) - 10
    //       const [u1Check, u2Check, avgX, avgY, A, B, u1, u2] = inteceptCircleLineSeg(
    //         current.pixel, next.pixel, this.oMario.getCenter(), 36
    //       )

    //       // let halfVy = Math.abs(this.oMario.yVelocity)
    //       // let halfVy = Math.abs(this.oMario.yVelocity) / 6
    //       // let halfVy = 3
    //       // let halfVy = 4
    //       // let halfVy = 1
    //       // let intersect = dist >= -1 * halfVy && dist <= 1 * halfVy

    //       // debugger

    //       // if (dist < 4) {
    //       //   console.log("distdistdist ", dist)
    //       // }
    //       if (u1Check || u2Check) {
    //         drawPixel(this.ctx, A.x, A.y, "white", 5)
    //         drawPixel(this.ctx, avgX, avgY, "purple", 5)
    //         drawPixel(this.ctx, B.x, B.y, "black", 5)

    //         // console.log("fffffffffffffffffafaf", u1, u2)
    //         if (this.oMario.isJumping()) {
    //           this.oMario.xVelocityBeforeJump = 0
    //           if (!(this.oMario.isRunningLeft() || this.oMario.isRunningRight())) {
    //             this.oMario.xVelocity = 0
    //           }
    //           this.oMario.removeJumpAction()
    //         }
    //         this.oMario.yVelocity = 0;
    //         this.oMario.y = avgY - this.oMario.height
    //         // drawPixel(this.ctx, e.pixel.x, e.pixel.y, "purple", 5)
    //         // console.log("distdistdist ", dist)
    //         // return intersect
    //         // return {
    //         //   x: e.pixel.x,
    //         //   y: e.pixel.y,
    //         //   // dist
    //         // }
    //       }
    //       // return undefined
    //       // return {
    //       //   x: e.pixel.x,
    //       //   y: e.pixel.y,
    //       //   // dist: 9999999
    //       // }
    //       return next
    //     })
    //   // .filter(v => v.dist > 0)
    //   // .reduce((prev, curr) => prev.dist < curr.dist ? prev : curr)
    //   // .reduce((prev, curr) => Math.min(prev.dist, curr.dist))
    // })
    // .flat().filter(v => v.dist !== 9999999)

    const triggerLR = leftNright.length > 0
    // const triggerUD = upNdown.length > 0
    const triggerUD = false

    // if (this.oMario.isRunningRight()) {
    //   if (triggerLR) {
    //     const hei = this.oMario.getCenter().y + (this.oMario.height * 1 / 3)
    //     if (hei > leftNright[0].pixel.y) {
    //       this.oMario.xVelocity = 0;
    //       this.oMario.x = leftNright[0].pixel.x - this.oMario.width - 2
    //     }
    //   }
    // }

    // if (this.oMario.isRunningLeft()) {
    //   if (triggerLR) {
    //     const hei = this.oMario.getCenter().y + (this.oMario.height * 1 / 3)
    //     if (hei > leftNright[0].pixel.y) {
    //       this.oMario.xVelocity = -0;
    //       this.oMario.x = leftNright[0].pixel.x
    //     }
    //   }
    // }




    // this.oMario.move()

    if (this.oMario.isDoNothing()) {
      this.oMario.xVelocity = 0
    }

    if (this.oMario.yVelocity < 0 || this.oMario.yVelocity > 0) {
      if (this.oMario.xVelocityBeforeJump === 0) {
        this.oMario.xVelocityBeforeJump = this.oMario.xVelocity
      }
      this.oMario.xVelocity = this.oMario.xVelocityBeforeJump
    }

    this.oMario.yVelocity += GRAVITY;

    this.shapes.shape2DList.map(shapes => {
      return shapes.allPixelArray
        .reduce((current, next) => {

          const [u1Check, u2Check, avgX, avgY, A, B, u1, u2] = inteceptCircleLineSeg(
            current.pixel, next.pixel, this.oMario.getCenter(), 36
          )

          if (u1Check || u2Check) {
            drawPixel(this.ctx, A.x, A.y, "white", 5)
            drawPixel(this.ctx, avgX, avgY, "purple", 5)
            drawPixel(this.ctx, B.x, B.y, "black", 5)

            if (this.oMario.isJumping()) {
              this.oMario.xVelocityBeforeJump = 0
              if (!(this.oMario.isRunningLeft() || this.oMario.isRunningRight())) {
                this.oMario.xVelocity = 0
              }
              this.oMario.removeJumpAction()
            }
            const topOrBottom = Math.atan2(
              avgY - this.oMario.getCenter().y, avgX - this.oMario.getCenter().x
            ) * (180 / Math.PI)
            this.oMario.yVelocity = 0;
            // this.oMario.y = avgY + this.oMario.height

            if (topOrBottom > 0) {
              // this.oMario.y = Math.round(Y - this.oMario.height)
              this.oMario.y = avgY - this.oMario.height
            } else {
              if (this.oMario.isGoingUp()) {
                this.oMario.y = avgY + this.oMario.height
              }
              else {
                // this.oMario.y = avgY - this.oMario.height;
                // debugger
              }
            }
          }
          return next
        })
    })

    if (triggerUD && true === false) {
      // if (triggerUD) {
      // let X = upNdown[0].pixel.x
      // let Y = upNdown[0].pixel.y
      // debugger
      upNdown.forEach(e => {
        let X = e.x
        let Y = e.y

        if (this.oMario.isJumping()) {
          this.oMario.xVelocityBeforeJump = 0
          if (!(this.oMario.isRunningLeft() || this.oMario.isRunningRight())) {
            this.oMario.xVelocity = 0
          }
          this.oMario.removeJumpAction()
        }


        // drawPixel(this.ctx, X, Y, "purple", 5)
        const topOrBottom = Math.atan2(
          Y - this.oMario.getCenter().y, X - this.oMario.getCenter().x
        ) * (180 / Math.PI)

        // console.log(
        //   "----> ", this.oMario.y
        // )
        // this.oMario.y = Y - this.oMario.height - 4
        // console.log(
        //   this.oMario.y, Y, Y - this.oMario.height
        // )
        this.oMario.yVelocity = 0;

        if (topOrBottom > 0) {
          // let dist = this.calcDistance(this.oMario.getCenter().x, this.oMario.getCenter().y, X, Y) - 38
          // let halfVy = 1
          // let intersect = dist >= -1 * halfVy && dist <= 1 * halfVy
          // let intersect = dist > -0.45 && dist < 0.45
          // let intersect = dist === 1
          // debugger
          // if (intersect) {
          // console.log(dist, this.oMario.y, Y, this.oMario.height)
          this.oMario.y = Math.round(Y - this.oMario.height)
          // console.log(this.oMario.y)
          // }
        } else {
          if (this.oMario.isGoingUp()) {
            // this.oMario.y = Y + this.oMario.height;
            this.oMario.y = Y + 10
            // this.oMario.y = Y;
          }
          else {
            this.oMario.y = Y - this.oMario.height;
          }
        }
      });


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
      this.oMario.getCenter().x, this.oMario.getCenter().y, 45, 0, 2 * Math.PI
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
      targetFPS: ${this.targetFps}
      FPS: ${this.currentFps}
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