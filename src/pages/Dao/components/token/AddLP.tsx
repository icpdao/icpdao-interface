import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { TokenConfigComponentsProps } from '@/pages/Dao/components/TokenConfig';
import { useIntl } from 'umi';
import { useModel } from '@@/plugin-model/useModel';
import { formatUnits } from 'ethers/lib/utils';
import { ZeroAddress } from '@/services/ethereum-connect';
import { DAOTokenConnect } from '@/services/ethereum-connect/token';
import { Alert, Button, Descriptions, Form, InputNumber, Row, Space, Spin, Switch } from 'antd';
import { PageLoading } from '@ant-design/pro-layout';
import { formatTickPrice, UniswapBound, UniswapField } from '@/services/ethereum-connect/uniswap';
import GlobalModal from '@/components/Modal';
import type { ETH_CONNECT } from '@/services/ethereum-connect/typings';
import { LinkOutlined } from '@ant-design/icons';
import { BigNumber } from 'ethers';

const TokenAddLP: React.FC<TokenConfigComponentsProps> = ({ tokenAddress, setCurrentTab }) => {
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
  const [previewAddLP, setPreviewAddLP] = useState<boolean>(false);
  const [addLPButtonLoading, setAddLPButtonLoading] = useState<boolean>(false);

  const [lpPoolAddress, setLPPoolAddress] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<BigNumber>();

  const tokenContract = useMemo(() => {
    if (tokenAddress && tokenAddress !== ZeroAddress) {
      return new DAOTokenConnect(tokenAddress, network, metamaskProvider);
    }
    return undefined;
  }, [metamaskProvider, network, tokenAddress]);

  const updatePoolInfo = useCallback(async () => {
    if (!lpPoolAddress || lpPoolAddress === ZeroAddress || !tokenAddress) return;
    const pool = await contract.uniswapPool.getPoolByAddress(lpPoolAddress, tokenAddress);
    setPoolInfo(pool);
    setFormDataFast({
      fee: pool.pool?.fee,
      baseToken: pool.tokenA?.address === tokenAddress ? pool.tokenA : pool.tokenB,
      quoteToken: pool.tokenA?.address === tokenAddress ? pool.tokenB : pool.tokenA,
      baseTokenAmount: 0,
      quoteTokenAmount: 0,
    });
  }, [contract.uniswapPool, lpPoolAddress, setFormDataFast, setPoolInfo, tokenAddress]);

  const handlerAddLP = useCallback(async () => {
    if (!tokenContract) return;
    if (!network || accounts.length === 0) return;
    if (!position) return;
    console.log(position.mintAmounts.amount1.toString(), position.mintAmounts.amount0.toString());
    const quoteTokenAmount = poolInfo.invertPrice
      ? position.mintAmounts.amount0.toString()
      : position.mintAmounts.amount1.toString();
    if (quoteTokenAmount !== '0') return;
    const addLP: ETH_CONNECT.AddLP = {
      baseTokenAmount: poolInfo.invertPrice
        ? position.mintAmounts.amount1.toString()
        : position.mintAmounts.amount0.toString(),
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
    };
    try {
      setAddLPButtonLoading(true);
      const tx = await tokenContract.updateLPPool(addLP);
      setAddLPButtonLoading(false);
      setPreviewAddLP(false);

      setLoadingTransferComplete(true);
      const deployEvent = (await tx.wait()).events.pop();
      await updatePoolInfo();
      setLoadingTransferComplete(false);
      console.log(deployEvent.args);
      setFormDataFast({
        independentField: UniswapField.CURRENCY_A,
        typedAmount: 0,
      });
      const amount = await tokenContract.getTemporaryAmount();
      console.log({ newTa: formatUnits(amount) });
      setTotalAmount(amount);
    } catch (e) {
      setPreviewAddLP(false);
      setLoadingTransferComplete(false);
    }
  }, [
    accounts.length,
    network,
    poolInfo.invertPrice,
    position,
    setFormDataFast,
    tokenContract,
    updatePoolInfo,
  ]);

  useMemo(async () => {
    if (!tokenContract) return;
    setLPPoolAddress(await tokenContract.getLPPool());
    const amount = await tokenContract.getTemporaryAmount();
    console.log({ ta: formatUnits(amount) });
    setTotalAmount(amount);
  }, [tokenContract]);

  useMemo(async () => {
    await updatePoolInfo();
  }, [updatePoolInfo]);

  useEffect(() => {
    if (!formData.startingPrice) return;
    setFormDataFast({ minPrice: formData.startingPrice.toString() });
  }, [formData.startingPrice, setFormDataFast]);

  const handlerMetamaskConnect = useCallback(() => {
    metamaskEvent$?.emit();
  }, [metamaskEvent$]);

  if (lpPoolAddress === ZeroAddress) {
    return (
      <>
        <Alert
          message="Warning"
          description={
            <div>
              {intl.formatMessage({ id: 'pages.dao.config.tab.token.add_lp.notfound' })}
              <LinkOutlined
                onClick={() => {
                  if (setCurrentTab) setCurrentTab('create');
                }}
              />
            </div>
          }
          type="warning"
          showIcon
        />
      </>
    );
  }

  if (!tokenAddress || !lpPoolAddress || totalAmount === undefined || poolInfo.pool === undefined) {
    return <PageLoading />;
  }

  return (
    <>
      <Spin
        tip={intl.formatMessage({ id: 'pages.dao.config.tab.token.add_lp.loading' })}
        spinning={loadingTransferComplete}
      >
        <Form layout={'vertical'} name={'tokenAddLP'}>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.add_lp.form.total_amount',
            })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.add_lp.form.total_amount.desc',
            })}
          >
            {formatUnits(totalAmount)}
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.add_lp.form.base_token_amount',
            })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.add_lp.form.base_token_amount.desc',
            })}
          >
            <InputNumber
              style={{ width: '200px' }}
              value={formattedAmounts[UniswapField.CURRENCY_A]}
              onChange={(value) =>
                setFormDataFast({
                  independentField: UniswapField.CURRENCY_A,
                  typedAmount: value,
                })
              }
              min={0}
              max={formatUnits(totalAmount)}
              step={1}
            />
          </Form.Item>
          <Form.Item>
            <Switch
              checked={advancedOP}
              onChange={(value) => {
                setAdvancedOP(value);
                console.log({ sp: formData.startingPrice?.toString() });
                setFormDataFast({
                  minPrice: formData.startingPrice?.toString() || true,
                  maxPrice: true,
                });
              }}
              disabled={!formData.startingPrice}
              checkedChildren={intl.formatMessage({
                id: 'pages.dao.config.tab.token.add_lp.form.advanced',
              })}
              unCheckedChildren=""
            />
          </Form.Item>
          {advancedOP && (
            <Row>
              <Space>
                <Form.Item
                  label={intl.formatMessage({
                    id: 'pages.dao.config.tab.token.add_lp.form.min_price',
                  })}
                  tooltip={intl.formatMessage({
                    id: 'pages.dao.config.tab.token.add_lp.form.min_price.desc',
                  })}
                >
                  <InputNumber
                    style={{ width: '200px' }}
                    value={minPrice}
                    min={formData.startingPrice}
                    onChange={(value) => {
                      setFormDataFast({
                        minPrice: value?.toString() || formData.startingPrice?.toString() || true,
                      });
                    }}
                    onStep={(_, info) => {
                      setFormDataFast({ minPrice: minPriceChange(info) });
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({
                    id: 'pages.dao.config.tab.token.add_lp.form.max_price',
                  })}
                  tooltip={intl.formatMessage({
                    id: 'pages.dao.config.tab.token.add_lp.form.max_price.desc',
                  })}
                >
                  <InputNumber
                    style={{ width: '200px' }}
                    value={maxPrice}
                    min={formData.startingPrice}
                    onChange={(value) => {
                      setFormDataFast({ maxPrice: value?.toString() || true });
                    }}
                    onStep={(_, info) => {
                      setFormDataFast({ maxPrice: maxPriceChange(info) });
                    }}
                  />
                </Form.Item>
              </Space>
            </Row>
          )}
          <Form.Item>
            {metamaskIsConnected && !!formData.quoteToken && !!formData.fee && (
              <Button
                type="primary"
                disabled={
                  !(
                    formattedAmounts[UniswapField.CURRENCY_A] &&
                    formattedAmounts[UniswapField.CURRENCY_B]
                  )
                }
                onClick={() => setPreviewAddLP(true)}
              >
                {intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create_pool.form.button.create',
                })}
              </Button>
            )}
            {!metamaskIsConnected && (
              <Button
                type="primary"
                disabled={!formattedAmounts[UniswapField.CURRENCY_A]}
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
        visible={previewAddLP}
        onOk={async () => {
          await handlerAddLP();
          return true;
        }}
        confirmLoading={addLPButtonLoading}
        width={800}
        okText={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.ok' })}
        cancelText={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.cancel' })}
        onCancel={() => setPreviewAddLP(false)}
      >
        <Descriptions title="Preview Add LP" bordered column={2}>
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
        </Descriptions>
      </GlobalModal>
    </>
  );
};

export default TokenAddLP;
