let oMario = new Mario(0, 0);
let GRAVITY = 1;


function startMarioGame() {
  window.onload = async () => {

    myImages = [
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

      // Set up the animation variables
      let frame = 0;
      const numFrames = 4;
      const frameWidth = 113;
      const frameHeight = 113;
      const frameInterval = 100; // Delay between frames, in milliseconds
      let lastFrameTime = 0; // Timestamp of the last frame

      // Main game loop
      // let [redShapeCorner, redShapeCornerHashMap] = await shapeFinder(ctx, canvas, images)
      let redShapeCorner = await shapeFinder(ctx, canvas, images)

      // console.log(arrayMin(redShapeCorner));
      console.log(redShapeCorner);
      console.log(redShapeCorner.length);
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

      function isYAxisNearShape(oMario, redShape, interval) {
        return oMario.y + oMario.height >= redShape.y - interval && oMario.y + oMario.height <= redShape.y + interval
      }
      function isXAxisNearShape(oMario, redShape) {
        return Math.trunc(oMario.x + (oMario.width / 2)) === redShape.x
      }

      function isOnShape(oMario, redShapeCorner) {

        for (const redShape of redShapeCorner) {
          // fillTextMultiLine(ctx, `
          //   oMario.y: ${oMario.y + oMario.height}
          //   rSy: ${redShape.y}
          // `, 1000, 50)
          // if (frame % 4 === 0 && Math.trunc(oMario.x + (oMario.width / 2)) === redShape.x)
          //   console.log(oMario.y + oMario.height, redShape.y);
          if (isYAxisNearShape(oMario, redShape, 3) && isXAxisNearShape(oMario, redShape)) {
            // console.log("kekkkkkk");
            return redShape
          }
        }
        return false
      }


      // redShapeCorner.map(v => console.log(v))
      // console.log(redShapeCorner.reduce((p, c) => (p.x | 0 )+ c.x));
      // console.log(redShapeCorner.reduce((p, c) => p.x + c.x));

      redShapeXAvg = redShapeCorner.map(v => v.x).reduce((p, c) => p + c) / redShapeCorner.length
      redShapeYAvg = redShapeCorner.map(v => v.y).reduce((p, c) => p + c) / redShapeCorner.length

      redShapeMin = redShapeCorner.filter(v => v.y < redShapeYAvg)
      console.log(redShapeMin);

      function gameLoop(timestamp) {
        // Calculate the elapsed time since the last frame
        const elapsedTime = timestamp - lastFrameTime;

        // Update the animation frame if the interval has passed
        if (oMario.xVelocity !== 0 && elapsedTime > frameInterval) {
          // Increment the frame
          frame = (frame + 1) % numFrames;
          // Reset the last frame time
          lastFrameTime = timestamp;
        } else if (oMario.xVelocity === 0 && elapsedTime > frameInterval) {
          frame = 0
        }

        oMario.move()

        // if (frame % 4 === 0)
        //   console.log(oMario.isDoNothing())

        if (oMario.isDoNothing()) {
          oMario.xVelocity = 0
          // console.log("nope");
        }

        if (oMario.yVelocity < 0 || oMario.yVelocity > 0) {
          if (oMario.xVelocityBeforeJump === 0) {
            oMario.xVelocityBeforeJump = oMario.xVelocity
          }
          oMario.xVelocity = oMario.xVelocityBeforeJump
        }

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[2], 0, 0);

        redShapeMin.map(shape => drawPixel(context, shape.x, shape.y, "black"))

        oMario.yVelocity += GRAVITY;
        let onShape = isOnShape(oMario, redShapeCorner)
        if (oMario.y + oMario.height >= canvas.height || onShape !== false) {
          // if (oMario.y + oMario.height >= canvas.height) {

          if (oMario.isJumping()) {
            oMario.xVelocityBeforeJump = 0
            if (!(oMario.isRunningLeft() || oMario.isRunningRight())) {
              oMario.xVelocity = 0
            }
            oMario.removeJumpAction()
          }
          oMario.yVelocity = 0;
          oMario.y = (onShape !== false ? onShape.y : canvas.height) - oMario.height;
        }

        // debugMessage = JSON.stringify({
        marioActions = oMario.action.length > 0 ? oMario.action.join(', ') : "DoNothing"
        debugMessage = `
          redShapeXAvg: ${redShapeCorner.map(v => v.x).reduce((p, c) => p + c) / redShapeCorner.length}
          redShapeYAvg: ${redShapeCorner.map(v => v.y).reduce((p, c) => p + c) / redShapeCorner.length}
          code: ${oMario.debugCode}
          GRAVITY: ${prec(GRAVITY)}
          Frame: ${frame}
          Mario X: ${prec(oMario.x)}
          Mario Y: ${prec(oMario.y)}
          Action: ${marioActions}
          xVelocityBeforeJump: ${oMario.xVelocityBeforeJump}
          DeltaV: X ${prec(oMario.xVelocity)} Y ${prec(oMario.yVelocity)} Yb ${prec(oMario.xVelocityBeforeJump)}
        `
        // ctx.fillText(debugMessage, 10, 50);


        fillTextMultiLine(ctx, debugMessage, 10, 50)

        spriteSheet = oMario.xVelocity < 0 ? images[1] : images[0]

        ctx.drawImage(
          spriteSheet,
          choseSpriteImage(spriteSheet, frame, frameWidth), // x position of the frame on the sprite sheet
          165, // y position of the frame on the sprite sheet
          frameWidth, // width of the frame
          frameHeight, // height of the frame
          oMario.x, // x position on the canvas to draw the frame
          oMario.y, // y position on the canvas to draw the frame
          oMario.width, // width to draw the frame on the canvas
          oMario.height // height to draw the frame on the canvas
        );


        // Request the next frame of the game loop
        requestAnimationFrame(gameLoop);
      }

      // Set up keyboard input to control Mario
      document.addEventListener("keydown", event => {
        oMario.debugCode = event.code
        if (event.code === "ArrowLeft") {
          // Left arrow key pressed
          oMario.removeLeftOrRightAction(MarioActions.runningRight)
          oMario.addAction(MarioActions.runningLeft)
          oMario.xVelocity = -10;
          oMario.xVelocityBeforeJump = 0
        }
        if (event.code === "ArrowRight") {
          // Right arrow key pressed
          oMario.removeLeftOrRightAction(MarioActions.runningLeft)
          oMario.addAction(MarioActions.runningRight)
          oMario.xVelocity = 10;
          oMario.xVelocityBeforeJump = 0
        }
        if (event.code === "Space") {
          // Space bar pressed
          oMario.jump();
          oMario.addAction(MarioActions.jumping)
        }
        if (event.code === "PageUp") {
          GRAVITY += 0.05
        }
        if (event.code === "PageDown") {
          GRAVITY -= 0.05
        }
      });

      document.addEventListener("keyup", event => {
        if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
          oMario.removeLeftOrRightAction(event.code === "ArrowLeft" ? MarioActions.runningLeft : MarioActions.runningRight)
          // oMario.xVelocity = 0;
        }
        // if (event.code === "ArrowLeft") {
        //   // Left or right arrow key released
        //   // oMario.removeLeftOrRightAction(MarioActions.runningLeft)
        //   oMario.xVelocity = 0;
        // }
        // if (event.code === "ArrowRight") {
        //   // Left or right arrow key released
        //   // oMario.removeLeftOrRightAction(MarioActions.runningRight)
        //   oMario.xVelocity = 0;
        // }
      });

      // Start the game loop
      requestAnimationFrame(gameLoop);
    });

  };
}
