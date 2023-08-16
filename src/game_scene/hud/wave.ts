import { FontSize } from "../../common/fontSize";

export class Wave extends g.Label {

    private static readonly WAVE = "WAVE";

    constructor(scene: g.Scene, font: g.BitmapFont, private _times: number = 0) {
        super({
            scene: scene,
            font: font,
            text: `${Wave.WAVE} 0`,
            anchorX: 0.5,
            anchorY: 0.5,
            fontSize: FontSize.SMALL,
            x: font.defaultGlyphWidth * 7,
            y: FontSize.SMALL * 1.5,
        });
    }

    get times(): number {
        return this._times;
    }

    next = () => {
        this.text = `${Wave.WAVE} ${++this._times}`;
        this.invalidate();
    }
}