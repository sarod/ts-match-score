import { range } from "../utils";

// export type GraphState = {
//   nbVertex: number;
//   scoreMatrix: ScoreMatrix;
// };

export type ScoreMatrix = number[][];

export class GraphState {
  public static fromEdgeScores(hgs: EdgeScores) {
    const vertexNameSet = new Set<string>();
    Object.keys(hgs).forEach(edgeStr => {
      const [vertex1, vertex2] = parseEdge(edgeStr);
      vertexNameSet.add(vertex1);
      vertexNameSet.add(vertex2);
    });
    const vertexNames = Array.from(vertexNameSet).sort();
    type VertexIndexByName = {
      [vertexName: string]: number;
    };
    const vertexIndexByName: VertexIndexByName = vertexNames.reduce(
      (previous: VertexIndexByName, vertexName, index) => {
        previous[vertexName] = index;
        return previous;
      },
      {}
    );

    let state = new GraphState(vertexNames, []);
    Object.keys(hgs).forEach(edgeStr => {
      const [vertex1, vertex2] = parseEdge(edgeStr);
      state = state.withScore100(
        vertexIndexByName[vertex1],
        vertexIndexByName[vertex2],
        hgs[edgeStr]
      );
    });

    return state;
  }

  constructor(
    private vertexNames: string[],
    private readonly scoreMatrix: ScoreMatrix
  ) {}

  public score100(x: number, y: number): number {
    if (x === y) {
      return 100;
    }
    if (x > y) {
      return this.score100(y, x);
    }
    const row = this.scoreMatrix[x] || [];
    return row[y] || 0;
  }

  public score1(x: number, y: number): number {
    return this.score100(x, y) / 100;
  }

  public nbVertex() {
    return this.vertexNames.length;
  }

  public withNbVertex(nbVertex: number): GraphState {
    if (nbVertex < this.vertexNames.length) {
      return this.withVertexNames(this.vertexNames.slice(0, nbVertex));
    } else {
      return this.withVertexNames(range(nbVertex).map(i => letter(i)));
    }
  }
  public withVertexNames(vertexNames: string[]): GraphState {
    return new GraphState(vertexNames, this.scoreMatrix);
  }

  public vertexName(vertexIndex: number): string {
    return this.vertexNames[vertexIndex];
  }

  public withScore100(x: number, y: number, newScore: number): GraphState {
    if (x === y) {
      throw new Error("Score not modifiable");
    }
    if (x > y) {
      return this.withScore100(y, x, newScore);
    } else {
      try {
        const matrix = this.scoreMatrix;
        const newRow = [...(matrix[x] || [])];
        newRow[y] = this.normalize(newScore);
        const newScores = [...matrix];
        newScores[x] = newRow;
        return new GraphState(this.vertexNames, newScores);
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
  }

  public withResetedScores(): GraphState {
    return new GraphState(this.vertexNames, []);
  }

  public computeConfidenceScore() {
    const n = this.nbVertex();
    let confidenceScore = 0;

    for (let x of range(0, n)) {
      for (let y of range(x + 1, n)) {
        const newLocal = this.score100(x, y);
        confidenceScore += newLocal || 0;
      }
    }
    return confidenceScore / ((n * (n - 1)) / 2);
  }

  private normalize(score: number): number {
    return Math.max(Math.min(score, 100), 0);
  }

  public toEdgeScores(): EdgeScores {
    const edgeScores: EdgeScores = {};
    const n = this.nbVertex();
    for (let x of range(0, n)) {
      for (let y of range(x + 1, n)) {
        const score = this.score100(x, y);
        if (score !== 0) {
          const edgeStr = this.vertexName(x) + "-" + this.vertexName(y);
          edgeScores[edgeStr] = score;
        }
      }
    }
    return edgeScores;
  }
}

export const isModifiable = (x: number, y: number) => {
  return x < y;
};

export const emptyGraph = (nbVertex: number): GraphState => {
  const vertexNames = range(nbVertex).map(i => letter(i));
  return new GraphState(vertexNames, []);
};

export const vertexName = (
  graphState: GraphState,
  vertexIndex: number
): string => {
  return graphState.vertexName(vertexIndex);
};

const letter = (index: number) => {
  return String.fromCharCode("A".charCodeAt(0) + index);
};

type EdgeScores = {
  [edge: string]: number;
};

const parseEdge = (edge: string): [string, string] => {
  const verticesInEdge = edge.split("-");
  if (verticesInEdge.length !== 2) {
    throw new Error(
      "Invalid edge def " + edge + ". It must be of form <Node1>-<Node2>"
    );
  }
  const vertex1 = verticesInEdge[0];
  const vertex2 = verticesInEdge[1];
  if (vertex1 === vertex2) {
    throw new Error("Edge def " + edge + " uses twice the same node");
  }
  if (vertex1 < vertex2) {
    return [vertex1, vertex2];
  } else {
    return [vertex2, vertex1];
  }
};
