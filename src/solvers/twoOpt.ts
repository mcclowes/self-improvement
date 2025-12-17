import type { TSPInstance, TSPSolution } from "../types.js";
import { calculateRouteDistance } from "../utils.js";
import { nearestNeighbor } from "./nearestNeighbor.js";

export interface TwoOptParams {
  maxIterations: number;
  maxNoImprove: number;
  startStrategy: "nearest" | "random" | "sequential";
}

export const defaultTwoOptParams: TwoOptParams = {
  maxIterations: 1000,
  maxNoImprove: 100,
  startStrategy: "nearest",
};

function createInitialRoute(
  instance: TSPInstance,
  strategy: TwoOptParams["startStrategy"]
): number[] {
  const n = instance.cities.length;

  switch (strategy) {
    case "nearest":
      return nearestNeighbor(instance).route;
    case "random":
      return shuffle([...Array(n).keys()]);
    case "sequential":
      return [...Array(n).keys()];
  }
}

function shuffle(arr: number[]): number[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function twoOptSwap(route: number[], i: number, j: number): number[] {
  const newRoute = route.slice(0, i);
  for (let k = j; k >= i; k--) {
    newRoute.push(route[k]!);
  }
  for (let k = j + 1; k < route.length; k++) {
    newRoute.push(route[k]!);
  }
  return newRoute;
}

export function createTwoOptSolver(params: TwoOptParams = defaultTwoOptParams) {
  return function twoOpt(instance: TSPInstance): TSPSolution {
    const { distances } = instance;
    const n = instance.cities.length;

    if (n <= 1) return { route: n === 0 ? [] : [0], distance: 0 };

    let route = createInitialRoute(instance, params.startStrategy);
    let bestDistance = calculateRouteDistance(route, distances);
    let noImproveCount = 0;
    let iterations = 0;

    while (
      iterations < params.maxIterations &&
      noImproveCount < params.maxNoImprove
    ) {
      let improved = false;

      for (let i = 0; i < n - 1 && !improved; i++) {
        for (let j = i + 2; j < n; j++) {
          const newRoute = twoOptSwap(route, i + 1, j);
          const newDistance = calculateRouteDistance(newRoute, distances);

          if (newDistance < bestDistance) {
            route = newRoute;
            bestDistance = newDistance;
            improved = true;
            noImproveCount = 0;
            break;
          }
        }
      }

      if (!improved) {
        noImproveCount++;
      }
      iterations++;
    }

    return { route, distance: bestDistance };
  };
}

export const twoOpt = createTwoOptSolver();
