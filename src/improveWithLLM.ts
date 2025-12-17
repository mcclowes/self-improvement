import "dotenv/config";
import { iterateWithLLM } from "./llm/index.js";
import type { TSPSolver } from "./types.js";
import { generateRandomCities, createInstance } from "./utils.js";

function createEvaluator(): (solver: TSPSolver) => number {
  // Pre-generate test instances for consistent evaluation
  const testCases = [
    { cities: generateRandomCities(20, 42), seed: 42 },
    { cities: generateRandomCities(30, 123), seed: 123 },
    { cities: generateRandomCities(50, 456), seed: 456 },
  ];

  const instances = testCases.map((tc) => createInstance(tc.cities));

  return (solver: TSPSolver): number => {
    let totalDistance = 0;

    for (const instance of instances) {
      try {
        const solution = solver(instance);
        totalDistance += solution.distance;
      } catch {
        // Penalize failed solvers heavily
        totalDistance += 10000;
      }
    }

    return totalDistance;
  };
}

async function main() {
  console.log("=".repeat(60));
  console.log("LLM-Guided TSP Solver Evolution");
  console.log("=".repeat(60));
  console.log();

  const evaluate = createEvaluator();

  const result = await iterateWithLLM(evaluate, 5);

  console.log();
  console.log("=".repeat(60));
  console.log("Evolution complete!");
  console.log("=".repeat(60));
  console.log(`Best fitness: ${result.bestFitness.toFixed(2)}`);
  console.log();
  console.log("Best solver code:");
  console.log("-".repeat(60));
  console.log(result.bestCode);
  console.log("-".repeat(60));
  console.log();
  console.log("Fitness history:");
  result.history.forEach((h, i) => {
    console.log(`  ${i + 1}. ${h.fitness.toFixed(2)}`);
  });
}

main().catch(console.error);
