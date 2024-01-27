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
    console.log(" -> myShapes.createShapeListFromBackground -> ");

    let __shape2DList = JSON.parse(localStorage.getItem("shape2DList"))
    if (__shape2DList !== null && __shape2DList.length > 0) {
      console.log("FROM CHACHE: shape2DList")
      this.shape2DList = __shape2DList
      return
    }

    let r = ShapeEdgesArray
    let processedPixels = []
    let nbcV2Idx = 0
    let rLen = -1

    // for (let index = 0; index < 4; index++) {
    while (r.length > 10) {
      this.shape.nbcV2(r[0], 4, this.drawing.canvas, this.drawing.ctx, this.drawing.data, r, processedPixels, nbcV2Idx)
      let cornerArray = this.shape.yanewcf(processedPixels, this.drawing.ctx)
      let spacedPoints = this.shape.pixelSpacing(processedPixels, this.drawing.ctx)
      this.shape2DList.push(new Shape2D().setCornerArrayAndSpacedPoints(cornerArray, spacedPoints))

      r = r.filter(v => processedPixels.find(vv => vv.pixel.id === v.id) === undefined)
      processedPixels = []
      nbcV2Idx = 0
      console.log(" -> myShapes.createShapeListFromBackground -> r: ", r);
      if (r.length === rLen) {
        // happens when more than 3 color near shapes/platforms,
        // maybe isRed function is not okay or dunno
        console.log("noooooooooooo");
        // debugger;
      }
      rLen = r.length
    }
    localStorage.setItem("shape2DList", JSON.stringify(this.shape2DList));
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
    let L2 = (((line2.x - line1.x) * (line2.x - line1.x)) + ((line2.y - line1.y) * (line2.y - line1.y)));
    if (L2 == 0) return false;
    let r = (((pnt.x - line1.x) * (line2.x - line1.x)) + ((pnt.y - line1.y) * (line2.y - line1.y))) / L2;

    //Assume line thickness is circular
    if (r < 0) {
      //Outside line1
      return (Math.sqrt(((line1.x - pnt.x) * (line1.x - pnt.x)) + ((line1.y - pnt.y) * (line1.y - pnt.y))) <= lineThickness);
    } else if ((0 <= r) && (r <= 1)) {
      //On the line segment
      let s = (((line1.y - pnt.y) * (line2.x - line1.x)) - ((line1.x - pnt.x) * (line2.y - line1.y))) / L2;
      return (Math.abs(s) * Math.sqrt(L2) <= lineThickness);
    } else {
      //Outside line2
      return (Math.sqrt(((line2.x - pnt.x) * (line2.x - pnt.x)) + ((line2.y - pnt.y) * (line2.y - pnt.y))) <= lineThickness);
    }
  }

  calculateTopBottom() {
    let redShapeXAvg = this.allPixelArray.map(v => v.pixel.x).reduce((p, c) => p + c, 0) / this.allPixelArray.length
    let redShapeYAvg = this.allPixelArray.map(v => v.pixel.y).reduce((p, c) => p + c, 0) / this.allPixelArray.length

    this.shapeTop = this.allPixelArray.filter(v => v.pixel.y < redShapeYAvg)
    this.shapeBottom = this.allPixelArray.filter(v => v.pixel.y > redShapeYAvg)

    this.shapeLeft = this.allPixelArray.filter(v => v.pixel.x < redShapeXAvg)
    this.shapeRight = this.allPixelArray.filter(v => v.pixel.y > redShapeXAvg)
  }



  // findLineCircleIntersections(cx, cy, radius, point1, point2) {
  //   let dx, dy, A, B, C, det, t;
  //   dx = point2.x - point1.x;
  //   dy = point2.y - point1.y;

  //   A = dx * dx + dy * dy;
  //   B = 2 * (dx * (point1.x - cx) + dy * (point1.y - cy));
  //   C = (point1.x - cx) * (point1.x - cx) +
  //     (point1.y - cy) * (point1.y - cy) -
  //     radius * radius;

  //   det = B * B - 4 * A * C;
  //   if (A <= 0.0000001 || det < 0) {
  //     console.log("Outside")
  //   } else {
  //     console.log("Intersect")
  //   }
  // }

  // isCircleTouchingLine(circleCenterX, circleCenterY, circleRadius, pointA, pointB) {
  //   // Calculate the vector AB and AC
  //   let vectorAB = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
  //   let vectorAC = { x: circleCenterX - pointA.x, y: circleCenterY - pointA.y };

  //   // Calculate the dot product of AB and AC
  //   let dotProduct = vectorAB.x * vectorAC.x + vectorAB.y * vectorAC.y;

  //   // Calculate the normalized distance from A to the closest point on the line AB
  //   let distance = dotProduct / (vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y);

  //   // Calculate the closest point on the line AB
  //   let closestPoint = {
  //     x: pointA.x + distance * vectorAB.x,
  //     y: pointA.y + distance * vectorAB.y
  //   };

  //   // Calculate the distance between the closest point and the circle center
  //   let distanceToCircleCenter = Math.sqrt(
  //     (circleCenterX - closestPoint.x) ** 2 + (circleCenterY - closestPoint.y) ** 2
  //   );

  //   // Check if the distance is equal to the circle radius (touching)
  //   const dist = Math.abs(distanceToCircleCenter - circleRadius)
  //   if (dist < 1) {
  //     console.log("fafafaf -> ", dist)
  //   }
  //   return dist <= 0.000001; // Adjust epsilon for floating-point comparison
  // }

  // checkCollision(a, b, c, x, y, radius) {
  //   let dist = (Math.abs(a * x + b * y + c)) /
  //     Math.sqrt(a * a + b * b);

  //   if (radius == dist)
  //     document.write("Touch");
  //   else if (radius > dist)
  //     document.write("Intersect");
  //   else
  //     document.write("Outside");
  // }

  isLineInsideOrNearCircle(circleCenterX, circleCenterY, circleRadius, pointA, pointB) {
    // Calculate the vector AB and AC
    let vectorAB = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
    let vectorAC = { x: circleCenterX - pointA.x, y: circleCenterY - pointA.y };

    // Calculate the dot product of AB and AC
    let dotProduct = Math.abs(vectorAB.x * vectorAC.x + vectorAB.y * vectorAC.y)

    // Calculate the normalized distance from A to the closest point on the line AB
    let distance = dotProduct / Math.sqrt(vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y);

    // Calculate the closest point on the line AB
    let closestPoint = {
      x: pointA.x + distance * vectorAB.x,
      y: pointA.y + distance * vectorAB.y
    };

    // if ((distance - circleRadius) < 0) {
    //   console.log(distance - circleRadius, distance, circleRadius)
    // }

    // // Calculate the distance between the closest point and the circle center
    // let distanceToCircleCenter = Math.sqrt(
    //   (circleCenterX - closestPoint.x) ** 2 + (circleCenterY - closestPoint.y) ** 2
    // );

    // // Check if the distance is less than or equal to the circle radius
    // return distanceToCircleCenter <= circleRadius;
    return true
  }

  inteceptCircleLineSeg(ctx, x0, y0, x1, y1, cx, cy, cr) {
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
    if (isNaN(d)) { // no intercept
      return false
    }
    u1 = (b - d) / c;
    u2 = (b + d) / c;
    // if (cr > d) {
    // ctx.beginPath();
    // // ctx.strokeStyle = 'red';
    // ctx.strokeStyle = "#"+((1<<24)*Math.random()|0).toString(16);
    // ctx.moveTo(x0, x1);
    // ctx.lineTo(y0, y1);
    // ctx.fillText(d, 50, 50)
    // ctx.fillText(`${u1} -- ${u1 <= 1 && u1 >= 0}`, 200, 60)
    // ctx.fillText(`${u2} -- ${u2 <= 1 && u2 >= 0}`, 200, 80)
    // ctx.stroke();
    // }
    return true
  }


  calcShapePointsAndMarioDistance(oMario, orientation, resultTrue, resultFalse) {
    for (const shape2D of this.shape2DList) {
      let topOrBottom = shape2D[orientation]
      for (let index = 0; index < topOrBottom.length; index += 1) {
        if (index + 1 > topOrBottom.length - 1)
          break

        let begining = topOrBottom[index].pixel
        let ending = topOrBottom[index + 1].pixel
        let avgX = (begining.x + ending.x) / 2
        let avgY = (begining.y + ending.y) / 2
        let fakePixel = { x: avgX, y: avgY }

        drawPixel(this.drawing.ctx, begining.x, begining.y, "white", 5)
        drawPixel(this.drawing.ctx, ending.x, ending.y, "blue", 5)
        drawPixel(this.drawing.ctx, avgX, avgY, "black", 5)

        let fixMario = { x: Math.trunc(oMario.x + (oMario.width / 2)), y: oMario.y + oMario.height }
        // let fixMario = { x: Math.trunc(oMario.x + (oMario.width / 2)), y: Math.trunc(oMario.y + (oMario.height * 2)) }
        drawPixel(this.drawing.ctx, fixMario.x, fixMario.y, "purple", 10)

        // this.findLineCircleIntersections(
        //   oMario.x + (oMario.width / 2),
        //   oMario.y + (oMario.height / 2),
        //   32,
        //   begining,
        //   ending
        // )

        // const colRes = this.isCircleTouchingLine(
        // const colRes = this.isLineInsideOrNearCircle(
        // const colRes = this.inteceptCircleLineSeg(
        //   this.drawing.ctx,
        //   begining.x,
        //   ending.x,
        //   begining.y,
        //   ending.y,
        //   oMario.x + (oMario.width / 2),
        //   oMario.y + (oMario.height / 2),
        //   36,
        // )

        // if (colRes) {
        //   console.log("----------> colres: ", colRes)
        // }

        this.drawing.ctx.beginPath();
        this.drawing.ctx.arc(
          oMario.x + (oMario.width / 2),
          oMario.y + (oMario.height / 2),
          36,
          0, 2 * Math.PI);
        this.drawing.ctx.stroke();

        // this.drawing.ctx.beginPath();
        // this.drawing.ctx.rect(oMario.x , oMario.y, 64, 64);
        // this.drawing.ctx.stroke();

        // Array(64).fill(0).forEach((_, idx) => {
        //   drawPixel(this.drawing.ctx, oMario.x + idx, oMario.y, "purple", 1)
        //   drawPixel(this.drawing.ctx, oMario.x + idx, oMario.y + oMario.height, "purple", 1)
        // })

        // Array(64).fill(0).forEach((_, idx) => {
        //   drawPixel(this.drawing.ctx, oMario.x, oMario.y + idx, "purple", 1)
        //   drawPixel(this.drawing.ctx, oMario.x + idx, oMario.y+ idx, "purple", 1)
        //   drawPixel(this.drawing.ctx, oMario.x + 64, oMario.y+ idx, "purple", 1)
        // })

        const lineThickness = 10
        if (
          this.calcIsInsideThickLineSegment(begining, ending, fixMario, lineThickness)
          ||
          this.calcIsInsideThickLineSegment(fakePixel, ending, fixMario, lineThickness)
          ||
          this.calcIsInsideThickLineSegment(begining, fakePixel, fixMario, lineThickness)
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