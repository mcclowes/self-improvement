export interface City {
  id: number;
  x: number;
  y: number;
}

export type Route = number[];

export type DistanceMatrix = number[][];

export interface TSPInstance {
  cities: City[];
  distances: DistanceMatrix;
}

export interface TSPSolution {
  route: Route;
  distance: number;
}

export type TSPSolver = (instance: TSPInstance) => TSPSolution;
