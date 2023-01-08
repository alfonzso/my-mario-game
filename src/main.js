import { startKeyboard } from "./tools/keyboard.js";
import { startMarioGame } from "./mario.js";
import { Mario, MarioActions } from "./cls/mario.cls.js";

let oMario = new Mario(0, 0);

startKeyboard(oMario, MarioActions);
startMarioGame(oMario);
