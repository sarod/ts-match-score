import { TextField } from '@material-ui/core';
import React, { ChangeEvent } from 'react';

import { GraphState, isModifiable, vertexName, score100, withScore100 } from './GraphState';
import { range } from './utils';
import { colorForScore100 } from './colorForScore';

export const GraphStateTable = ({ graphState, onGraphStateChange }: {
    graphState: GraphState,
    onGraphStateChange?: (newState: GraphState) => void
}) => <table>
        <thead><tr>
            <td />
            {range(graphState.nbVertex).map((colIndex: number) => (<td key={colIndex}>{vertexName(graphState, colIndex)}</td>))}
        </tr>
        </thead>
        <tbody>
            {range(graphState.nbVertex).map((rowIndex: number) => (<tr key={rowIndex}>
                <td>{vertexName(graphState, rowIndex)}</td>
                {range(graphState.nbVertex).map((colIndex: number) => isModifiable(rowIndex, colIndex) ? (

                    <td key={colIndex}
                        style={{ backgroundColor: colorForScore100(score100(graphState, rowIndex, colIndex)) }}
                    >
                        {onGraphStateChange ?
                            (
                                <TextField
                                    inputProps={{ min: "0", max: "100", step: "5" }}
                                    type="number" value={score100(graphState, rowIndex, colIndex)} onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        const newScore = Number(e.target.value);
                                        if (!isNaN(newScore)) {
                                            onGraphStateChange(withScore100(graphState, rowIndex, colIndex, newScore));
                                        }
                                    }} />) : (<div>{Math.round(score100(graphState, rowIndex, colIndex))}</div>)}
                    </td>) : <td></td>)}
            </tr>))}
        </tbody>
    </table>