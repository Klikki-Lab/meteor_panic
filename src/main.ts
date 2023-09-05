import { GameScene } from "./game_scene/gameScene";
import { GameMainParameterObject } from "./parameterObject";
import { TitleScene } from "./title_scene/titleScene";

export function main(param: GameMainParameterObject): void {

	let totalTimeLimit = 116;
	if (param.sessionParameter.totalTimeLimit) {//20 以上 200 以下の整数
		totalTimeLimit = param.sessionParameter.totalTimeLimit;
	}
	g.game.vars.gameState = {
		score: 0,
		playThreshold: 100,
		clearThreshold: undefined,
	};
	g.game.audio.music.volume = 0.3;
	g.game.audio.sound.volume = 0.3;

	g.game.vars.version = "0.1.3";//バージョン更新忘れずに!!
	const isDebug = false;
	const random = param.random ?? g.game.random;

	const titleTimeLimit = 7;
	const gameTimeLimit = 99;
	const titleScene = new TitleScene(titleTimeLimit);
	titleScene.onFinish.add(props => {
		if (props.muteBGM) g.game.audio.music.volume = 0;
		if (props.muteSE) g.game.audio.sound.volume = 0;

		const gameScene = new GameScene(random, gameTimeLimit, isDebug);
		g.game.replaceScene(gameScene);
	});

	g.game.pushScene(titleScene);
}
