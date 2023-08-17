import { Sight } from "./player/sight";
import { ShockWave } from "./effect/shockWave";
import { Missile } from "./player/missile";
import { Meteor } from "./invader/meteor";
import { Scorer } from "./hud/scorer";
import { Smoke } from "./effect/smoke";
import { Combo } from "./combo";
import { Star } from "../common/star";
import { Player } from "./player/player";
import { Explosion } from "./effect/explosion";
import { Pos } from "./common/entity";
import { Ticker } from "./hud/ticker";
import { Wave } from "./hud/wave";
import { NotificationLabel } from "./notificationLabel";
import { MissileBase } from "./player/missileBase";
import { MissileLauncher } from "./player/missileLauncher";
import { DestroyedMissileBase } from "./player/destroyedMissileBase";
import { FinishLabel as FinishLabel } from "./finishLabel";
import { UFO } from "./invader/ufo";
import { Invader, Props } from "./invader/invader";
import { InvaderShockWave } from "./effect/InvaderShockWave";
import { PlayerShockWave } from "./effect/playerShockWave";
import { UFOBullet } from "./invader/ufoBullet";
import { Rebuild } from "./player/rebuild";
import { MissileBaseBackground } from "./player/missileBaseBackground";
import { FireSmoke } from "./player/fireSmoke";
import { Collider } from "./common/collider";
import { DestroyedUFO } from "./invader/destroyedUfo";
import { Blinking } from "./blinking";

export class GameScene extends g.Scene {

