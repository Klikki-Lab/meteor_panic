export class Combo {

    static readonly MAX_COMBO = 6;
    private _count: number = 0;

    get count(): number {
        return Math.min(this._count, Combo.MAX_COMBO);
    }

    increment = () => this._count++;
}