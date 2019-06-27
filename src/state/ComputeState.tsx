import { GraphState } from "./GraphState";
import { range } from "../utils";
export type ComputeState = {
  iterations: GraphState[];
};

export const initialState = (initialState: GraphState): ComputeState => ({
  iterations: [initialState]
});

export const computeNextComputeState = (computeState: ComputeState) => {
  const k = computeState.iterations.length - 1;
  const lastIteration = computeState.iterations[k];
  return {
    iterations: [
      ...computeState.iterations,
      computeNextIteration(lastIteration, k)
    ]
  };
};

export const needsAnotherIteration = (computeState: ComputeState) => {
  return (
    computeState.iterations.length < computeState.iterations[0].nbVertex() + 1
  );
};

// Floyd-Warshall algorithm
// https://en.wikipedia.org/wiki/Floyd–Warshall_algorithm
const computeNextIteration = (
  graphState: GraphState,
  k: number
): GraphState => {
  console.log("k (0 based): " + k);
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
