import { MyEngine } from "./engine.cls.js";
import { loadImages } from "./image.loader.js";
import { MyShapes } from "./shape.cls.js";

export function startMarioGame(oMario) {
  window.onload = async () => {

    let myImages = [
      "mario_sprite_sheet.png",
      "mario_sprite_sheet_flipped.png",
      "mario.bg.png"
    ]

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
      myShapes.startNbc(10, ctx, myShapes.shapeEdges)

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
