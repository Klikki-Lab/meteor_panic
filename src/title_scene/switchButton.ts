import { FontSize } from "../common/fontSize";

export interface SwitchLabel {
    readonly ON: string;
    readonly OFF: string;
}

export class SwitchButton extends g.E {

    private _on = true;

    constructor(scene: g.Scene, font: g.BitmapFont, switchLabel: SwitchLabel, fontSize: number = FontSize.TINY) {
        super({ scene: scene });

        const label = new g.Label({
            scene: scene,
            font: font,
            text: switchLabel.ON,
            anchorX: 0.5,
            anchorY: 0.5,
            fontSize: fontSize,
        });
        const colors = ["orange", "grey"];
        const maxLength = Math.max(switchLabel.ON.length, switchLabel.OFF.length);
        const maxWidth = maxLength * label.fontSize;

        const rect = new g.FilledRect({
            scene: scene,
            width: maxWidth + (maxWidth / maxLength) * 2,
            height: label.height * 3,
            cssColor: colors[0],
            anchorX: 0.5,
            anchorY: 0.5,
            touchable: true,
        });

        rect.onPointDown.add(_e => {
            this._on = !this._on;
            label.text = this._on ? switchLabel.ON : switchLabel.OFF;
            label.invalidate();
            rect.cssColor = colors[this._on ? 0 : 1];
            rect.modified();
        });

        this.append(rect);
        this.append(label);

        this.width = rect.width;
        this.height = rect.height;
    }

    get on(): boolean {
        return this._on;
    }
}