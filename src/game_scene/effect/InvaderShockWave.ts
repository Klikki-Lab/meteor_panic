import { Combo } from "../combo";
import { Pos } from "../common/entity";
import { ShockWave } from "./shockWave";

export class InvaderShockWave extends ShockWave {

    constructor(scene: g.Scene, point: Pos, existsBackground: boolean, combo?: Combo, speed?: number) {
        super(scene, scene.asset.getImageById("shock_wave_invader"), point, false, 1, existsBackground, combo, speed);
    }
}