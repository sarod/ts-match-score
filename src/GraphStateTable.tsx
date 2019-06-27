import { TextField, Typography } from "@material-ui/core";
import React, { ChangeEvent } from "react";

import { colorForScore } from "./colorForScore";
import { GraphState, isModifiable } from "./state/GraphState";
import { range, round2Digits } from "./utils";
import { ScoreDisplay } from "./ScoreBlock";

export const GraphStateTable = ({
  graphState,
  onGraphStateChange
}: {
  graphState: GraphState;
  onGraphStateChange?: (newState: GraphState) => void;
}) => (
  <table>
    <thead>
      <tr>
        <td />
        {range(graphState.nbVertex()).map(
          (colIndex: number) =>
            colIndex >= 1 && (
              <td key={colIndex}>{graphState.vertexName(colIndex)}</td>
            )
        )}
      </tr>
    </thead>
    <tbody>
      {range(graphState.nbVertex()).map(
        (rowIndex: number) =>
          rowIndex < graphState.nbVertex() - 1 && (
            <tr key={rowIndex}>
              <td>{graphState.vertexName(rowIndex)}</td>
              {range(graphState.nbVertex()).map(
                (colIndex: number) =>
                  colIndex >= 1 &&
                  (isModifiable(rowIndex, colIndex) ? (
                    <td
                      key={colIndex}
                      style={{
                        backgroundColor: colorForScore(
                          graphState.score100(rowIndex, colIndex)
                        ),
                        width: "50px"
                      }}
                    >
                      {onGraphStateChange ? (
                        <TextField
                          inputProps={{
                            min: "0",
                            max: "100",
                            step: "5",
                            style: {
                              textAlign: "right"
                            }
                          }}
                          type="number"
                          value={graphState.score100(rowIndex, colIndex)}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const newScore = Number(e.target.value);
                            if (!isNaN(newScore)) {
                              onGraphStateChange(
                                graphState.withScore100(
                                  rowIndex,
                                  colIndex,
                                  newScore
                                )
                              );
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="subtitle1">
                          <ScoreDisplay
                            score={graphState.score100(rowIndex, colIndex)}
                          />
                        </Typography>
                      )}
                    </td>
                  ) : (
                    <td key={colIndex}></td>
                  ))
              )}
            </tr>
          )
      )}
    </tbody>
  </table>
);
