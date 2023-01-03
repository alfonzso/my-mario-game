let oMario = new Mario(0, 0);
let GRAVITY = 1;


function startMarioGame() {
  window.onload = async () => {

    myImages = [
      "mario_sprite_sheet.png",
      "mario_sprite_sheet_flipped.png",
      "mario.bg.png"
    ]

    loadImages(myImages).then(images => {
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
      let redShapeCorner = shapeFinder(ctx, canvas, images)

      function isOnShape(oMario, redShapeCorner) {
        for (const redShape of redShapeCorner) {
          // console.log(oMario.y + oMario.height === redShape.y, oMario.y + oMario.height, redShape.y)
          // if (oMario.x === redShape.x) {
          // if (frame % 4 === 0 && oMario.y + oMario.height > redShape.y - 3 && oMario.y + oMario.height < redShape.y + 3)
          //   console.log(oMario.x === redShape.x, oMario.x, redShape.x)
          //     // console.log("kekekekek", Math.trunc(oMario.y - oMario.height) === redShape.y, Math.trunc(oMario.y - oMario.height), redShape.y)
          //     console.log("kekekekek", Math.trunc(oMario.y) === redShape.y, Math.trunc(oMario.y), redShape.y)
          //   // if (Math.trunc(oMario.y) === redShape.y)
          //   //   console.log("lelele")
          // }

          // if (oMario.y + oMario.height === redShape.y && oMario.x === redShape.x) {
          if (oMario.y + oMario.height > redShape.y - 3 && oMario.y + oMario.height < redShape.y + 3 && Math.trunc(oMario.x + (oMario.width / 2)) === redShape.x) {
            // console.log("m there")
            return redShape
          }
        }
        return false
      }

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

        if (oMario.yVelocity < 0 || oMario.yVelocity > 0) {
          if (oMario.xVelocityBeforeJump === 0) {
            oMario.xVelocityBeforeJump = oMario.xVelocity
          }
          oMario.xVelocity = oMario.xVelocityBeforeJump
        }

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

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // debugMessage = JSON.stringify({
        debugMessage = `
          code: ${oMario.debugCode}
          GRAVITY: ${prec(GRAVITY)}
          Frame: ${frame}
          Mario X: ${prec(oMario.x)}
          Mario Y: ${prec(oMario.y)}
          Action: ${oMario.action.join(', ')}
          DeltaV: X ${prec(oMario.xVelocity)} Y ${prec(oMario.yVelocity)} Yb ${prec(oMario.xVelocityBeforeJump)}
        `
        // ctx.fillText(debugMessage, 10, 50);
        ctx.drawImage(images[2], 0, 0);

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
          oMario.addAction(MarioActions.runningLeft)
          oMario.xVelocity = -10;
        }
        if (event.code === "ArrowRight") {
          // Right arrow key pressed
          oMario.addAction(MarioActions.runningRight)
          oMario.xVelocity = 10;
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
        if (event.code === "ArrowLeft") {
          // Left or right arrow key released
          oMario.removeLeftOrRightAction(MarioActions.runningLeft)
          oMario.xVelocity = 0;
        }
        if (event.code === "ArrowRight") {
          // Left or right arrow key released
          oMario.removeLeftOrRightAction(MarioActions.runningRight)
          oMario.xVelocity = 0;
        }
      });

      // Start the game loop
      requestAnimationFrame(gameLoop);
    });

  };
}
