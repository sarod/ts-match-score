import { range } from "./utils";
import tinycolor from "tinycolor2";
const red = tinycolor("#f44335");
const green = tinycolor("#4caf50");
const hueDelta = green.toHsv().h - red.toHsv().h;
const colors = range(100).map(i => {
  const redHsv = red.toHsv();
  return tinycolor({
    ...redHsv,
    h: redHsv.h + (hueDelta * i) / 100
  }).toRgbString();
});
// console.log("colors:", colors, "hueDelta", hueDelta);
export const colorForScore = (score100: number) => {
  const rounded = Math.round(score100);
  if (rounded === 0) {
    return "";
  }
  return colors[rounded - 1];
};

export const contrastColorForScore = (score100: number) => {
  return tinycolor
    .mostReadable(colorForScore(score100), ["white", "black"])
    .toString();
};
