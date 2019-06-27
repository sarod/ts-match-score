export { range } from "lodash";

export type SearchParams = { [param: string]: string };
export const buildQueryString = (params: SearchParams) => {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) =>
    urlParams.append(key, value)
  );
  return urlParams.toString();
};

export const replaceSearchParams = (
  href: string,
  params: SearchParams
): string => {
  const newUrl = new URL(href);
  newUrl.search = buildQueryString(params);
  return newUrl.href;
};

export const round2Digits = (number: number) => {
  return Math.round(number * 100) / 100;
};

export const alphaName = (index: number) => {
  return String.fromCharCode("A".charCodeAt(0) + index);
};
