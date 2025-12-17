# Self-Improving TSP Solver

An experimental project exploring self-improving code using the Travelling Salesman Problem (TSP) as a test domain.

## Overview

This project implements two approaches to automated algorithm improvement:

1. **Parameter Evolution** - Genetic algorithm that evolves hyperparameters of existing solvers
2. **LLM Code Generation** - Claude generates and iterates on solver implementations based on benchmark feedback

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Compare solver performance
npm run benchmark

# Run parameter evolution (no API key needed)
npm run improve

# Run LLM-guided evolution (requires API key)
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run improve:llm
```

## Project Structure

```
src/
├── types.ts              # Core types
├── utils.ts              # Distance calculations, city generation
├── benchmark.ts          # Performance comparison
├── improve.ts            # Parameter evolution
├── improveWithLLM.ts     # LLM-guided evolution
├── solvers/              # TSP algorithms
├── evolution/            # Genetic algorithm
└── llm/                  # Code generation
```

## How It Works

### Parameter Evolution

The genetic algorithm evolves parameters like iteration counts and initialization strategies for the 2-opt solver:

```
Gen 0: best=1508.28, avg=1548.70
Gen 10: best=1492.29, avg=1539.61
...
Improvement: 3.96%
```

### LLM Code Generation

Claude generates solver code, evaluates it against test instances, and iteratively improves based on fitness feedback:

```
Initial solver fitness: 1600.00
Iteration 2/5: Improved: 1600.00 -> 1520.00
...
```

## Requirements

- Node.js 20+
- Anthropic API key (for LLM features)

## License

ISC
