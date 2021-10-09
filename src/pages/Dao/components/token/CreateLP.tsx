import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Form,
  Spin,
  Input,
  Space,
  Alert,
  Select,
  Radio,
  InputNumber,
  Button,
  Descriptions,
  Skeleton,
} from 'antd';
import { request, useIntl } from 'umi';
import { useModel } from '@@/plugin-model/useModel';
import type { TokenConfigComponentsProps } from '@/pages/Dao/components/TokenConfig';
import { getMetamaskProvider, ZeroAddress } from '@/services/ethereum-connect';
import { EthereumChainId } from '@/utils/utils';
import Web3 from 'web3';
import { ERC20Connect } from '@/services/ethereum-connect/erc20';
import styles from './index.less';
import GlobalModal from '@/components/Modal';
import type { Currency } from '@uniswap/sdk-core';
import { CurrencyAmount, Token, WETH9 } from '@uniswap/sdk-core';
import {
  Bound,
  currencyId,
  Field,
  formatTickPrice,
  PoolState,
  useUniswap,
  WETH9_EXTENDED,
} from '@/pages/Dao/hooks/useUniswap';
import type { Pool } from '@uniswap/v3-sdk';
import { FeeAmount } from '@uniswap/v3-sdk';
import { BigNumber } from 'ethers';
import JSBI from 'jsbi';
import { FormattedMessage } from '@@/plugin-locale/localeExports';
import { ETH_CONNECT } from '@/services/ethereum-connect/typings';
import IconFont from '@/components/IconFont';

type TokenToSelect = {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
};

type TokenToSelects = {
  logoURI: string;
  name: string;
  timestamp: string;
  tokens: TokenToSelect[];
  version: {
    major: number;
    minor: number;
    patch: number;
  };
};

const getCoinGecko = async (network: string) => {
  const compoundTokenList: TokenToSelects = await request(
    'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
  );
  const chainId = EthereumChainId[network];
  const weth9 = WETH9[chainId];
  const quoteTokens: Record<string, Token> = { [weth9.address]: weth9 };
  compoundTokenList.tokens.forEach((t) => {
    if (t.chainId === chainId) {
      quoteTokens[t.address] = new Token(t.chainId, t.address, t.decimals, t.symbol, t.name);
    }
  });
  return quoteTokens;
};

