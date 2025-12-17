import type { TSPSolver } from "./types.js";
import { generateRandomCities, createInstance } from "./utils.js";
import { nearestNeighbor } from "./solvers/index.js";

interface BenchmarkResult {
  solver: string;
  cities: number;
  distance: number;
  timeMs: number;
}

function runBenchmark(
  solver: TSPSolver,
  solverName: string,
  cityCount: number,
  seed: number
): BenchmarkResult {
  const cities = generateRandomCities(cityCount, seed);
  const instance = createInstance(cities);

  const start = performance.now();
  const solution = solver(instance);
  const timeMs = performance.now() - start;

  return {
    solver: solverName,
    cities: cityCount,
    distance: solution.distance,
    timeMs,
  };
}

function runSuite(solvers: Map<string, TSPSolver>, cityCounts: number[]) {
  const seed = 42;
  const results: BenchmarkResult[] = [];

  for (const cityCount of cityCounts) {
    for (const [name, solver] of solvers) {
      const result = runBenchmark(solver, name, cityCount, seed);
      results.push(result);
      console.log(
        `${name.padEnd(20)} | ${cityCount.toString().padStart(5)} cities | ` +
          `${result.distance.toFixed(2).padStart(10)} dist | ` +
          `${result.timeMs.toFixed(2).padStart(8)} ms`
      );
    }
    console.log("-".repeat(65));
  }

  return results;
}

const solvers = new Map<string, TSPSolver>([
  ["nearest-neighbor", nearestNeighbor],
]);

console.log("TSP Benchmark Suite\n" + "=".repeat(65));
runSuite(solvers, [10, 25, 50, 100, 200]);
