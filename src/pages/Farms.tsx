import {
  Flex,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Image,
  Link,
  TabList,
  Tabs,
  Tab,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tooltip,
  Checkbox,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import BigNumber from "bignumber.js";
import logo from "../assets/logo.png";
import GODZ from "../assets/GODZ.png";
import GODZETH from "../assets/GODZ-ETH.png";
import share from "../assets/share.png";
import { useFarmsContext } from "../context/farmsContext";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import useToken, { useApprove } from "../hooks/useToken";
import { usePendingToken, usePoolInfo, usePoolUserInfo } from "../hooks/useFarms";
import Button from "../components/Button";
import { useTokenPrice } from "../hooks/usePrice";
import { formatNumber } from "../libs";
import { useLiquidity } from "../hooks/useLiquidity";
import { useAccount } from "wagmi";
import { CopyToClipboard } from "react-copy-to-clipboard";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const getTokenUrl = (isLpToken = false, weth: any, token: any) => {
  if (isLpToken) {
    return `https://app.uniswap.org/add/v2/ETH/${token}`;
  }

  return `https://app.uniswap.org/swap?exactField=input&inputCurrency=${weth}&outputCurrency=${token}`;
};
const imgs: any = {
  GODZ,
  "GODZ-ETH": GODZETH,
};
const Share = () => {
  const { address } = useAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(`Share and make money together! \r\n${window.location.origin}?inviter=${address}`);
  }, [address]);

  return (
    <Tooltip className="zillpad-farm-tips" isOpen={isOpen} label="Copied!">
      <Flex
        className="zillpad-farm-item-share"
        flexDirection={"column"}
        onClick={(e: any) => {
          e.stopPropagation();
          e.preventDefault();
          onOpen();
          setTimeout(() => {
            onClose();
          }, 2000);

          return;
        }}
      >
        <Text className="title" style={{ color: "#9894B1" }}>
          <Text as={"span"} whiteSpace={"nowrap"}>
            Share
          </Text>
        </Text>
        <CopyToClipboard text={value}>
          <Image src={share} alt="share" />
        </CopyToClipboard>
      </Flex>
    </Tooltip>
  );
};
const StakedCard = ({ className, symbol, userInfo, handleStake, text, isConduct }: any) => {
  if (!userInfo?.amount && !isConduct) return null;

  return (
    <Flex flexDirection={"column"} className={classNames(["stake", className])}>
      <Text className="title" style={{ color: "#9894B1" }}>
        {symbol} <Text as={"span"}>FARMING</Text>
      </Text>
      <Flex className="zillpad-farm-item-stakeGroup">
        {userInfo?.amount && (
          <Button className="zillpad-farm-item-stakedBtn" onClick={() => handleStake(true)}>
            UnStake
          </Button>
        )}
        {isConduct && (
          <Button className="zillpad-farm-item-stakedBtn" onClick={() => handleStake(false)}>
            {text}
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
const ClaimCard = ({
  className,
  symbol,
  pendingToken,
  isLoading,
  decimals,
  harvest,
  isConduct,
}: any) => {
  if (!new BigNumber(pendingToken?.toString() ?? 0).toNumber() && !isConduct) return null;

  return (
    <Flex flexDirection={"column"} className={classNames([className])}>
      <Text className="title">
        {symbol}{" "}
        <Text as="span" style={{ marginLeft: "4px", color: "#CAC1FF" }}>
          EARNED
        </Text>
      </Text>
      <Flex justifyContent={"space-between"}>
        <Flex as={Text} className="value" alignItems={"center"}>
          {formatNumber(
            new BigNumber(pendingToken?.toString() ?? 0).div(10 ** decimals).toFixed(2)
          )}
        </Flex>
        <Flex className="zillpad-farm-item-harvestBtn">
          <Button isDisabled={!Number(pendingToken)} isLoading={isLoading} onClick={harvest}>
            Harvest
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
const TotalLiquidity = ({
  className,
  isLpToken,
  totalLiquidity,
  totalDeposit,
  decimals,
  price,
}: any) => {
  return (
    <Flex className={className} flexDirection={"column"}>
      <Text className="title">{isLpToken ? "Total Liquidity" : "Total Earned"}</Text>
      <Text className="value">
        $
        {formatNumber(
          isLpToken
            ? new BigNumber(totalLiquidity).toFixed(0)
            : new BigNumber(totalDeposit ?? 0)
                .dividedBy(10 ** decimals)
                .multipliedBy(price.price?.toString() ?? 0)
                .toFixed(0)
        )}
      </Text>
    </Flex>
  );
};
const Item = ({ item, search, style, isConduct }: any) => {
  const {
    symbol,
    decimals,
    allowance,
    balanceOf,
    isLpToken,
    token0,
    token1,
    token0Symbol,
    token1Symbol,
  } = useToken(item.token);
  const [unstakeArr, setUnstakeArr] = useState<any>([]);
  const { approve, isLoading: isApproveLoading } = useApprove(item.token);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [isUnStake, setIsUnStake] = useState(false);
  const { harvest, deposit, withdraw, userIDsMsg, COLLECTION_TIME, weth } = useFarmsContext();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const { pendingToken } = usePendingToken(item.pid);
  const { userInfo } = usePoolUserInfo(item.pid);
  const { amountPerTime, token, totalEarn, totalDeposit, endTime } = usePoolInfo(item.pid);
  const price = useTokenPrice(token, decimals);
  const totalLiquidity = useLiquidity(item.token, totalDeposit, isLpToken, price);
  const userIdsMsgForPid = userIDsMsg.filter(
    (_item: any) => Number(_item.pid) === item.pid && !_item.isTaked
  );
  const apr = new BigNumber(amountPerTime)
    .dividedBy(10 ** decimals)
    .multipliedBy(price.price)
    .multipliedBy(31536000)
    .dividedBy(
      isLpToken
        ? new BigNumber(totalLiquidity).toNumber()
        : new BigNumber(totalDeposit)
            .dividedBy(10 ** decimals)
            .multipliedBy(price.price)
            .toNumber()
    )
    .dividedBy(100)
    .toFixed(2);
  item.apr = apr;
  item.symbol = symbol;
  item.token0Symbol = token0Symbol;
  item.token1Symbol = token1Symbol;
  item.isLpToken = isLpToken;
  item.decimals = decimals;
  item.liquidity = totalDeposit;
  item.earned = totalEarn;
  const handleDeposit = async () => {
    setIsLoading(true);
    try {
      if (isUnStake) {
        await withdraw(item.pid, unstakeArr);
        setIsLoading(false);
        handleClose();

        return;
      }
      await deposit(
        item.pid,
        BigInt(new BigNumber(amount ?? 0).multipliedBy(10 ** decimals).toFixed())
      );
      setIsLoading(false);
      handleClose();
    } catch (error) {
      setIsLoading(false);
    }

    return;
  };

  const handleStake = async (isUnStake = false) => {
    setIsUnStake(isUnStake);
    if (new BigNumber(allowance?.toString() ?? 0).isGreaterThan(balanceOf?.toString() ?? 0)) {
      onOpen();
    } else {
      await approve();
    }
  };
  const isExtractable = useMemo(() => {
    if (isUnStake) {
      if (unstakeArr.length) {
        return false;
      } else {
        return true;
      }
    }

    return false;
  }, [isUnStake, unstakeArr]);
  const handleClose = () => {
    setAmount(undefined);
    setUnstakeArr([]);
    onClose();
  };
  const allChecked = userIdsMsgForPid
    .map((item: any) => item.ID)
    .every((item: any) => unstakeArr.includes(item));
  const isIndeterminate =
    userIdsMsgForPid.map((item: any) => item.ID).some((item: any) => unstakeArr.includes(item)) &&
    !allChecked;
  const name = token0Symbol && token1Symbol ? `${token0Symbol}-${token1Symbol}` : symbol;
  const text = useMemo(() => {
    if (new BigNumber(allowance?.toString() ?? 0).isGreaterThan(balanceOf?.toString() ?? 0)) {
      return `Stake Tokens`;
    }
    if (isApproveLoading) {
      return "Enableing...";
    }

    return "Enable Contract";
  }, [allowance, balanceOf, isApproveLoading]);
  const [isHarvestLoading, setIsHarvestLoading] = useState(false);
  const handleHarvest = async () => {
    setIsHarvestLoading(true);
    try {
      await harvest(item.pid);
      setIsHarvestLoading(false);
    } catch (error) {
      setIsHarvestLoading(false);
    }
  };

  return (
    <>
      <AccordionItem
        className={classNames([
          "zillpad-farm-item",
          search && name.toLowerCase().indexOf(search.toLowerCase()) === -1 && "hide",
        ])}
        style={style}
      >
        <AccordionButton as={Flex} className="zillpad-farm-item-button">
          <Flex className="zillpad-farm-item-info">
            <Image className="zillpad-farm-item-logo" src={imgs[name] || logo} alt={name} />
            <Flex flexDirection={"column"}>
              <Text className="zillpad-farm-item-name">{name}</Text>
              <Flex as={Text} fontSize={"3xl"} flexWrap={"wrap"}>
                <Text as="span">Pledge time:</Text>{" "}
                <Text as="span">{dayjs.duration(Number(item.keepTime) * 1000).asDays()} days</Text>
              </Flex>
            </Flex>
          </Flex>
          <Flex
            flexDirection={"column"}
            className="zillpad-farm-item-earned"
            alignItems={"flex-start"}
          >
            <Text className="title">Earned</Text>
            <Text className="value">
              {formatNumber(
                new BigNumber(userInfo.amount ?? 0).dividedBy(10 ** decimals).toNumber()
              )}
            </Text>
          </Flex>
          <Flex
            flexDirection={"column"}
            className="zillpad-farm-item-apr"
            alignItems={"flex-start"}
          >
            <Text className="title">APR</Text>
            <Text className="value">{formatNumber(apr)}%</Text>
          </Flex>
          <TotalLiquidity
            className="zillpad-farm-item-liquidity"
            isLpToken={isLpToken}
            totalLiquidity={totalLiquidity}
            totalDeposit={totalDeposit}
            decimals={decimals}
            price={price}
          />
          <Flex className="zillpad-farm-item-cardAction">
            <ClaimCard
              symbol={name}
              pendingToken={pendingToken}
              decimals={decimals}
              harvest={handleHarvest}
              isLoading={isHarvestLoading}
              isConduct={isConduct}
            />
            <StakedCard
              symbol={name}
              userInfo={userInfo}
              handleStake={handleStake}
              text={text}
              isConduct={isConduct}
            />
          </Flex>
          <Flex alignItems={"center"} as="span" className="value zillpad-farm-item-expanded">
            <Text>
              <span className="zillpad-farm-item-details">Details</span>
              <span className="zillpad-farm-item-hide">Hide</span>
            </Text>
            <AccordionIcon />
          </Flex>
          <Share />
        </AccordionButton>
        <Flex as={AccordionPanel} className="zillpad-farm-item-panel" alignItems={"center"}>
          <TotalLiquidity
            className="zillpad-farm-item-panel-liquidity"
            totalLiquidity={totalLiquidity}
            totalDeposit={totalDeposit}
            decimals={decimals}
            price={price}
          />
          <Flex flexDirection={"column"} className="zillpad-farm-item-links">
            <Link
              href={getTokenUrl(
                isLpToken,
                weth,
                isLpToken
                  ? token0.toLowerCase() === weth.toLowerCase()
                    ? token1
                    : token0
                  : item.token
              )}
              target="_blank"
            >
              Get {name}
            </Link>
            <Link
              href={`${process.env.REACT_APP_EXPLORER_URL}/address/${item.token}`}
              target="_blank"
              whiteSpace={"nowrap"}
            >
              VIEW CONTRACT
            </Link>
          </Flex>
          <ClaimCard
            symbol={name}
            pendingToken={pendingToken}
            decimals={decimals}
            harvest={handleHarvest}
            className="zillpad-farm-item-panel-card"
            isLoading={isHarvestLoading}
            isConduct={isConduct}
          />
          <StakedCard
            className="zillpad-farm-item-panel-card"
            symbol={name}
            userInfo={userInfo}
            isConduct={isConduct}
            handleStake={handleStake}
            text={text}
          />
        </Flex>
      </AccordionItem>
      <Modal isOpen={isOpen} onClose={handleClose} isCentered size="4xl">
        <ModalOverlay />
        <ModalContent className="zillpad-farm-modal-content">
          <ModalHeader className="zillpad-farm-modal-header">
            {isUnStake && "Un"}Stake Tokens
          </ModalHeader>
          <ModalCloseButton className="zillpad-farm-modal-close" />
          <ModalBody className="zillpad-farm-modal-body">
            {!isUnStake ? (
              <Flex flexDirection={"column"} className="zillpad-farm-modal-stakeInput">
                <Flex justifyContent={"space-between"}>
                  Stake
                  <Flex>
                    Balance:{" "}
                    {new BigNumber(balanceOf?.toString() ?? 0).div(10 ** decimals).toFixed(2)}
                  </Flex>
                </Flex>
                <Flex className="zillpad-farm-modal-stakeInput-box">
                  <Input
                    value={amount}
                    placeholder="0"
                    onChange={(e: any) => setAmount(e.target.value)}
                    variant={"unstyled"}
                  />
                  <Button
                    fontSize="3xl"
                    onClick={() => {
                      setAmount(
                        new BigNumber(
                          (isUnStake ? userInfo?.amount.toString() : balanceOf?.toString()) ?? 0
                        )
                          .div(10 ** decimals)
                          .toNumber()
                      );
                    }}
                  >
                    Max
                  </Button>
                  {name}
                </Flex>
              </Flex>
            ) : (
              <>
                <Checkbox
                  className="zillpad-farm-modal-allChecked"
                  isChecked={allChecked}
                  isIndeterminate={isIndeterminate}
                  onChange={(e) => {
                    setUnstakeArr(
                      e.target.checked
                        ? userIdsMsgForPid
                            .filter((_item: any) => {
                              const extractableTime =
                                Number(_item.depositTime + item.keepTime) * 1000;

                              return (
                                Date.now() >= Number(endTime) * 1000 ||
                                (Date.now() >= extractableTime &&
                                  Date.now() <= extractableTime + COLLECTION_TIME)
                              );
                            })
                            .map((item: any) => item.ID)
                        : []
                    );
                  }}
                >
                  All Checkbox
                </Checkbox>
                <Flex flexDirection={"column"} className="zillpad-farm-modal-body-unstake">
                  {userIdsMsgForPid.map((_item: any, index: any) => {
                    const extractableTime = Number(_item.depositTime + item.keepTime) * 1000;
                    const _endTime = Number(endTime * BigInt(1000));
                    
                    return (
                      <Checkbox
                        isDisabled={
                          !(
                            Date.now() >= Number(endTime) * 1000 ||
                            (Date.now() >= extractableTime &&
                              Date.now() <= extractableTime + COLLECTION_TIME)
                          )
                        }
                        key={`${_item.ID}_${index}`}
                        value={`${_item.ID}_${index}`}
                        className="zillpad-farm-modal-unstake"
                        isChecked={unstakeArr.includes(_item.ID)}
                        onChange={() => {
                          if (unstakeArr.includes(_item.ID)) {
                            setUnstakeArr(unstakeArr.filter((item: any) => item !== _item.ID));
                          } else {
                            setUnstakeArr([...unstakeArr, _item.ID]);
                          }
                        }}
                      >
                        <Flex
                          justifyContent={"space-between"}
                          flexDirection={"column"}
                          width={"full"}
                          style={{ borderBottom: "1px solid #000" }}
                        >
                          <Flex alignItems={"center"}>ID: {_item.ID.toString()}</Flex>
                          <Flex justifyContent={"center"} flexDirection={"column"}>
                            <Text>
                              Staked Time:{" "}
                              {dayjs(Number(_item.depositTime * BigInt(1000))).format(
                                "MM/DD/YYYY hh:mm:ss A"
                              )}
                            </Text>
                            <Text>
                              Extractable Time:{" "}
                              {dayjs(
                                extractableTime > _endTime ? _endTime : extractableTime
                              ).format("MM/DD/YYYY hh:mm:ss A")}
                            </Text>
                          </Flex>
                          <Flex alignItems={"center"}>
                            Amount:{" "}
                            {formatNumber(
                              new BigNumber(_item.amount.toString())
                                .dividedBy(10 ** decimals)
                                .toNumber()
                            )}{" "}
                            {name}
                          </Flex>
                        </Flex>
                      </Checkbox>
                    );
                  })}
                </Flex>
              </>
            )}
            {!new BigNumber((isUnStake ? userInfo?.amount.toString() : balanceOf?.toString()) ?? 0)
              .div(10 ** decimals)
              .toNumber() && (
              <Flex className="zillpad-farm-modal-no-tokens">
                No tokens to stake: <a href="https://app.uniswap.app">Get {name}</a>
              </Flex>
            )}
            {isUnStake ? null : (
              <>
                <Flex className="zillpad-farm-modal-rates" justifyContent={"space-between"}>
                  <Text>Pledge time:</Text>{" "}
                  <Text>{dayjs.duration(Number(item.keepTime) * 1000).asDays()} days</Text>
                </Flex>
                {/* <Flex className="zillpad-farm-modal-rates" justifyContent={"space-between"}>
                  After the current pledge is successful, it will enter a lock-up period{" "}
                  {dayjs(Date.now() + Number(item.keepTime) * 1000).fromNow()}. After the lock-up
                  period ends, the principal can be withdrawn. Estimated unlock time:
                  {dayjs(Date.now() + Number(item.keepTime) * 1000).format("MM/DD/YYYY hh:mm:ss A")}
                </Flex> */}
              </>
            )}
          </ModalBody>
          <ModalFooter className="zillpad-farm-modal-footer">
            <Flex flexDirection={"column"} className="zillpad-farm-modal-container">
              <Flex className="zillpad-farm-modal-footer-buttons">
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleDeposit} isDisabled={isExtractable} isLoading={isLoading}>
                  Confirm
                </Button>
              </Flex>
              <a
                href={getTokenUrl(
                  isLpToken,
                  weth,
                  isLpToken
                    ? token0.toLowerCase() === weth.toLowerCase()
                      ? token1
                      : token0
                    : item.token
                )}
              >
                Get {name}
              </a>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default function Farms() {
  const { allPools } = useFarmsContext();
  const [isCard, setIsCard] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const handleChangeType = (index: number) => {
    setCurrentTab(index);
  };
  console.log(allPools, "-allPools");
  
  return (
    <Flex flexDirection={"column"} className="zillpad-farm">
         <Flex flexDirection={"column"} className="zillpad-farm-container">
         <Flex alignItems={"center"} className="zillpad-farm-header">
          <Flex className="zillpad-farm-header-left" alignItems={"center"}>
            <Flex className="zillpad-farm-header-styleType">
              <svg
                viewBox="0 0 24 24"
                width="20px"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => setIsCard(true)}
                className={classNames([isCard && "active"])}
              >
                <path d="M4.5 12H7.5C8.05 12 8.5 11.55 8.5 11V7C8.5 6.45 8.05 6 7.5 6H4.5C3.95 6 3.5 6.45 3.5 7V11C3.5 11.55 3.95 12 4.5 12ZM4.5 19H7.5C8.05 19 8.5 18.55 8.5 18V14C8.5 13.45 8.05 13 7.5 13H4.5C3.95 13 3.5 13.45 3.5 14V18C3.5 18.55 3.95 19 4.5 19ZM10.5 19H13.5C14.05 19 14.5 18.55 14.5 18V14C14.5 13.45 14.05 13 13.5 13H10.5C9.95 13 9.5 13.45 9.5 14V18C9.5 18.55 9.95 19 10.5 19ZM16.5 19H19.5C20.05 19 20.5 18.55 20.5 18V14C20.5 13.45 20.05 13 19.5 13H16.5C15.95 13 15.5 13.45 15.5 14V18C15.5 18.55 15.95 19 16.5 19ZM10.5 12H13.5C14.05 12 14.5 11.55 14.5 11V7C14.5 6.45 14.05 6 13.5 6H10.5C9.95 6 9.5 6.45 9.5 7V11C9.5 11.55 9.95 12 10.5 12ZM15.5 7V11C15.5 11.55 15.95 12 16.5 12H19.5C20.05 12 20.5 11.55 20.5 11V7C20.5 6.45 20.05 6 19.5 6H16.5C15.95 6 15.5 6.45 15.5 7Z"></path>
              </svg>
              <svg
                viewBox="0 0 24 24"
                width="20px"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => setIsCard(false)}
                className={classNames([!isCard && "active"])}
              >
                <path d="M4.5 14H6.5C7.05 14 7.5 13.55 7.5 13V11C7.5 10.45 7.05 10 6.5 10H4.5C3.95 10 3.5 10.45 3.5 11V13C3.5 13.55 3.95 14 4.5 14ZM4.5 19H6.5C7.05 19 7.5 18.55 7.5 18V16C7.5 15.45 7.05 15 6.5 15H4.5C3.95 15 3.5 15.45 3.5 16V18C3.5 18.55 3.95 19 4.5 19ZM4.5 9H6.5C7.05 9 7.5 8.55 7.5 8V6C7.5 5.45 7.05 5 6.5 5H4.5C3.95 5 3.5 5.45 3.5 6V8C3.5 8.55 3.95 9 4.5 9ZM9.5 14H19.5C20.05 14 20.5 13.55 20.5 13V11C20.5 10.45 20.05 10 19.5 10H9.5C8.95 10 8.5 10.45 8.5 11V13C8.5 13.55 8.95 14 9.5 14ZM9.5 19H19.5C20.05 19 20.5 18.55 20.5 18V16C20.5 15.45 20.05 15 19.5 15H9.5C8.95 15 8.5 15.45 8.5 16V18C8.5 18.55 8.95 19 9.5 19ZM8.5 6V8C8.5 8.55 8.95 9 9.5 9H19.5C20.05 9 20.5 8.55 20.5 8V6C20.5 5.45 20.05 5 19.5 5H9.5C8.95 5 8.5 5.45 8.5 6Z"></path>
              </svg>
            </Flex>
            <Tabs
              variant="soft-rounded"
              className="zillpad-farm-header-tabs"
              onChange={handleChangeType}
            >
              <TabList className="zillpad-farm-header-tabList">
                <Tab>Conduct</Tab>
                <Tab>Expired</Tab>
              </TabList>
            </Tabs>
            
          </Flex>
          <Flex className="zillpad-connectWallet">
              <ConnectButton />
          </Flex>
          {/* <Flex className="zillpad-farm-header-right">
            <FormControl className="zillpad-farm-header-minetype">
              <FormLabel>SEARCH</FormLabel>
              <Select placeholder="All" onChange={(e: any) => setSort(e.target.value)}>
                {sortList.map((item: any, index: number) => (
                  <option key={index} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl className="zillpad-farm-header-search">
              <FormLabel>SEARCH</FormLabel>
              <Input value={search} onChange={(e: any) => setSearch(e.target.value)} />
            </FormControl>
          </Flex> */}
        </Flex>
        <Accordion
          allowMultiple
          className={classNames(["zillpad-farm-list", isCard && "zillpad-farm-card"])}
        >
          {allPools.map((item: any) => (
            <Item
              item={item}
              key={`${item.name}_${item.token}_${item.pid}`}
              isConduct={currentTab === 0}
              style={{
                display:
                  currentTab === 0
                    ? Date.now() < Number(item.endTime) * 1000
                      ? "block"
                      : "none"
                    : Date.now() > Number(item.endTime) * 1000
                    ? "block"
                    : "none",
              }}
            />
          ))}
        </Accordion>
      </Flex>
    </Flex>
  );
}

