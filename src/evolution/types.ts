export interface Individual<T> {
  params: T;
  fitness: number;
}

export interface EvolutionConfig {
  populationSize: number;
  generations: number;
  mutationRate: number;
  eliteCount: number;
  tournamentSize: number;
}

export const defaultEvolutionConfig: EvolutionConfig = {
  populationSize: 20,
  generations: 50,
  mutationRate: 0.2,
  eliteCount: 2,
  tournamentSize: 3,
};

export interface EvolutionResult<T> {
  best: Individual<T>;
  history: { generation: number; bestFitness: number; avgFitness: number }[];
}
