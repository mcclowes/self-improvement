import Anthropic from "@anthropic-ai/sdk";
import type { TSPSolver, TSPInstance, TSPSolution } from "../types.js";
import { calculateRouteDistance } from "../utils.js";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert algorithm designer specializing in combinatorial optimization.
Your task is to generate TypeScript code for TSP (Travelling Salesman Problem) solvers.

The solver function must:
1. Accept a TSPInstance with: cities (array of {id, x, y}), distances (2D matrix)
2. Return a TSPSolution with: route (array of city ids), distance (total tour length)

Available imports you can use:
- calculateRouteDistance(route: number[], distances: number[][]): number

Respond ONLY with the function body code, no markdown, no explanation.
The code will be wrapped in: function solver(instance: TSPInstance): TSPSolution { ... }`;

interface GenerationResult {
  code: string;
  solver: TSPSolver | null;
  error?: string;
}

export async function generateSolverCode(
  feedback: string,
  previousCode?: string
): Promise<GenerationResult> {
  let prompt = feedback;

  if (previousCode) {
    prompt = `Previous solver code:\n\`\`\`typescript\n${previousCode}\n\`\`\`\n\n${feedback}\n\nGenerate improved code:`;
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return { code: "", solver: null, error: "No text response" };
  }

  const code = content.text.trim();

  // Try to compile and validate
  try {
    const solver = compileSolver(code);
    return { code, solver };
  } catch (e) {
    return {
      code,
      solver: null,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

function compileSolver(code: string): TSPSolver {
  // Create a function from the code string
  const wrappedCode = `
    const { cities, distances } = instance;
    ${code}
  `;

  const fn = new Function(
    "instance",
    "calculateRouteDistance",
    wrappedCode
  ) as (
    instance: TSPInstance,
    calcDist: typeof calculateRouteDistance
  ) => TSPSolution;

  return (instance: TSPInstance) => fn(instance, calculateRouteDistance);
}

export async function iterateWithLLM(
  evaluateFn: (solver: TSPSolver) => number,
  iterations: number = 5
): Promise<{ bestCode: string; bestFitness: number; history: { fitness: number; code: string }[] }> {
  const history: { fitness: number; code: string }[] = [];
  let bestCode = "";
  let bestFitness = Infinity;

  // Initial generation
  console.log("Generating initial solver...");
  let result = await generateSolverCode(
    "Generate a basic but effective TSP solver. Start with a greedy nearest neighbor approach, then try to improve it with local search like 2-opt."
  );

  if (result.solver) {
    const fitness = evaluateFn(result.solver);
    history.push({ fitness, code: result.code });
    bestCode = result.code;
    bestFitness = fitness;
    console.log(`Initial solver fitness: ${fitness.toFixed(2)}`);
  } else {
    console.log(`Initial generation failed: ${result.error}`);
    return { bestCode, bestFitness, history };
  }

  // Iterative improvement
  for (let i = 1; i < iterations; i++) {
    console.log(`\nIteration ${i + 1}/${iterations}`);

    const feedback = `Current best fitness: ${bestFitness.toFixed(2)} (lower is better, this is total tour distance).
Analyze the code and suggest ONE specific improvement. Focus on:
- Better local search moves (2-opt, 3-opt, or-opt)
- Smarter initialization
- Escape mechanisms for local optima
- Efficient distance calculations

Make the improvement and return the complete updated code.`;

    result = await generateSolverCode(feedback, bestCode);

    if (result.solver) {
      const fitness = evaluateFn(result.solver);
      history.push({ fitness, code: result.code });

      if (fitness < bestFitness) {
        console.log(`Improved: ${bestFitness.toFixed(2)} -> ${fitness.toFixed(2)}`);
        bestFitness = fitness;
        bestCode = result.code;
      } else {
        console.log(`No improvement: ${fitness.toFixed(2)} (best: ${bestFitness.toFixed(2)})`);
      }
    } else {
      console.log(`Generation failed: ${result.error}`);
    }
  }

  return { bestCode, bestFitness, history };
}
