
export const range = (x: number): number[] => {
    const items = [];
    for (let i = 0; i < x; i++) {
        items[i] = i;
    }
    return items;
}
