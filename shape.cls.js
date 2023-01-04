import { arrayMax, arrayMin, drawPixel, getHSLFromBigIndex, isPointOnLine, isRed, rgb2hsl, xyToBigIndex } from "./common.fn.js";
import { MyPixels } from "./mypixel.cls.js";


export class MyShapes {

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

    let redShapeEdges = []
    let shapeCorners = []

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
        redShapeEdges.push(shape)
      }
      if (notRedCounter > 4 || (notRedCounter > 1 && notRedCounter < 3)) {
        shapeCorners.push(shape)
      }
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

  startNbc(size = 6, ctx, cornersOfShape) {
    let wannabeCorners = []
    for (const onePixel of cornersOfShape) {
      let pixel = this.nbc(onePixel, size, ctx, cornersOfShape)
      if (pixel !== null) {
        wannabeCorners.push(pixel)
      }
    }

    let actualCorners = this.removeClosestPixelAndChooseAvgPoint(wannabeCorners)

    for (const pxl of actualCorners) {
      drawPixel(ctx, pxl.x, pxl.y, "black", 4)
    }

    console.log(actualCorners);
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

  // nbc(size = 6, canvas = null, ctx, data, cornersOfShape) {
  nbc(pixel, size = 6, ctx, cornersOfShape) {



    // let context = canvas.getContext('2d');
    // let data = context.getImageData(0, 0, canvas.width, canvas.height).data;

    // let size = 6
    let finalMatrix = []
    let nbMatrixXAxis = []
    // let nbMatrixYAxis = []
    // nbMatrixXAxis.push(0)
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


    // let redOrNotArr = []
    // for (const row of finalMatrix) {
    //   let tmpArr = []
    //   for (const xy of row) {
    //     let bigIdx = xyToBigIndex(xy.x, xy.y, canvas)
    //     let hsl = getHSLFromBigIndex(bigIdx, data)
    //     if (!isRed(...hsl)) {
    //       // tmpArr.push("R")
    //       tmpArr.push("0")
    //     } else {
    //       // tmpArr.push("*")
    //       tmpArr.push("1")
    //     }

    //   }
    //   // tmpArr.reverse()
    //   redOrNotArr.push(tmpArr)
    // }
    // // redOrNotArr.reverse()

    // redOrNotArr[size / 2][size / 2] = "X"

    // console.log("K", nbMatrixXAxis);
    // console.log("K", finalMatrix);
    // console.log("K", redOrNotArr);

    // let dbgArrStr = []
    // for (const column of redOrNotArr) {
    //   dbgArrStr.push(column.join(" "))
    // }

    let ttt = []
    for (const row of finalMatrix) {
      for (const xy of row) {
        let pxl = cornersOfShape.find(v => v.x === xy.x && v.y === xy.y)
        if (pxl !== undefined)
          ttt.push(pxl)
      }
    }

    // console.log(cornersOfShape);
    // console.log(ttt);
    let min = arrayMin(ttt);
    let max = arrayMax(ttt);
    // console.log("kek");

    // for (const idx of ttt) {

    // }


    let [x1, y1] = [min.x, min.y]
    let [x2, y2] = [max.x, max.y]

    // console.log(isPointOnLine(this.x, this.y, x1, y1, x2, y2, 1));

    // context.lineWidth = 5;
    // context.moveTo(x1, y1);
    // context.lineTo(x2, y2);
    // context.stroke();

    if (!isPointOnLine(pixel.x, pixel.y, x1, y1, x2, y2, 2)) {
      // console.log(this.x, this.y);
      //
      return pixel
    }


    return null
    // console.log(dbgArrStr.join("\n"));
    // return dbgArrStr.join("\n")


  }

}