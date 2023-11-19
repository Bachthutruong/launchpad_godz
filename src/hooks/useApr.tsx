import BigNumber from "bignumber.js";

let time = 31536000;
export function useApr(price: any, amountPerTime: number, totalDeposit: number) {
  let total = totalDeposit;
  //（每区块释放的GODZ数量*GODZ价格）*(年）/（质押池的LP价值 ）
  //（每区块释放的GODZ数量*GODZ价格）*(年）/（质押池的ODZ价值 ）

  return new BigNumber(amountPerTime?.toString() ?? 0)
    .multipliedBy(price)
    .multipliedBy(time)
    .dividedBy(total)
    .dividedBy(100)
    .toFixed(2);
}
