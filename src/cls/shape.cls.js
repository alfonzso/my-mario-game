import {
  drawPixel, fillTextMultiLine, getHSLFromBigIndex, isRed, rgb2hsl,
  xyToBigIndex
} from "../tools/common.fn.js";
import { MyPixels, OrderedMyPixel } from "./mypixel.cls.js";

export class MyShapes {

  setupEFC = {
    tolerance: 1,
    r: 5,
    d: 1,
    a: 0.0,
  }

  n = Math.ceil(2.0 * Math.PI * this.setupEFC.r / this.setupEFC.d)
  da = 2.0 * Math.PI / this.n

  shapeEdges = null
  shapeCorners = null

  async shapeFinder(ctx, canvas, backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0);

    let context = canvas.getContext('2d');
    let data = context.getImageData(0, 0, canvas.width, canvas.height).data;

    let redShape = []

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (isRed(...rgb2hsl(r, g, b))) {
        let y = Math.trunc(i / 4 / canvas.width)
        let x = (i - (y * 4 * canvas.width)) / 4
        redShape.push(new MyPixels(x, y))
      }
    }

    console.log("redShapeLen", redShape.length);

    let redShapeEdges = []
    let shapeCorners = []

    let contNbc = false
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

      if (notRedCounter > 2) {
        redShapeEdges.push(shape)
      }
      if (notRedCounter > 1) {

      }

    }

    this.shapeEdges = redShapeEdges
    this.shapeCorners = shapeCorners
  }

  getShapeXAvg() {

    return this.shapeEdges.map(v => v.x).reduce((p, c) => p + c) / this.shapeEdges.length
  }

  getShapeYAvg() {

    return this.shapeEdges.map(v => v.y).reduce((p, c) => p + c) / this.shapeEdges.length
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
    let redShapeXAvg = this.shapeEdges.map(v => v.x).reduce((p, c) => p + c) / this.shapeEdges.length
    let redShapeYAvg = this.shapeEdges.map(v => v.y).reduce((p, c) => p + c) / this.shapeEdges.length

    this.shapeTop = this.shapeEdges.filter(v => v.y < redShapeYAvg)
    this.shapeBottom = this.shapeEdges.filter(v => v.y > redShapeYAvg)

    this.shapeLeft = this.shapeEdges.filter(v => v.x < redShapeXAvg)
    this.shapeRight = this.shapeEdges.filter(v => v.y > redShapeXAvg)
  }

  startYANbc(size = 6, ctx, canvas, cornersOfShape) {

    let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let wannabeCorners = []
    for (const edges of cornersOfShape) {
      if (this.zoomToPixel(edges, size, canvas, ctx, data))
        wannabeCorners.push(edges)
    }

    let skipElements = []
    let avgPixelArray = []
    let xTol = 0.950
    let yTol = 1.050
    for (const edc of wannabeCorners) {
      if (!skipElements.includes(edc)) {
        let elements = wannabeCorners.filter(v => v.x / edc.x > xTol && v.x / edc.x < yTol && v.y / edc.y > xTol && v.y / edc.y < yTol)
        skipElements.push(...elements)
        let avgX = elements.map(v => v.x).reduce((p, c) => p + c) / elements.length
        let avgY = elements.map(v => v.y).reduce((p, c) => p + c) / elements.length

        var avgPixel = elements.reduce(function (prev, curr) {
          return (
            Math.abs(curr.x - avgX) < Math.abs(prev.x - avgX) ? curr : prev
          )
        });

        var avgPixelY = elements.reduce(function (prev, curr) {
          return (
            Math.abs(curr.y - avgY) < Math.abs(prev.y - avgY) ? curr : prev
          )
        });

        console.log(elements, avgX, avgY, "=>", avgPixel, avgPixelY);
        avgPixelArray.push(avgPixel)
      }

    }

    cornersOfShape.sort((a, b) => a.x - b.x)

    console.log(avgPixelArray);

    for (let index = 0; index < cornersOfShape.length; index += 15) {

      let [xx, yy] = [cornersOfShape[index].x, cornersOfShape[index].y]
      drawPixel(ctx, xx, yy, "black", 2.5)
    }

  }

  startNbc(size = 6, ctx, cornersOfShape) {
    let wannabeCorners = []
    for (const onePixel of cornersOfShape) {
      let pixel = this.zoomToPixel(onePixel, size, ctx, cornersOfShape)
      if (pixel !== null) {
        wannabeCorners.push(pixel)
      }
    }

    for (const pxl of wannabeCorners) {
      if (pxl !== undefined)
        drawPixel(ctx, pxl.x, pxl.y, "black", 4)
    }

    console.log(wannabeCorners);
  }

  removeClosestPixelAndChooseAvgPoint(wannabeCorners) {
    let tmpAaaa = wannabeCorners
    let reducedNumberOfCorners = []

    let idxCounter = 25

    while (idxCounter > 0) {
      let xyz = tmpAaaa[0]
      if (xyz === undefined)
        break
      let intervalWC = wannabeCorners.filter(v => xyz.x <= v.x + 10 && xyz.x >= v.x - 10)
      let avgX = Math.trunc(intervalWC.map(v => v.x).reduce((p, c) => p + c) / intervalWC.length)

      reducedNumberOfCorners.push(intervalWC.find(v => v.x >= avgX - 1 && v.x <= avgX + 1))
      tmpAaaa = tmpAaaa.filter(vv => !intervalWC.map(v => v.x).includes(vv.x))
      idxCounter -= 1
    }

    console.log("tttt", tmpAaaa.length);
    return reducedNumberOfCorners
  }

  createMatrixAroundPixel(pixel, size) {
    let finalMatrix = []
    let nbMatrixXAxis = []
    for (let idx = size / 2; idx !== 0; idx--) { nbMatrixXAxis.push(idx * -1) }
    for (let idx = 0; idx <= size / 2; idx++) { nbMatrixXAxis.push(idx) }

    for (let idxY = size / 2; idxY !== 0; idxY--) {
      let tmpRow = []
      for (const idxX of nbMatrixXAxis) {
        let pxl = new MyPixels(pixel.x + idxX, pixel.y + (idxY * -1))
        tmpRow.push(pxl)
      }
      finalMatrix.push(tmpRow)
    }

    for (let idxY = 0; idxY <= size / 2; idxY++) {
      let tmpRow = []
      for (const idxX of nbMatrixXAxis) {
        let pxl = new MyPixels(pixel.x + idxX, pixel.y + idxY)
        tmpRow.push(pxl)
      }
      finalMatrix.push(tmpRow)
    }
    return finalMatrix
  }

  identifyColorFromMatrixPixel(pixelMatrix, canvas, data) {
    let redOrNotArr = []
    for (const row of pixelMatrix) {
      let tmpArr = []
      for (const xy of row) {
        let bigIdx = xyToBigIndex(xy.x, xy.y, canvas)
        let hsl = getHSLFromBigIndex(bigIdx, data)
        if (isRed(...hsl)) {
          tmpArr.push("1")

        } else {
          tmpArr.push("0")

        }

      }
      redOrNotArr.push(tmpArr)
    }
    return redOrNotArr
  }

  createMultilineStringFromMatrixPixel(redOrNotArr) {
    let dbgArrStr = []
    for (const column of redOrNotArr) {
      dbgArrStr.push(column.join(" "))
    }
    return dbgArrStr.join("\n")
  }

  debugAroundPixel(pixelToDebugCfg, fillTextMultiLineCfg) {
    let debug = this.zoomToPixel(pixelToDebugCfg.pixel, pixelToDebugCfg.size, pixelToDebugCfg.canvas, pixelToDebugCfg.data)
    fillTextMultiLine(fillTextMultiLineCfg.ctx, debug, fillTextMultiLineCfg.x, fillTextMultiLineCfg.y)
  }

  zoomToPixel(pixel, size = 6, canvas, data) {
    let pixelMatrix = this.createMatrixAroundPixel(pixel, size)
    let redOrNotArr = this.identifyColorFromMatrixPixel(pixelMatrix, canvas, data)
    return this.createMultilineStringFromMatrixPixel(redOrNotArr)

  }

  nbcV2(pixel, size = 6, canvas, ctx, data, cos, pP, nbcV2Idx) {
    let pixelMatrix = this.createMatrixAroundPixel(pixel, size)

    let redOrNotArr = []
    for (const row of pixelMatrix) {
      let tmpRedArray = []
      for (const xy of row) {
        if (xy.x === pixel.x && xy.y === pixel.y)
          continue
        if (pP.length > 0 && this.pixelArrayIncludesElement(pP, xy)) {
          continue
        }
        let bigIdx = xyToBigIndex(xy.x, xy.y, canvas)
        let hsl = getHSLFromBigIndex(bigIdx, data)
        if (isRed(...hsl)) {
          tmpRedArray.push(xy)
        }

      }
      redOrNotArr.push(...tmpRedArray)
    }

    let filtered = cos.filter(
      v =>
        redOrNotArr.filter(vv => vv.x === v.x && vv.y === v.y).length > 0
    )

    if (filtered.length === 0)
      return

    let lenCalc = pP.length
    let orPixel = new OrderedMyPixel(pixel, lenCalc)
    let orderFiltered = []

    for (const f of filtered) {
      lenCalc += 1
      orderFiltered.push(new OrderedMyPixel(f, lenCalc))
    }

    if (pP.find(v => v.pixel.id === orPixel.pixel.id) === undefined)
      pP.push(orPixel, ...orderFiltered)

    nbcV2Idx += 1

    for (const f of orderFiltered) {
      this.nbcV2(f.pixel, size, canvas, ctx, data, cos, pP, nbcV2Idx)
    }

  }

  isBetween(a, b, c) {
    let crossproduct = (c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y)

    if (Math.abs(crossproduct) > Number.EPSILON)
      return false

    let dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y) * (b.y - a.y)
    if (dotproduct < 0)
      return false

    let squaredlengthba = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y)
    if (dotproduct > squaredlengthba)
      return false

    return true
  }

  is_on(a, b, c) {
    return this.collinear(a, b, c) &&
      (a.x != b.x ? this.within(a.x, c.x, b.x) : this.within(a.y, c.y, b.y))
  }

  collinear(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) == (c.x - a.x) * (b.y - a.y)
  }

  within(p, q, r) {
    return p <= q <= r || r <= q <= p
  }

  pixelArrayIncludesElement(pxlArray, pixel) {
    return pxlArray.filter(v => v.pixel.x === pixel.x && v.pixel.y === pixel.y).length > 0
  }

  startCornerFinder(shapeEdges, ctx) {
    for (const edges of shapeEdges) {
      this.cornerFinder(edges.x, edges.y, shapeEdges, ctx)
    }
  }

  cornerFinder(xx, yy, shapeEdges, ctx) {

    let edgesFromCircle = this.calcEdgesFromCircle(shapeEdges, xx, yy)
    if (edgesFromCircle.length === 0)
      return

    let minX = edgesFromCircle.reduce((p, v) => p.x < v.x ? p : v)
    let maxX = edgesFromCircle.reduce((p, v) => p.x > v.x ? p : v)

    let minY = edgesFromCircle.reduce((p, v) => p.y < v.y ? p : v)
    let maxY = edgesFromCircle.reduce((p, v) => p.y > v.y ? p : v)

    let isPOLCounter = 0
    for (let [miX, maY] of [[minX, maxX], [minY, maxY]]) {

      const path = new Path2D();
      path.moveTo(miX.x, miX.y);
      path.lineTo(maY.x, maY.y);
      ctx.lineWidth = 3;

      if (!ctx.isPointInStroke(path, xx, yy))
        isPOLCounter += 1

    }
    if (isPOLCounter === 2)
      drawPixel(ctx, xx, yy, "green", 5)

  }

  calcEdgesFromCircle(shapeEdges, xx, yy) {
    let edgesFromCircle = []

    for (let i = 0; i < this.n; i++, this.setupEFC.a += this.da) {
      let x = Math.trunc(xx + this.setupEFC.r * Math.cos(this.setupEFC.a))
      let y = Math.trunc(yy + this.setupEFC.r * Math.sin(this.setupEFC.a))

      edgesFromCircle.push(
        ...shapeEdges.filter(
          v =>
            (v.x <= x + this.setupEFC.tolerance && v.x >= x - this.setupEFC.tolerance)
            &&
            (v.y <= y + this.setupEFC.tolerance && v.y >= y - this.setupEFC.tolerance)
        )
      )
    }

    return edgesFromCircle
  }

  startYACF(shapeEdges, ctx) {
    let idx = 0
    this.yacfArray = []
    let path = new Path2D()
    this.yacf(shapeEdges[idx].x, shapeEdges[idx].y, shapeEdges, ctx, path)
  }

