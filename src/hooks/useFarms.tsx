import { useAccount, useContractRead } from "wagmi";
import abi from "../pools/farm.json";
const contract: any = process.env.REACT_APP_FARMS_ADDRESS as string;

export function usePendingToken(pid: number) {
  const { address } = useAccount();
  const { data: pendingToken }: any = useContractRead({
    address: contract,
    abi,
    functionName: "pendingToken",
    args: [pid, address],
    enabled: !!address,
    watch: true,
  });

  return {
    pendingToken,
  };
}
export function usePoolUserInfo(pid: number) {
  const { address } = useAccount();
  const { data: userInfo }: any = useContractRead({
    address: contract,
    abi,
    functionName: "userInfo",
    args: [pid, address],
    enabled: !!address,
    watch: true,
  });
  return {
    userInfo: {
      startTime: userInfo?.[0],
      amount: userInfo?.[1],
      rewardDebt: userInfo?.[2],
    },
  };
}
export function usePoolInfo(pid: number) {
  const { data: poolInfo }: any = useContractRead({
    address: contract,
    abi,
    functionName: "poolInfo",
    args: [pid],
    enabled: pid !== undefined,
    watch: true,
  });
  return {
    token: poolInfo?.[0],
    startTime: poolInfo?.[1],
    keepTime: poolInfo?.[2],
    endTime: poolInfo?.[3],
    amountPerTime: poolInfo?.[4],
    totalEarn: poolInfo?.[5],
    totalDeposit: poolInfo?.[6],
    accTokenPerShare: poolInfo?.[7],
    lastRewardTime: poolInfo?.[8],
  };
}
