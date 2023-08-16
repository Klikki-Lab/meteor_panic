import { Combo } from "../combo";

export interface Props {
    readonly invader: Invader;
    readonly combo: Combo;
};

export abstract class Invader extends g.Sprite {

    onDestroy: g.Trigger<Props> = new g.Trigger();

    abstract deactivate(): void;

    abstract _destroy(combo: Combo): void;

    getRadius = (): number => this.width * 0.5;
}
