import { FontSize } from "./fontSize";

export class Button extends g.E {

    private static readonly NORMAL = "orange";
    private static readonly PRESSED = "grey";

    onClicked: g.Trigger<void> = new g.Trigger();

    constructor(scene: g.Scene, font: g.BitmapFont, text: string, fontSize: number = FontSize.TINY) {
        super({ scene: scene });

        const label = new g.Label({
            scene: scene,
            font: font,
            text: text,
            anchorX: 0.5,
            anchorY: 0.5,
            fontSize: fontSize,
        });
        const maxLength = text.length;
        const maxWidth = maxLength * label.fontSize;
        const rect = new g.FilledRect({
            scene: scene,
            width: maxWidth + (maxWidth / maxLength) * 2,
            height: label.height * 3,
            cssColor: Button.NORMAL,
            anchorX: 0.5,
            anchorY: 0.5,
            touchable: true,
        });
        rect.onPointDown.add(e => {
            this.onClicked.fire();
        });

        this.append(rect);
        this.append(label);
    }
}