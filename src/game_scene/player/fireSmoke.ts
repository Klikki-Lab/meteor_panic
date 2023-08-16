export class FireSmoke extends g.Sprite {

    constructor(scene: g.Scene, x: number, y: number) {
        super({
            scene: scene,
            src: scene.asset.getImageById("smoke"),
            anchorX: 0.5,
            anchorY: 0.5,
            opacity: 0.5,
            x: x,
            y: y,
            scaleX: 0,
            scaleY: 0,
            angle: g.game.random.generate() * 360,
        });

        const velocity = 1 / g.game.fps;
        this.onUpdate.add(() => {
            this.scaleX += velocity;
            this.scaleY += velocity;
            this.opacity -= velocity * 0.1;
            if (g.game.random.generate() > 0.5) {
                this.x += velocity * (g.game.random.generate() * 2 - 1) * this.width;
            }
            this.y -= velocity * this.height * 0.5;
            this.modified();
            if (this.opacity <= 0) {
                this.destroy();
            }
        });
    }
}