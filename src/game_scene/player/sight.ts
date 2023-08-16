export class Sight extends g.Sprite {

    constructor(scene: g.Scene, point: g.CommonOffset) {
        const asset = scene.asset.getImageById("sight");
        super({
            scene: scene,
            src: asset,
            width: asset.width,
            height: asset.height,
            x: point.x,
            y: point.y,
            anchorX: 0.5,
            anchorY: 0.5,
            opacity: 0.75,
        });

        let time = 0;
        const framePerMillis = 1 / g.game.fps;
        const threshold = 1 / 30;
        this.onUpdate.add(() => {
            if (time >= threshold) {
                time = 0;
                this.opacity = 1 - this.opacity;
                this.modified();
            } else {
                time += framePerMillis;
            }
        });
    }
}