import BigNumber from "bignumber.js";

export function formatNumber(num: string | number) {
  num = Number(num);
  if (num === Infinity) {
    return "∞";
  }
  if (num >= 1e12) {
    return (num / 1e12).toFixed(1) + "T";
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + "B";
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + "M";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + "K";
  } else {
    return new BigNumber(num.toFixed(5)).toNumber();
  }
}
