// import Mario from "mario.cls.js"
// import { Mario } from "./mario.cls"
const mario = new Mario(0, 0);
const GRAVITY = 0.5;

window.onload = () => {

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Other code goes here
    const marioImage = new Image();
    const spriteSheet = new Image();

    marioImage.src = "mario.png";
    spriteSheet.src = "mario_sprite_sheet.png";
    // spriteSheet.crossOrigin = `Anonymous`;


    marioImage.onload = () => {
        ctx.drawImage(marioImage, mario.x, mario.y, mario.width, mario.height);
    };

    // Wait for the image to load
    spriteSheet.onload = () => {
        // Create an image data object for the sprite sheet
        const spriteSheetData = ctx.createImageData(spriteSheet.width, spriteSheet.height);

        // Copy the pixel data from the sprite sheet into the image data object
        spriteSheetData.data.set(new Uint8ClampedArray(ctx.getImageData(0, 0, spriteSheet.width, spriteSheet.height, spriteSheet).data));
    };

    // Create a new instance of Mario and start the game loop
    // const mario = new Mario(0, 0);
    setInterval(gameLoop, 1000 / 60); // 60 FPS

    // Main game loop
    function gameLoop() {
        // Update game state

        // Move Mario
        mario.move();

        mario.yVelocity += GRAVITY;
        if (mario.y + mario.height >= canvas.height) {
            mario.y = canvas.height - mario.height;
            mario.yVelocity = 0;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Mario
        ctx.drawImage(marioImage, mario.x, mario.y, mario.width, mario.height);

        // Redraw game screen
    }

    // Set up keyboard input to control Mario
    document.addEventListener("keydown", event => {
        if (event.keyCode === 37) {
            // Left arrow key pressed
            mario.xVelocity = -5;
        } else if (event.keyCode === 39) {
            // Right arrow key pressed
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

};
