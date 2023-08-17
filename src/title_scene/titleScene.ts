import { Star } from "../common/star";
import { FontSize } from "../common/fontSize";
import { SwitchButton, SwitchLabel } from "./switchButton";
import { Timer } from "./timer";

export interface AudioProps {
    readonly muteBGM: boolean;
    readonly muteSE: boolean;
};

export class TitleScene extends g.Scene {

    onFinish: g.Trigger<AudioProps> = new g.Trigger();

    constructor(timeLimit: number) {
        super({
            game: g.game,
            assetIds: [
                "title", "description",
                "font16_1", "glyph_area_16",
            ],
        });

        const createBitmapFont16_1 = (): g.BitmapFont => {
            const fontAsset = this.asset.getImageById("font16_1");
            const fontGlyphAsset = this.asset.getTextById("glyph_area_16");
            const glyphInfo = JSON.parse(fontGlyphAsset.data);
            return new g.BitmapFont({
                src: fontAsset,
                glyphInfo: glyphInfo,
            });
        };

        const createLabel = (bitmapFont: g.BitmapFont, text: string, fontSize: number = FontSize.TINY): g.Label => {
            return new g.Label({
                scene: this,
                font: bitmapFont,
                text: text,
                fontSize: fontSize,
                anchorX: 0.5,
                anchorY: 0.5,
            });
        };

        const createSwitchButton = (bitmapFont: g.BitmapFont, switchLabel: SwitchLabel): SwitchButton =>
            new SwitchButton(this, bitmapFont, switchLabel);


        this.onLoad.add(() => {
            const bitmapFont = createBitmapFont16_1();

            for (let i = 0; i < 32; i++)
                this.append(new Star(this));

            const titleAsset = this.asset.getImageById("title");
            const title = new g.Sprite({
                scene: this,
                src: titleAsset,
                x: g.game.width / 2,
                y: titleAsset.height * 1.25,
                anchorX: 0.5,
                anchorY: 0.5,
            });
            this.append(title);
            const descriptionAsset = this.asset.getImageById("description");
            const description = new g.Sprite({
                scene: this,
                src: descriptionAsset,
                x: g.game.width / 2,
                y: title.y + title.height + descriptionAsset.height / 2,
                anchorX: 0.5,
                anchorY: 0.5,
            });
            this.append(description);

            const copyright = createLabel(bitmapFont, "MUSIC BY (C)PANICPUMPKIN");
            copyright.x = g.game.width / 2;
            copyright.y = g.game.height - copyright.height * 1.5;
            this.append(copyright);
            const inspired = createLabel(bitmapFont, "THIS GAME IS INSPIRED BY MISSILE COMMAND.");
            inspired.x = g.game.width / 2;
            inspired.y = g.game.height - inspired.height / 2;
            this.append(inspired);
            const version = createLabel(bitmapFont, `VERSION ${g.game.vars.version}`);
            version.moveTo(version.width / 2, version.height / 2);
            this.append(version);

            const musicSwitch = createSwitchButton(bitmapFont, { ON: "MUSIC ON", OFF: "MUSIC OFF" });
            musicSwitch.x = g.game.width / 2 - musicSwitch.width / 2;
            musicSwitch.y = description.y + description.height + musicSwitch.height;
            this.append(musicSwitch);

            const seSwitch = createSwitchButton(bitmapFont, { ON: "SE ON", OFF: "SE OFF" });
            seSwitch.x = g.game.width / 2 + musicSwitch.width / 2;
            seSwitch.y = musicSwitch.y;
            this.append(seSwitch);

            const timer = new Timer(this, bitmapFont, timeLimit);
            timer.y = musicSwitch.y - musicSwitch.height;
            timer.onFinish.addOnce(() => {
                this.onUpdate.remove(updateHandler);
                this.onFinish.fire({ muteBGM: !musicSwitch.on, muteSE: !seSwitch.on });
            });
            this.append(timer);

            const updateHandler = () => {
                this.children.forEach(entity => {
                    if (entity instanceof Star) {
                        entity.moveBy(-30 / g.game.fps, 30 / g.game.fps);
                        if (entity.x < 0 || entity.y > g.game.height) {
                            entity.moveTo(g.game.random.generate() * g.game.width + 1, 0);
                        }
                        entity.modified();
                    }
                });
            };
            this.onUpdate.add(updateHandler);
            timer.start();
        });
    }
}