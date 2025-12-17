import type { TSPInstance, TSPSolution } from "../types.js";
import { calculateRouteDistance } from "../utils.js";

export function nearestNeighbor(instance: TSPInstance): TSPSolution {
  const { cities, distances } = instance;
  const n = cities.length;

  if (n === 0) return { route: [], distance: 0 };
  if (n === 1) return { route: [0], distance: 0 };

  const visited = new Set<number>();
  const route: number[] = [];

  let current = 0;
  route.push(current);
  visited.add(current);

  while (visited.size < n) {
    let nearestDist = Infinity;
    let nearest = -1;

    for (let i = 0; i < n; i++) {
      if (!visited.has(i)) {
        const dist = distances[current]![i]!;
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      }
    }

    if (nearest !== -1) {
      route.push(nearest);
      visited.add(nearest);
      current = nearest;
    }
  }

  return {
    route,
    distance: calculateRouteDistance(route, distances),
  };
}
