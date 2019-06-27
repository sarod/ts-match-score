import React from "react";

import { colorForScore, contrastColorForScore } from "./colorForScore";
import { round2Digits } from "./utils";

export const ScoreDisplay = ({ score }: { score: number }) => (
  <div
    style={{
      display: "inline-block",
      width: "50px",
      textAlign: "right",
      paddingRight: "8px",
      backgroundColor: colorForScore(score),
      color: contrastColorForScore(score)
    }}
  >
    {round2Digits(score)}
  </div>
);
