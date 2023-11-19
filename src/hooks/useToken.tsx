import { useCallback, useEffect, useState } from "react";
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { readContract } from "@wagmi/core";
import { zeroAddress } from "viem";
import { getReserves } from "./usePrice";
const contract: any = process.env.REACT_APP_FARMS_ADDRESS as string;
const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
export default function useToken(token?: any) {
  const { address } = useAccount();
  const [token0, setToken0] = useState("");
  const [token1, setToken1] = useState("");
  const [isLpToken, setIsLpToken] = useState(false);
  const [approveState, setApproveState] = useState("approved");
  const { data: symbol }: any = useContractRead({
    address: token,
    abi: erc20ABI,
    functionName: "symbol",
    enabled: !!token,
  });
  const { data: token0Symbol }: any = useContractRead({
    address: token0 as any,
    abi: erc20ABI,
    functionName: "symbol",
    enabled: !!token0,
  });
  const { data: token1Symbol }: any = useContractRead({
    address: token1 as any,
    abi: erc20ABI,
    functionName: "symbol",
    enabled: !!token1,
  });
  const { data: decimals }: any = useContractRead({
    address: token,
    abi: erc20ABI,
    functionName: "decimals",
    enabled: !!token,
  });
  const { data: allowance }: any = useContractRead({
    address: token,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address as any, contract],
    enabled: !!address && !!contract,
    watch: true,
  });
  const { data: balanceOf }: any = useContractRead({
    address: token,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address as any],
    enabled: !!token && !!address,
    watch: true,
  });

  useEffect(() => {
    (async () => {
      try {
        await getReserves(token);
        setIsLpToken(true);
        const token0: any = await readContract({
          address: token,
          abi: [
            {
              constant: true,
              inputs: [],
              name: "token0",
              outputs: [{ internalType: "address", name: "", type: "address" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "token0",
        });
        const token1: any = await readContract({
          address: token,
          abi: [
            {
              constant: true,
              inputs: [],
              name: "token1",
              outputs: [{ internalType: "address", name: "", type: "address" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "token1",
        });
        setToken0(token0);
        setToken1(token1);
      } catch (error) {
        setIsLpToken(false);
      }
    })();
  }, [token]);
  return {
    token0,
    token1,
    token0Symbol: token0Symbol === "WETH" ? "ETH" : token0Symbol,
    token1Symbol: token1Symbol === "WETH" ? "ETH" : token1Symbol,
    isLpToken,
    symbol: symbol === "WETH" ? "ETH" : symbol,
    decimals: decimals ?? 18,
    allowance,
    balanceOf,
    approveState,
  };
}

export function useApprove(token: any, spender = contract, amount?: any) {
  const { config } = usePrepareContractWrite({
    address: token,
    abi: erc20ABI,
    args: [spender, amount ? BigInt(amount) : maxUint256],
    functionName: "approve",
    enabled: spender !== zeroAddress,
  } as any);
  const { data, write, error, isError, isLoading } = useContractWrite(config);

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const approve = useCallback(() => {
    write?.();
  }, [write]);

  return { approve, isLoading: isLoading || isTxLoading, isSuccess: isTxSuccess, error, isError };
}
