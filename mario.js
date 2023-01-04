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
      ctx.canvas.width = 1280;
      ctx.canvas.height = 786;

      // Set up Mario
      oMario.width = 113 / 2;
      oMario.height = 113 / 2;


      // Main game loop
      // let [redShapeCorner, redShapeCornerHashMap] = await shapeFinder(ctx, canvas, images)
      let myShapes = new MyShapes()
      await myShapes.shapeFinder(ctx, canvas, images)

      // console.log(arrayMin(redShapeCorner));
      console.log(myShapes.shapeCorner);
      console.log(myShapes.shapeCorner.length);
      // console.log(redShapeCornerHashMap.length);
      // console.log(redShapeCornerHashMap[1400]);

      // console.log(new MyPixels(5, 5));
      // console.log(new MyPixels(5, 5) === new MyPixels(5, 5));
      // console.log(objDeepEqual(new MyPixels(5, 5), new MyPixels(5, 5)));
      // console.log(md5(JSON.stringify({ foo: 'bar' })));

      // const textAsBuffer = new TextEncoder().encode(JSON.stringify({ foo: 'bar' }));
      // const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer); const hashArray = Array.from(new Uint8Array(hashBuffer))
      // const digest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      // console.log(digest);

      // md5(JSON.stringify({foo: 'bar'}))
      // console.log(redShapeCorner[1500]);
      // console.log(redShapeCorner[3000]);
      // redShapeCorner.map(v => console.log(v.x))
      // redShapeCorner.filter(v => v.x === 500).map(v => console.log(v))



      // redShapeCorner.map(v => console.log(v))
      // console.log(redShapeCorner.reduce((p, c) => (p.x | 0 )+ c.x));
      // console.log(redShapeCorner.reduce((p, c) => p.x + c.x));

      myShapes.calculateTopBottom()
      // console.log(redShapeTop);

      let myEngine = new MyEngine(oMario, ctx, canvas, images)
      myEngine.setShape(myShapes)

      function gameLoopWrapper(timestamp) {
        myEngine.gameLoop(timestamp)
        requestAnimationFrame(gameLoopWrapper);

      }
      // Start the game loop
      requestAnimationFrame(gameLoopWrapper);
    });

  };
}
