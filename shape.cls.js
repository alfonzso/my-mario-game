import { getHSLFromBigIndex, isRed, rgb2hsl, xyToBigIndex } from "./common.fn.js";
import { MyPixels } from "./mypixel.cls.js";

export class MyShapes {

  async shapeFinder(ctx, canvas, images) {
    ctx.drawImage(images[2], 0, 0);

    let context = canvas.getContext('2d');
    let data = context.getImageData(0, 0, canvas.width, canvas.height).data;

    let redShape = []

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // const alpha = data[i + 3];

      if (isRed(...rgb2hsl(r, g, b))) {
        let y = Math.trunc(i / 4 / canvas.width)
        let x = (i - (y * 4 * canvas.width)) / 4
        redShape.push(new MyPixels(x, y))
      }
    }

    let redShapeCorner = []

    for (const shape of redShape) {
      shape.neightbourCalculator()

      let notRedCounter = 0
      for (const row of shape.neightb) {
        for (const xy of row) {
          let bigIdx = xyToBigIndex(xy.x, xy.y, canvas)
          let hsl = getHSLFromBigIndex(bigIdx, data)
          if (!isRed(...hsl)) {
            notRedCounter += 1
          }
        }
      }
      if (notRedCounter >= 3) {
        redShapeCorner.push(shape)
      }
    }

    // return redShapeCorner
    this.shapeCorner = redShapeCorner
  }

  getShapeXAvg() {
    // this.setShapeXAvg = shapeCorner.map(v => v.x).reduce((p, c) => p + c) / shapeCorner.length
    return this.shapeCorner.map(v => v.x).reduce((p, c) => p + c) / this.shapeCorner.length
  }

  getShapeYAvg() {
    // this.setShapeYAvg = shapeCorner.map(v => v.y).reduce((p, c) => p + c) / shapeCorner.length
    return this.shapeCorner.map(v => v.y).reduce((p, c) => p + c) / this.shapeCorner.length
  }


  isYAxisNearShape(oMario, redShape, interval) {
    return oMario.y + oMario.height >= redShape.y - interval && oMario.y + oMario.height <= redShape.y + interval
  }

  isXAxisNearShape(oMario, redShape) {
    return Math.trunc(oMario.x + (oMario.width / 2)) === redShape.x
  }

  isOnShape(oMario) {
    for (const redShape of this.shapeTop) {
      if (this.isYAxisNearShape(oMario, redShape, 3) && this.isXAxisNearShape(oMario, redShape)) {
        return redShape
      }
    }
    return false
  }

  isUnderShape(oMario) {
    for (const redShape of this.shapeBottom) {
      if (this.isYAxisNearShape(oMario, redShape, 50) && this.isXAxisNearShape(oMario, redShape)) {
        oMario.yVelocity = Math.abs(oMario.yVelocity)
        return false
      }
    }
    return false
  }

  checkShape(oMario) {
    return [this.isOnShape(oMario), this.isUnderShape(oMario)]
  }


  calculateTopBottom() {
    let redShapeXAvg = this.shapeCorner.map(v => v.x).reduce((p, c) => p + c) / this.shapeCorner.length
    let redShapeYAvg = this.shapeCorner.map(v => v.y).reduce((p, c) => p + c) / this.shapeCorner.length

    this.shapeTop = this.shapeCorner.filter(v => v.y < redShapeYAvg)
    this.shapeBottom = this.shapeCorner.filter(v => v.y > redShapeYAvg)

    this.shapeLeft = this.shapeCorner.filter(v => v.x < redShapeXAvg)
    this.shapeRight = this.shapeCorner.filter(v => v.y > redShapeXAvg)
  }


}