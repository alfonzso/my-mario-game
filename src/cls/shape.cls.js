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

  // calcSetupEFC = {
  n = Math.ceil(2.0 * Math.PI * this.setupEFC.r / this.setupEFC.d)
  da = 2.0 * Math.PI / this.n
  // }

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
      // const alpha = data[i + 3];

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
        // if (contNbc)
        //   break
        for (const xy of row) {
          let bigIdx = xyToBigIndex(xy.x, xy.y, canvas)
          let hsl = getHSLFromBigIndex(bigIdx, data)
          if (!isRed(...hsl)) {
            notRedCounter += 1
            // contNbc = true
            // redShapeEdges.push(shape)
            // break
          }
        }
      }
      // contNbc = false
      if (notRedCounter > 2) {
        redShapeEdges.push(shape)
      }
      if (notRedCounter > 1) {
        // redShapeEdges.push(shape)
        // drawPixel(ctx, shape.x, shape.y, "blue", 2)
        // console.log("keeeeeeeeeeeek");
      }

      // if (notRedCounter > 4 || (notRedCounter > 1 && notRedCounter < 3)) {
      //   shapeCorners.push(shape)
      // }
    }

    this.shapeEdges = redShapeEdges
    this.shapeCorners = shapeCorners
  }

  getShapeXAvg() {
    // this.setShapeXAvg = shapeCorner.map(v => v.x).reduce((p, c) => p + c) / shapeCorner.length
    return this.shapeEdges.map(v => v.x).reduce((p, c) => p + c) / this.shapeEdges.length
  }

  getShapeYAvg() {
    // this.setShapeYAvg = shapeCorner.map(v => v.y).reduce((p, c) => p + c) / shapeCorner.length
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
    // console.log(wannabeCorners)
    // for (const edc of wannabeCorners) {
    //   drawPixel(ctx, edc.x, edc.y, "black", 5)
    // }

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

        // let avgPixel = elements.find(v =>
        //   // (v.x / avgX >= 0.980 && v.x / avgX <= 1.020) && (v.y / avgY >= 0.980 && v.y / avgY <= 1.020)
        //   v.x === Math.trunc(avgX) || v.y === Math.trunc(avgY)
        //   // && v.y === avgY
        // )
        console.log(elements, avgX, avgY, "=>", avgPixel, avgPixelY);
        avgPixelArray.push(avgPixel)
      }

    }

    // console.log(avgPixelArray);
    // for (const edc of avgPixelArray) {
    //   if (edc !== undefined)
    //     drawPixel(ctx, edc.x, edc.y, "green", 5)
    // }
    // cornersOfShape.sort((a, b) => a.y - b.y)
    cornersOfShape.sort((a, b) => a.x - b.x)
    // cornersOfShape.sort((a, b) => a.y - b.y)
    console.log(avgPixelArray);
    // for (const edc of cornersOfShape) {
    for (let index = 0; index < cornersOfShape.length; index += 15) {
      // if (edc !== undefined)
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

    // let actualCorners = this.removeClosestPixelAndChooseAvgPoint(wannabeCorners)

    // for (const pxl of actualCorners) {
    for (const pxl of wannabeCorners) {
      if (pxl !== undefined)
        drawPixel(ctx, pxl.x, pxl.y, "black", 4)
    }

    // console.log(actualCorners);
    console.log(wannabeCorners);
  }


  removeClosestPixelAndChooseAvgPoint(wannabeCorners) {
    let tmpAaaa = wannabeCorners
    let reducedNumberOfCorners = []
    // let intervalWC = 0
    // for (const xyz of tmpAaaa) {
    let idxCounter = 25
    // while (tmpAaaa.length >= 0) {
    while (idxCounter > 0) {
      let xyz = tmpAaaa[0]
      if (xyz === undefined)
        break
      let intervalWC = wannabeCorners.filter(v => xyz.x <= v.x + 10 && xyz.x >= v.x - 10)
      let avgX = Math.trunc(intervalWC.map(v => v.x).reduce((p, c) => p + c) / intervalWC.length)
      // console.log("t", intervalWC, avgX, intervalWC.find(v => v.x === avgX));
      // intervalWC.find(v => v.x === avgX)
      reducedNumberOfCorners.push(intervalWC.find(v => v.x >= avgX - 1 && v.x <= avgX + 1))
      tmpAaaa = tmpAaaa.filter(vv => !intervalWC.map(v => v.x).includes(vv.x))
      idxCounter -= 1
    }
    // tmpAaaa = tmpAaaa.map(v => intervalWC.filter(vv => vv.x !== v.x))
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
          // tmpArr.push(`${xy.x}x${xy.y}|0`)
        } else {
          tmpArr.push("0")
          // tmpArr.push(`${xy.x}x${xy.y}|1`)
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

    // # compare versus epsilon for floating point values, or != 0 if using integers
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
    // "Return true iff point c intersects the line segment from a to b."
    // # (or the degenerate case that all 3 points are coincident)
    return this.collinear(a, b, c) &&
      (a.x != b.x ? this.within(a.x, c.x, b.x) : this.within(a.y, c.y, b.y))
  }

  collinear(a, b, c) {
    // "Return true iff a, b, and c all lie on the same line."
    return (b.x - a.x) * (c.y - a.y) == (c.x - a.x) * (b.y - a.y)
  }

  within(p, q, r) {
    // "Return true iff q is between p and r (inclusive)."
    return p <= q <= r || r <= q <= p
  }

  pixelArrayIncludesElement(pxlArray, pixel) {
    return pxlArray.filter(v => v.pixel.x === pixel.x && v.pixel.y === pixel.y).length > 0
  }

  startCornerFinder(shapeEdges, ctx) {
    // for (let index = 0; index < shapeEdges.length; index += 2) {
    //   this.cornerFinder(shapeEdges[index].x, shapeEdges[index].y, shapeEdges, ctx)
    // }
    for (const edges of shapeEdges) {
      this.cornerFinder(edges.x, edges.y, shapeEdges, ctx)
    }
  }

  cornerFinder(xx, yy, shapeEdges, ctx) {
    // var startTime = performance.now()

    // let xx = shapeEdges[0].x
    // let yy = shapeEdges[0].y

    // let edgesFromCircle = []
    // let tolerance = 1
    // let r = 5
    // let d = 1
    // let n = Math.ceil(2.0 * Math.PI * r / d); // integer number of points (rounded up)
    // let da = 2.0 * Math.PI / n;           // floating angular step between points
    // let a = 0.0
    // for (let i = 0; i < n; i++, a += da) {
    //   let x = xx + r * Math.cos(a);
    //   let y = yy + r * Math.sin(a);
    //   // here x,y is your point
    //   // console.log(x, y);
    //   edgesFromCircle.push(
    //     ...shapeEdges.filter(
    //       v => (v.x <= Math.trunc(x) + tolerance && v.x >= Math.trunc(x) - tolerance) && (v.y <= Math.trunc(y) + tolerance && v.y >= Math.trunc(y) - tolerance)
    //     )
    //   )
    //   // edgesFromCircle.push(...myShapes.shapeEdges.filter(v => v.y === y))
    //   // drawPixel(ctx, x, y, "black", 1)
    // }

    let edgesFromCircle = this.calcEdgesFromCircle(shapeEdges, xx, yy)
    if (edgesFromCircle.length === 0)
      return

    // console.log(xx, yy, edgesFromCircle);
    let minX = edgesFromCircle.reduce((p, v) => p.x < v.x ? p : v) //, 0)
    let maxX = edgesFromCircle.reduce((p, v) => p.x > v.x ? p : v) //, 0)

    let minY = edgesFromCircle.reduce((p, v) => p.y < v.y ? p : v) //, 0)
    let maxY = edgesFromCircle.reduce((p, v) => p.y > v.y ? p : v) //, 0)

    // let isPOL = isPointOnLine(xx, yy, min.x, min.y, max.x, max.y, 5)
    // if (!isPOL)
    //   drawPixel(ctx, xx, yy, "green", 5)

    let isPOLCounter = 0
    for (let [miX, maY] of [[minX, maxX], [minY, maxY]]) {

      const path = new Path2D();
      path.moveTo(miX.x, miX.y);
      path.lineTo(maY.x, maY.y);
      ctx.lineWidth = 3;
      // ctx.stroke(path);
      if (!ctx.isPointInStroke(path, xx, yy))
        isPOLCounter += 1

    }
    if (isPOLCounter === 2)
      drawPixel(ctx, xx, yy, "green", 5)
    // console.log(min, max, isPOL);
    // for (const edc of [min, max]) {
    //   drawPixel(ctx, edc.x, edc.y, "green", 2)
    // }
    // var endTime = performance.now()

    // console.log(`calcEdgesFromCircle ->> ${endTime - startTime} ms`)
  }

  // setupEFC() {
  //   let tolerance = 1
  //   let r = 5
  //   let d = 1
  //   let n = Math.ceil(2.0 * Math.PI * r / d); // integer number of points (rounded up)
  //   let da = 2.0 * Math.PI / n;           // floating angular step between points
  //   let a = 0.0
  // }

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
    // let efc = edgesFromCircle.filter(v => v === undefined).length
    // if (efc > 0)
    //   console.log("kkkkk", efc);
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

      // edgesFromCircle.push(
      this.yacfArray.push(
        ...shapeEdges.filter(
          v =>
            // (v.x <= x + this.setupEFC.tolerance && v.x >= x - this.setupEFC.tolerance)
            // &&
            // (v.y <= y + this.setupEFC.tolerance && v.y >= y - this.setupEFC.tolerance)
            this.isPointOnLine(v.x, v.y, xx, yy, x, y, ctx, path)
        )
      )
    }
    console.log(yacfArray);
    // let minX = edgesFromCircle.reduce((p, v) => p.x < v.x ? p : v) //, 0)
    // let maxX = edgesFromCircle.reduce((p, v) => p.x > v.x ? p : v) //, 0)

    // let minY = edgesFromCircle.reduce((p, v) => p.y < v.y ? p : v) //, 0)
    // let maxY = edgesFromCircle.reduce((p, v) => p.y > v.y ? p : v) //, 0)

  }

  isPointOnLine(cx, cy, x0, y0, x1, y1, ctx, path = new Path2D()) {
    // const path = new Path2D();
    path.moveTo(x0, y0);
    path.lineTo(x1, y1);
    ctx.lineWidth = 1;
    // ctx.stroke(path);
    return ctx.isPointInStroke(path, cx, cy)
    // if (!ctx.isPointInStroke(path, cx, cy))
    //   isPOLCounter += 1
  }

  yanewcf(processedPixels, ctx) {
    let cornerPosArray = []
    let idxOfpP = 0
    // for (const edc of processedPixels) {
    let lineFinder = []

    for (let idx = 0; idx < processedPixels.length; idx += 1) {
      let edc = processedPixels[idx].pixel
      // drawPixel(ctx, edc.x, edc.y, "green", 5)
      // ctx.fillText(`${idxOfpP}`, edc.x, edc.y);
      idxOfpP += 1
      if (lineFinder.length > 1) {
        // let [cx, cy] = lineFinder.map(v => [v.x, v.y])[0]
        let yellow = lineFinder[0]
        // let [x0, y0] = lineFinder.map(v => [v.x, v.y])[1]
        let green = lineFinder[1]
        // let [x1, y1] = lineFinder.map(v => [v.x, v.y])[2]
        // let [x1, y1] = [edc.x, edc.y]
        let blue = edc

        // drawPixel(ctx, yellow.x, yellow.y, "yellow", 5)
        // drawPixel(ctx, green.x, green.y, "blue", 5)
        // drawPixel(ctx, blue.x, blue.y, "green", 5)

        // let path = new Path2D()
        // let res = this.isPointOnLine(green.x, green.y, yellow.x, yellow.y, blue.x, blue.y, ctx, path)
        // if (res) {
        //   lineFinder = [lineFinder[0], edc]
        // }
        // let isB = this.isBetween(yellow, blue, green)
        // let isB = this.is_on(yellow, blue, green)
        // if (!isB)
        //   drawPixel(ctx, blue.x, blue.y, "white", 15)
        var Dx = blue.x - yellow.x;
        var Dy = blue.y - yellow.y;
        var d = Math.abs(Dy * green.x - Dx * green.y - yellow.x * blue.y + blue.x * yellow.y) / Math.sqrt(Math.pow(Dx, 2) + Math.pow(Dy, 2));
        if (d > 0.75) {
          // if (d > 0.85 ){
          // drawPixel(ctx, blue.x, blue.y, "white", 5)
          // ctx.beginPath();
          // ctx.arc(blue.x, blue.y, 10, 0, 2 * Math.PI);
          // ctx.stroke();
          lineFinder = []
          cornerPosArray.push(processedPixels[idx])
        } else {
          lineFinder = [lineFinder[0], edc]
        }
        // if (!res) {
        //   // console.log(idxOfpP, res);
        //   // drawPixel(ctx, x1, y1, "black", 5)
        //   // drawPixel(ctx, cx, cy, "blue", 5)
        //   // drawPixel(ctx, x0, y0, "blue", 5)
        //   // let newedc = processedPixels[idx + 1].pixel
        //   // ctx.beginPath();
        //   // ctx.fillStyle = 'green';
        //   // ctx.fillStyle = "blue";
        //   // ctx.fillRect(10, 10, 100, 100);
        //   // ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
        //   // ctx.arc(blue.x, blue.y, 10, 0, 2 * Math.PI);
        //   // ctx.stroke();
        //   // ctx.beginPath();
        //   // ctx.fillStyle = 'black';
        //   // ctx.arc(newedc.x, newedc.y, 10, 0, 2 * Math.PI);
        //   // ctx.stroke();
        //   lineFinder = []
        // }

        // return
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
      // drawPixel(ctx, edc.x, edc.y, "green", 5)
      spacedPointsArray.push(processedPixels[idx])
    }
    return spacedPointsArray
  }
}