
class Mario {
    x = 0;
    y = 0;
    width = 32 * 2;
    height = 32 * 2;
    xVelocity = 0;
    yVelocity = 0;

    // Constructor to set up the initial state of Mario
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // Method to move Mario based on his velocity
    move() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;
    }

    // Method to handle Mario's jumping behavior
    jump() {
        if (this.yVelocity === 0) {
            this.yVelocity = -10;
        }
    }
}
