# Self-Improvement TSP Project

Experimental project for self-improving code using the Travelling Salesman Problem as a test domain.

## Stack
- TypeScript (ESM)
- Vitest for testing
- Anthropic SDK for LLM-based code generation

## Commands
- `npm test` - run tests
- `npm run benchmark` - compare solver performance
- `npm run improve` - run parameter evolution (no API key needed)
- `npm run improve:llm` - run LLM-guided evolution (requires ANTHROPIC_API_KEY)

## Structure
```
src/
├── types.ts              # Core types: City, Route, TSPInstance, TSPSolver
├── utils.ts              # Distance calc, instance creation, city generation
├── benchmark.ts          # Benchmark runner
├── improve.ts            # Parameter evolution runner
├── improveWithLLM.ts     # LLM evolution runner
├── solvers/              # TSP solver implementations
│   ├── nearestNeighbor.ts
│   └── twoOpt.ts         # Parameterized solver
├── evolution/            # Genetic algorithm for parameter tuning
│   ├── types.ts
│   └── paramEvolution.ts
└── llm/                  # LLM code generation
    └── codeGenerator.ts
```

## Two Improvement Loops

1. **Parameter Evolution** (`npm run improve`)
   - Genetic algorithm evolves parameters of parameterized solvers
   - No external dependencies

2. **LLM Code Generation** (`npm run improve:llm`)
   - Claude generates/iterates solver code
   - Evaluates against test instances, feeds results back
   - Requires `ANTHROPIC_API_KEY` in `.env`

## Adding New Solvers
1. Create solver in `src/solvers/`
2. Export from `src/solvers/index.ts`
3. Add to benchmark in `src/benchmark.ts`

## Environment
- Node 20+ (see `.nvmrc`)
- Copy `.env.example` to `.env` and add your API key
