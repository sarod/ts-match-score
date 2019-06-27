import {
  Button,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel
} from "@material-ui/core";
import React, { ChangeEvent, useEffect } from "react";

import { emptyGraph, GraphState } from "./state/GraphState";
import { GraphStateTable } from "./GraphStateTable";
import { SearchParams, replaceSearchParams, round2Digits } from "./utils";
import {
  ComputeState,
  initialState as createInitialComputeState,
  computeNextComputeState,
  needsAnotherIteration
} from "./state/ComputeState";
import { colorForScore100 } from "./colorForScore";

const EDGES_PARAM = "edges";
const graphStateFromUrl = (): GraphState => {
  const params = new URLSearchParams(window.location.search);
  if (params.has(EDGES_PARAM)) {
    try {
      return GraphState.fromEdgeScores(
        JSON.parse(params.get(EDGES_PARAM) as string)
      );
    } catch (e) {}
  }
  return emptyGraph(7);
};

const DELAY_PARAM = "delay";
const delayFromUrl = (): number => {
  const params = new URLSearchParams(window.location.search);
  if (params.has(DELAY_PARAM)) {
    try {
      return Number(params.get(DELAY_PARAM));
    } catch (e) {}
  }
  return 300;
};

const AUTO_COMPUTE_PARAM = "auto";
const autoComputeFromUrl = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  if (params.has(AUTO_COMPUTE_PARAM)) {
    return params.get(AUTO_COMPUTE_PARAM) === "true";
  }
  return false;
};

export default function App() {
  const [autoCompute, setAutoCompute] = React.useState(autoComputeFromUrl());
  const [inputState, setInputState] = React.useState<GraphState>(
    graphStateFromUrl()
  );
  const [toCompute, setToCompute] = React.useState<GraphState | null>(
    autoCompute ? inputState : null
  );
  const [delay, setDelay] = React.useState(delayFromUrl());
  const [computeState, setComputeState] = React.useState<ComputeState | null>(
    null
  );

  const handleAutoComputeChange = (autoCompute: boolean): void => {
    setAutoCompute(autoCompute);
    if (autoCompute) {
      setToCompute(inputState);
    }
  };

  const handleInputStateChange = (state: GraphState): void => {
    setInputState(state);
    if (autoCompute) {
      setToCompute(state);
    }
  };

  useEffect(() => {
    synchronizeUrl(delay, autoCompute, inputState);
  }, [inputState, autoCompute, delay]);

  useEffect(() => {
    if (toCompute === null) {
      return;
    }
    let computeState = createInitialComputeState(toCompute);
    setComputeState(computeState);
    let timeoutId: any;

    const iterate = () => {
      computeState = computeNextComputeState(computeState);
      setComputeState(computeState);

      if (needsAnotherIteration(computeState)) {
        timeoutId = setTimeout(iterate, delay);
      }
    };
    if (needsAnotherIteration(computeState)) {
      timeoutId = setTimeout(iterate, delay);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [toCompute, delay]);

  const handleComputeNow = () => {
    setToCompute(inputState);
  };
  return (
    <div className="App" style={{ display: "flex", height: "1vh" }}>
      <div>
        <Typography variant="h6">Input</Typography>
        <TextField
          label="Node Count"
          type="number"
          value={inputState.nbVertex()}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const nbVertex = Number(e.target.value);
            if (!isNaN(nbVertex)) {
              handleInputStateChange(inputState.withNbVertex(nbVertex));
            }
          }}
        />
        <Button
          onClick={() => {
            handleInputStateChange(inputState.withResetedScores());
          }}
        >
          Clear Scores
        </Button>

        <GraphStateTable
          graphState={inputState}
          onGraphStateChange={handleInputStateChange}
        />
        <ConfidenceScore
          confidenceScore={inputState.computeConfidenceScore()}
        />
        <pre>{JSON.stringify(inputState.toEdgeScores(), null, "  ")}</pre>
      </div>

      <div>
        <Typography variant="h6">New Confidence Score</Typography>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={autoCompute}
                onChange={(e: any, checked: boolean) => {
                  handleAutoComputeChange(checked);
                }}
              />
            }
            label="Auto Compute"
          />

          {!autoCompute && (
            <Button
              onClick={handleComputeNow}
              disabled={
                computeState ? needsAnotherIteration(computeState) : false
              }
            >
              Compute now
            </Button>
          )}
          <TextField
            label="Iteartion Delay"
            type="number"
            disabled={
              computeState ? needsAnotherIteration(computeState) : false
            }
            value={delay}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const delay = Number(e.target.value);
              if (!isNaN(delay)) {
                setDelay(delay);
              }
            }}
          />
        </div>

        {computeState &&
          computeState.iterations.map((_, i) => {
            const reverseIndex = computeState.iterations.length - i - 1;
            const iterationState = computeState.iterations[reverseIndex];

            return (
              <div key={reverseIndex}>
                <h3>
                  Iteration {reverseIndex}
                  {reverseIndex === 0 && " (Input State)"}
                </h3>
                <GraphStateTable graphState={iterationState} />
                <ConfidenceScore
                  confidenceScore={iterationState.computeConfidenceScore()}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}

const ConfidenceScore = ({ confidenceScore }: { confidenceScore: number }) => (
  <Typography variant="subtitle1">
    Confidence Score:{" "}
    <span style={{ backgroundColor: colorForScore100(confidenceScore) }}>
      {round2Digits(confidenceScore)}
    </span>
  </Typography>
);
function synchronizeUrl(
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
