import {
  Flex,
  Heading,
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
        <Flex className="zillpad-connectWallet">
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
              <Flex as={Text} fontSize={"16px"} flexWrap={"wrap"}>
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

export default function Mint() {
  const { allPools } = useFarmsContext();
  const [isCard, setIsCard] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const handleChangeType = (index: number) => {
    setCurrentTab(index);
  };  
  return (
    <Flex flexDirection={"column"} className="zillpad-farm">
        <Flex justifyContent="center"> {/* Thêm một Flex container để chứa iframe */}
        <iframe
          title="Embedded Website"
          src="http://127.0.0.1:5500/index.html#/mint" // Thay thế bằng URL của trang web bạn muốn nhúng
          width="120%"
          height="1000px"
        ></iframe>
      </Flex>
    </Flex>
  );
}


