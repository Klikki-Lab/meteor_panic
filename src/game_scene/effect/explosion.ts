import { Pos } from "../common/entity";

export class Explosion extends g.FrameSprite {

    constructor(scene: g.Scene, point: Pos, scale: number = 1, interval: number = 1000 / g.game.fps * 2) {
        const asset = scene.asset.getImageById("explosion");
        super({
            scene: scene,
            src: asset,
            width: asset.width / 3,
            height: asset.height,
            srcWidth: asset.width / 3,
            srcHeight: asset.height,
            anchorX: 0.5,
            anchorY: 0.5,
            x: point.x,
            y: point.y,
            scaleX: scale,
            scaleY: scale,
            angle: g.game.random.generate() * 360,
            frames: [0, 1, 2, 1, 0],
            interval: Math.floor(interval),
            loop: false,
        });

        this.start();
        this.onFinish.addOnce(() => {
            this.destroy();
        });
    }
}