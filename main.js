import { startKeyboard } from "./keyboard.js";
import { startMarioGame } from "./mario.js";
import { Mario } from "./mario.cls.js";

let oMario = new Mario(0, 0);

startKeyboard(oMario);
startMarioGame(oMario);
