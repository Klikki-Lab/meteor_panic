import { MissileBase } from "../player/missileBase";
import { Combo } from "../combo";
import { Pos } from "../common/entity";
import { Invader } from "./invader";

export class Meteor extends Invader {

    onFalling: g.Trigger<Meteor> = new g.Trigger();
    onSmoke: g.Trigger<Meteor> = new g.Trigger();
    onCracked: g.Trigger<Meteor> = new g.Trigger();

    static readonly MAX_CRACK_COUNT = 2;
    private _target?: MissileBase;
    private vx = 0;
    private vy = 0;
    private _prevX = 0;
    private _prevY = 0;
    private frame = 0;
    private level = 0;
    private crackRate = 0;
    private crackPeriod = 0;
    private _isStrike = false;

    constructor(
        scene: g.Scene,
        private random: g.RandomGenerator,
        start: Pos,
        target: Pos,
        private _waveTimes: number,
        private _crackCount: number = Meteor.MAX_CRACK_COUNT) {

        const asset = scene.asset.getImageById("meteor");
        const radian = Math.atan2(target.y - start.y, target.x - start.x);
        const scale = Math.pow(0.75, Meteor.MAX_CRACK_COUNT - _crackCount);

        super({
            scene: scene,
            src: asset,
            anchorX: 0.5,
            anchorY: 0.5,
            width: asset.width,
            height: asset.height,
            x: start.x,
            y: start.y - asset.height / 2,
            scaleX: scale,
            scaleY: scale,
            angle: radian * (180 / Math.PI) + 90,
        });

        if (target instanceof MissileBase) {
            this._target = target;
        }
        this.level = Math.floor(_waveTimes / 3) + 3;
        this.crackRate = _waveTimes / 300;
        this.crackPeriod = Math.floor(g.game.fps / 2 * random.generate());

        const velocity = 30 / g.game.fps;
        this.vx = Math.cos(radian) * velocity;
        this.vy = Math.sin(radian) * velocity;
        this._prevX = Math.floor(start.x);
        this._prevY = Math.floor(start.y);

        const heatAsset = scene.asset.getImageById("heat");
        const assetW = Math.floor(heatAsset.width / 3);
        const heat = new g.FrameSprite({
            scene: scene,
            src: heatAsset,
            width: assetW,
            height: heatAsset.height,
            srcWidth: assetW,
            srcHeight: heatAsset.height,
            anchorX: 0.5,
            anchorY: 0.3,
            x: this.width / 2,
            y: this.height / 2,
            opacity: 0.5,
            interval: 1000 / g.game.fps,
            frames: [0, 1, 2],
            loop: true,
        });
        this.append(heat);
        heat.start();

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = () => {
        if (this._isStrike) return;

        this.frame++;
        if (this._crackCount > 0 && g.game.height * 0.1 < this.y && g.game.height * 0.6 > this.y) {
            if (this.frame >= this.crackPeriod) {
                this.crackPeriod = Math.floor(g.game.fps / 2 * this.random.generate());
                this.frame = 0;
                if (this.random.generate() < this.crackRate) {
                    this._crackCount--;
                    this.onCracked.fire(this);
                }
            }
        }

        const smokeW = this.width * 0.5;
        for (let i = 0; i < this.level; i++) {
            this.x += this.vx;
            this.y += this.vy;

            if (Math.abs(this._prevX - this.x) + Math.abs(this._prevY - this.y) >
                smokeW + this.random.generate() * smokeW * 0.5 * this.level) {
                this._prevX = this.x;
                this._prevY = this.y;
                this.onSmoke.fire(this);
            }
            this.onFalling.fire(this);
            if (this._isStrike) {
                break;
            }
        }
        this.modified();
    };

    _destroy = (combo: Combo): void => {
        this.deactivate();
        this.onDestroy.fire({ invader: this, combo });
    };

    deactivate = () => {
        this._isStrike = true;
    }

    get waveTimes(): number {
        return this._waveTimes;
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

    get crackCount(): number {
        return this._crackCount;
    }
}