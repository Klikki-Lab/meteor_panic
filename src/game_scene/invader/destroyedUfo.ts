import { UFO } from "./ufo";

export class DestroyedUFO extends g.Sprite {

    constructor(scene: g.Scene, ufo: UFO) {
        super({
            scene: scene,
            src: scene.asset.getImageById("ufo"),
            x: ufo.x,
            y: ufo.y,
            anchorX: 0.5,
            anchorY: 0.5,
            angle: 0,
        });

        const vx = this.x < g.game.width / 2 ? -1 : 1;
        let vy = -this.height / g.game.fps * 6;
        const gravity = 9.8 / (g.game.fps) * 3;
        this.onUpdate.add(() => {
            this.x += vx * (this.width / g.game.fps) * 2;
            this.y += vy;
            vy += gravity;
            this.angle += vx * (360 / g.game.fps);
            this.opacity -= (1 / g.game.fps) / 3;
            this.modified();
            if (this.y + this.height > g.game.height) {
                this.destroy();
            }
        });
    }
}