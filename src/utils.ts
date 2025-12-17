import type { City, DistanceMatrix, TSPInstance, Route } from "./types.js";

export function euclideanDistance(a: City, b: City): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function buildDistanceMatrix(cities: City[]): DistanceMatrix {
  const n = cities.length;
  const matrix: DistanceMatrix = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => 0)
  );

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dist = euclideanDistance(cities[i]!, cities[j]!);
      matrix[i]![j] = dist;
      matrix[j]![i] = dist;
    }
  }

  return matrix;
}

export function createInstance(cities: City[]): TSPInstance {
  return {
    cities,
    distances: buildDistanceMatrix(cities),
  };
}

export function calculateRouteDistance(
  route: Route,
  distances: DistanceMatrix
): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += distances[route[i]!]![route[i + 1]!]!;
  }
  total += distances[route[route.length - 1]!]![route[0]!]!;
  return total;
}

export function generateRandomCities(n: number, seed?: number): City[] {
  const rng = seed !== undefined ? seededRandom(seed) : Math.random;
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: rng() * 100,
    y: rng() * 100,
  }));
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}
