import { MyEngine } from "./cls/engine.cls.js";
import { loadImages } from "./tools/image.loader.js";
import { fillTextMultiLine } from "./tools/common.fn.js";
import { MyShapes } from "./cls/shape.cls.js";

export function startMarioGame(oMario) {
  window.onload = async () => {

    let myImages = [
      "./backgrounds/mario_sprite_sheet.png",
      "./backgrounds/mario_sprite_sheet_flipped.png",
      "./backgrounds/mario.bg.moreshape.png"
    ]
    // "./backgrounds/mario.bg.png"

    loadImages(myImages).then(async images => {
      const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d");
      // ctx.canvas.width = 1280;
      // ctx.canvas.height = 786;
      ctx.canvas.width = 1600;
      ctx.canvas.height = 900;

      // Set up Mario
      oMario.width = 113 / 2;
      oMario.height = 113 / 2;

      // Main game loop
      let myShapes = new MyShapes()
      await myShapes.shapeFinder(ctx, canvas, images[2])

      console.log(myShapes.shapeEdges);
      console.log(myShapes.shapeEdges.length);

      myShapes.calculateTopBottom()


      // myShapes.debugThis = myShapes.shapeEdges[0].nbc(10, canvas, myShapes.shapeEdges)
      // myShapes.shapeEdges[10].nbc(10, canvas, myShapes.shapeEdges)

      console.log(myShapes.shapeEdges.length);
      // let ctx = canvas.getContext('2d');
      // let data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      // myShapes.shapeEdges.map(v => v.nbc(10, canvas, ctx, data, myShapes.shapeEdges))
      // myShapes.shapeEdges.map(v => v.nbc(10, ctx, myShapes.shapeEdges))
      // let xx = myShapes.shapeEdges[0].x
      // let yy = myShapes.shapeEdges[0].y

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
      //     ...myShapes.shapeEdges.filter(
      //       v => (v.x <= Math.trunc(x) + tolerance && v.x >= Math.trunc(x) - tolerance) && (v.y <= Math.trunc(y) + tolerance && v.y >= Math.trunc(y) - tolerance)
      //     )
      //   )
      //   // edgesFromCircle.push(...myShapes.shapeEdges.filter(v => v.y === y))
      //   drawPixel(ctx, x, y, "black", 1)
      // }
      // console.log(xx, yy, edgesFromCircle);
      // let min = edgesFromCircle.reduce((p, v) => p.x < v.x ? p : v)
      // let max = edgesFromCircle.reduce((p, v) => p.x > v.x ? p : v)

      // let isPOL = isPointOnLine(xx, yy, min.x, min.y, max.x, max.y, 1)

      // console.log(min, max, isPOL);
      // for (const edc of [min, max]) {
      //   drawPixel(ctx, edc.x, edc.y, "green", 2)
      // }

      // myShapes.startNbc(6, ctx, myShapes.shapeEdges)

      // let context = canvas.getContext('2d');


      // let wannabeCorners = []

      let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      var startTime = performance.now()
      // for (const edges of myShapes.shapeEdges) {
      //   let ppp = myShapes.nbc(edges, 26, canvas, ctx, data, myShapes.shapeEdges)
      //   if (ppp)
      //     wannabeCorners.push(edges)
      // }
      let debugThis = myShapes.nbc(myShapes.shapeEdges[0], 30, canvas, ctx, data, myShapes.shapeEdges)
      let debugThis1 = myShapes.nbc(myShapes.shapeEdges[24], 2, canvas, ctx, data, myShapes.shapeEdges)
      let debugThis2 = myShapes.nbc(myShapes.shapeEdges[26], 2, canvas, ctx, data, myShapes.shapeEdges)

      let processedPixels = []
      let nbcV2Idx = 0
      myShapes.nbcV2(myShapes.shapeEdges[1500], 4, canvas, ctx, data, myShapes.shapeEdges, processedPixels, nbcV2Idx)

      console.log(processedPixels, "kkkkkk");
      // myShapes.startCornerFinder(myShapes.shapeEdges, ctx)
      // myShapes.startYACF(myShapes.shapeEdges, ctx)
      // myShapes.startYANbc(26, ctx, canvas, myShapes.shapeEdges)
      var endTime = performance.now()
      // console.log(wannabeCorners)

      let idxOfpP = 0
      // for (const edc of processedPixels) {
      let lineFinder = []

      for (let idx = 0; idx < processedPixels.length; idx += 3) {
        let edc = processedPixels[idx]
        // drawPixel(ctx, edc.x, edc.y, "green", 5)
        // ctx.fillText(`${idxOfpP}`, edc.x, edc.y);
        idxOfpP += 1
        if (lineFinder.length > 1) {
          let [cx, cy] = lineFinder.map(v => [v.x, v.y])[0]
          let [x0, y0] = lineFinder.map(v => [v.x, v.y])[1]
          // let [x1, y1] = lineFinder.map(v => [v.x, v.y])[2]
          let [x1, y1] = [edc.x, edc.y]

          // drawPixel(ctx, cx, cy, "yellow", 1)
          // drawPixel(ctx, x1, y1, "blue", 1)

          // drawPixel(ctx, x0, y0, "green", 1)

          let path = new Path2D()
          let res = myShapes.isPointOnLine(x0, y0, cx, cy, x1, y1, ctx, path)
          if (res) {
            lineFinder = [lineFinder[0], edc]
          }
          if (!res) {
            console.log(idxOfpP, res);
            // drawPixel(ctx, x1, y1, "black", 5)
            // drawPixel(ctx, cx, cy, "blue", 5)
            // drawPixel(ctx, x0, y0, "blue", 5)
            ctx.beginPath();
            ctx.arc(x1, y1, 10, 0, 2 * Math.PI);
            ctx.stroke();
            lineFinder = []
          }

          // return
        } else {
          lineFinder.push(edc)
        }
      }
      fillTextMultiLine(ctx, debugThis, 1000, 50)
      fillTextMultiLine(ctx, debugThis1, 800, 500)
      fillTextMultiLine(ctx, debugThis2, 850, 550)


      console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)

      let myEngine = new MyEngine(oMario, ctx, canvas, images)
      myEngine.setShape(myShapes)




      // const canvas = document.querySelector("canvas");
      // const ctx = canvas.getContext("2d");
      // ctx.lineWidth = 5;
      // let x1, y1, y2 = 0
      // x1 = y1 = y2 = 20
      // let x2 = 100
      // ctx.moveTo(20, 20);
      // ctx.lineTo(100, 20);
      // ctx.stroke();
      // console.log(isPointOnLine(20, 20, x1, y1, x2, y2, 5));
      // console.log(isPointOnLine(100, 20, x1, y1, x2, y2, 5));
      // console.log(isPointOnLine(100, 100, x1, y1, x2, y2, 5));
      // console.log(isPointOnLine(60, 20, x1, y1, x2, y2, 5));
      // console.log(isPointOnLine(100, 21, x1, y1, x2, y2, 5));

      function gameLoopWrapper(timestamp) {
        myEngine.gameLoop(timestamp)
        requestAnimationFrame(gameLoopWrapper);

      }
      // Start the game loop
      // requestAnimationFrame(gameLoopWrapper);
    });

  };
}
