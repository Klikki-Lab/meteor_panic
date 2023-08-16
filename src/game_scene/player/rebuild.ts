import { MissileBase } from "./missileBase";

export class Rebuild extends g.Sprite {

    onRebuilded: g.Trigger<void> = new g.Trigger();

    constructor(scene: g.Scene, base: MissileBase) {
        super({
            scene: scene,
            src: scene.asset.getImageById("missile_base_rebuild"),
            x: base.x,
            y: base.y,
            anchorX: 0.5,
            anchorY: 0.5,
            opacity: 0,
        });

        const step = Math.PI / g.game.fps;
        let frames = 0;
        const updateHandler = () => {
            const sin = Math.sin(++frames * step)
            const rate = Math.min(1, sin);
            this.opacity = rate;
            this.modified();

            if (!base.visible() && sin >= 0.99) {
                this.onRebuilded.fire();
            }
            if (base.visible() && sin <= 0.01) {
                this.onUpdate.remove(updateHandler);
                this.destroy();
            }
        };
        this.onUpdate.add(updateHandler);
    }
}