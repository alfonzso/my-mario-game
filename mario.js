let oMario = new Mario(0, 0);
let GRAVITY = 0.5;

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

function startMarioGame() {
  window.onload = async () => {

    myImages = [
      "mario_sprite_sheet.png",
      "mario_sprite_sheet_flipped.png"
    ]

    loadImages(myImages).then(images => {
      const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d");
      ctx.canvas.width = 1300;
      ctx.canvas.height = 600;

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
        if (oMario.y + oMario.height >= canvas.height) {

          if (oMario.isJumping()) {
            oMario.xVelocityBeforeJump = 0
            if (!(oMario.isRunningLeft() || oMario.isRunningRight())) {
              oMario.xVelocity = 0
            }
            oMario.removeJumpAction()
          }
          oMario.yVelocity = 0;
          oMario.y = canvas.height - oMario.height;
        }

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // debugMessage = JSON.stringify({
        debugMessage = `
        code: ${oMario.debugCode}
        GRAVITY: ${GRAVITY}
        Frame: ${frame}
        Mario X: ${oMario.x}
        Mario Y: ${oMario.y}
        Action: ${oMario.action.join(', ')}
        DeltaV: X ${oMario.xVelocity} Y ${oMario.yVelocity} Yb ${oMario.xVelocityBeforeJump}
      `
        // ctx.fillText(debugMessage, 10, 50);
        fillTextMultiLine(ctx, debugMessage, 10, 50)

        spriteSheet = oMario.xVelocity < 0 ? images[1] : images[0]

        ctx.drawImage(
          spriteSheet,
          choseSpriteImage(spriteSheet, frame, frameWidth), // x position of the frame on the sprite sheet
          175, // y position of the frame on the sprite sheet
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
          oMario.xVelocity = -5;
        }
        if (event.code === "ArrowRight") {
          // Right arrow key pressed
          oMario.addAction(MarioActions.runningRight)
          oMario.xVelocity = 5;
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
