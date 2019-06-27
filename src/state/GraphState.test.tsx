import { GraphState } from "./GraphState";

it("computeConfidenceScore", () => {
  const graphState = GraphState.fromEdgeScores({
    "A-B": 100,
    "A-C": 100
  });

  expect(Math.round(graphState.computeConfidenceScore())).toBe(
    Math.round((100 + 100) / 3)
  );
});

it("computeConfidenceScore2", () => {
  const graphState = GraphState.fromEdgeScores({
    "A-B": 90,
    "A-C": 90,
    "A-D": 80,
    "A-E": 30,
    "B-C": 90,
    "B-D": 70,
    "C-D": 80,
    "E-F": 95,
    "E-G": 85,
    "F-G": 75
  });

  expect(Math.round(graphState.computeConfidenceScore())).toBe(
    Math.round(
      (90 + 90 + 80 + 30 + 90 + 70 + 80 + 95 + 85 + 75) / ((7 * 6) / 2)
    )
  );
});
