export interface Launchable {

    fire(isDebug: boolean): boolean;

    reload(addCount: number): number;

    enable(): void;

    disable(): void;

    isFull(): boolean;

    isEmpty(): boolean;

    getRemainingCount(): number;
}