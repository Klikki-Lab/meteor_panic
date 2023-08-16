import { FontSize } from "../../common/fontSize";

export class Ticker extends g.Label {

    onCountdown: g.Trigger<void> = new g.Trigger();
    onFinish: g.Trigger<void> = new g.Trigger();

    private static readonly TIME = "TIME ";

    constructor(scene: g.Scene, font: g.BitmapFont, private _timeLimit: number) {
        super({
            scene: scene,
            font: font,
            text: `${Ticker.TIME}${_timeLimit}`,
            anchorX: 0.5,
            anchorY: 0.5,
            fontSize: FontSize.SMALL,
            x: g.game.width - font.defaultGlyphWidth * 7,
            y: FontSize.SMALL * 1.5,
        });
    }

    start = () => {
        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = () => {
        this._timeLimit -= 1 / g.game.fps;
        const time = Math.ceil(this._timeLimit);
        const text = `${Ticker.TIME}${time.toString().slice(-3)}`;
        if (this.text !== text) {
            this.text = text;
            this.invalidate();

            if (time <= 5 && time >= 0) {
                this.onCountdown.fire();
            }
        }

        if (this._timeLimit < 0) {
            this.onUpdate.remove(this.updateHandler);
            this.onFinish.fire();
        }
    };

    isTimeOver = () => this._timeLimit < 0;
}