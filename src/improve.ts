import { evolveParams } from "./evolution/index.js";
import type { ParamSchema } from "./evolution/index.js";
import { createTwoOptSolver, type TwoOptParams } from "./solvers/index.js";
import { generateRandomCities, createInstance } from "./utils.js";

const twoOptSchema: ParamSchema = {
  maxIterations: { min: 100, max: 5000, integer: true },
  maxNoImprove: { min: 10, max: 500, integer: true },
  startStrategy: ["nearest", "random", "sequential"],
};

interface ImprovementRun {
  timestamp: Date;
  initialFitness: number;
  finalFitness: number;
  improvement: number;
  bestParams: TwoOptParams;
  generations: number;
}

async function evaluateTwoOptParams(params: TwoOptParams): Promise<number> {
  const solver = createTwoOptSolver(params);

  // Evaluate on multiple problem sizes for robustness
  const testCases = [
    { cities: 20, seed: 42 },
    { cities: 30, seed: 123 },
    { cities: 50, seed: 456 },
  ];

  let totalDistance = 0;

  for (const { cities: n, seed } of testCases) {
    const cities = generateRandomCities(n, seed);
    const instance = createInstance(cities);
    const solution = solver(instance);
    totalDistance += solution.distance;
  }

  return totalDistance;
}

async function runImprovement(): Promise<ImprovementRun> {
  console.log("=".repeat(60));
  console.log("Starting parameter evolution for 2-opt solver");
  console.log("=".repeat(60));
  console.log();

  // Get baseline with default params
  const defaultParams: TwoOptParams = {
    maxIterations: 1000,
    maxNoImprove: 100,
    startStrategy: "nearest",
  };
  const initialFitness = await evaluateTwoOptParams(defaultParams);
  console.log(`Baseline fitness (default params): ${initialFitness.toFixed(2)}`);
  console.log();

  // Evolve parameters
  const result = await evolveParams<TwoOptParams>(
    twoOptSchema,
    evaluateTwoOptParams,
    {
      populationSize: 15,
      generations: 30,
      mutationRate: 0.25,
      eliteCount: 2,
    }
  );

  const finalFitness = result.best.fitness;
  const improvement = ((initialFitness - finalFitness) / initialFitness) * 100;

  console.log();
  console.log("=".repeat(60));
  console.log("Evolution complete!");
  console.log("=".repeat(60));
  console.log(`Initial fitness:  ${initialFitness.toFixed(2)}`);
  console.log(`Final fitness:    ${finalFitness.toFixed(2)}`);
  console.log(`Improvement:      ${improvement.toFixed(2)}%`);
  console.log();
  console.log("Best parameters found:");
  console.log(JSON.stringify(result.best.params, null, 2));

  return {
    timestamp: new Date(),
    initialFitness,
    finalFitness,
    improvement,
    bestParams: result.best.params,
    generations: 30,
  };
}

// Run if executed directly
runImprovement().catch(console.error);
