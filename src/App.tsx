import {
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography
} from "@material-ui/core";
import React, { ChangeEvent, useEffect } from "react";

import { colorForScore100 } from "./colorForScore";
import { ForceGraph } from "./graph/ForceGraph";
import { GraphStateTable } from "./GraphStateTable";
import {
  computeNextComputeState,
  ComputeState,
  initialState as createInitialComputeState,
  needsAnotherIteration
} from "./state/ComputeState";
import { GraphState } from "./state/GraphState";
import {
  autoComputeFromUrl,
  delayFromUrl,
  graphStateFromUrl
} from "./url/parseUrl";
import { synchronizeUrl } from "./url/synchronizeUrl";
import { round2Digits } from "./utils";

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
        <Typography variant="h5">Input</Typography>
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
        <ForceGraph graphState={inputState}></ForceGraph>
      </div>

      <div>
        <Typography variant="h5">New Confidence Score</Typography>
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
              <div
                key={reverseIndex}
                style={{ display: "flex", flexDirection: "row" }}
              >
                <div>
                  <Typography variant="h6">Iteration {reverseIndex}</Typography>
                  <Typography variant="subtitle1">
                    {reverseIndex === 0
                      ? "Input State"
                      : "Using paths through node " +
                        iterationState.vertexName(reverseIndex) +
                        ""}
                  </Typography>
                  <GraphStateTable graphState={iterationState} />

                  <ConfidenceScore
                    confidenceScore={iterationState.computeConfidenceScore()}
                  />
                </div>
                <div>
                  <ForceGraph graphState={iterationState} />
                </div>
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
