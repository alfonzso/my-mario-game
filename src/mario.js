import { MyEngine } from "./cls/engine.cls.js";
import { loadImages } from "./tools/image.loader.js";
import { MyShapes } from "./cls/shape.cls.js";
import { Shape2D } from "./cls/2Dshape.js";

export function startMarioGame(oMario) {
  window.onload = async () => {

    let myImages = [
      "./backgrounds/mario_sprite_sheet.png",
      "./backgrounds/mario_sprite_sheet_flipped.png",
      "./backgrounds/mario.bg.moreshape.png"
    ]

    loadImages(myImages).then(async images => {
      const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d");

      ctx.canvas.width = 1600;
      ctx.canvas.height = 900;

      oMario.width = 113 / 2;
      oMario.height = 113 / 2;

      let myShapes = new MyShapes()
      await myShapes.shapeFinder(ctx, canvas, images[2])

      console.log(myShapes.shapeEdges);

      let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      var startTime = performance.now()

      let shape_2d = new Shape2D()
      shape_2d.setShapeAndDrawing(myShapes, { ctx, canvas, data })
      shape_2d.createShapeListFromBackground(myShapes.shapeEdges)
      shape_2d.drawPoints()

      var endTime = performance.now()
      console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)

      let myEngine = new MyEngine(oMario, ctx, canvas, images)
      myEngine.setShape(shape_2d)

      function gameLoopWrapper(timestamp) {
        myEngine.gameLoop(timestamp)
        requestAnimationFrame(gameLoopWrapper);

      }

      requestAnimationFrame(gameLoopWrapper);
    });

  };
}
