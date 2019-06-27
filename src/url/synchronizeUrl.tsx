import { GraphState } from "../state/GraphState";
import { replaceSearchParams, SearchParams } from "../utils";
import { AUTO_COMPUTE_PARAM, DELAY_PARAM, EDGES_PARAM } from "./parseUrl";

export function synchronizeUrl(
  delay: number,
  autoCompute: boolean,
  inputState: GraphState
) {
  const searchParams: SearchParams = {
    [DELAY_PARAM]: String(delay),
    [AUTO_COMPUTE_PARAM]: String(autoCompute),
    [EDGES_PARAM]: JSON.stringify(inputState.toEdgeScores())
  };
  const originalHref = window.location.href;
  const newHref = replaceSearchParams(originalHref, searchParams);
  if (newHref !== originalHref) {
    window.history.pushState("", "Update Params", newHref);
  }
}
