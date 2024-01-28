import { MyEngine } from "./cls/engine.cls.js";
import { loadImages } from "./tools/image.loader.js";
import { MyShapes } from "./cls/shape.cls.js";
import { Shape2D } from "./cls/2Dshape.js";

import { startKeyboard } from "./tools/keyboard.js";
import { MarioActions } from "./cls/mario.cls.js";

export function startMarioGame(oMario) {
  window.onload = async () => {

    let myImages = [
      "./backgrounds/mario_sprite_sheet.png",
      // "./backgrounds/mario_sprite_sheet_orig_edited.png",
      "./backgrounds/mario_sprite_sheet_flipped.png",
      // "./backgrounds/mario.bg.moreshape.png"
      // "./backgrounds/mario.bg.bkp.v1.png"
      "./backgrounds/mario.bg.moreshape.v1.png"
    ]

    loadImages(myImages).then(async images => {
      const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d");

      ctx.canvas.width = 1600;
      ctx.canvas.height = 900;
      ctx.drawImage(images[2], 0, 0);

      // oMario.width = 113 / 2;
      // oMario.height = 113 / 2;

      // let myShapes = JSON.parse(localStorage.getItem("MyShapes"))
      // if (myShapes === null) {
      let myShapes = new MyShapes()
      await myShapes.shapeFinder(canvas, images[2].src)
      //   // localStorage.setItem("MyShapes", myShapes);
      //   localStorage.setItem("MyShapes", JSON.stringify(myShapes));
      // }

      console.log(" -> myShapes.shapeEdges -> ", myShapes, myShapes.shapeEdges);

      // let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let startTime = performance.now()
      // console.log(" -> myShapes.shapeEdges data-> ", data);

      let shape_2d = new Shape2D()
      shape_2d.setShapeAndDrawing(myShapes, {
        ctx, canvas, data: ctx.getImageData(0, 0, canvas.width, canvas.height).data
      })
      shape_2d.createShapeListFromBackground(myShapes.shapeEdges, images[2].src)
      shape_2d.drawPoints()

      let endTime = performance.now()
      console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)

      let myEngine = new MyEngine(oMario, ctx, canvas, images)
      startKeyboard(oMario, MarioActions, myEngine);

      myEngine.setShape(shape_2d)

      function gameLoopWrapper(timestamp) {
        myEngine.gameLoop(timestamp)
        requestAnimationFrame(gameLoopWrapper);
      }

      requestAnimationFrame(gameLoopWrapper);
    });

  };
}
