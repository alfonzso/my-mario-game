import { MarioActions } from "./mario.cls.js";
// Set up keyboard input to control Mario
export const startKeyboard = (oMario) => {

  document.addEventListener("keydown", event => {
    oMario.debugCode = event.code
    if (event.code === "ArrowLeft") {
      // Left arrow key pressed
      oMario.addAction(MarioActions.runningLeft)
      oMario.xVelocity = -10;
      oMario.xVelocityBeforeJump = 0
    }
    if (event.code === "ArrowRight") {
      // Right arrow key pressed
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
    }
  });

}
