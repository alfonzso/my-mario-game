import { drawPixel } from "../tools/common.fn.js"

class Shape2D {
  shape2DList = []
  cornerArray = []
  spacedPoints = []
  allPixelArray = []
  shape = null
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

  isOnShape(oMario) {
    for (const shape2D of this.shape2DList) {
      // console.log(shape2D);
      // for (const pixels of shape2D.allPixelArray) {
      for (let index = 0; index < shape2D.allPixelArray.length; index += 1) {
        if (index + 1 > shape2D.allPixelArray.length - 1)
          break
        let begining = shape2D.allPixelArray[index].pixel
        let ending = shape2D.allPixelArray[index + 1].pixel
        // this.drawing.ctx.fillText(`${pixels.orderNumber}`, pixels.pixel.x, pixels.pixel.y);
        // drawPixel(this.drawing.ctx, pixels.pixel.x, pixels.pixel.y, "black", 5)
        var Dx = ending.x - begining.x;
        var Dy = ending.y - begining.y;
        var avgX = ( begining.x + ending.x ) / 2
        var avgY = ( begining.y + ending.y ) / 2
        var d = Math.abs(Dy * oMario.x - Dx * oMario.y - begining.x * ending.y + ending.x * begining.y) / Math.sqrt(Math.pow(Dx, 2) + Math.pow(Dy, 2));
        if (d < 0.75) {
          // return { x: oMario.x, y: oMario.y }
          return { x: avgX, y: avgY }
        }
      }
    }
    return false
  }

}

export {
  Shape2D
}