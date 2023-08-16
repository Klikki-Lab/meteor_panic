export class MissileBaseBackground extends g.Sprite {

    constructor(scene: g.Scene, x: number, y: number) {
        super({
            scene: scene,
            src: scene.asset.getImageById("destroyed_missile_base_back"),
            anchorX: 0.5,
            anchorY: 0.5,
            x: x,
            y: y,
            hidden: true,
        });
    }
}