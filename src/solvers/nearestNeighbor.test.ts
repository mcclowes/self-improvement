import { describe, it, expect } from "vitest";
import { nearestNeighbor } from "./nearestNeighbor.js";
import { createInstance } from "../utils.js";
import type { City } from "../types.js";

describe("nearestNeighbor", () => {
  it("handles empty input", () => {
    const instance = createInstance([]);
    const solution = nearestNeighbor(instance);
    expect(solution.route).toEqual([]);
    expect(solution.distance).toBe(0);
  });

  it("handles single city", () => {
    const cities: City[] = [{ id: 0, x: 0, y: 0 }];
    const instance = createInstance(cities);
    const solution = nearestNeighbor(instance);
    expect(solution.route).toEqual([0]);
    expect(solution.distance).toBe(0);
  });

  it("visits all cities exactly once", () => {
    const cities: City[] = [
      { id: 0, x: 0, y: 0 },
      { id: 1, x: 1, y: 0 },
      { id: 2, x: 2, y: 0 },
      { id: 3, x: 3, y: 0 },
    ];
    const instance = createInstance(cities);
    const solution = nearestNeighbor(instance);

    expect(solution.route).toHaveLength(4);
    expect(new Set(solution.route).size).toBe(4);
  });

  it("starts from city 0", () => {
    const cities: City[] = [
      { id: 0, x: 0, y: 0 },
      { id: 1, x: 10, y: 0 },
      { id: 2, x: 5, y: 0 },
    ];
    const instance = createInstance(cities);
    const solution = nearestNeighbor(instance);
    expect(solution.route[0]).toBe(0);
  });

  it("picks nearest unvisited city at each step", () => {
    // Line of cities: 0 at origin, 2 is closest, then 1
    const cities: City[] = [
      { id: 0, x: 0, y: 0 },
      { id: 1, x: 10, y: 0 },
      { id: 2, x: 2, y: 0 },
    ];
    const instance = createInstance(cities);
    const solution = nearestNeighbor(instance);

    // Should go 0 -> 2 -> 1
    expect(solution.route).toEqual([0, 2, 1]);
  });

  it("calculates correct distance", () => {
    const cities: City[] = [
      { id: 0, x: 0, y: 0 },
      { id: 1, x: 3, y: 0 },
      { id: 2, x: 3, y: 4 },
    ];
    const instance = createInstance(cities);
    const solution = nearestNeighbor(instance);

    expect(solution.distance).toBeGreaterThan(0);
  });
});