// yet another corner finder
  yacf(xx, yy, shapeEdges, ctx, path) {

    for (let i = 0; i < this.n; i++, this.setupEFC.a += this.da) {
      let x = Math.trunc(xx + this.setupEFC.r * Math.cos(this.setupEFC.a))
      let y = Math.trunc(yy + this.setupEFC.r * Math.sin(this.setupEFC.a))

      this.yacfArray.push(
        ...shapeEdges.filter(
          v =>
            this.isPointOnLine(v.x, v.y, xx, yy, x, y, ctx, path)
        )
      )
    }
    console.log(yacfArray);
  }

  isPointOnLine(cx, cy, x0, y0, x1, y1, ctx, path = new Path2D()) {
    path.moveTo(x0, y0);
    path.lineTo(x1, y1);
    ctx.lineWidth = 1;

    return ctx.isPointInStroke(path, cx, cy)
  }
  // yet another new corner finder
  yanewcf(processedPixels, ctx) {
    let cornerPosArray = []
    let idxOfpP = 0

    let lineFinder = []

    for (let idx = 0; idx < processedPixels.length; idx += 1) {
      let edc = processedPixels[idx].pixel

      idxOfpP += 1
      if (lineFinder.length > 1) {

        let yellow = lineFinder[0]
        let green = lineFinder[1]
        let blue = edc

        var Dx = blue.x - yellow.x;
        var Dy = blue.y - yellow.y;
        var d = Math.abs(Dy * green.x - Dx * green.y - yellow.x * blue.y + blue.x * yellow.y) / Math.sqrt(Math.pow(Dx, 2) + Math.pow(Dy, 2));
        if (d > 0.75) {
          lineFinder = []
          cornerPosArray.push(processedPixels[idx])
        } else {
          lineFinder = [lineFinder[0], edc]
        }

      } else {
        lineFinder.push(edc)
      }
    }
    return cornerPosArray
  }

  pixelSpacing(processedPixels, ctx) {
    let spacedPointsArray = []
    for (let idx = 0; idx < processedPixels.length; idx += 75) {
      let edc = processedPixels[idx].pixel

      spacedPointsArray.push(processedPixels[idx])
    }
    return spacedPointsArray
  }
}