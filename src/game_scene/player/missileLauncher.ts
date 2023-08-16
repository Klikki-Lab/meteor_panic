import { Launchable } from "./launchable";

const Anim = {
    ENABLE: 0,
    EMPTY: 1,
    DISABLE: 2,
};

export class MissileLauncher extends g.E implements Launchable {

    static readonly MAX_COUNT = 10;

    private _sprites: g.FrameSprite[] = [];
    private _remainingCount = 10;

    constructor(scene: g.Scene, baseAsset: g.ImageAsset, bx: number, by: number) {
        super({ scene: scene });

        const x = bx - baseAsset.width / 2;
        const y = by + baseAsset.height / 3;
        const asset = scene.asset.getImageById("remaining_missile");
        const srcWidth = 18;
        const margin = (x + (4 % 5) * srcWidth * 1.25 - x + (0 % 5) * srcWidth * 1.25 - baseAsset.width) / 2;
        for (let i = 0; i < MissileLauncher.MAX_COUNT; i++) {
            const sprite = new g.FrameSprite({
                scene: scene,
                src: asset,
                srcWidth: srcWidth,
                srcHeight: asset.height,
                width: srcWidth,
                height: asset.height,
                anchorX: 0.5,
                anchorY: 0.5,
                x: x + (i % 5) * srcWidth * 1.25 - margin,
                y: y + Math.floor(i / 5) * asset.height * 1.5,
                frames: [Anim.ENABLE, Anim.EMPTY, Anim.DISABLE],
                frameNumber: 0,
                loop: false,
            });
            this._sprites.push(sprite);
            this.append(sprite);
        }
    }

    fire = (isUnlimited: boolean = false): boolean => {
        if (isUnlimited) return true;

        this._remainingCount = Math.max(--this._remainingCount, 0);
        for (let i = MissileLauncher.MAX_COUNT - 1; i >= 0; i--) {
            if (this._sprites[i].frameNumber === Anim.ENABLE) {
                this._sprites[i].frameNumber = Anim.EMPTY;
                this._sprites[i].modified();
                return true;
            }
        }
        return false;
    };

    reload = (addCount: number): number => {
        const prevCount = this._remainingCount;
        this._remainingCount = Math.min(this._remainingCount + addCount, MissileLauncher.MAX_COUNT);
        let count = 0;
        for (let i = prevCount; i < prevCount + addCount && i < MissileLauncher.MAX_COUNT; i++) {
            if (this._sprites[i].frameNumber === Anim.EMPTY) {
                this._sprites[i].frameNumber = Anim.ENABLE;
                this._sprites[i].modified();
                count++;
            }
        }
        return count;
    }

    enable = () => {
        this._sprites.forEach(spr => {
            if (spr.frameNumber === Anim.DISABLE) {
                spr.frameNumber = Anim.ENABLE;
                spr.modified();
            }
        });
    };

    disable = (): void => {
        this._sprites.forEach(spr => {
            if (spr.frameNumber === Anim.ENABLE) {
                spr.frameNumber = Anim.DISABLE;
                spr.modified();
            }
        });
    };

    getRemainingCount = (): number => this._remainingCount;

    isFull = (): boolean => this._remainingCount === MissileLauncher.MAX_COUNT;

    isEmpty = (): boolean => this._remainingCount === 0;
}