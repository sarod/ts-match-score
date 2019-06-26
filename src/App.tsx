import { Button, TextField, Typography } from '@material-ui/core';
import React, { ChangeEvent, } from 'react';

import { computeConfidenceScore, emptyGraph, GraphState } from './GraphState';
import { GraphStateTable } from './GraphStateTable';
import { range } from './utils';
import { ComputeState, initialState as createInitialComputeState, computeNextComputeState, needsAnotherIteration } from './ComputeState';
import { colorForScore1 } from './colorForScore';


export default function App() {
  const [inputState, setInputState] = React.useState<GraphState>(emptyGraph(7));
  const [delay, setDelay] = React.useState(300);
  const [computeState, setComputeState] = React.useState<ComputeState | null>(null);

  const handleCompute = () => {

    let computeState = createInitialComputeState(inputState);
    setComputeState(computeState);

    const iterate = () => {
      computeState = computeNextComputeState(computeState);
      setComputeState(computeState);

      if (needsAnotherIteration(computeState)) {
        setTimeout(iterate, delay)
      }
    }
    if (needsAnotherIteration(computeState)) {
      setTimeout(iterate, delay)
    }

  }
  return (
    <div className="App" style={{ display: 'flex' }}>
      <div>
        <Typography variant="h6">Input</Typography>
        <TextField
          label="Matrix Size"
          type="number"
          value={inputState.nbVertex}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const nbVertex = Number(e.target.value);
            if (!isNaN(nbVertex)) {
              setInputState((inputState: GraphState) => ({
                ...inputState,
                nbVertex
              }));
            }
          }}
        />

        <GraphStateTable graphState={inputState} onGraphStateChange={setInputState} />
        <ConfidenceScore confidenceScore={computeConfidenceScore(inputState)} />
      </div>

      <div>
        <Typography variant="h6">New Confidence Score</Typography>
        <div>
          <Button onClick={handleCompute} disabled={computeState ? needsAnotherIteration(computeState) : false}>Compute now</Button>
          <TextField
            label="Iteartion Delay"
            type="number"
            disabled={computeState ? needsAnotherIteration(computeState) : false}
            value={delay}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const delay = Number(e.target.value);
              if (!isNaN(delay)) {
                setDelay(delay);
              }
            }}
          />
        </div>


        {computeState && computeState.iterations.map((_, i) => {
          const reverseIndex = computeState.iterations.length - i - 1;
          const iterationState = computeState.iterations[reverseIndex];

          return (
            <div key={reverseIndex}>
              <h3>Iteration {reverseIndex}</h3>
              <GraphStateTable graphState={iterationState} />
              <ConfidenceScore confidenceScore={computeConfidenceScore(iterationState)} />
            </div>
          )
        })}

      </div>
    </div>
  );
}


const ConfidenceScore = ({ confidenceScore }: { confidenceScore: number }) => (
  <Typography variant="subtitle1" style={{ backgroundColor: colorForScore1(confidenceScore) }}>Confidence Score:  {confidenceScore}</Typography>
)