
function arrayMin(arr) {
  return arr.reduce(function (p, v) {
    return (p.x < v.x || p.y < v.y ? p : v);
  });
}

function arrayMax(arr) {
  return arr.reduce(function (p, v) {
    return (p.x > v.x || p.y > v.y ? p : v);
  });
}

function choseSpriteImage(spriteSheet, frame, frameWidth, oMario) {
  let result = 0
  const spirteX = oMario.xVelocity < 0 ? (spriteSheet.width - frameWidth) - (frame * frameWidth) : (frame * frameWidth)
  // if (oMario.isRunningLeft() || oMario.isRunningRight() || oMario.isDoNothing()) {
  if (oMario.isRunningLeft() || oMario.isRunningRight()) {
    result = spirteX
  }
  if (oMario.isJumping() || oMario.isGoingDown()) {
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

function drawPixel(context, x, y, color, size = 1) {
  var roundedX = Math.round(x);
  var roundedY = Math.round(y);
  context.fillStyle = color || '#000';
  context.fillRect(roundedX, roundedY, size, size);
}

async function objHash(text) {
  const textAsBuffer = new TextEncoder().encode(JSON.stringify(text));
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer); const hashArray = Array.from(new Uint8Array(hashBuffer))
  const digest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return digest
}

function isPointOnLine(px, py, x1, y1, x2, y2, width) {
  return distancePointFromLine(px, py, x1, y1, x2, y2, width) <= width / 2
}

function distancePointFromLine(x0, y0, x1, y1, x2, y2) {
  return Math.abs((x2 - x1) * (y1 - y0) - (x1 - x0) * (y2 - y1)) / Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

export {
  arrayMin,
  arrayMax,
  isPointOnLine,
  distancePointFromLine,
  drawPixel,
  prec,
  isRed,
  rgb2hsl,
  xyToBigIndex,
  getHSLFromBigIndex,
  fillTextMultiLine,
  choseSpriteImage
}