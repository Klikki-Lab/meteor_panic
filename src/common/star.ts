export class Star extends g.FilledRect {

    static readonly COLORS = ["cyan", "magenta", "green", "yellow", "white"];

    constructor(scene: g.Scene) {
        const size = g.game.random.generate() + 2;
        super({
            scene: scene,
            width: size,
            height: size,
            x: (g.game.width - 32) * g.game.random.generate() + 16,
            y: (g.game.height * 0.8) * g.game.random.generate(),
            cssColor: Star.COLORS[Math.floor(Star.COLORS.length * g.game.random.generate())]
        });
    }
}