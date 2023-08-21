import { Collider } from "../common/collider";
import { Pos } from "../common/entity";
import { Invader } from "../invader/invader";
import { MissileBase } from "./missileBase";
import { MissileLauncher } from "./missileLauncher";

interface Props {
    readonly base: MissileBase;
    readonly duration: number;
}

export class Player {

    static readonly BASE_NUMBER = 3;
    private static readonly UPGRADE_RATE = 2;
    private static readonly MAX_POWER = 2;
    private static readonly MAX_VELOCITY = 30;

    onNextWaveRebuild: g.Trigger<MissileBase> = new g.Trigger();
    onReload: g.Trigger<Props> = new g.Trigger();
    onFinishReload: g.Trigger<number> = new g.Trigger();
    onExplodeBase: g.Trigger<MissileBase> = new g.Trigger();

    private _power = 1;
    private _speed = 20;
    private isReloading = false;

    constructor(private _missileBases: MissileBase[]) {
    }

    fire = (point: g.CommonOffset, isUnlimited?: boolean): Pos | undefined => {
        const touched = this.findTouchedBases(point);
        if (!touched && touched.length !== 1) return undefined;

        const base = this.findClosestAvailableBase(point.x, touched[0]);
        if (!base) return undefined;

        base.fire(point, isUnlimited);
        return base;
    };

    private findTouchedBases = (point: g.CommonOffset): MissileBase[] =>
        this.getAvailableBases().filter(base => {
            const x = base.x - point.x;
            const y = base.y - point.y;
            const r = base.getRadius();
            if (x * x + y * y <= r * r) return base;
        });

    upgrade = (): void => {
        this._power = Math.min(this._power + (Player.UPGRADE_RATE * 0.1), Player.MAX_POWER);
        this._speed = Math.min(this._speed + Player.UPGRADE_RATE, Player.MAX_VELOCITY);
    };

    rebuild = (): boolean => {
        let isRebuild = false;
        this._missileBases.forEach(base => {
            if (!base.isActive()) {
                base.rebuild();
                isRebuild = true;
            }
        });
        return isRebuild;
    };

    isCollide = (invader: Invader): boolean => {
        const bases = this.getActiveBases().filter(base => Collider.within(base, invader, 0.5, 0.25));
        const isCollide = bases?.length === 1;
        if (isCollide) {
            bases[0].deactivate();
            this.onExplodeBase.fire(bases[0]);
        }
        return isCollide;
    }

    getActiveBasesCount = (): number => this.getActiveBases().length;

    /**
     * @returns 行動可能な全ての基地を取得する。
     */
    private getActiveBases = (): MissileBase[] => this._missileBases.filter(base => base.isActive());

    /**
     * @returns ミサイル発射可能な全ての基地を取得する。
     */
    private getAvailableBases = (): MissileBase[] => this._missileBases.filter(base => base.isActive() && !base.isEmptyMissile());

    /**
     * 
     * @param duration 
     * @param reloadCount 
     */
    reload = (duration: number, reloadCount: number = MissileLauncher.MAX_COUNT): void => {
        this.isReloading = true;
        let delay = 0;
        this.getActiveBases().forEach(base => {
            const count = Math.min(MissileLauncher.MAX_COUNT - base.getRemainingCount(), reloadCount);
            for (let i = 0; i < count; i++) {
                this.onReload.fire({ base: base, duration: duration * delay++ });
            }
        });
        this.onFinishReload.fire(duration * delay);
        this.isReloading = false;
    };

    reloadAll = (): void => {
        if (this.isReloading) return;
        this.getActiveBases().forEach(base => base.reload(MissileLauncher.MAX_COUNT));
    };

    getAvailableRemainingMissilesCount = (): number => {
        const initialValue = 0;
        return this.getAvailableBases()
            .map(base => base.getRemainingCount())
            .reduce((prev, current) => prev + current, initialValue);
    }

    private findClosestAvailableBase = (targetX: number, excludeTarget: MissileBase): MissileBase | undefined => {
        const bases = this.getAvailableBases().filter(base => base !== excludeTarget);

        let baseIndex = -1;
        let minX = g.game.width;
        bases.forEach((base, index) => {
            if (Math.abs(base.x - targetX) < minX) {
                minX = Math.abs(base.x - targetX);
                baseIndex = index;
            }
        });
        return baseIndex === -1 ? undefined : bases[baseIndex];
    };

    /**
     * すべての基地からランダムにひとつを選び出す。
     * @param excludeTarget 除外する基地
     * @returns 選び出した基地
     */
    pickBaseRandomly = (random: g.RandomGenerator, excludeTarget?: MissileBase): MissileBase => {
        if (excludeTarget) {
            const excluded = this._missileBases.filter(base => base !== excludeTarget);
            return excluded[Math.floor(random.generate() * excluded.length)];
        }
        return this._missileBases[Math.floor(random.generate() * this._missileBases.length)];
    };

    isDestroyedAll = (): boolean => this.getActiveBases().length === 0;

    getMissileBaseHeight = (): number => this._missileBases[0].height;

    get power(): number {
        return this._power;
    };

    get speed(): number {
        return this._speed;
    };
}