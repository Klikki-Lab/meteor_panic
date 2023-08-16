import { Combo } from "../combo";
import { Pos } from "../common/entity";

export abstract class ShockWave extends g.Sprite {

    onSpread: g.Trigger<ShockWave> = new g.Trigger();

    constructor(scene: g.Scene, asset: g.ImageAsset, point: Pos, isStrike: boolean, power: number = 1, private _combo?: Combo, speed: number = 2) {
        super({
            scene: scene,
            src: asset,
            width: asset.width,
            height: asset.height,
            x: point.x,
            y: point.y,
            anchorX: 0.5,
            anchorY: 0.5,
            scaleX: 0,
            scaleY: 0,
            compositeOperation: "xor"
        });

        const _power = power * (isStrike ? 1.5 : 1);
        const step = Math.PI / g.game.fps / speed;
        let frame = 0;
        this.onUpdate.add(() => {
            this.x = point.x + (g.game.random.generate() * 2 - 1) * _power * 2;
            this.y = point.y + (g.game.random.generate() * 2 - 1) * _power * 2;

            const rate = Math.sin(++frame * step) * 1.01;
            const scele = Math.min(1, rate) * _power;
            this.scale(scele);
            this.onSpread.fire(this);

            if (scele <= 0) {
                this.x = point.x;
                this.y = point.y;
                this.scale(0);
                this.destroy();
            }
            this.modified();
        });
    }

    get combo(): Combo {
        return this._combo;
    }
}