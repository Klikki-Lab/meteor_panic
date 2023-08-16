import { FontSize } from "../common/fontSize";

export class NotificationLabel extends g.Label {

    onPeak: g.Trigger<void> = new g.Trigger();
    onFinish: g.Trigger<void> = new g.Trigger();

    constructor(scene: g.Scene, font: g.BitmapFont, text: string) {
        const startY = g.game.height * 0.5 - FontSize.LARGE;
        super({
            scene: scene,
            font: font,
            text: text,
            anchorX: 0.5,
            anchorY: 0.5,
            fontSize: FontSize.LARGE,
            x: g.game.width / 2,
            y: startY,
            opacity: 0,
        });

        const step = Math.PI / g.game.fps / 2;
        let frame = 0;

        const updateHandler = () => {
            const sin = Math.sin(++frame * step) * 2;//1.5
            const rate = Math.min(1, sin);
            this.y = startY + this.height * rate;
            this.opacity = rate;
            this.modified();

            if (sin <= 0) {
                this.hide();
                this.onFinish.fire();
                this.onUpdate.remove(updateHandler);
                this.destroy();
            } else if (sin >= 0.99) {
                this.onPeak.fire();
            }
        }
        this.onUpdate.add(updateHandler);
    }
}