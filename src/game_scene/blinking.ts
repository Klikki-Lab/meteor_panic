export class Blinking extends g.FilledRect {

    constructor(scene: g.Scene) {
        super({
            scene: scene,
            width: g.game.width,
            height: g.game.height,
            cssColor: "red",
            opacity: 0.25,
            hidden: true,
        });
    }

    private updateHandler = () => {
        this.opacity -= (1 / g.game.fps);
        if (this.opacity <= 0) {
            this.onUpdate.remove(this.updateHandler);
            this.hide();
        }
    };

    blink = () => {
        this.opacity = 0.5;
        this.modified();
        this.onUpdate.add(this.updateHandler);
        super.show();
    }
}