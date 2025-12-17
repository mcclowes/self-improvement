import { describe, it, expect } from "vitest";
import {
  euclideanDistance,
  buildDistanceMatrix,
  calculateRouteDistance,
  generateRandomCities,
  createInstance,
} from "./utils.js";
import type { City } from "./types.js";

describe("euclideanDistance", () => {
  it("calculates distance between two points", () => {
    const a: City = { id: 0, x: 0, y: 0 };
    const b: City = { id: 1, x: 3, y: 4 };
    expect(euclideanDistance(a, b)).toBe(5);
  });

  it("returns 0 for same point", () => {
    const a: City = { id: 0, x: 5, y: 5 };
    expect(euclideanDistance(a, a)).toBe(0);
  });
});

describe("buildDistanceMatrix", () => {
  it("creates symmetric matrix", () => {
    const cities: City[] = [
      { id: 0, x: 0, y: 0 },
      { id: 1, x: 3, y: 4 },
      { id: 2, x: 6, y: 0 },
    ];
    const matrix = buildDistanceMatrix(cities);

    expect(matrix[0]![1]).toBe(matrix[1]![0]);
    expect(matrix[0]![2]).toBe(matrix[2]![0]);
    expect(matrix[1]![2]).toBe(matrix[2]![1]);
  });

  it("has zeros on diagonal", () => {
    const cities: City[] = [
      { id: 0, x: 0, y: 0 },
      { id: 1, x: 1, y: 1 },
    ];
    const matrix = buildDistanceMatrix(cities);

    expect(matrix[0]![0]).toBe(0);
    expect(matrix[1]![1]).toBe(0);
  });
});

describe("calculateRouteDistance", () => {
  it("calculates total route distance including return", () => {
    const cities: City[] = [
      { id: 0, x: 0, y: 0 },
      { id: 1, x: 3, y: 0 },
      { id: 2, x: 3, y: 4 },
    ];
    const matrix = buildDistanceMatrix(cities);
    const route = [0, 1, 2];

    // 0->1: 3, 1->2: 4, 2->0: 5 = 12
    expect(calculateRouteDistance(route, matrix)).toBe(12);
  });
});

describe("generateRandomCities", () => {
  it("generates correct number of cities", () => {
    const cities = generateRandomCities(10);
    expect(cities).toHaveLength(10);
  });

  it("produces deterministic results with seed", () => {
    const cities1 = generateRandomCities(5, 42);
    const cities2 = generateRandomCities(5, 42);
    expect(cities1).toEqual(cities2);
  });

  it("assigns sequential IDs", () => {
    const cities = generateRandomCities(3);
    expect(cities.map((c) => c.id)).toEqual([0, 1, 2]);
  });
});

describe("createInstance", () => {
  it("creates instance with cities and distance matrix", () => {
    const cities: City[] = [
      { id: 0, x: 0, y: 0 },
      { id: 1, x: 1, y: 1 },
    ];
    const instance = createInstance(cities);

    expect(instance.cities).toBe(cities);
    expect(instance.distances).toHaveLength(2);
  });
});
