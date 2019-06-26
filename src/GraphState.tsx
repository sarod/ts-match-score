import { range } from "./utils";

export type GraphState = {
    nbVertex: number;
    scoreMatrix: ScoreMatrix;
};
export type ScoreMatrix = number[][];
export const score1 = (graphState: GraphState, x: number, y: number): number => {
    const s = score100(graphState, y, x);
    return s ? s / 100 : s;
};

export const score100 = (graphState: GraphState, x: number, y: number): number => {
    if (x === y) {
        return 100;
    }
    if (x > y) {
        return score100(graphState, y, x);
    }
    const row = graphState.scoreMatrix[x] || [];
    return row[y] || 0;
};

export const isModifiable = (x: number, y: number) => {
    return x < y;
};
export const withScore100 = (
    graphState: GraphState,
    x: number,
    y: number,
    newScore: number
): GraphState => {
    if (isModifiable(x, y)) {
        try {
            const matrix = graphState.scoreMatrix;
            const newRow = [...(matrix[x] || [])];
            newRow[y] = newScore;
            const newMatrix = [...matrix];
            newMatrix[x] = newRow;
            return {
                ...graphState,
                scoreMatrix: newMatrix
            };
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
    return graphState;
};

export const withScore1 = (
    graphState: GraphState,
    x: number,
    y: number,
    newScore: number
): GraphState => {
    return withScore100(graphState, x, y, newScore ? newScore * 100 : newScore)
};


export const emptyGraph = (nbVertex: number): GraphState => {
    return { nbVertex, scoreMatrix: [] };
}

export const computeConfidenceScore = (graphState: GraphState) => {
    const n = graphState.nbVertex;
    let confidenceScore = 0
    for (let x of range(n)) {
        for (let y of range(x)) {
            const newLocal = newFunction(graphState, x, y);
            confidenceScore += newLocal || 0;
        }
    }
    return confidenceScore / ((n * n - 1) / 2);
}


export const vertexName = (graphState: GraphState, vertexIndex: number): string => {
    return String.fromCharCode("A".charCodeAt(0) + vertexIndex);
};

function newFunction(graphState: GraphState, x: number, y: number) {
    return score1(graphState, x, y);
}
