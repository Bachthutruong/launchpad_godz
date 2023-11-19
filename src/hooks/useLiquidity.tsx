import { useEffect, useState } from "react";
import { getReserves } from "./usePrice";
import { erc20ABI, useContractRead } from "wagmi";
import BigNumber from "bignumber.js";
export function useLiquidity(token: any, lpBalance: any, isLpToken: boolean, price: any) {
  const [totalLiquidity, setTotalLiquidity] = useState<number | string>(0);
  const { data: totalSupply } = useContractRead({
    address: token,
    abi: erc20ABI,
    functionName: "totalSupply",
    enabled: isLpToken,
    watch: true,
  });
  useEffect(() => {
    if (!isLpToken || !totalSupply || !price) return;
    (async () => {
      try {
        const reserves: any = await getReserves(token);
        const liquidityShare = new BigNumber(lpBalance.toString()).dividedBy(
          totalSupply.toString()
        );
        const totalToken0 = new BigNumber(reserves[0].toString());
        const totalToken1 = new BigNumber(reserves[1].toString());

        const token0Balance = liquidityShare.multipliedBy(totalToken0).dividedBy(10 ** 18);
        const token1Balance = liquidityShare.multipliedBy(totalToken1).dividedBy(10 ** 18);

        console.log(`
lpBalance: ${lpBalance.toString()} \r
liquidityShare: ${liquidityShare.toString()} \r
totalToken0: ${totalToken0.toString()} \r
totalToken1: ${totalToken1.toString()} \r
token0Balance: ${token0Balance.toString()} \r
token1Balance: ${token1Balance.toString()} \r
price: ${JSON.stringify(price, null, 2)} \r
`);
        setTotalLiquidity(
          new BigNumber(token0Balance.multipliedBy(price.token0Price))
            .plus(token1Balance.multipliedBy(price.token1Price))
            .toString()
        );
      } catch (error) {}
    })();
  }, [isLpToken, totalSupply, token, lpBalance, price]);

  return totalLiquidity;
}
