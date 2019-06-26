import { GraphState, score1, withScore1 } from './GraphState';
import { range } from './utils';
export type ComputeState = {
    iterations: GraphState[];
};


export const initialState = (initialState: GraphState): ComputeState => ({
    iterations: [initialState]
})

export const computeNextComputeState = (computeState: ComputeState) => {
    const nextIterationIndex = computeState.iterations.length;
    const lastIteration = computeState.iterations[nextIterationIndex - 1];
    return {
        iterations: [...computeState.iterations, computeNextIteration(lastIteration, nextIterationIndex)]
    }
};

export const needsAnotherIteration = (computeState: ComputeState) => {
    return computeState.iterations.length < computeState.iterations[0].nbVertex
}

const computeNextIteration = (graphState: GraphState, k: number): GraphState => {
    let currentState = graphState;
    for (let i of range(currentState.nbVertex)) {
        for (let j of range(currentState.nbVertex)) {
            const ijScore = score1(currentState, i, j) || 0;
            const ikScore = score1(currentState, i, k) || 0;
            const kjScore = score1(currentState, k, j) || 0;
            const newScore = ikScore * kjScore;
            if (ijScore < newScore) {
                currentState = withScore1(currentState, i, j, newScore)
            }
        }
    }
    return currentState;
}