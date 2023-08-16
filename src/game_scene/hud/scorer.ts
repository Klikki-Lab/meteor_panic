import { FontSize } from "../../common/fontSize";

export class Scorer extends g.Label {

    private static readonly SCORE = "SCORE ";
    static readonly DEFAULT_SCORE = 100;

    constructor(scene: g.Scene, font: g.BitmapFont) {
        super({
            scene: scene,
            font: font,
            text: "SCORE 0",
            anchorX: 0.5,
            anchorY: 0.5,
            fontSize: FontSize.SMALL,
            x: g.game.width * 0.5,
            y: FontSize.SMALL * 1.5,
        });
    }

    add = (score: number) => {
        g.game.vars.gameState.score += score;
        this.text = `${Scorer.SCORE}${g.game.vars.gameState.score.toString()}`;
        this.x = g.game.width * 0.5;
        this.invalidate();
    }
}