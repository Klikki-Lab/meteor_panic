import { FontSize } from "../common/fontSize";

export class Timer extends g.Label {

    onFinish: g.Trigger<void> = new g.Trigger();

    private static readonly TIME = "TIME ";

    constructor(scene: g.Scene, font: g.BitmapFont, private timeLimit: number) {
        super({
            scene: scene,
            font: font,
            text: `${timeLimit} SEC TO START!`,
            anchorX: 0.5,
            anchorY: 0.5,
            fontSize: FontSize.SMALL,
            x: g.game.width / 2,
        });
    }

    start = () => {
        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = () => {
        this.timeLimit -= 1 / g.game.fps;
        const time = Math.ceil(this.timeLimit);
        const text = `${time} SEC TO START!`;
        if (this.text !== text) {
            this.text = text;
            this.invalidate();
        }

        if (time < 0) {
            this.onUpdate.remove(this.updateHandler);
            this.onFinish.fire();
        }
    };

    isTimeOver = () => this.timeLimit < 0;
}