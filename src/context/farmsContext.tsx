import { ReactNode, createContext, useCallback, useContext } from "react";
import abi from "../pools/farm.json";
import { useAccount, useChainId, useContractRead } from "wagmi";
import { writeContract } from "@wagmi/core";
import { zeroAddress } from "viem";
import { useLocation } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useETHPrice } from "../hooks/usePrice";

const duration = 3000;
const contract: any = process.env.REACT_APP_FARMS_ADDRESS as string;
const Context = createContext({});
const weths: any = {
  1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  5: "0xD849c39474fBC337624F2E53718cDd36E2B96e39",
};
export function FarmsProvider({ children }: { children: ReactNode }) {
  const chainId = useChainId();
  const ethPrice = useETHPrice();
  const weth = weths[chainId];
  const toast = useToast({
    position: "top",
  });
  const { address } = useAccount();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const inviter = queryParams.get("inviter") || zeroAddress;
  const { data: allPools = [] }: any = useContractRead({
    address: contract,
    abi,
    functionName: "getAllPool",
  });
  const { data: DAY_SECOND_NUMBER = BigInt(60) }: any = useContractRead({
    address: contract,
    abi,
    functionName: "DAY_SECOND_NUMBER",
  });
  const { data: userIDsMsg = [] }: any = useContractRead({
    address: contract,
    abi,
    functionName: "getUserIDsMsg",
    args: [address],
    enabled: !!address && address !== zeroAddress,
    watch: true,
  });
  const deposit = useCallback(async (pid: number, amount: BigInt | string, msg?: string) => {
    try {
      await writeContract({
        address: contract,
        abi,
        functionName: "deposit",
        args: [pid, amount, inviter],
      });
      toast({
        title: `Submit ${msg || "Stake"} successfully`,
        status: "success",
        duration,
      });
    } catch (error: any) {
      console.log(error, "---error");
      let msg;
      if (
        error.message.indexOf("super not super") !== -1 ||
        error.message.indexOf("zero address") !== -1
      ) {
        msg = "Staking failed: you need an inviter";
      }
      if (error.message.indexOf("TRANSFER_FAILED") !== -1) {
        msg = "Failed to collect, please try again";
      }
      if (error.message.indexOf("not white or not open") !== -1) {
        msg = "not white or not open";
      }
      if (error.message.indexOf("TRANSFER_FROM_FAILED") !== -1) {
        msg = "transfer from failed";
      }
      if (msg) {
        toast({
          title: msg,
          status: "error",
          duration,
        });
      }
    }
  }, []);
  const withdraw = useCallback(async (pid: number, ids: any[]) => {
    try {
      await writeContract({
        address: contract,
        abi,
        functionName: "withdraw",
        args: [pid, ids],
      });
      toast({
        title: "Submit Withdraw successfully",
        status: "success",
        duration,
      });
    } catch (error) {
      console.log(error, "---error");
    }
  }, []);

  const harvest = useCallback(
    async (pid: number) => {
      try {
        await deposit(pid, BigInt(0), "Harvest");
      } catch (error) {}
    },
    [deposit]
  );

  return (
    <Context.Provider
      value={{
        allPools: allPools.map((item: any, index: number) => {
          item.pid = index;
          
          return item;
        }),
        deposit,
        withdraw,
        harvest,
        userIDsMsg,
        ethPrice,
        weth,
        COLLECTION_TIME: Number(DAY_SECOND_NUMBER * BigInt(3 * 1000)),
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useFarmsContext(): any {
  return useContext(Context);
}
