// import Mario from "mario.cls.js"
// import { Mario } from "./mario.cls"
let oMario = new Mario(0, 0);
const GRAVITY = 0.5;

function choseSpriteImage(spriteSheet, frame, frameWidth) {
    result = 0
    const spirteX = oMario.xVelocity < 0 ? (spriteSheet.width - frameWidth) - (frame * frameWidth) : (frame * frameWidth)
    if (oMario.isRunningLeft() || oMario.isRunningRight() || oMario.isDoNothing()) {
        result = spirteX
    }
    if (oMario.isJumping()) {
        result = oMario.xVelocity < 0 ? 635 : 465
    }
    console.log(result)
    return result
}

window.onload = async () => {

    // const spriteSheet = new Image();
    // const spriteSheetReverse = new Image();
    myImages = [
        "mario_sprite_sheet.png",
        "mario_sprite_sheet_flipped.png"
    ]
    // spriteSheet.src = "mario_sprite_sheet.png";
    // spriteSheetReverse.src = "mario_sprite_sheet_flipped.png";

    // await spriteSheetReverse.onload();
    // await spriteSheetReverse.decode();

    // Wait for the image to load
    // spriteSheet.onload = () => {
    loadImages(myImages).then(images => {
        // the loaded images are in the images array
        // })
        // Set up the canvas and context
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        // ctx.height = 1024
        // ctx.width = 768
        ctx.canvas.width = 1300;
        ctx.canvas.height = 600;

        // Set up Mario
        // const mario = new Mario(0, 0);
        oMario.width = 113;
        oMario.height = 113;

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

            oMario.yVelocity += GRAVITY;
            if (oMario.y + oMario.height >= canvas.height) {
                oMario.y = canvas.height - oMario.height;
                oMario.yVelocity = 0;
                oMario.removeJumpAction()
            }

            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillText(frame, 10, 50);

            spriteSheet = oMario.xVelocity < 0 ? images[1] : images[0]

            ctx.fillText(oMario.action.join(', '), 10, 60);

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
