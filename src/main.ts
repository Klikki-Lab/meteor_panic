import { GameScene } from "./game_scene/gameScene";
import { GameMainParameterObject } from "./parameterObject";
import { TitleScene } from "./title_scene/titleScene";

export function main(param: GameMainParameterObject): void {

    g.game.vars.gameState = {
        score: 0,
        playThreshold: 100,
        clearThreshold: undefined,
    };
    g.game.audio.music.volume = 0.5;
    g.game.audio.sound.volume = 0.5;

    g.game.vars.version = "0.1.3";//バージョン更新忘れずに!!
    const isDebug = false;
    const random = param.random ?? g.game.random;

    //const _totalTimeLimit = param.sessionParameter.totalTimeLimit ?? 116;
    const titleTimeLimit = 7;
    const gameTimeLimit = 99;
    const titleScene = new TitleScene(titleTimeLimit);
    titleScene.onFinish.add(props => {
        if (props.muteBGM) g.game.audio.music.volume = 0;
        if (props.muteSE) g.game.audio.sound.volume = 0;

        const gameScene = new GameScene(random, gameTimeLimit, props.background, isDebug);
        g.game.replaceScene(gameScene);
    });

    g.game.pushScene(titleScene);
}
