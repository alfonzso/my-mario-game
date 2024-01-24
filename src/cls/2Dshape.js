import { drawPixel } from "../tools/common.fn.js"

class Shape2D {
  shape2DList = []
  cornerArray = []
  spacedPoints = []
  allPixelArray = []
  shape = null

  shapeTop = null
  shapeBottom = null
  shapeLeft = null
  shapeRight = null

  drawing = {}

  constructor() {
  }

  setShapeAndDrawing(shape, drawing) {
    this.shape = shape
    this.drawing = drawing
  }

  setCornerArrayAndSpacedPoints(cornerArray, spacedPoints) {
    this.cornerArray = cornerArray
    this.spacedPoints = spacedPoints
    this.allPixelArray = [...cornerArray, ...spacedPoints].sort((a, b) => a.orderNumber - b.orderNumber)
    this.calculateTopBottom()
    return this
  }

  createShapeListFromBackground(ShapeEdgesArray) {
    let r = ShapeEdgesArray
    let processedPixels = []
    let nbcV2Idx = 0

    // for (let index = 0; index < 4; index++) {
    while (r.length > 10) {
      this.shape.nbcV2(r[0], 4, this.drawing.canvas, this.drawing.ctx, this.drawing.data, r, processedPixels, nbcV2Idx)
      let cornerArray = this.shape.yanewcf(processedPixels, this.drawing.ctx)
      let spacedPoints = this.shape.pixelSpacing(processedPixels, this.drawing.ctx)
      this.shape2DList.push(new Shape2D().setCornerArrayAndSpacedPoints(cornerArray, spacedPoints))

      r = r.filter(v => processedPixels.find(vv => vv.pixel.id === v.id) === undefined)
      processedPixels = []
      nbcV2Idx = 0
    }
  }

  drawPoints() {
    for (const shape2D of this.shape2DList) {
      console.log(shape2D);
      for (const pixels of shape2D.allPixelArray) {
        this.drawing.ctx.fillText(`${pixels.orderNumber}`, pixels.pixel.x, pixels.pixel.y);
        drawPixel(this.drawing.ctx, pixels.pixel.x, pixels.pixel.y, "black", 5)
      }
    }
  }

  isYAxisNearShape(oMario, redShape, interval) {
    return oMario.y + oMario.height >= redShape.y - interval && oMario.y + oMario.height <= redShape.y + interval
  }

  isXAxisNearShape(oMario, redShape) {
    return Math.trunc(oMario.x + (oMario.width / 2)) === redShape.x
  }

  isPointOnLine(cx, cy, x0, y0, x1, y1, ctx, path = new Path2D()) {
    // const path = new Path2D();
    path.moveTo(x0, y0);
    path.lineTo(x1, y1);
    ctx.lineWidth = 20;
    // ctx.stroke(path);
    return ctx.isPointInStroke(path, cx, cy)
    // if (!ctx.isPointInStroke(path, cx, cy))
    //   isPOLCounter += 1
  }

  calcIsInsideThickLineSegment(line1, line2, pnt, lineThickness) {
    var L2 = (((line2.x - line1.x) * (line2.x - line1.x)) + ((line2.y - line1.y) * (line2.y - line1.y)));
    if (L2 == 0) return false;
    var r = (((pnt.x - line1.x) * (line2.x - line1.x)) + ((pnt.y - line1.y) * (line2.y - line1.y))) / L2;

    //Assume line thickness is circular
    if (r < 0) {
      //Outside line1
      return (Math.sqrt(((line1.x - pnt.x) * (line1.x - pnt.x)) + ((line1.y - pnt.y) * (line1.y - pnt.y))) <= lineThickness);
    } else if ((0 <= r) && (r <= 1)) {
      //On the line segment
      var s = (((line1.y - pnt.y) * (line2.x - line1.x)) - ((line1.x - pnt.x) * (line2.y - line1.y))) / L2;
      return (Math.abs(s) * Math.sqrt(L2) <= lineThickness);
    } else {
      //Outside line2
      return (Math.sqrt(((line2.x - pnt.x) * (line2.x - pnt.x)) + ((line2.y - pnt.y) * (line2.y - pnt.y))) <= lineThickness);
    }
  }

  calculateTopBottom() {
    let redShapeXAvg = this.allPixelArray.map(v => v.pixel.x).reduce((p, c) => p + c) / this.allPixelArray.length
    let redShapeYAvg = this.allPixelArray.map(v => v.pixel.y).reduce((p, c) => p + c) / this.allPixelArray.length

    this.shapeTop = this.allPixelArray.filter(v => v.pixel.y < redShapeYAvg)
    this.shapeBottom = this.allPixelArray.filter(v => v.pixel.y > redShapeYAvg)

    this.shapeLeft = this.allPixelArray.filter(v => v.pixel.x < redShapeXAvg)
    this.shapeRight = this.allPixelArray.filter(v => v.pixel.y > redShapeXAvg)
  }

  calcShapePointsAndMarioDistance(oMario, orientation, resultTrue, resultFalse) {
    for (const shape2D of this.shape2DList) {
      let topOrBottom = shape2D[orientation]
      for (let index = 0; index < topOrBottom.length; index += 1) {
        if (index + 1 > topOrBottom.length - 1)
          break

        let begining = topOrBottom[index].pixel
        let ending = topOrBottom[index + 1].pixel
        var avgX = (begining.x + ending.x) / 2
        var avgY = (begining.y + ending.y) / 2
        let fakePixel = { x: avgX, y: avgY }

        drawPixel(this.drawing.ctx, begining.x, begining.y, "white", 3)
        drawPixel(this.drawing.ctx, ending.x, ending.y, "blue", 2)
        drawPixel(this.drawing.ctx, avgX, avgY, "black", 5)

        let fixMario = { x: Math.trunc(oMario.x + (oMario.width / 2)), y: oMario.y + oMario.height }
        if (
          this.calcIsInsideThickLineSegment(begining, ending, fixMario, 15)
          ||
          this.calcIsInsideThickLineSegment(fakePixel, ending, fixMario, 15)
          ||
          this.calcIsInsideThickLineSegment(begining, fakePixel, fixMario, 15)
        ) {
          return resultTrue(true, fixMario, {})
        }
      }
    }
    return resultFalse(false)
  }

  checkShape(oMario) {
    return [this.isOnShape(oMario), this.isUnderShape(oMario)]
  }

  isUnderShape(oMario) {
    function resultTrue(res, fixedMario, data) {
      oMario.yVelocity = Math.abs(oMario.yVelocity)
      return {
        res: false, x: fixedMario.x, y: fixedMario.y, data
      }
    }
    function resultFalse(res) {
      return {
        res: false
      }
    }
    return this.calcShapePointsAndMarioDistance(oMario, "shapeBottom", resultTrue, resultFalse)
  }

  isOnShape(oMario) {
    function resultTrue(res, fixedMario, data) {
      return {
        res, x: fixedMario.x, y: fixedMario.y, data
      }
    }
    function resultFalse(res) {
      return {
        res
      }
    }
    return this.calcShapePointsAndMarioDistance(oMario, "shapeTop", resultTrue, resultFalse)
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export {
  Shape2D
}