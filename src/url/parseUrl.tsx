import { GraphState } from "../state/GraphState";
import { alphaName, range } from "../utils";

export const EDGES_PARAM = "edges";
export const graphStateFromUrl = (): GraphState => {
  const params = new URLSearchParams(window.location.search);
  if (params.has(EDGES_PARAM)) {
    try {
      return GraphState.fromEdgeScores(
        JSON.parse(params.get(EDGES_PARAM) as string)
      );
    } catch (e) {}
  }
  return GraphState.createEmpty(range(0, 7).map(alphaName));
};

export const DELAY_PARAM = "delay";
export const delayFromUrl = (): number => {
  const params = new URLSearchParams(window.location.search);
  if (params.has(DELAY_PARAM)) {
    try {
      return Number(params.get(DELAY_PARAM));
    } catch (e) {}
  }
  return 300;
};

export const AUTO_COMPUTE_PARAM = "auto";
export const autoComputeFromUrl = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  if (params.has(AUTO_COMPUTE_PARAM)) {
    return params.get(AUTO_COMPUTE_PARAM) === "true";
  }
  return false;
};
