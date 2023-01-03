
function arrayMin(arr) {
  return arr.reduce(function (p, v) {
    return (p.y < v.y ? p : v);
  });
}

function arrayMax(arr) {
  return arr.reduce(function (p, v) {
    return (p > v ? p : v);
  });
}

function choseSpriteImage(spriteSheet, frame, frameWidth) {
  result = 0
  const spirteX = oMario.xVelocity < 0 ? (spriteSheet.width - frameWidth) - (frame * frameWidth) : (frame * frameWidth)
  if (oMario.isRunningLeft() || oMario.isRunningRight() || oMario.isDoNothing()) {
    result = spirteX
  }
  if (oMario.isJumping()) {
    result = oMario.xVelocity < 0 ? 635 : 465
  }
  // console.log(result)
  return result
}

function fillTextMultiLine(ctx, text, x, y) {
  var lineHeight = ctx.measureText("M").width * 1.2;
  var lines = text.split("\n");
  for (var i = 0; i < lines.length; ++i) {
    ctx.fillText(lines[i], x, y);
    y += lineHeight;
  }
}

function prec(x) {
  return x.toPrecision(4);
}

// function rgb2hsl(r, g, b) {
//   let v = Math.max(r, g, b), c = v - Math.min(r, g, b), f = (1 - Math.abs(v + v - c - 1));
//   let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c));
//   return [60 * (h < 0 ? h + 6 : h), f ? c / f : 0, (v + v - c) / 2];
// }

const rgb2hsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
    : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
};

function isRed(h, s, l) {
  if (h > 350)
    if (s >= 40)
      if (l < 70 && l > 30)
        return true
  return false
}

function xyToBigIndex(x, y, canvas) {
  return (x * 4) + (canvas.width * y * 4)
}

function getHSLFromBigIndex(bigIdx, data) {
  return rgb2hsl(data[bigIdx], data[bigIdx + 1], data[bigIdx + 2])
}

function objDeepEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

function objIncludes(arr, itemMayIncludes) {
  for (const item of arr) {
    if (objDeepEqual(item, itemMayIncludes)) {
      return true
    }
  }
  return false
}

// function point(x, y, canvas) {
//   canvas.beginPath();
//   canvas.moveTo(x, y);
//   canvas.lineTo(x + 1, y + 1);
//   canvas.stroke();
// }

function drawPixel(context, x, y, color) {
  var roundedX = Math.round(x);
  var roundedY = Math.round(y);
  context.fillStyle = color || '#000';
  context.fillRect(roundedX, roundedY, 5, 5);
}

// onceLog = true

async function shapeFinder(ctx, canvas, images) {
  ctx.drawImage(images[2], 0, 0);

  context = canvas.getContext('2d');
  var data = context.getImageData(0, 0, canvas.width, canvas.height).data;

  // let x = 5
  // let y = 5

  // var view = new DataView(data.data.buffer);
  // var num = view.getUint32(4 * (x + y * canvas.width));
  // let i = 2816000
  // let i = 2819920
  // let iHole = (Math.trunc(i / 4 / canvas.width) * 4) - i
  // let y = Math.trunc(i / 4 / canvas.width)
  // let x = (i - (y * 4 * canvas.width)) / 4

  // const r = data[i];
  // const g = data[i + 1];
  // const b = data[i + 2];
  // console.log(r, g, b);
  // hsl = rgb2hsl(r, g, b)
  // console.log(...hsl)
  // console.log(isRed(...hsl), x, y)

  redShape = []

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // const alpha = data[i + 3];

    if (isRed(...rgb2hsl(r, g, b))) {
      let y = Math.trunc(i / 4 / canvas.width)
      let x = (i - (y * 4 * canvas.width)) / 4
      redPixel = new MyPixels(x, y)
      // await redPixel.genHash()
      // if (onceLog)
      //   console.log("kek   ", redPixel)
      // onceLog = false
      redShape.push(redPixel)
      // console.log("")
      // console.log("Pixel at " + x + "," + y + " is white");
    }

    // if (rgb2hsl(r, g, b)) {
    //   console.log("Pixel at " + x + "," + y + " is white");
    // }

    // console.log(r, g, b)
  }
  let redShapeCorner = []
  // let redShapeCornerHashMap = []

  // leftRedShape = redShape.filter(v => v.x === 495)
  console.log("---->", redShape[0], redShape.length);
  // console.log("---->---->", leftRedShape);

  // for (const shape of leftRedShape) {
  //   drawPixel(context, shape.x, shape.y, "green")
  // }

  for (const shape of redShape) {
    shape.neightbourCalculator()
    // console.log(redShape[0], redShape[0].neightb,);

    // for (const row of redShape[0].neightb) {
    let notRedCounter = 0
    for (const row of shape.neightb) {
      for (const xy of row) {
        //     // console.log(xy);
        bigIdx = xyToBigIndex(xy.x, xy.y, canvas)
        hsl = getHSLFromBigIndex(bigIdx, data)
        //     // console.log(hsl);
        if (!isRed(...hsl)) {
          notRedCounter += 1
          //       console.log(xy)
          // drawPixel(context, xy.x, xy.y, "black")
          // if (!objIncludes(redShapeCorner, xy))
          // xyHash = await objHash(xy)

          // if (redShapeCorner.filter(v => v.hash === xy.hash).length === 0) {
          //   // if (!redShapeCornerHashMap.includes(xyHash)) {
          //   // redShapeCornerHashMap.push(xyHash)
          //   redShapeCorner.push(xy)
          // }
        }
      }
    }
    if (notRedCounter >= 3) {
      redShapeCorner.push(shape)
      // drawPixel(context, shape.x, shape.y, "black")
    }
  }

  // console.log(redShapeCorner)
  // return [redShapeCorner, redShapeCornerHashMap]
  return redShapeCorner


  // console.log(data.data)
  // console.log(view)
  // console.log(num)
  // var pixel = context.getImageData(0, 0, 1, 1)
  // for (let y = 0; y < ctx.canvas.height; y++) {
  //   for (let x = 0; x < ctx.canvas.width; x++) {
  //     var pixel = context.getImageData(0, 0, 1, 1).data
  //   }
  // }
  // console.log(pixel)

}

async function objHash(text) {
  const textAsBuffer = new TextEncoder().encode(JSON.stringify(text));
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer); const hashArray = Array.from(new Uint8Array(hashBuffer))
  const digest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  // console.log(digest);
  return digest
}