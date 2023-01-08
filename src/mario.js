import { MyEngine } from "./cls/engine.cls.js";
import { loadImages } from "./tools/image.loader.js";
import { fillTextMultiLine, drawPixel } from "./tools/common.fn.js";
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

      // myShapes.calculateTopBottom()

      // for (const shapes of myShapes.shapeEdges) {
      //   drawPixel(ctx, shapes.x, shapes.y, "blue", 1)
      // }


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
      myShapes.nbcV2(myShapes.shapeEdges[0], 4, canvas, ctx, data, myShapes.shapeEdges, processedPixels, nbcV2Idx)

      console.log(processedPixels, "kkkkkk");
      // myShapes.startCornerFinder(myShapes.shapeEdges, ctx)
      // myShapes.startYACF(myShapes.shapeEdges, ctx)
      // myShapes.startYANbc(26, ctx, canvas, myShapes.shapeEdges)
      var endTime = performance.now()
      // console.log(wannabeCorners)

      myShapes.yanewcf(processedPixels, ctx)
      myShapes.pixelSpacing(processedPixels, ctx)

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
