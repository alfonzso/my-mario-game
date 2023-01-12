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


  isOnShape(oMario) {
    let isThere = null
    for (const shape2D of this.shape2DList) {
      // console.log(shape2D);
      // for (const pixels of shape2D.allPixelArray) {
      for (let index = 0; index < shape2D.allPixelArray.length; index += 1) {
        if (index + 1 > shape2D.allPixelArray.length - 1)
          break
        let begining = shape2D.allPixelArray[index].pixel
        let ending = shape2D.allPixelArray[index + 1].pixel

        // let ordNum1 = shape2D.allPixelArray[index + 1].orderNumber
        // let ordNum = shape2D.allPixelArray[index].orderNumber
        // if (ordNum1 - ordNum < 90) {
        //   index += 1
        //   continue
        // }

        drawPixel(this.drawing.ctx, begining.x, begining.y, "white", 20)
        drawPixel(this.drawing.ctx, ending.x, ending.y, "blue", 10)
        // this.drawing.ctx.fillText(`${pixels.orderNumber}`, pixels.pixel.x, pixels.pixel.y);
        // drawPixel(this.drawing.ctx, pixels.pixel.x, pixels.pixel.y, "black", 5)
        var Dx = ending.x - begining.x;
        var Dy = ending.y - begining.y;
        // var
        // if (Dx === 0)
        //   Dx = 1
        // if (Dy === 0)
        //   Dy = 1
        // var Dx = begining.x - ending.x;
        // var Dy = begining.y - ending.y;
        var avgX = (begining.x + ending.x) / 2
        var avgY = (begining.y + ending.y) / 2
        drawPixel(this.drawing.ctx, avgX, avgY, "black", 5)

        // let fixMario = { x : oMario.x , y: oMario.y}
        let fixMario = { x: Math.trunc(oMario.x + (oMario.width / 2)), y: oMario.y + oMario.height }
        let neww = this.calcIsInsideThickLineSegment(begining, ending, fixMario, 15)

        var d = Math.abs(Dy * (oMario.x === 0 ? 1 : oMario.x) - Dx * oMario.y - begining.x * ending.y + ending.x * begining.y) / Math.sqrt(Math.pow(Dx, 2) + Math.pow(Dy, 2));
        // isThere = this.isPointOnLine(oMario.x, oMario.y, begining.x, begining.y, ending.x, ending.y, this.drawing.ctx, new Path2D())
        // if (d < 0.75) {
        // if (d < 5) {
        if (neww) {
          // if (isThere) {
          // return { x: oMario.x, y: oMario.y }
          // return { x: avgX, y: avgY }
          // this.sleep(5000)

          return {
            // res: true, x: begining.x, y: begining.y, data: { dx: Dx, dy: Dy, d: d }
            // res: true, x: avgX, y: avgY, data: { dx: Dx, dy: Dy, d: d }
            res: true, x: fixMario.x, y: fixMario.y, data: { dx: Dx, dy: Dy, d: d }
            // res: true, x: begining.x, y: begining.y, data: { isThere: isThere }
          }
          // console.log(d);
        }
        // else{
        //   console.log("fukkk");
        // }
        // return {
        //   res: false, x: begining.x, y: begining.y, data: { dx: Dx, dy: Dy, d: d, inner: true }
        //   // res: true, x: begining.x, y: begining.y, data: { isThere: isThere }
        // }
      }
    }
    return { res: false, data: { dx: Dx, dy: Dy, d: d } }
    // return { res: false, data: { isThere: isThere } }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export {
  Shape2D
}