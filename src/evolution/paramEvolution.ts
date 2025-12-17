import type {
  Individual,
  EvolutionConfig,
  EvolutionResult,
} from "./types.js";
import { defaultEvolutionConfig } from "./types.js";

export interface ParamRange {
  min: number;
  max: number;
  integer?: boolean;
}

export interface ParamSchema {
  [key: string]: ParamRange | string[];
}

function randomInRange(range: ParamRange): number {
  const value = range.min + Math.random() * (range.max - range.min);
  return range.integer ? Math.round(value) : value;
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function generateRandomParams<T extends Record<string, unknown>>(
  schema: ParamSchema
): T {
  const params: Record<string, unknown> = {};

  for (const [key, range] of Object.entries(schema)) {
    if (Array.isArray(range)) {
      params[key] = randomFromArray(range);
    } else {
      params[key] = randomInRange(range);
    }
  }

  return params as T;
}

function mutateParams<T extends Record<string, unknown>>(
  params: T,
  schema: ParamSchema,
  mutationRate: number
): T {
  const newParams: Record<string, unknown> = { ...params };

  for (const [key, range] of Object.entries(schema)) {
    if (Math.random() < mutationRate) {
      if (Array.isArray(range)) {
        newParams[key] = randomFromArray(range);
      } else {
        // Gaussian-ish mutation
        const current = params[key] as number;
        const spread = (range.max - range.min) * 0.2;
        let newValue = current + (Math.random() - 0.5) * 2 * spread;
        newValue = Math.max(range.min, Math.min(range.max, newValue));
        newParams[key] = range.integer ? Math.round(newValue) : newValue;
      }
    }
  }

  return newParams as T;
}

function crossover<T extends Record<string, unknown>>(
  parent1: T,
  parent2: T
): T {
  const child: Record<string, unknown> = {};

  for (const key of Object.keys(parent1)) {
    child[key] = Math.random() < 0.5 ? parent1[key] : parent2[key];
  }

  return child as T;
}

function tournamentSelect<T>(
  population: Individual<T>[],
  tournamentSize: number
): Individual<T> {
  let best: Individual<T> | null = null;

  for (let i = 0; i < tournamentSize; i++) {
    const candidate = population[Math.floor(Math.random() * population.length)]!;
    if (!best || candidate.fitness < best.fitness) {
      best = candidate;
    }
  }

  return best!;
}

export async function evolveParams<T extends Record<string, unknown>>(
  schema: ParamSchema,
  evaluate: (params: T) => Promise<number> | number,
  config: Partial<EvolutionConfig> = {}
): Promise<EvolutionResult<T>> {
  const cfg = { ...defaultEvolutionConfig, ...config };
  const history: EvolutionResult<T>["history"] = [];

  // Initialize population
  let population: Individual<T>[] = [];
  for (let i = 0; i < cfg.populationSize; i++) {
    const params = generateRandomParams<T>(schema);
    const fitness = await evaluate(params);
    population.push({ params, fitness });
  }

  population.sort((a, b) => a.fitness - b.fitness);

  for (let gen = 0; gen < cfg.generations; gen++) {
    const newPopulation: Individual<T>[] = [];

    // Elitism
    for (let i = 0; i < cfg.eliteCount; i++) {
      newPopulation.push(population[i]!);
    }

    // Breed rest of population
    while (newPopulation.length < cfg.populationSize) {
      const parent1 = tournamentSelect(population, cfg.tournamentSize);
      const parent2 = tournamentSelect(population, cfg.tournamentSize);

      let childParams = crossover(parent1.params, parent2.params);
      childParams = mutateParams(childParams, schema, cfg.mutationRate);

      const fitness = await evaluate(childParams);
      newPopulation.push({ params: childParams, fitness });
    }

    population = newPopulation.sort((a, b) => a.fitness - b.fitness);

    const avgFitness =
      population.reduce((sum, ind) => sum + ind.fitness, 0) / population.length;

    history.push({
      generation: gen,
      bestFitness: population[0]!.fitness,
      avgFitness,
    });

    // Log progress
    if (gen % 10 === 0 || gen === cfg.generations - 1) {
      console.log(
        `Gen ${gen}: best=${population[0]!.fitness.toFixed(2)}, avg=${avgFitness.toFixed(2)}`
      );
    }
  }

  return {
    best: population[0]!,
    history,
  };
}
