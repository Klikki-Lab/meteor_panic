import { FontSize } from "../common/fontSize";

export class FinishLabel extends g.Label {

    onFinish: g.Trigger<void> = new g.Trigger();

    constructor(scene: g.Scene, font: g.BitmapFont, text: string) {
        super({
            scene: scene,
            font: font,
            text: text,
            anchorX: 0.5,
            anchorY: 0.5,
            fontSize: FontSize.LARGE,
            x: g.game.width * 0.5,
            y: g.game.height * 0.5,
        });

        const period = g.game.fps / 4;
        this.onUpdate.add(() => {
            const sin = Math.sin(g.game.age / period) * 0.02;
            this.scale(1 - sin);
            this.modified();
        });
    }
}