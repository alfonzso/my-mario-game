// import Mario from "mario.cls.js"
// import { Mario } from "./mario.cls"
const mario = new Mario(0, 0);
const GRAVITY = 0.5;

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
        mario.width = 113;
        mario.height = 113;

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
            if (mario.xVelocity !== 0 && elapsedTime > frameInterval) {
                // Increment the frame
                frame = (frame + 1) % numFrames;
                // Reset the last frame time
                lastFrameTime = timestamp;
            } else if (mario.xVelocity === 0 && elapsedTime > frameInterval) {
                frame = 0
            }

            mario.move()

            mario.yVelocity += GRAVITY;
            if (mario.y + mario.height >= canvas.height) {
                mario.y = canvas.height - mario.height;
                mario.yVelocity = 0;
                mario.doing = Doing.nothing
            }

            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillText(frame, 10, 50);

            // ctx.save()
            // ctx.scale(-1, 1);
            spriteSheet = mario.xVelocity < 0 ? images[1] : images[0]

            // const spirteX = 1085 - (frame * frameWidth)
            // const spirteX = mario.xVelocity < 0 ? 1085 - (frame * frameWidth) : (frame * frameWidth)
            // console.log(mario.xVelocity)
            // console.log(spriteSheet.width - frameWidth)

            ctx.fillText(mario.doing, 10, 60);

            function choseSpriteImage(mario, spriteSheet, frame, frameWidth) {
                const spirteX = mario.xVelocity < 0 ? (spriteSheet.width - frameWidth) - (frame * frameWidth) : (frame * frameWidth)
                if (mario.doing === Doing.moving || mario.doing === Doing.nothing) {
                    return spirteX
                } else if (mario.doing === Doing.jumping) {
                    return 465
                }
            }

            ctx.drawImage(
                spriteSheet,
                choseSpriteImage(mario, spriteSheet, frame, frameWidth), // x position of the frame on the sprite sheet
                175, // y position of the frame on the sprite sheet
                frameWidth, // width of the frame
                frameHeight, // height of the frame
                mario.x, // x position on the canvas to draw the frame
                mario.y, // y position on the canvas to draw the frame
                mario.width, // width to draw the frame on the canvas
                mario.height // height to draw the frame on the canvas
            );

            // // Draw the current frame of the animation
            // if (mario.doing === Doing.moving || mario.doing === Doing.nothing) {
            //     ctx.drawImage(
            //         spriteSheet,
            //         spirteX, // x position of the frame on the sprite sheet
            //         175, // y position of the frame on the sprite sheet
            //         frameWidth, // width of the frame
            //         frameHeight, // height of the frame
            //         mario.x, // x position on the canvas to draw the frame
            //         mario.y, // y position on the canvas to draw the frame
            //         mario.width, // width to draw the frame on the canvas
            //         mario.height // height to draw the frame on the canvas
            //     );
            // } else if (mario.doing === Doing.jumping) {
            //     ctx.drawImage(
            //         spriteSheet,
            //         465, // x position of the frame on the sprite sheet
            //         175, // y position of the frame on the sprite sheet
            //         frameWidth, // width of the frame
            //         frameHeight, // height of the frame
            //         mario.x, // x position on the canvas to draw the frame
            //         mario.y, // y position on the canvas to draw the frame
            //         mario.width, // width to draw the frame on the canvas
            //         mario.height // height to draw the frame on the canvas
            //     );
            // }

            // ctx.restore();

            // ctx.save();

            // console.log(mario.x, mario.y)
            // console.log(frame * frameWidth)

            // Request the next frame of the game loop
            requestAnimationFrame(gameLoop);
        }

        // Set up keyboard input to control Mario
        document.addEventListener("keydown", event => {
            if (event.code === "ArrowLeft") {
                // Left arrow key pressed
                mario.xVelocity = -5;
                mario.doing = Doing.moving
            } else if (event.code === "ArrowRight") {
                // Right arrow key pressed
                mario.xVelocity = 5;
                mario.doing = Doing.moving
            } else if (event.code === "Space") {
                // Space bar pressed
                mario.jump();
                mario.doing = Doing.jumping
            }
        });

        document.addEventListener("keyup", event => {
            if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
                // Left or right arrow key released
                mario.xVelocity = 0;
                mario.doing = Doing.nothing
            }
        });

        // Start the game loop
        requestAnimationFrame(gameLoop);
    });
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
