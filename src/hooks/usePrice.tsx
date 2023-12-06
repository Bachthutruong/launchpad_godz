import BigNumber from "bignumber.js";
import { useChainId, useContractRead } from "wagmi";
import { readContract } from "@wagmi/core";
import useToken from "./useToken";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { useFarmsContext } from "../context/farmsContext";

type Chain = "uni" | "pancake";
const routers = {
  uni: {
    v2: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    v3: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  },
  pancake: {
    v2: "0x10ed43c718714eb63d5aa57b78b54704e256024e",
    v3: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
  },
};
export async function getReserves(contract: any) {
  return await readContract({
    address: contract,
    abi: [
      {
        constant: true,
        inputs: [],
        name: "getReserves",
        outputs: [
          { internalType: "uint112", name: "_reserve0", type: "uint112" },
          { internalType: "uint112", name: "_reserve1", type: "uint112" },
          { internalType: "uint32", name: "_blockTimestampLast", type: "uint32" },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "getReserves",
  });
}
async function getPathPrice(contract: any, amount: any, path: any[]) {
  return await readContract({
    address: contract,
    abi: [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
        ],
        name: "getAmountsIn",
        outputs: [
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "getAmountsIn",
    args: [amount, path],
  });
}
const chainLinkFeed = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
export function useETHPrice() {
  const chainId = useChainId();
  const { data: ethPrice = 1800 }: any = useContractRead({
    address: chainLinkFeed,
    abi: [
      {
        inputs: [],
        name: "latestRoundData",
        outputs: [
          { internalType: "uint80", name: "roundId", type: "uint80" },
          { internalType: "int256", name: "answer", type: "int256" },
          { internalType: "uint256", name: "startedAt", type: "uint256" },
          { internalType: "uint256", name: "updatedAt", type: "uint256" },
          { internalType: "uint80", name: "answeredInRound", type: "uint80" },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "latestRoundData",
    watch: true,
    enabled: chainId === 1 || chainId === 0x1,
  });

  return new BigNumber(ethPrice?.[1]).dividedBy(10 ** 8).toNumber() || ethPrice;
}
export function useTokenPrice(token: any, decimals = 18) {
  const { ethPrice } = useFarmsContext();
  const [price, setPrice] = useState({ price: 0, token0Price: 0, token1Price: 0 });
  const chainId = useChainId();
  const { weth } = useFarmsContext();
  const [token0, token1] = [weth, token];
  const { decimals: token0Decimal } = useToken(token0);
  const { decimals: token1Decimal } = useToken(token1);
  let type: Chain = "uni";
  if (chainId === 56 || chainId === 0x38) {
    type = "pancake";
  }
  const v2Router: any = routers[type].v2;
  useEffect(() => {
    (async () => {
      if (token === zeroAddress) return;
      try {
        const price: any = await getPathPrice(
          v2Router,
          BigInt(1) * BigInt(10 ** (decimals ?? 18)),
          [token0, token1]
        );
        const token0Price = new BigNumber(price[0].toString())
          .dividedBy(10 ** token0Decimal)
          .multipliedBy(ethPrice)
          .toNumber();
        const token1Price = new BigNumber(price[1].toString())
          .dividedBy(10 ** token0Decimal)
          .multipliedBy(ethPrice)
          .toNumber();
        setPrice({
          price: token0.toLowerCase() === token.toLowerCase() ? token1Price : token0Price,
          token0Price,
          token1Price,
        });
      } catch (error) {
        // 认定为lp token 此时需要处理判断是 v2 还是 v3
        try {
          const token0: any = await readContract({
            address: token,
            abi: [
              {
                inputs: [],
                name: "token0",
                outputs: [{ internalType: "address", name: "", type: "address" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "token0",
          });
          try {
            // is v2
            const [_reserve0, _reserve1]: any = await getReserves(token);
            const token0Amount = new BigNumber(_reserve0.toString()).dividedBy(10 ** token0Decimal);
            const token1Amount = new BigNumber(_reserve1.toString()).dividedBy(10 ** token1Decimal);
            let token0Price, token1Price;
            if (token0.toLowerCase() === weth.toLowerCase()) {
              token0Price = ethPrice;
              token1Price = new BigNumber(token0Amount)
                .dividedBy(token1Amount)
                .multipliedBy(ethPrice)
                .toNumber();
            } else {
              token0Price = new BigNumber(token1Amount)
                .dividedBy(token0Amount)
                .multipliedBy(ethPrice)
                .toNumber();
              token1Price = ethPrice;
            }
            setPrice({
              price: token0.toLowerCase() === weth.toLowerCase() ? token1Price : token0Price,
              token0Price,
              token1Price,
            });
          } catch (error) {
            // is v3
            const slot0: any = await readContract({
              address: token,
              abi: [
                {
                  inputs: [],
                  name: "slot0",
                  outputs: [
                    { internalType: "uint160", name: "sqrtPriceX96", type: "uint160" },
                    { internalType: "int24", name: "tick", type: "int24" },
                    { internalType: "uint16", name: "observationIndex", type: "uint16" },
                    { internalType: "uint16", name: "observationCardinality", type: "uint16" },
                    {
                      internalType: "uint16",
                      name: "observationCardinalityNext",
                      type: "uint16",
                    },
                    { internalType: "uint32", name: "feeProtocol", type: "uint32" },
                    { internalType: "bool", name: "unlocked", type: "bool" },
                  ],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "slot0",
            });
            if (slot0) {
              // 当没有Slot0时，可以认为是lp Token
              const sqrtPriceX96 = new BigNumber(slot0[0].toString());
              const numerator = sqrtPriceX96.dividedBy(2 ** 96).pow(2);
              const denominator = 10 ** token1Decimal / 10 ** token0Decimal;

              const token0Price = numerator
                .dividedBy(denominator)
                .multipliedBy(ethPrice)
                .toNumber();
              const token1Price = new BigNumber(1)
                .dividedBy(token0Price)
                .multipliedBy(ethPrice)
                .toNumber();
              setPrice({
                price: token0 === token ? token1Price : token0Price,
                token0Price,
                token1Price,
              });
            }
          }
        } catch (error) {
          console.log(error, "---token0Error");
        }
      }
    })();
  }, [v2Router, decimals, token, weth, token0Decimal, token0, token1, token1Decimal, ethPrice]);

  return price;
}
