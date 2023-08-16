import { Pos } from "../common/entity";

export class Missile extends g.Sprite {

    onFlying: g.Trigger<Missile> = new g.Trigger();
    onSmoke: g.Trigger<Missile> = new g.Trigger();
    onReachTarget: g.Trigger<Missile> = new g.Trigger();

    private _prevX: number;
    private _prevY: number;
    private _isStrike = false;

    constructor(scene: g.Scene, start: Pos, end: Pos, private _speed: number = 20) {
        const asset = scene.asset.getImageById("missile");
        const radian = Math.atan2(end.y - start.y, end.x - start.x);
        super({
            scene: scene,
            src: asset,
            width: asset.width,
            height: asset.height,
            anchorX: 0.5,
            anchorY: 0.5,
            x: start.x,
            y: start.y,
            angle: radian * (180 / Math.PI) + 90,
        });

        const combustionAsset = scene.asset.getImageById("combustion");
        const combustion = new g.FrameSprite({
            scene: scene,
            src: combustionAsset,
            srcWidth: 16,
            srcHeight: combustionAsset.height,
            width: 16,
            height: combustionAsset.height,
            anchorX: 0.5,
            anchorY: 0.5,
            x: this.width * 0.5,
            y: this.height * 1.52,
            opacity: 0.75,
            frames: [0, 1],
            interval: Math.floor((2 / 30) * 1000),
            loop: true,
        });
        this.append(combustion);
        combustion.start();

        const velocity = 30 / g.game.fps;
        const vx = Math.cos(radian) * velocity;
        const vy = Math.sin(radian) * velocity;
        this._prevX = start.x;
        this._prevY = start.y;

        this.onUpdate.add(() => {
            if (this._isStrike) return;

            for (let i = 0; i < this._speed; i++) {
                this.x += vx;
                this.y += vy;

                if (Math.abs(end.x - this.x) <= 1 && Math.abs(end.y - this.y) <= 1) {
                    this.x = end.x;
                    this.y = end.y;
                    this.onReachTarget.fire(this);
                    return;
                }
                if (Math.abs(this._prevX - this.x) + Math.abs(this._prevY - this.y) >
                    this.width + g.game.random.generate() * this.width) {
                    this.onSmoke.fire(this);
                    this._prevX = this.x;
                    this._prevY = this.y;
                }

                this.onFlying.fire(this);
                if (this._isStrike) {
                    return;
                }
            }
            this.modified();
        });
    }

    strike = () => {
        this._isStrike = true;
    };

    get isStrike() {
        return this._isStrike;
    }

    get prevX(): number {
        return this._prevX;
    }

    get prevY(): number {
        return this._prevY;
    }
}