// Set up keyboard input to control Mario
export const startKeyboard = (oMario, MarioActions) => {

  // let marioSpeed = 10
  document.addEventListener("keydown", event => {
    oMario.debugCode = event.code
    if (event.code === "ArrowLeft") {
      // Left arrow key pressed
      oMario.addAction(MarioActions.runningLeft)
      oMario.xVelocity = oMario.speed * -1;
      oMario.xVelocityBeforeJump = 0
    }
    if (event.code === "ArrowRight") {
      // Right arrow key pressed
      oMario.addAction(MarioActions.runningRight)
      oMario.xVelocity = oMario.speed;
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
    if (event.code === "Home") {
      oMario.speed /= 10
    }
    if (event.code === "End") {
      oMario.speed *= 10
    }
    if (event.code === "Delete") {
      console.clear()
    }
    if (event.code === "KeyR") {
      oMario.x = 160
      oMario.y = 500
    }
  });

  document.addEventListener("keyup", event => {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      oMario.removeLeftOrRightAction(event.code === "ArrowLeft" ? MarioActions.runningLeft : MarioActions.runningRight)
    }
  });

}
