import { ConnectButton } from "@rainbow-me/rainbowkit";
import logo from "../assets/logo.png";
import { Flex } from "@chakra-ui/react";

const list: any[] = [
  // { name: "Home", link: "/" },
  // { name: "Farms", link: "/farms" },
];
export default function Header() {
  return (
    <header className="zillpad-header">
      <Flex gap="20px">
      
        <a href="/">
          <img className="zillpad-logo" src={logo} alt="logo" />
        </a>
        
        <Flex as="ul" alignItems={"center"} gap="20px">
          {list.map((item) => (
            <Flex as="li" key={item.name}>
              <a href={item.link}>{item.name}</a>
            </Flex>
          ))}
        </Flex>
      </Flex>
      <Flex className="zillpad-connectWallet">
        <ConnectButton />
      </Flex>
    </header>
  );
}
