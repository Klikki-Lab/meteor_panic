export class DestroyedMissileBase extends g.Sprite {

    onSmoke: g.Trigger<DestroyedMissileBase> = new g.Trigger();
    private time: number = 0;

    constructor(scene: g.Scene, x: number, y: number, private _background: g.Sprite) {
        super({
            scene: scene,
            src: scene.asset.getImageById("destroyed_missile_base"),
            anchorX: 0.5,
            anchorY: 0.5,
            x: x,
            y: y,
            hidden: true,
        });
    }

    private updateHandler = () => {
        this.time += 1 / g.game.fps;
        if (this.time >= 0.5) {
            this.onSmoke.fire(this);
            this.time = 0;
        }
    };

    show = () => {
        this.time = 0;
        super.show();
        this._background.show();
        if (!this.onUpdate.contains(this.updateHandler))
            this.onUpdate.add(this.updateHandler);
    };

    hide = () => {
        super.hide();
        this._background.hide();
        if (this.onUpdate.contains(this.updateHandler))
            this.onUpdate.remove(this.updateHandler);
    };
}