    constructor(random: g.RandomGenerator, timeLimit: number, isDebug: boolean = false) {
        super({
            game: g.game,
            assetIds: [
                "missile_base", "destroyed_missile_base", "missile_base_rebuild", "destroyed_missile_base_back",
                "missile", "remaining_missile", "combustion", "gun_turret", "sight",
                "meteor", "heat", "smoke", "explosion", "shock_wave_player", "shock_wave_invader", "ground",
                "ufo", "destroyed_ufo", "ufo_bullet", "horizon",
                "font16_1", "glyph_area_16",
                "bgm", "se_fire", "se_reload", "se_destroy", "se_explosion", "se_ufo", "se_powerup", "se_strike",
                "se_rebuild", "se_start", "se_finish",
            ]
        });

        this.onLoad.add(() => loadHandler());

        const createBitmapFont16_1 = (): g.BitmapFont => {
            const fontAsset = this.asset.getImageById("font16_1");
            const fontGlyphAsset = this.asset.getTextById("glyph_area_16");
            const glyphInfo = JSON.parse(fontGlyphAsset.data);
            return new g.BitmapFont({
                src: fontAsset,
                glyphInfo: glyphInfo,
            });
        };

        const createMissileBases = (
            groungHeight: number,
            launcherLayer: g.E,
            backLayer: g.E,
            smokeLayer: g.E,
            missileBaseLayer: g.E,
            rebuildLayer: g.E): MissileBase[] => {

            const missilBases: MissileBase[] = [];
            const posX = [0.15, 0.5, 0.85];
            const baseAsset = this.asset.getImageById("missile_base");
            for (let i = 0; i < Player.BASE_NUMBER; i++) {
                const bx = g.game.width * posX[i];
                const by = g.game.height - groungHeight - baseAsset.height * 0.1;

                const background = new MissileBaseBackground(this, bx, by);
                backLayer.append(background);
                const destroyed = new DestroyedMissileBase(this, bx, by, background);
                destroyed.onSmoke.add(base => smokeLayer.append(new FireSmoke(this, base.x, base.y)));
                missileBaseLayer.append(destroyed);

                const launcher = new MissileLauncher(this, baseAsset, bx, by);
                launcherLayer.append(launcher);
                const missileBase = new MissileBase(this, bx, by, launcher);
                missileBase.onRebuild.add(_base => {
                    const rebuild = new Rebuild(this, _base);
                    rebuild.onRebuilded.addOnce(() => {
                        destroyed.hide();
                        _base.show();
                    });
                    rebuildLayer.append(new Rebuild(this, _base));
                });
                missileBase.onDestroyed.add(_base => {
                    destroyed.show();
                });
                missilBases.push(missileBase);
                missileBaseLayer.append(missileBase);
            }
            return missilBases;
        };

        const loadHandler = (): void => {
            const bitmapFont = createBitmapFont16_1();

            for (let i = 0; i < 64; i++)
                this.append(new Star(this));

            const groundAsset = this.asset.getImageById("ground");
            const ground = new g.Sprite({
                scene: this,
                src: groundAsset,
                y: g.game.height - groundAsset.height,
            });
            const horizonAset = this.asset.getImageById("horizon");
            const horizon = new g.Sprite({
                scene: this,
                src: horizonAset,
                y: g.game.height - ground.height - horizonAset.height,
            });
            this.append(horizon);

            const blinking = new Blinking(this);
            this.append(blinking);

            const backLayer = new g.E({ scene: this });
            const smokeLayer = new g.E({ scene: this });
            const invaderLayer = new g.E({ scene: this });
            const missileLayer = new g.E({ scene: this });
            const explosionLayer = new g.E({ scene: this });
            this.append(backLayer);
            this.append(smokeLayer);
            this.append(invaderLayer);
            this.append(missileLayer);
            this.append(explosionLayer);

            const missileBaseLayer = new g.E({ scene: this });
            const launcherLayer = new g.E({ scene: this });
            const rebuildLayer = new g.E({ scene: this });
            this.append(missileBaseLayer);
            this.append(rebuildLayer);

            const missilBases = createMissileBases(
                ground.height, launcherLayer, backLayer, smokeLayer, missileBaseLayer, rebuildLayer);
            const player = new Player(missilBases);
            player.onReload.add(props => {
                this.setTimeout(() => {
                    props.base.reload(1);
                    this.asset.getAudioById("se_reload").play();
                }, props.duration);
            });
            player.onFinishReload.add(duration => {
                this.setTimeout(() => {
                    if (ticker?.isTimeOver()) return;
                    waveStart();
                }, duration);
            });
            player.onExplodeBase.add(base => {
                const count = 10;
                for (let i = 0; i < count; i++) {
                    this.setTimeout(() => {
                        const sx = base.x + (g.game.random.generate() * 2 - 1) * base.width / 2;
                        const sy = base.y - g.game.random.generate() * base.height / 2;
                        const shockWave = new InvaderShockWave(this, { x: sx, y: sy } as g.CommonOffset, undefined, 0.5);
                        if (i === count - 1) {
                            shockWave.onSpread.addOnce(_shockWave => {
                                base.disableLauncher();
                                base.hide();
                                base.onDestroyed.fire(base);
                            });
                        }
                        shockWaveLayer.append(shockWave);

                        const ex = base.x + (g.game.random.generate() * 2 - 1) * base.width / 2;
                        const ey = base.y - g.game.random.generate() * base.height / 2;
                        const explosion = new Explosion(this, { x: ex, y: ey } as g.CommonOffset, 1, 2000 / g.game.fps);
                        shockWaveLayer.append(explosion);
                    }, 200 * i);
                }
            });

            const shockWaveLayer = new g.E({ scene: this });
            this.append(shockWaveLayer);

            this.append(ground);
            this.append(launcherLayer);

            const wave = new Wave(this, bitmapFont);
            this.append(wave);
            const ticker = new Ticker(this, bitmapFont, timeLimit);
            ticker.onCountdown.add(() => blinking.blink());
            ticker.onFinish.addOnce(() => finishGame());
            this.append(ticker);
            const scoreLabel = new Scorer(this, bitmapFont);
            this.append(scoreLabel);

            let canFire = false;
            this.onPointDownCapture.add(e => {
                if (!canFire || e.point.y >= ground.y) return;

                launchMissile(e.point, ticker.isTimeOver() || isDebug);
            });

            let turnInvader = true;
            let totalInvaderCount = 0;
            let goneInvaderCount = 0;
            let destroyObjectCount = 0;

            this.asset.getAudioById("se_start").play();
            const gameStart = new NotificationLabel(this, bitmapFont, "START!");
            gameStart.onFinish.addOnce(() => {
                this.asset.getAudioById("bgm").play();
                ticker.start();
                waveStart();
            });
            this.append(gameStart);

            const init = () => {
                canFire = true;
                turnInvader = false;
                totalInvaderCount = 0;
                goneInvaderCount = 0;
                destroyObjectCount = 0;
            };

            const waveStart = () => {
                init();
                wave.next();
                if (wave.times > 1) {
                    const waveStartLabel = new NotificationLabel(this, bitmapFont, `WAVE ${wave.times}`);
                    waveStartLabel.onPeak.addOnce(() => {
                        if (ticker.isTimeOver()) return;
                        invade();
                    });
                    this.append(waveStartLabel);
                } else {
                    invade();
                }
            };

            const finishWave = () => {
                this.setTimeout(() => {
                    if (ticker.isTimeOver()) return;

                    canFire = false;
                    const duration = this.asset.getAudioById("se_reload").duration;
                    const completedWave = new NotificationLabel(this, bitmapFont, `WAVE ${wave.times} COMPLETED`);
                    completedWave.onFinish.addOnce(() => {
                        if (ticker.isTimeOver()) return;

                        if (player.rebuild()) {
                            const seBuild = this.asset.getAudioById("se_rebuild");
                            seBuild.play();
                            this.setTimeout(() => {
                                player.reload(duration);
                            }, seBuild.duration);
                            return;
                        }
                        player.reload(duration);
                    });
                    this.append(completedWave);
                }, 500);
            };

            const finishGame = () => {
                canFire = false;
                if (this.onUpdate.contains(updateHandler)) {
                    this.onUpdate.remove(updateHandler);
                }

                const invaders = invaderLayer.children;
                if (invaders) {
                    for (let i = invaders.length - 1; i >= 0; i--) {
                        const invader = invaders[i];
                        if ((invader instanceof Meteor) || (invader instanceof UFOBullet)) {
                            invader.deactivate();
                            invader?.destroy();
                            explosionLayer.append(new Explosion(this, invader, 2, 1000 / g.game.fps * 2));
                        } else if (invader instanceof UFO) {
                            invader.deactivate();
                        }
                    }
                }
                this.asset.getAudioById("bgm").stop();
                this.setTimeout(() => {
                    this.children.forEach(entity => {
                        if (entity instanceof NotificationLabel)
                            entity.hide();
                    });
                    this.append(new FinishLabel(this, bitmapFont, "FINISH!"));
                    this.asset.getAudioById("se_finish").play();
                    this.setTimeout(() => {
                        player.rebuild();
                        player.reloadAll();
                        canFire = true;
                    }, 1000);
                }, 1000);
            };

            const meteorPeriod = g.game.fps * 5;
            const ufoPeriod = g.game.fps * 4;
            let attckMeteorTimes: number;
            let attckUFOTimes: number;
            let meteorCount: number;
            let frame: number;
            const invade = (): void => {
                attckMeteorTimes = Math.floor(wave.times / 3) + 2;//5
                attckUFOTimes = Math.floor(wave.times / 3) + 1;//10
                meteorCount = Math.floor(wave.times / 3) * 2 + 5;//3

                frame = 0;
                turnInvader = true;
                this.onUpdate.add(updateHandler);
            };

            const updateHandler = () => {
                if (!ticker.isTimeOver()) {
                    if (frame % meteorPeriod === 0) {
                        //console.log(`frame=${frame} ,meteorPeriod=${meteorPeriod}`);
                        attckMeteorTimes--;
                        for (let j = 0; j < meteorCount; j++) {
                            const start = { x: random.generate() * g.game.width, y: 0 } as g.CommonOffset;
                            const target = chooseTarget();
                            invaderLayer.append(createMeteor(start, target, wave.times));
                        }
                    }
                    frame++;
                    if (attckUFOTimes > 0 && frame % ufoPeriod === 0) {
                        attckUFOTimes--;
                        const ufo = createUFO();
                        invaderLayer.append(ufo);
                        this.asset.getAudioById("se_ufo").play();
                    }
                }

                if (ticker.isTimeOver() || attckMeteorTimes <= 0) {
                    turnInvader = false;
                    if (this.onUpdate.contains(updateHandler)) {
                        this.onUpdate.remove(updateHandler);
                    }
                }
            };

            const createUFO = (): UFO => {
                totalInvaderCount++;
                const ufo = new UFO(this, random, wave.times);
                ufo.onFire.add(ufo => {
                    totalInvaderCount++;
                    const start = { x: ufo.x, y: ufo.y } as g.CommonOffset;
                    const target = chooseTarget();
                    const bullet = new UFOBullet(this, start, target, wave.times);
                    bullet.onFalling.add(bullet => falling(bullet));
                    bullet.onDestroy.addOnce(props => explode(props));
                    invaderLayer.append(bullet);
                });
                ufo.onGone.addOnce(() => goneInvader());
                ufo.onDestroy.addOnce(props => {
                    explode(props);
                    explosionLayer.append(new DestroyedUFO(this, ufo));
                });
                return ufo;
            };

            const chooseTarget = (invader?: Invader): Pos => {
                if (!invader) {
                    if (random.generate() > 0.25) {
                        return { x: random.generate() * g.game.width, y: ground.y } as g.CommonOffset;
                    }
                    return player.pickBaseRandomly();
                }

                if (random.generate() > 0.25) {
                    let times = 9;
                    while (times-- > 0) {
                        const x = random.generate() * g.game.width;
                        const y = ground.y;
                        const radian = Math.atan2(y - invader.y, x - invader.x);
                        const angle = radian * (180 / Math.PI) + 90;
                        if (Math.abs(invader.angle - angle) >= 30) {
                            return { x: x, y: y } as g.CommonOffset;
                        }
                    }
                }
                return player.pickBaseRandomly(invader instanceof Meteor ? invader.targetBase : undefined);
            };

            const createMeteor = (start: Pos, target: Pos, waveTimes: number, crackCount: number = Meteor.MAX_CRACK_COUNT): Meteor => {
                totalInvaderCount++;

                const meteor = new Meteor(this, random, start, target, waveTimes, crackCount);
                meteor.onFalling.add(meteor => falling(meteor));
                meteor.onSmoke.add(meteor => smokeLayer.append(new Smoke(this, meteor)));
                meteor.onCracked.add(meteor => cracked(meteor));
                meteor.onDestroy.addOnce(props => explode(props));
                return meteor;
            };

            const falling = (invader: Invader) => {
                if (invader.y >= ground.y) {
                    invader.y = ground.y;
                    invader.deactivate();
                    createShockWave(invader);
                    return;
                }
                if (invader.y + invader.getRadius() >= ground.y - player.getMissileBaseHeight()) {
                    if (!player.isCollide(invader)) return;
                    invader.deactivate();

                    createShockWave(invader);
                    this.asset.getAudioById("se_destroy").play();
                }
            };

            const cracked = (meteor: Meteor) => {
                const target = chooseTarget(meteor);
                invaderLayer.append(createMeteor(meteor, target, meteor.waveTimes, meteor.crackCount));
            };

            const explode = (props: Props) => {
                destroyObjectCount++;
                const shockWave = createShockWave(props.invader, props.combo);
                shockWave.onSpread.add(shockWave => spreadShockWave(shockWave));
            };

            const createShockWave = (invader: Invader, combo?: Combo): ShockWave => {
                explosionLayer.append(new Explosion(this, invader));
                const shockWave = new InvaderShockWave(this, invader, combo);
                shockWaveLayer.append(shockWave);

                invader.destroy();
                goneInvader();
                return shockWave;
            };

            const goneInvader = () => {
                goneInvaderCount++;
                if (!turnInvader && goneInvaderCount === totalInvaderCount) {
                    finishWave();
                }
            };

            const launchMissile = (target: g.CommonOffset, isUnlimited?: boolean) => {
                const pos = player.fire(target, isUnlimited);
                if (!pos) return;

                const sight = new Sight(this, target);
                this.append(sight);
                const missile = new Missile(this, pos, target, player.speed);
                missile.onFlying.add(missile => {
                    const entities = invaderLayer.children;
                    if (!entities || entities.length === 0) return;

                    for (let i = 0; i < entities.length; i++) {
                        const entity = entities[i];
                        if ((entity instanceof Invader) && Collider.within(missile, entities[i])) {
                            missile.strike();
                            explodeMissile(missile, sight, entity);
                            this.asset.getAudioById("se_strike").play();
                            return;
                        }
                    }
                });
                missile.onSmoke.add(missile => smokeLayer.append(new Smoke(this, missile)));
                missile.onReachTarget.addOnce(missile => { explodeMissile(missile, sight) });
                missileLayer.append(missile);
                this.asset.getAudioById("se_fire").play();
            };

            const explodeMissile = (missile: Missile, sight: Sight, invader?: Invader) => {
                const shockWave = new PlayerShockWave(this, missile, missile.isStrike, player.power, new Combo());
                shockWave.onSpread.add(shockWave => spreadShockWave(shockWave));
                shockWaveLayer.append(shockWave);
                smokeLayer.append(new Smoke(this, missile));
                explosionLayer.append(new Explosion(this, missile));

                if (missile.isStrike && invader) {
                    destroyInvader(invader, shockWave);
                }
                missile.destroy();
                sight.destroy();
            };

            const spreadShockWave = (shockWave: ShockWave) => {
                invaderLayer.children?.forEach(invader => {
                    if ((invader instanceof Invader) && Collider.within(shockWave, invader)) {
                        destroyInvader(invader, shockWave);
                        return;
                    }
                });
            };

            let currentAge = 0;
            const destroyInvader = (invader: Invader, shockWave: ShockWave) => {
                if (g.game.age - currentAge >= 1) {
                    this.asset.getAudioById("se_destroy").play();
                    currentAge = g.game.age;
                }
                invader._destroy(shockWave.combo);

                const score = Scorer.DEFAULT_SCORE * (1 << shockWave.combo.count);
                const strikeBonus = 1;//isFirstStrik ? 10 : 1;
                scoreLabel.add(score * strikeBonus);

                showScore(invader.x, invader.y, score * strikeBonus, shockWave.combo.count);
                shockWave.combo.increment();
                if (invader instanceof UFO) {
                    this.asset.getAudioById("se_powerup").play();
                    player.upgrade();
                }
            };

            const showScore = (x: number, y: number, score: number, combo: number) => {
                const label = new g.Label({
                    scene: this,
                    text: score.toString(),
                    fontSize: 16,
                    font: bitmapFont,
                    anchorX: 0.5,
                    anchorY: 0.5,
                    x: x,
                    y: y,
                });

                let rate = combo / Combo.MAX_COMBO;
                const updateHandler = () => {
                    if (rate <= 0.01) {
                        label.onUpdate.remove(updateHandler);
                        return;
                    }
                    label.y -= (label.height / 2) * rate;
                    rate *= 0.7;
                    label.modified();
                };
                label.onUpdate.add(updateHandler);
                this.append(label);
                this.setTimeout(() => label.destroy(), 1500);
            };
        };
    }
} 