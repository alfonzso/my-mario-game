// import Mario from "mario.cls.js"
// import { Mario } from "./mario.cls"
const mario = new Mario(0, 0);
const GRAVITY = 0.5;

window.onload = async () => {

    const spriteSheet = new Image();
    const spriteSheetReverse = new Image();
    spriteSheet.src = "mario_sprite_sheet.png";
    spriteSheetReverse.src = "mario_sprite_sheet_flipped.png";

    // await spriteSheetReverse.onload();
    // await spriteSheetReverse.decode();

    // Wait for the image to load
    spriteSheet.onload = () => {
        // Set up the canvas and context
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");

        // Set up Mario
        // const mario = new Mario(0, 0);
        mario.width = 113;
        mario.height = 113;

        // Set up the animation variables
        let frame = 0;
        const numFrames = 5;
        const frameWidth = 113;
        const frameHeight = 113;
        const frameInterval = 100; // Delay between frames, in milliseconds
        let lastFrameTime = 0; // Timestamp of the last frame

        // Main game loop
        function gameLoop(timestamp) {
            // Calculate the elapsed time since the last frame
            const elapsedTime = timestamp - lastFrameTime;

            // Update the animation frame if the interval has passed
            if (mario.xVelocity !== 0 && elapsedTime > frameInterval) {
                // if (elapsedTime > frameInterval) {
                // Increment the frame
                frame = (frame + 1) % numFrames;

                // Reset the last frame time
                lastFrameTime = timestamp;
            } else if (mario.xVelocity === 0 && elapsedTime > frameInterval) {
                // frame = 0
                frame = 1
            }

            mario.move()

            mario.yVelocity += GRAVITY;
            if (mario.y + mario.height >= canvas.height) {
                mario.y = canvas.height - mario.height;
                mario.yVelocity = 0;
            }

            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // ctx.save()
            // ctx.scale(-1, 1);

            // const spirteX = 1085 - (frame * frameWidth)
            const spirteX = (frame * frameWidth)
            console.log(spirteX)

            // Draw the current frame of the animation
            ctx.drawImage(
                spriteSheet,
                spirteX, // x position of the frame on the sprite sheet
                175, // y position of the frame on the sprite sheet
                frameWidth, // width of the frame
                frameHeight, // height of the frame
                mario.x, // x position on the canvas to draw the frame
                mario.y, // y position on the canvas to draw the frame
                mario.width, // width to draw the frame on the canvas
                mario.height // height to draw the frame on the canvas
            );

            // ctx.restore();

            // ctx.save();

            // console.log(mario.x, mario.y)
            // console.log(frame * frameWidth)

            // Request the next frame of the game loop
            requestAnimationFrame(gameLoop);
        }

        // Set up keyboard input to control Mario
        document.addEventListener("keydown", event => {
            if (event.keyCode === 37) {
                // Left arrow key pressed
                // console.log("left")
                // console.log(mario.x, mario.y)
                mario.xVelocity = -5;
            } else if (event.keyCode === 39) {
                // Right arrow key pressed
                // console.log("left")
                // console.log(mario.x, mario.y)
                mario.xVelocity = 5;
            } else if (event.keyCode === 32) {
                // Space bar pressed
                mario.jump();
            }
        });

        document.addEventListener("keyup", event => {
            if (event.keyCode === 37 || event.keyCode === 39) {
                // Left or right arrow key released
                mario.xVelocity = 0;
            }
        });

        // Start the game loop
        requestAnimationFrame(gameLoop);
    };
    // Main game loop
    // function gameLoop() {
    //     // Update game state

    //     // Move Mario
    //     mario.move();

    //     mario.yVelocity += GRAVITY;
    //     if (mario.y + mario.height >= canvas.height) {
    //         mario.y = canvas.height - mario.height;
    //         mario.yVelocity = 0;
    //     }

    //     ctx.clearRect(0, 0, canvas.width, canvas.height);

    //     // Draw Mario
    //     ctx.drawImage(marioImage, mario.x, mario.y, mario.width, mario.height);

    //     // Redraw game screen
    // }



};
