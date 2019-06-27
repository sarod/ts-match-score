import { GraphState } from "./GraphState";
import { range } from "../utils";
export type ComputeState = {
  iterations: GraphState[];
};

export const initialState = (initialState: GraphState): ComputeState => ({
  iterations: [initialState]
});

export const computeNextComputeState = (computeState: ComputeState) => {
  const nextIterationIndex = computeState.iterations.length;
  const lastIteration = computeState.iterations[nextIterationIndex - 1];
  return {
    iterations: [
      ...computeState.iterations,
      computeNextIteration(lastIteration, nextIterationIndex - 1)
    ]
  };
};

export const needsAnotherIteration = (computeState: ComputeState) => {
  return computeState.iterations.length < computeState.iterations[0].nbVertex();
};

// Floyd-Warshall algorithm
// https://en.wikipedia.org/wiki/Floyd–Warshall_algorithm
const computeNextIteration = (
  graphState: GraphState,
  k: number
): GraphState => {
  // Something IS WRONG!!!
  // http://localhost:3000/?delay=0&edges=%7B%22A-B%22%3A100%2C%22A-C%22%3A100%2C%22A-D%22%3A100%2C%22A-E%22%3A100%2C%22A-F%22%3A100%2C%22A-G%22%3A100%7D

  console.log("iteration" + k);
  let newState = graphState;
  for (let i of range(newState.nbVertex())) {
    for (let j of range(newState.nbVertex())) {
      const ijScore = newState.score1(i, j);
      const ikScore = newState.score1(i, k);
      const kjScore = newState.score1(k, j);
      const newScore = ikScore * kjScore;
      if (ijScore < newScore) {
        // FIXME we should not do rounding hre
        newState = newState.withScore100(i, j, newScore * 100);
      }
    }
  }
  console.log("graphState", graphState, "newGrpahState", newState);
  return newState;
};
