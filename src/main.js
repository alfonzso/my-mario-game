import { startKeyboard } from "./tools/keyboard.js";
import { startMarioGame } from "./mario.js";
import { Mario, MarioActions } from "./cls/mario.cls.js";

let oMario = new Mario(0, 0);
// let oMario = new Mario(290, 833.5);

startMarioGame(oMario);
