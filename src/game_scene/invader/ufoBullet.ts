import { MissileBase } from "../player/missileBase";
import { Combo } from "../combo";
import { Pos } from "../common/entity";
import { Invader } from "./invader";

export class UFOBullet extends Invader {

    onFalling: g.Trigger<UFOBullet> = new g.Trigger();

    private _target?: MissileBase;
    private vx = 0;
    private vy = 0;
    private _prevX = 0;
    private _prevY = 0;
    private frame = 0;
    private level = 0;
    private _isStrike = false;

    constructor(scene: g.Scene, start: Pos, target: Pos, _waveTimes: number) {
        const asset = scene.asset.getImageById("ufo_bullet");
        const radian = Math.atan2(target.y - start.y, target.x - start.x);
        super({
            scene: scene,
            src: asset,
            anchorX: 0.5,
            anchorY: 0.5,
            width: asset.width,
            height: asset.height,
            x: start.x,
            y: start.y - asset.height / 2,
            scaleX: 2,
            scaleY: 2,
            angle: radian * (180 / Math.PI) + 90,
        });

        if (target instanceof MissileBase) {
            this._target = target;
        }
        this.level = Math.floor(_waveTimes / 5) + 2;

        const velocity = 30 / g.game.fps;
        this.vx = Math.cos(radian) * velocity;
        this.vy = Math.sin(radian) * velocity;
        this._prevX = Math.floor(start.x);
        this._prevY = Math.floor(start.y);

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = () => {
        for (let i = 0; i < this.level; i++) {
            this.x += this.vx;
            this.y += this.vy;
            this.onFalling.fire(this);
            if (this._isStrike) {
                break;
            }
        }
        this.angle += this.level * 10;
        this.modified();
    };

    _destroy = (combo: Combo): void => {
        this.deactivate();
        this.onDestroy.fire({ invader: this, combo });
    };

    deactivate = () => {
        this._isStrike = true;
        this.onUpdate?.remove(this.updateHandler);
    }

    get prevX(): number {
        return this._prevX;
    }

    get prevY(): number {
        return this._prevY;
    }

    get targetBase(): MissileBase {
        return this._target;
    }
}