const TokenCreateLP: React.FC<TokenConfigComponentsProps> = ({
  tokenAddress,
  lpPoolAddress,
  setLPPoolAddress,
  tokenContract,
}) => {
  const intl = useIntl();

  const { metamaskProvider, network, contract, account, chainId } = useModel('useWalletModel');

  // -------- help state
  const [loadingTransferComplete, setLoadingTransferComplete] = useState<boolean>(false);
  const [advancedOP, setAdvancedOP] = useState<boolean>(false);
  const [quoteTokenSelectLoading, setQuoteTokenSelectLoading] = useState<boolean>(false);
  const [approveQuoteTokenButtonLoading, setApproveQuoteTokenButtonLoading] =
    useState<boolean>(false);
  const [approvedQuoteToken, setApprovedQuoteToken] = useState<boolean>(false);

  const [coinGeckoObj, setCoinGeckoObj] = useState<Record<string, Token>>({});
  const [currentSearchQuoteToken, setCurrentSearchQuoteToken] = useState<Token[]>([]);
  const [previewCreateLP, setPreviewCreateLP] = useState<boolean>(false);
  const [createLPButtonLoading, setCreateLPButtonLoading] = useState<boolean>(false);

  // --------- data stream
  const [baseCurrency, setBaseCurrency] = useState<Currency>();
  const [quoteCurrency, setQuoteCurrency] = useState<Currency>();
  const [maxBaseTokenAmount, setMaxBaseTokenAmount] = useState<CurrencyAmount<Currency>>();
  const [maxQuoteTokenAmount, setMaxQuoteTokenAmount] = useState<CurrencyAmount<Currency>>();
  const [feeAmount, setFeeAmount] = useState<FeeAmount>();
  useEffect(() => {
    if (!baseCurrency) return;
    tokenContract?.getTemporaryAmount().then((value) => {
      if (!baseCurrency) return;
      const amount = value ? JSBI.BigInt(value.toString()) : undefined;
      if (amount) {
        setMaxBaseTokenAmount(CurrencyAmount.fromRawAmount(baseCurrency, amount));
      }
    });
  }, [baseCurrency, tokenContract]);

  const quoteTokenRecord = useMemo(() => {
    if (!currentSearchQuoteToken || currentSearchQuoteToken.length === 0) return coinGeckoObj;
    const currentSearchQuoteTokenObj: Record<string, Token> = {};
    currentSearchQuoteToken.forEach((csqt) => {
      currentSearchQuoteTokenObj[csqt?.address || ''] = csqt;
    });
    return {
      ...coinGeckoObj,
      ...currentSearchQuoteTokenObj,
    };
  }, [coinGeckoObj, currentSearchQuoteToken]);

  useEffect(() => {
    getCoinGecko(network).then((v) => {
      setCoinGeckoObj(v);
      setCurrentSearchQuoteToken(Object.values(v));
    });
  }, [network]);

  useEffect(() => {
    if (!quoteCurrency || !account) return;
    const currencyIdNew = currencyId(quoteCurrency);
    if (
      currencyIdNew === 'ETH' ||
      quoteCurrency.wrapped.address === WETH9[EthereumChainId[network]].address
    ) {
      getMetamaskProvider(metamaskProvider)
        ?.getBalance(account)
        .then((ethBalance: BigNumber) => {
          const amount = ethBalance ? JSBI.BigInt(ethBalance.toString()) : undefined;
          if (amount && quoteCurrency) {
            setMaxQuoteTokenAmount(CurrencyAmount.fromRawAmount(quoteCurrency, amount));
          }
        });
      return;
    }
    const quoteTokenContract = new ERC20Connect(
      quoteCurrency.wrapped.address,
      network,
      metamaskProvider,
    );
    quoteTokenContract.getBalanceOf(account).then((value) => {
      const amount = value ? JSBI.BigInt(value.toString()) : undefined;
      if (amount && quoteCurrency) {
        setMaxQuoteTokenAmount(CurrencyAmount.fromRawAmount(quoteCurrency, amount));
      }
    });
  }, [account, quoteCurrency, metamaskProvider, network, quoteTokenRecord]);

  const balances: (CurrencyAmount<Currency> | undefined)[] = useMemo(() => {
    return [maxBaseTokenAmount, maxQuoteTokenAmount];
  }, [maxBaseTokenAmount, maxQuoteTokenAmount]);

  const transformed: [Token, Token, FeeAmount] | null = useMemo(() => {
    if (!chainId || !baseCurrency || !quoteCurrency || !feeAmount) return null;
    const ta = baseCurrency?.wrapped;
    const tb = quoteCurrency?.wrapped;
    if (!ta || !tb || ta.equals(tb)) return null;
    const [token0, token1] = ta.sortsBefore(tb) ? [ta, tb] : [tb, ta];
    return [token0, token1, feeAmount];
  }, [chainId, feeAmount, baseCurrency, quoteCurrency]);

  const [poolInfo, setPoolInfo] = useState<[PoolState, Pool | null]>();

  useEffect(() => {
    if (!transformed || !transformed[0] || !transformed[1] || !transformed[2]) {
      setPoolInfo([PoolState.INVALID, null]);
      return;
    }
    contract.uniswapPool
      .getPool(transformed[0], transformed[1], transformed[2])
      .then(({ pool: pl, sqrtPriceX96 }) => {
        if (!pl || !sqrtPriceX96 || sqrtPriceX96.eq(0)) {
          setPoolInfo([PoolState.NOT_EXISTS, null]);
          return;
        }
        setPoolInfo([PoolState.EXISTS, pl]);
      });
  }, [contract.uniswapPool, transformed]);

  const [inputState, setInputState] =
    useState<{ field: Field; typedValue: string; noLiquidity: boolean }>();
  const [leftRangeState, setLeftRangeState] = useState<string | true>(true);
  const [rightRangeState, setRightRangeState] = useState<string | true>(true);
  const [startPriceState, setStartPriceState] = useState<string>();

  const {
    price,
    position,
    noLiquidity,
    currencies,
    invalidPool,
    invalidRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
    onFieldAInput,
    onFieldBInput,
    onLeftRangeInput,
    onRightRangeInput,
    onStartPriceInput,
    leftPrice,
    rightPrice,
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
    formattedAmounts,
    maxAmounts,
    isSorted,
    priceLower,
    priceUpper,
    tickLower,
    tickUpper,
  } = useUniswap(
    { inputState, leftRangeState, rightRangeState, startPriceState },
    { setInputState, setLeftRangeState, setRightRangeState, setStartPriceState },
    balances,
    poolInfo,
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    undefined,
  );

  // select token common function
  const handleCurrencySelect = useCallback(
    (currencyNew: Currency, currencyIdOther?: string): (string | undefined)[] => {
      const currencyIdNew = currencyId(currencyNew);

      if (currencyIdNew === currencyIdOther) {
        // not ideal, but for now clobber the other if the currency ids are equal
        return [currencyIdNew, undefined];
      }
      // prevent weth + eth
      const isETHOrWETHNew =
        currencyIdNew === 'ETH' ||
        (chainId !== undefined && currencyIdNew === WETH9_EXTENDED[chainId]?.address);
      const isETHOrWETHOther =
        currencyIdOther !== undefined &&
        (currencyIdOther === 'ETH' ||
          (chainId !== undefined && currencyIdOther === WETH9_EXTENDED[chainId]?.address));

      if (isETHOrWETHNew && isETHOrWETHOther) {
        return [currencyIdNew, undefined];
      }
      return [currencyIdNew, currencyIdOther];
    },
    [chainId],
  );

  // select quote token function
  const handleCurrencyBSelect = useCallback(
    (currencyBNew: Currency) => {
      handleCurrencySelect(currencyBNew, tokenAddress);
      setQuoteCurrency(currencyBNew);
      setFeeAmount(undefined);
    },
    [handleCurrencySelect, tokenAddress],
  );

  // select fee function
  const handleFeePoolSelect = useCallback(
    (newFeeAmount: FeeAmount) => {
      onLeftRangeInput('');
      onRightRangeInput('');
      setFeeAmount(newFeeAmount);
    },
    [onLeftRangeInput, onRightRangeInput],
  );

  useEffect(() => {
    if (tokenContract) {
      tokenContract.getToken().then((baseToken) => {
        setBaseCurrency(baseToken);
      });
    }
  }, [tokenContract]);

  useEffect(() => {
    if (!quoteCurrency || !account || !tokenAddress) return;
    if (
      quoteCurrency.isNative ||
      quoteCurrency.wrapped.address === WETH9[EthereumChainId[network]].address
    ) {
      setApprovedQuoteToken(true);
      return;
    }
    const quoteTokenContract = new ERC20Connect(
      quoteCurrency.wrapped.address,
      network,
      metamaskProvider,
    );
    quoteTokenContract.getAllowance(account, tokenAddress).then((allowance: BigNumber) => {
      if (parseFloat(formattedAmounts[Field.CURRENCY_B] || '0') < 1) {
        setApprovedQuoteToken(BigNumber.from(1).lte(allowance));
        return;
      }
      setApprovedQuoteToken(BigNumber.from(formattedAmounts[Field.CURRENCY_B]).lte(allowance));
    });
  }, [
    account,
    quoteCurrency,
    formattedAmounts,
    metamaskProvider,
    network,
    quoteTokenRecord,
    tokenAddress,
  ]);

  const handlerApprovedQuoteToken = useCallback(async () => {
    if (!quoteCurrency || !account || !tokenAddress) return;
    try {
      const quoteTokenContract = new ERC20Connect(
        quoteCurrency.wrapped.address,
        network,
        metamaskProvider,
      );
      const tx = await quoteTokenContract?.approve(tokenAddress);
      if (!tx) return;
      setApproveQuoteTokenButtonLoading(true);
      const receipt = await tx.wait();
      const deployEvent = receipt.events.pop();
      setApproveQuoteTokenButtonLoading(false);
      setApprovedQuoteToken(true);
      console.log(deployEvent.args);
    } catch (e) {
      setApproveQuoteTokenButtonLoading(false);
    }
  }, [account, quoteCurrency, metamaskProvider, network, tokenAddress]);

  const handlerCreateLPPool = useCallback(async () => {
    console.log({ network, account, position });
    if (!tokenContract) return;
    if (!network || !account) return;
    if (!position) return;

    const createLPPool: ETH_CONNECT.CreateLPPool = {
      baseTokenAmount: invertPrice
        ? position.mintAmounts.amount1.toString()
        : position.mintAmounts.amount0.toString(),
      quoteTokenAddress: invertPrice ? position.pool.token0.address : position.pool.token1.address,
      quoteTokenAmount: invertPrice
        ? position.mintAmounts.amount0.toString()
        : position.mintAmounts.amount1.toString(),
      fee: position.pool.fee,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      sqrtPriceX96: position.pool.sqrtRatioX96.toString(),
    };
    console.log({ createLPPool });
    try {
      setCreateLPButtonLoading(true);
      const tx = await tokenContract?.createLPPoolOrLinkLPPool(createLPPool);
      setCreateLPButtonLoading(false);

      setPreviewCreateLP(false);
      setLoadingTransferComplete(true);
      const deployEvent = (await tx.wait()).events.pop();
      setLoadingTransferComplete(false);
      console.log(deployEvent.args);
      if (setLPPoolAddress) setLPPoolAddress(deployEvent.args[deployEvent.args.length - 1]);
    } catch (e) {
      setCreateLPButtonLoading(false);
      setLoadingTransferComplete(false);
    }
  }, [account, invertPrice, network, position, setLPPoolAddress, tokenContract]);

  const handlerQuoteTokenSearch = useCallback(
    async (value) => {
      if (!value) {
        setCurrentSearchQuoteToken(Object.values(coinGeckoObj));
        return;
      }
      setQuoteTokenSelectLoading(true);
      const rt = Object.values(coinGeckoObj).filter(
        (v) =>
          v.address.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
          v.symbol?.toLowerCase().indexOf(value.toLowerCase()) !== -1,
      );
      if (rt.length > 0) {
        setCurrentSearchQuoteToken(rt);
      } else if (Web3.utils.isAddress(value)) {
        const erc20 = await new ERC20Connect(value, network, metamaskProvider).getToken();
        console.log({ [value]: erc20 });
        setCurrentSearchQuoteToken([erc20]);
      } else {
        setCurrentSearchQuoteToken([]);
      }
      setQuoteTokenSelectLoading(false);
    },
    [coinGeckoObj, network, metamaskProvider],
  );

  const quoteTokenSelect = useMemo(() => {
    return currentSearchQuoteToken.map((t) => (
      <Select.Option key={t.address} value={t.address} tokensymbol={t.symbol}>
        <Space>
          <Space size={0} direction={'vertical'}>
            <div className={styles.quoteTokenSelectOptionSymbol}>{t.symbol}</div>
            <div className={styles.quoteTokenSelectOptionName}>{t.name}</div>
          </Space>
        </Space>
      </Select.Option>
    ));
  }, [currentSearchQuoteToken]);

  const handlerQuoteTokenChange = useCallback(
    async (value) => {
      const quoteToken = quoteTokenRecord[value];
      console.log({ value, quoteToken });
      handleCurrencyBSelect(quoteToken);
    },
    [handleCurrencyBSelect, quoteTokenRecord],
  );

  const button = useMemo(() => {
    if (
      !quoteCurrency ||
      !feeAmount ||
      !startPriceState ||
      !formattedAmounts[Field.CURRENCY_B] ||
      !formattedAmounts[Field.CURRENCY_A]
    ) {
      return (
        <Button type="primary" disabled={true}>
          {intl.formatMessage({
            id: 'pages.dao.config.tab.token.create_pool.form.button.create',
          })}
        </Button>
      );
    }
    if (approvedQuoteToken) {
      return (
        <Button
          type="primary"
          disabled={!(formattedAmounts[Field.CURRENCY_A] && formattedAmounts[Field.CURRENCY_B])}
          onClick={() => setPreviewCreateLP(true)}
        >
          {intl.formatMessage({
            id: 'pages.dao.config.tab.token.create_pool.form.button.create',
          })}
        </Button>
      );
    }
    return (
      <Button
        type="primary"
        loading={approveQuoteTokenButtonLoading}
        disabled={!(formattedAmounts[Field.CURRENCY_A] && formattedAmounts[Field.CURRENCY_B])}
        onClick={handlerApprovedQuoteToken}
      >
        {intl.formatMessage(
          { id: 'pages.dao.config.tab.token.create_pool.form.button.approve' },
          { quote_token_name: quoteCurrency?.symbol },
        )}
      </Button>
    );
  }, [
    approveQuoteTokenButtonLoading,
    approvedQuoteToken,
    feeAmount,
    quoteCurrency,
    formattedAmounts,
    handlerApprovedQuoteToken,
    intl,
    startPriceState,
  ]);

  if (!tokenAddress || !lpPoolAddress || !baseCurrency) {
    return <Skeleton active />;
  }

  if (tokenAddress === ZeroAddress) {
    return (
      <>
        <Alert
          message="Warning"
          description={intl.formatMessage({
            id: 'pages.dao.config.tab.token.create_pool.notfound',
          })}
          type="warning"
          showIcon
        />
      </>
    );
  }
  if (lpPoolAddress !== ZeroAddress) {
    return (
      <>
        <Alert
          message="Info"
          description={intl.formatMessage({ id: 'pages.dao.config.tab.token.create_pool.existed' })}
          type="info"
          showIcon
        />
      </>
    );
  }
  console.log(
    'console',
    depositADisabled,
    !feeAmount,
    invalidPool,
    noLiquidity && !startPriceState,
    startPriceState,
    tickLower === undefined,
    tickUpper === undefined,
    invalidPool,
    invalidRange,
  );
  return (
    <>
      <Spin
        tip={intl.formatMessage({ id: 'pages.dao.config.tab.token.create_pool.loading' })}
        spinning={loadingTransferComplete}
      >
        <Form labelCol={{ span: 5 }} wrapperCol={{ span: 8 }} name={'tokenCreateLP'}>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.base_token',
            })}
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.create_pool.form.base_token.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
          >
            <Input style={{ width: '100%' }} disabled={true} value={baseCurrency?.symbol || ''} />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.quote_token',
            })}
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.create_pool.form.quote_token.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
          >
            <Select
              showSearch
              value={currencies[Field.CURRENCY_B]?.wrapped.address}
              placeholder={intl.formatMessage({
                id: 'pages.dao.config.tab.token.create_pool.form.quote_token.pla',
              })}
              defaultActiveFirstOption={false}
              optionLabelProp={'tokensymbol'}
              filterOption={false}
              onSearch={handlerQuoteTokenSearch}
              loading={quoteTokenSelectLoading}
              onChange={handlerQuoteTokenChange}
              style={{ width: '100%' }}
            >
              {quoteTokenSelect}
            </Select>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create_pool.form.fee' })}
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.create_pool.form.fee.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
          >
            <Radio.Group
              buttonStyle="solid"
              disabled={!quoteCurrency}
              value={feeAmount}
              onChange={(value) => {
                handleFeePoolSelect(value.target.value);
              }}
            >
              <Radio.Button value={FeeAmount.LOW}>0.05%</Radio.Button>
              <Radio.Button value={FeeAmount.MEDIUM}>0.3%</Radio.Button>
              <Radio.Button value={FeeAmount.HIGH}>1%</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.set_starting_price',
            })}
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.create_pool.form.set_starting_price.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
          >
            <InputNumber
              style={{ width: '100%' }}
              disabled={!feeAmount || !baseCurrency || !quoteCurrency}
              value={invertPrice ? price?.invert().toSignificant(6) : price?.toSignificant(6)}
              onChange={(value) => onStartPriceInput(value)}
            />
            {!!quoteCurrency?.symbol && (
              <div className={styles.StartPriceTips}>
                {quoteCurrency?.symbol} per {baseCurrency.symbol}
              </div>
            )}
            {!!quoteCurrency?.symbol && !invalidPool && !(noLiquidity && !startPriceState) && (
              <div className={styles.StartPriceTips}>
                Current {baseCurrency?.symbol} Price:{' '}
                {invertPrice ? price?.invert()?.toSignificant(5) : price?.toSignificant(5)}{' '}
                {quoteCurrency?.symbol}
              </div>
            )}
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 5, span: 8 }}>
            <Radio.Group
              value={advancedOP ? 'advanced' : 'normal'}
              buttonStyle="solid"
              disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceState)}
              onChange={(v) => {
                setAdvancedOP(v.target.value === 'advanced');
                setLeftRangeState(true);
                setRightRangeState(true);
              }}
            >
              <Radio.Button value="normal">
                <FormattedMessage id={`pages.dao.config.tab.token.create.form.normal`} />
              </Radio.Button>
              <Radio.Button value="advanced">
                <FormattedMessage id={`pages.dao.config.tab.token.create_pool.form.advanced`} />
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          {advancedOP && (
            <>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create_pool.form.min_price',
                })}
                tooltip={{
                  title: intl.formatMessage({
                    id: 'pages.dao.config.tab.token.create_pool.form.min_price.desc',
                  }),
                  icon: <IconFont type={'icon-question'} />,
                }}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceState)}
                  value={
                    ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]
                      ? '0'
                      : leftPrice?.toSignificant(5) ?? ''
                  }
                  min={'0'}
                  onChange={(value) => {
                    onLeftRangeInput(value);
                  }}
                  onStep={(_, info) => {
                    if (info.type === 'up') getIncrementLower();
                    if (info.type === 'down') getDecrementLower();
                  }}
                />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create_pool.form.max_price',
                })}
                tooltip={{
                  title: intl.formatMessage({
                    id: 'pages.dao.config.tab.token.create_pool.form.max_price.desc',
                  }),
                  icon: <IconFont type={'icon-question'} />,
                }}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceState)}
                  value={
                    ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]
                      ? '∞'
                      : rightPrice?.toSignificant(5) ?? ''
                  }
                  min={'∞'}
                  onChange={(value) => {
                    onRightRangeInput(value);
                  }}
                  onStep={(_, info) => {
                    if (info.type === 'up') getIncrementUpper();
                    if (info.type === 'down') getDecrementUpper();
                  }}
                />
              </Form.Item>
            </>
          )}
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.base_token_amount',
            })}
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.create_pool.form.base_token_amount.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
          >
            <InputNumber
              style={{ width: '100%' }}
              disabled={
                depositADisabled ||
                !feeAmount ||
                invalidPool ||
                (noLiquidity && !startPriceState) ||
                tickLower === undefined ||
                tickUpper === undefined ||
                invalidPool ||
                invalidRange
              }
              value={formattedAmounts[Field.CURRENCY_A]}
              min={'0'}
              max={maxAmounts[Field.CURRENCY_A]?.toSignificant(10) ?? ''}
              step={1}
              onChange={(value) => {
                onFieldAInput(value);
              }}
            />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.quote_token_amount',
            })}
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.create_pool.form.quote_token_amount.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
          >
            <InputNumber
              style={{ width: '100%' }}
              disabled={
                depositBDisabled ||
                !feeAmount ||
                invalidPool ||
                (noLiquidity && !startPriceState) ||
                tickLower === undefined ||
                tickUpper === undefined ||
                invalidPool ||
                invalidRange
              }
              value={formattedAmounts[Field.CURRENCY_B]}
              min={'0'}
              max={maxAmounts[Field.CURRENCY_B]?.toSignificant(10) ?? ''}
              step={1}
              onChange={(value) => {
                onFieldBInput(value);
              }}
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 5, span: 8 }}>{button}</Form.Item>
        </Form>
      </Spin>
      <GlobalModal
        key={'previewCreateLP'}
        visible={previewCreateLP}
        onOk={async () => {
          await handlerCreateLPPool();
          return true;
        }}
        confirmLoading={createLPButtonLoading}
        width={800}
        okText={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.ok' })}
        cancelText={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.cancel' })}
        onCancel={() => setPreviewCreateLP(false)}
      >
        <Descriptions title="Preview Create LP Pool" bordered column={2}>
          <Descriptions.Item
            span={2}
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.base_token',
            })}
          >
            {invertPrice ? position?.amount1.toSignificant(4) : position?.amount0.toSignificant(4)}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.quote_token',
            })}
          >
            {invertPrice ? position?.amount0.toSignificant(4) : position?.amount1.toSignificant(4)}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create_pool.form.fee' })}
          >
            {(position?.pool?.fee || 0) / 10000}%
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.min_price',
            })}
          >
            {`${formatTickPrice(priceLower, ticksAtLimit, Bound.LOWER)}`}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.max_price',
            })}
          >
            {`${formatTickPrice(priceUpper, ticksAtLimit, Bound.UPPER)}`}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.current_price',
            })}
          >
            {`${position?.pool.priceOf(position.pool.token0).toSignificant(5)} `}
          </Descriptions.Item>
        </Descriptions>
      </GlobalModal>
    </>
  );
};

export default TokenCreateLP;
