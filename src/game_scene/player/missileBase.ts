import { Launchable } from "./launchable";

export class MissileBase extends g.E {

    onRebuild: g.Trigger<MissileBase> = new g.Trigger();
    onDestroyed: g.Trigger<MissileBase> = new g.Trigger();

    private gunTurret: g.Sprite;
    private _isActive = true;

    constructor(scene: g.Scene, x: number, y: number, private _launchable: Launchable) {
        const asset = scene.asset.getImageById("missile_base");
        super({
            scene: scene,
            anchorX: 0.5,
            anchorY: 0.5,
            x: x,
            y: y,
            width: asset.width,
            height: asset.height,
        });

        const base = new g.Sprite({
            scene: scene,
            src: asset,
            anchorX: 0.5,
            anchorY: 0.5,
            x: this.width * 0.5,
            y: this.height * 0.5,
        });

        this.gunTurret = new g.Sprite({
            scene: scene,
            src: scene.asset.getImageById("gun_turret"),
            anchorX: 0.5,
            anchorY: 0.5,
        })
        this.append(this.gunTurret);
        this.append(base);

        const initAngle = 180;
        this.modifiedGunAngle(initAngle * (Math.PI / 180));
    }

    private modifiedGunAngle = (radian: number) => {
        const degree = radian * 180 / Math.PI;
        this.gunTurret.angle = 180 - degree;
        this.gunTurret.x = this.width * 0.5 + this.width * 0.6 * Math.sin(radian);
        this.gunTurret.y = this.height * 0.5 + this.height * 0.6 * Math.cos(radian);
        this.gunTurret.modified();
    }

    /**
     * ミサイルを発射する。
     * @param point 標的座標
     * @param isUnlimited 弾数無制限フラグ
     * @returns ミサイルが発射されたら true、そうでなければ false
     */
    fire = (point: g.CommonOffset, isUnlimited?: boolean): boolean => {
        const radian = Math.atan2(point.x - this.x, point.y - this.y);
        this.modifiedGunAngle(radian);
        if (!this._launchable.fire(isUnlimited)) return false;

        this.scaleX = 1.3;
        this.scaleY = 0.7;
        const updateHandler = () => {
            this.scaleX -= 0.1;
            this.scaleY += 0.1;
            if (this.scaleX <= 1 || this.scaleY >= 1) {
                this.scale(1.0);
                this.onUpdate.remove(updateHandler);
            }
            this.modified();
        }
        this.onUpdate.add(updateHandler);

        const rate = 0.8;
        const sin = Math.sin(radian);
        const cos = Math.cos(radian);
        let rx = 0.6 * rate;
        let ry = 0.6 * rate;
        const gunUpdateHandler = () => {
            if (rx < 0.35) {
                this.modifiedGunAngle(radian);
                this.gunTurret.onUpdate.remove(gunUpdateHandler);
                return;
            }
            this.gunTurret.x = this.width * 0.5 + this.width * rx * sin;
            this.gunTurret.y = this.height * 0.5 + this.height * ry * cos;
            this.gunTurret.modified();
            rx *= rate
            ry *= rate;
        };
        this.gunTurret.onUpdate.add(gunUpdateHandler);
        return true;
    };

    rebuild = (): void => {
        this._isActive = true;
        this._launchable.enable();
        this.onRebuild.fire(this);
    };

    getRemainingCount = (): number => this._launchable.getRemainingCount();

    reload = (addCount: number): number => this._launchable.reload(addCount);

    isFull = () => this._launchable.isFull();

    isEmptyMissile = () => this._launchable.isEmpty();

    isActive = (): boolean => this._isActive;

    deactivate = (): void => { this._isActive = false; }

    disableLauncher = (): void => this._launchable.disable();

    getRadius = () => this.width * 0.5;
}