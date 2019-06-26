import { range } from './utils';
import tinycolor from 'tinycolor2';
const red = tinycolor("red");
const green = tinycolor("green");
const hueDelta = green.toHsv().h - red.toHsv().h;
const colors = range(100).map(i => {
    const redHsv = red.toHsv();
    return tinycolor({
        ...redHsv,
        h: redHsv.h + hueDelta * i / 100
    }).toRgbString();
});
console.log("colors:", colors, "hueDelta", hueDelta);
export const colorForScore100 = (score100: number) => {
    const rounded = Math.round(score100);
    if (rounded === 0) {
        return '';
    }
    return colors[rounded - 1];
};


export const colorForScore1 = (score1: number) => {
    return colorForScore100(score1 * 100);
};

