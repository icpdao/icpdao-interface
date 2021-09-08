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
  Switch,
  Row,
  Button,
  Descriptions,
} from 'antd';
import { request, useIntl } from 'umi';
import { useModel } from '@@/plugin-model/useModel';
import type { TokenConfigComponentsProps } from '@/pages/Dao/components/TokenConfig';
import { getMetamaskProvider, ZeroAddress } from '@/services/ethereum-connect';
import { DAOTokenConnect } from '@/services/ethereum-connect/token';
import { EthereumChainId } from '@/utils/utils';
import Web3 from 'web3';
import { ERC20Connect } from '@/services/ethereum-connect/erc20';
import { PageLoading } from '@ant-design/pro-layout';
import styles from './index.less';
import { formatTickPrice, UniswapBound, UniswapField } from '@/services/ethereum-connect/uniswap';
import GlobalModal from '@/components/Modal';
import { Token, WETH9 } from '@uniswap/sdk-core';
import { ETH_CONNECT } from '@/services/ethereum-connect/typings';
import { formatEther, formatUnits } from 'ethers/lib/utils';

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

const TokenCreateLP: React.FC<TokenConfigComponentsProps> = ({ tokenAddress }) => {
  const intl = useIntl();

  const {
    metamaskEvent$,
    metamaskIsConnected,
    network,
    metamaskProvider,
    formData,
    poolInfo,
    accounts,
    setFormDataFast,
    minPrice,
    maxPrice,
    minPriceChange,
    maxPriceChange,
    formattedAmounts,
    position,
    ticksAtLimit,
    lowerPrice,
    upperPrice,
    contract,
    setPoolInfo,
  } = useModel('useUniswapModel');

  const [loadingTransferComplete, setLoadingTransferComplete] = useState<boolean>(false);
  const [advancedOP, setAdvancedOP] = useState<boolean>(false);
  const [quoteTokenSelectLoading, setQuoteTokenSelectLoading] = useState<boolean>(false);
  const [approveQuoteTokenButtonLoading, setApproveQuoteTokenButtonLoading] =
    useState<boolean>(false);
  const [approvedQuoteToken, setApprovedQuoteToken] = useState<boolean>(false);

  const [coinGeckoObj, setCoinGeckoObj] = useState<Record<string, Token>>({});
  const [currentSearchQuoteToken, setCurrentSearchQuoteToken] = useState<Token[]>([]);
  const [lpPoolAddress, setLPPoolAddress] = useState<string>('');
  const [previewCreateLP, setPreviewCreateLP] = useState<boolean>(false);
  const [createLPButtonLoading, setCreateLPButtonLoading] = useState<boolean>(false);
  const tokenContract = useMemo(() => {
    if (tokenAddress && tokenAddress !== ZeroAddress) {
      return new DAOTokenConnect(tokenAddress, network, metamaskProvider);
    }
    return undefined;
  }, [metamaskProvider, network, tokenAddress]);

  useEffect(() => {
    if (tokenContract) {
      tokenContract.getLPPool().then((pd) => {
        setLPPoolAddress(pd);
        tokenContract.getToken().then((baseToken) => {
          setFormDataFast({ baseToken });
        });
      });
    }
  }, [setFormDataFast, tokenContract]);

  useEffect(() => {
    if (!formData.baseToken || !formData.quoteToken || !formData.fee) return;
    contract.uniswapPool
      .getPool(formData.baseToken, formData.quoteToken, formData.fee)
      .then((up) => setPoolInfo(up));
  }, [contract.uniswapPool, formData.baseToken, formData.fee, formData.quoteToken, setPoolInfo]);

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

  const maxBaseTokenAmount = useMemo(async () => {
    const amount = await tokenContract?.getTemporaryAmount();
    if (!amount) return 0;
    console.log({ ta: formatUnits(amount) });
    return formatUnits(amount);
  }, [tokenContract]);

  const maxQuoteTokenAmount = useMemo(async () => {
    if (!formData.quoteToken || accounts.length <= 0) return 0;
    if (formData.quoteToken.address === WETH9[EthereumChainId[network]].address) {
      const provider = getMetamaskProvider(metamaskProvider);
      if (!provider) return 0;
      const ethBalance = await provider.getBalance(accounts[0]);
      console.log({ ethBalance: formatEther(ethBalance) });
      return formatEther(ethBalance);
    }
    const quoteTokenContract = new ERC20Connect(
      formData.quoteToken.address,
      network,
      metamaskProvider,
    );
    const amount = await quoteTokenContract.getBalanceOf(accounts[0]);
    const { decimals } = quoteTokenRecord[formData.quoteToken.address] || {};
    return formatUnits(amount, decimals);
  }, [accounts, formData.quoteToken, metamaskProvider, network, quoteTokenRecord]);

  useEffect(() => {
    getCoinGecko(network).then((v) => setCoinGeckoObj(v));
  }, [network]);

  useEffect(() => {
    if (!formData.quoteToken || accounts.length <= 0 || !tokenAddress) return;
    if (formData.quoteToken.address === WETH9[EthereumChainId[network]].address) {
      setApprovedQuoteToken(true);
      return;
    }
    const quoteTokenContract = new ERC20Connect(
      formData.quoteToken.address,
      network,
      metamaskProvider,
    );
    const { decimals } = quoteTokenRecord[formData.quoteToken.address] || {};
    quoteTokenContract.getAllowance(accounts[0], tokenAddress).then((allowance) => {
      console.log({ allowance: parseFloat(formatUnits(allowance, decimals)) });
      setApprovedQuoteToken(
        parseFloat(formatUnits(allowance, decimals)) >= formattedAmounts[UniswapField.CURRENCY_B],
      );
    });
  }, [
    accounts,
    formData.quoteToken,
    formattedAmounts,
    metamaskProvider,
    network,
    quoteTokenRecord,
    tokenAddress,
  ]);

  const handlerMetamaskConnect = useCallback(() => {
    metamaskEvent$?.emit();
  }, [metamaskEvent$]);

  const handlerApprovedQuoteToken = useCallback(async () => {
    if (!formData.quoteToken || accounts.length <= 0 || !tokenAddress) return;
    try {
      const quoteTokenContract = new ERC20Connect(
        formData.quoteToken.address,
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
  }, [accounts.length, formData.quoteToken, metamaskProvider, network, tokenAddress]);

  const handlerCreateLPPool = useCallback(async () => {
    console.log({ network, accounts, position });
    if (!tokenContract) return;
    if (!network || accounts.length === 0) return;
    if (!position) return;
    console.log(poolInfo.invertPrice);

    const createLPPool: ETH_CONNECT.CreateLPPool = {
      baseTokenAmount: poolInfo.invertPrice
        ? position.mintAmounts.amount1.toString()
        : position.mintAmounts.amount0.toString(),
      quoteTokenAddress: poolInfo.invertPrice
        ? position.pool.token0.address
        : position.pool.token1.address,
      quoteTokenAmount: poolInfo.invertPrice
        ? position.mintAmounts.amount0.toString()
        : position.mintAmounts.amount1.toString(),
      fee: position.pool.fee,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      sqrtPriceX96: position.pool.sqrtRatioX96.toString(),
    };

    try {
      setCreateLPButtonLoading(true);
      const tx = await tokenContract?.createLPPoolOrLinkLPPool(createLPPool);
      setCreateLPButtonLoading(false);

      setPreviewCreateLP(false);
      setLoadingTransferComplete(true);
      const deployEvent = (await tx.wait()).events.pop();
      setLoadingTransferComplete(false);
      console.log(deployEvent.args);
      setLPPoolAddress(deployEvent.args[deployEvent.args.length - 1]);
    } catch (e) {
      setCreateLPButtonLoading(false);
      setLoadingTransferComplete(false);
    }
  }, [accounts, network, poolInfo.invertPrice, position, tokenContract]);

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
          {/* <Avatar src={t.logoURI} /> */}
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
      setFormDataFast({
        fee: undefined,
        startingPrice: 0,
        baseTokenAmount: 0,
        quoteTokenAmount: 0,
        quoteToken,
      });
    },
    [quoteTokenRecord, setFormDataFast],
  );

  if (!tokenAddress || !lpPoolAddress || !formData.baseToken) {
    return <PageLoading />;
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
  return (
    <>
      <Spin
        tip={intl.formatMessage({ id: 'pages.dao.config.tab.token.create_pool.loading' })}
        spinning={loadingTransferComplete}
      >
        <Form layout={'vertical'} name={'tokenCreateLP'}>
          <Space>
            <Form.Item
              label={intl.formatMessage({
                id: 'pages.dao.config.tab.token.create_pool.form.base_token',
              })}
              tooltip={intl.formatMessage({
                id: 'pages.dao.config.tab.token.create_pool.form.base_token.desc',
              })}
            >
              <Input
                style={{ width: '200px' }}
                disabled={true}
                value={formData.baseToken?.name || ''}
              />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({
                id: 'pages.dao.config.tab.token.create_pool.form.quote_token',
              })}
              tooltip={intl.formatMessage({
                id: 'pages.dao.config.tab.token.create_pool.form.quote_token.desc',
              })}
            >
              <Select
                showSearch
                value={formData.quoteToken?.address || ''}
                placeholder={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create_pool.form.quote_token.pla',
                })}
                defaultActiveFirstOption={false}
                optionLabelProp={'tokensymbol'}
                filterOption={false}
                onSearch={handlerQuoteTokenSearch}
                loading={quoteTokenSelectLoading}
                onChange={handlerQuoteTokenChange}
                style={{ width: '200px' }}
              >
                {quoteTokenSelect}
              </Select>
            </Form.Item>
          </Space>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create_pool.form.fee' })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.fee.desc',
            })}
          >
            <Radio.Group
              buttonStyle="solid"
              disabled={!formData.quoteToken}
              value={formData.fee || ''}
              onChange={(value) => {
                setFormDataFast({ fee: value.target.value });
              }}
            >
              <Radio.Button value={500}>0.05%</Radio.Button>
              <Radio.Button value={3000}>0.3%</Radio.Button>
              <Radio.Button value={10000}>1%</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.set_starting_price',
            })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.set_starting_price.desc',
            })}
          >
            <InputNumber
              style={{ width: '200px' }}
              disabled={!formData.fee || !poolInfo.tokenA || !!poolInfo.pool}
              value={formData.startingPrice || 0}
              onChange={(value) => setFormDataFast({ startingPrice: value })}
              min={0}
              precision={1}
            />
          </Form.Item>
          <Form.Item>
            <Switch
              checked={advancedOP}
              onChange={(value) => {
                setAdvancedOP(value);
                if (!value) setFormDataFast({ minPrice: true, maxPrice: true });
              }}
              disabled={!formData.startingPrice}
              checkedChildren={intl.formatMessage({
                id: 'pages.dao.config.tab.token.create_pool.form.advanced',
              })}
              unCheckedChildren=""
            />
          </Form.Item>
          {advancedOP && (
            <Row>
              <Space>
                <Form.Item
                  label={intl.formatMessage({
                    id: 'pages.dao.config.tab.token.create_pool.form.min_price',
                  })}
                  tooltip={intl.formatMessage({
                    id: 'pages.dao.config.tab.token.create_pool.form.min_price.desc',
                  })}
                >
                  <InputNumber
                    style={{ width: '200px' }}
                    disabled={!formData.startingPrice}
                    value={minPrice}
                    min={0}
                    onChange={(value) => {
                      setFormDataFast({ minPrice: value?.toString() || '' });
                    }}
                    onStep={(_, info) => {
                      setFormDataFast({ minPrice: minPriceChange(info) });
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({
                    id: 'pages.dao.config.tab.token.create_pool.form.max_price',
                  })}
                  tooltip={intl.formatMessage({
                    id: 'pages.dao.config.tab.token.create_pool.form.max_price.desc',
                  })}
                >
                  <InputNumber
                    style={{ width: '200px' }}
                    disabled={!formData.startingPrice}
                    value={maxPrice}
                    min={0}
                    onChange={(value) => {
                      setFormDataFast({ maxPrice: value?.toString() || '' });
                    }}
                    onStep={(_, info) => {
                      setFormDataFast({ maxPrice: maxPriceChange(info) });
                    }}
                  />
                </Form.Item>
              </Space>
            </Row>
          )}
          <Row>
            <Space>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create_pool.form.base_token_amount',
                })}
                tooltip={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create_pool.form.base_token_amount.desc',
                })}
              >
                <InputNumber
                  style={{ width: '200px' }}
                  disabled={!formData.startingPrice}
                  value={formattedAmounts[UniswapField.CURRENCY_A]}
                  min={0}
                  max={maxBaseTokenAmount}
                  step={1}
                  onChange={(value) => {
                    setFormDataFast({
                      independentField: UniswapField.CURRENCY_A,
                      typedAmount: value,
                    });
                  }}
                />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create_pool.form.quote_token_amount',
                })}
                tooltip={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create_pool.form.quote_token_amount.desc',
                })}
              >
                <InputNumber
                  style={{ width: '200px' }}
                  disabled={!formData.startingPrice}
                  value={formattedAmounts[UniswapField.CURRENCY_B]}
                  min={0}
                  max={maxQuoteTokenAmount}
                  step={1}
                  onChange={(value) => {
                    setFormDataFast({
                      independentField: UniswapField.CURRENCY_B,
                      typedAmount: value,
                    });
                  }}
                />
              </Form.Item>
            </Space>
          </Row>
          <Form.Item>
            {metamaskIsConnected &&
              !!formData.quoteToken &&
              !!formData.fee &&
              (approvedQuoteToken ? (
                <Button
                  type="primary"
                  disabled={
                    !(
                      formattedAmounts[UniswapField.CURRENCY_A] &&
                      formattedAmounts[UniswapField.CURRENCY_B]
                    )
                  }
                  onClick={() => setPreviewCreateLP(true)}
                >
                  {intl.formatMessage({
                    id: 'pages.dao.config.tab.token.create_pool.form.button.create',
                  })}
                </Button>
              ) : (
                <Button
                  type="primary"
                  loading={approveQuoteTokenButtonLoading}
                  disabled={
                    !(
                      formattedAmounts[UniswapField.CURRENCY_A] &&
                      formattedAmounts[UniswapField.CURRENCY_B]
                    )
                  }
                  onClick={() => handlerApprovedQuoteToken()}
                >
                  {intl.formatMessage(
                    { id: 'pages.dao.config.tab.token.create_pool.form.button.approve' },
                    { quote_token_name: formData.quoteToken?.symbol },
                  )}
                </Button>
              ))}
            {!metamaskIsConnected && (
              <Button
                type="primary"
                disabled={
                  !(
                    formattedAmounts[UniswapField.CURRENCY_A] &&
                    formattedAmounts[UniswapField.CURRENCY_B]
                  )
                }
                onClick={() => handlerMetamaskConnect()}
              >
                {intl.formatMessage({
                  id: 'pages.common.connect',
                })}
              </Button>
            )}
          </Form.Item>
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
            {poolInfo.invertPrice
              ? position?.amount1.toSignificant(4)
              : position?.amount0.toSignificant(4)}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.quote_token',
            })}
          >
            {poolInfo.invertPrice
              ? position?.amount0.toSignificant(4)
              : position?.amount1.toSignificant(4)}
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
            {`${formatTickPrice(lowerPrice, ticksAtLimit, UniswapBound.LOWER)}`}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.max_price',
            })}
          >
            {`${formatTickPrice(upperPrice, ticksAtLimit, UniswapBound.UPPER)}`}
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
