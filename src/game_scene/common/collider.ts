export module Collider {

    export function within(e1: g.E, e2: g.E, distanceRate1: number = 0.5, distanceRate2: number = 0.5): boolean {
        const x = e2.x - e1.x;
        const y = e2.y - e1.y;
        const r = e2.width * e2.scaleX * distanceRate2 + e1.width * e1.scaleX * distanceRate1;
        return x * x + y * y < r * r;
    };
}