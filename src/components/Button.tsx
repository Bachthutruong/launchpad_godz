import { Button } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function MyButton({ children, ...props }: any) {
  const { isConnected } = useAccount();
  return isConnected ? <Button {...props}>{children}</Button> : <ConnectButton {...props} />;
}
