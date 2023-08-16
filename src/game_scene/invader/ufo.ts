import { Combo } from "../combo";
import { Invader } from "./invader";

export class UFO extends Invader {

    onFire: g.Trigger<UFO> = new g.Trigger();
    onGone: g.Trigger<void> = new g.Trigger();

    private static readonly DIRECTION_LEFT = -1;
    private static readonly DIRECTION_RIGHT = 1;

    private _isRun = false;

    constructor(scene: g.Scene, random: g.RandomGenerator, waveTimes: number) {
        const asset = scene.asset.getImageById("ufo");
        super({
            scene: scene,
            src: asset,
            x: -asset.width / 2,
            y: g.game.height / 3 * random.generate() + asset.height * 1.5,
            anchorX: 0.5,
            anchorY: 0.5,
            angle: 0,
        });

        const direction = random.generate() < 0.5 ? UFO.DIRECTION_LEFT : UFO.DIRECTION_RIGHT;
        this.x = direction === UFO.DIRECTION_LEFT ? g.game.width + this.getRadius() : -this.getRadius();
        let frame = 0;
        let prevX = this.x;
        let prevY = this.y;
        const fireRate = waveTimes / 150;
        const vx = g.game.width * (1 / g.game.fps / 6) * direction;
        const cy = (g.game.height / 4) * random.generate() + this.height * 2;

        const updateHanler = () => {
            this.x += vx * (this._isRun ? 3 : 1);
            this.y = cy + Math.sin(frame++ % (g.game.fps * 10) / 8) * this.height * 1.5;
            const radian = direction === UFO.DIRECTION_LEFT ?
                Math.atan2(prevY - this.y, prevX - this.x) : Math.atan2(this.y - prevY, this.x - prevX);
            this.angle = 360 - radian * (180 / Math.PI) / 5;
            this.modified();

            prevX = this.x;
            prevY = this.y;

            if (!this._isRun && random.generate() <= fireRate) {
                this.onFire.fire(this);
            }

            if (this.x - this.getRadius() >= g.game.width || this.x < -this.getRadius()) {
                this.onGone.fire();
                this.onUpdate.remove(updateHanler);
                this.destroy();
            }
        }
        this.onUpdate.add(updateHanler);
    }

    _destroy = (combo: Combo): void => {
        this.onDestroy.fire({ invader: this, combo: combo });
    };

    deactivate = () => this._isRun = true;
}