import { DestroyedUFO } from "../invader/destroyedUfo";
import { Meteor } from "../invader/meteor";
import { Missile } from "../player/missile";

type Smoky = Missile | Meteor;

export class Smoke extends g.Sprite {

    constructor(scene: g.Scene, smoky: Smoky) {
        const asset = scene.asset.getImageById("smoke");
        super({
            scene: scene,
            src: asset,
            width: asset.width,
            height: asset.height,
            anchorX: 0.5,
            anchorY: 0.5,
            opacity: 1,
            x: smoky.prevX,
            y: smoky.prevY,
            scaleX: 0.75 * smoky.scaleX,
            scaleY: 0.75 * smoky.scaleY,
            angle: g.game.random.generate() * 360,
        });

        const rate = 1 / g.game.fps / 2;
        const scaleRate = rate * 0.5;
        const updateHandler = () => {
            this.scale(this.scaleX - scaleRate * smoky.scaleX);
            this.opacity = Math.max(this.opacity - rate, 0);
            this.modified();

            if (this.opacity <= 0.01) {
                this.onUpdate.remove(updateHandler);
                this.destroy();
            }
        };
        this.onUpdate.add(updateHandler);
    }
}