import { Combo } from "../combo";
import { Pos } from "../common/entity";
import { ShockWave } from "./shockWave";

export class PlayerShockWave extends ShockWave {

    constructor(scene: g.Scene, point: Pos, existsBackground: boolean, isStrike: boolean, power: number, combo: Combo) {
        super(scene, scene.asset.getImageById("shock_wave_player"), point, isStrike, power, existsBackground, combo);
    }
}