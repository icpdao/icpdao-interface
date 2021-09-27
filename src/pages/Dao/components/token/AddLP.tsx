import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { TokenConfigComponentsProps } from '@/pages/Dao/components/TokenConfig';
import { useIntl } from 'umi';
import { useModel } from '@@/plugin-model/useModel';
import { ZeroAddress } from '@/services/ethereum-connect';
import { Alert, Button, Descriptions, Form, InputNumber, Radio, Skeleton, Spin } from 'antd';
import GlobalModal from '@/components/Modal';
import type { ETH_CONNECT } from '@/services/ethereum-connect/typings';
import { LinkOutlined } from '@ant-design/icons';
import { FormattedMessage } from '@@/plugin-locale/localeExports';
import type { Currency, Token } from '@uniswap/sdk-core';
import { CurrencyAmount } from '@uniswap/sdk-core';
import type { FeeAmount, Pool } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';
import { Bound, Field, formatTickPrice, PoolState, useUniswap } from '@/pages/Dao/hooks/useUniswap';

const TokenAddLP: React.FC<TokenConfigComponentsProps> = ({
  tokenAddress,
  setCurrentTab,
  lpPoolAddress,
  tokenContract,
}) => {
  const intl = useIntl();
  const { network, contract, account, chainId } = useModel('useWalletModel');
  const [loadingTransferComplete, setLoadingTransferComplete] = useState<boolean>(false);
  const [advancedOP, setAdvancedOP] = useState<boolean>(false);
  const [previewAddLP, setPreviewAddLP] = useState<boolean>(false);
  const [addLPButtonLoading, setAddLPButtonLoading] = useState<boolean>(false);

  const [baseCurrency, setBaseCurrency] = useState<Currency>();
  const [quoteCurrency, setQuoteCurrency] = useState<Currency>();
  const [maxBaseTokenAmount, setMaxBaseTokenAmount] = useState<CurrencyAmount<Currency>>();
  const [maxQuoteTokenAmount, setMaxQuoteTokenAmount] = useState<CurrencyAmount<Currency>>();
  const [feeAmount, setFeeAmount] = useState<FeeAmount>();
  useEffect(() => {
    if (!lpPoolAddress || lpPoolAddress === ZeroAddress || !tokenAddress) return;
    contract.uniswapPool.getPoolByAddress(lpPoolAddress, tokenAddress).then((pl) => {
      setBaseCurrency(pl.tokenA?.address === tokenAddress ? pl.tokenA : pl.tokenB);
      setQuoteCurrency(pl.tokenA?.address === tokenAddress ? pl.tokenB : pl.tokenA);
      setFeeAmount(pl.pool.fee);
      // quote token max value set 1
      setMaxQuoteTokenAmount(
        CurrencyAmount.fromRawAmount(
          pl.tokenA?.address === tokenAddress ? pl.tokenB : pl.tokenA,
          JSBI.BigInt(1),
        ),
      );
    });
  }, [contract.uniswapPool, lpPoolAddress, tokenAddress]);

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

  const balances: (CurrencyAmount<Currency> | undefined)[] = useMemo(() => {
    return [maxBaseTokenAmount, maxQuoteTokenAmount];
  }, [maxBaseTokenAmount, maxQuoteTokenAmount]);

  const {
    price,
    position,
    noLiquidity,
    invalidPool,
    invalidRange,
    depositADisabled,
    invertPrice,
    ticksAtLimit,
    onFieldAInput,
    onLeftRangeInput,
    onRightRangeInput,
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

  const startPriceWithNoQuoteToken = useMemo(
    () => (invertPrice ? price?.invert()?.toSignificant(5) : price?.toSignificant(5)),
    [invertPrice, price],
  );

  useEffect(() => {
    if (!startPriceWithNoQuoteToken) return;
    console.log({ startPriceWithNoQuoteToken });
    onLeftRangeInput(startPriceWithNoQuoteToken);
  }, [invertPrice, onLeftRangeInput, price, startPriceWithNoQuoteToken]);

  const handlerAddLP = useCallback(async () => {
    if (!tokenContract) return;
    if (!network || !account) return;
    if (!position) return;
    console.log(position.mintAmounts.amount1.toString(), position.mintAmounts.amount0.toString());
    const quoteTokenAmount = invertPrice
      ? position.mintAmounts.amount0.toString()
      : position.mintAmounts.amount1.toString();
    if (quoteTokenAmount !== '0') return;
    const addLP: ETH_CONNECT.AddLP = {
      baseTokenAmount: invertPrice
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
      setLoadingTransferComplete(false);
      console.log(deployEvent.args);
      const value = await tokenContract.getTemporaryAmount();
      const amount = value ? JSBI.BigInt(value.toString()) : undefined;
      if (amount && baseCurrency) {
        setMaxBaseTokenAmount(CurrencyAmount.fromRawAmount(baseCurrency, amount));
        onFieldAInput('0');
      }
    } catch (e) {
      setPreviewAddLP(false);
      setLoadingTransferComplete(false);
    }
  }, [account, baseCurrency, invertPrice, network, onFieldAInput, position, tokenContract]);

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

  if (!tokenAddress || !lpPoolAddress || !poolInfo || poolInfo[0] !== PoolState.EXISTS) {
    return <Skeleton active />;
  }

  return (
    <>
      <Spin
        tip={intl.formatMessage({ id: 'pages.dao.config.tab.token.add_lp.loading' })}
        spinning={loadingTransferComplete}
      >
        <Form labelCol={{ span: 5 }} wrapperCol={{ span: 8 }} name={'tokenAddLP'}>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.add_lp.form.total_amount',
            })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.add_lp.form.total_amount.desc',
            })}
          >
            {maxAmounts[Field.CURRENCY_A]?.toExact() ?? ''}
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 5, span: 8 }}>
            <Radio.Group
              value={advancedOP ? 'advanced' : 'normal'}
              buttonStyle="solid"
              disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceState)}
              onChange={(v) => {
                setAdvancedOP(v.target.value === 'advanced');
                if (startPriceWithNoQuoteToken) onLeftRangeInput(startPriceWithNoQuoteToken);
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
                  id: 'pages.dao.config.tab.token.add_lp.form.min_price',
                })}
                tooltip={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.add_lp.form.min_price.desc',
                })}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceState)}
                  value={
                    ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]
                      ? '0'
                      : leftPrice?.toSignificant(5) ?? ''
                  }
                  min={startPriceWithNoQuoteToken}
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
                  id: 'pages.dao.config.tab.token.add_lp.form.max_price',
                })}
                tooltip={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.add_lp.form.max_price.desc',
                })}
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
              id: 'pages.dao.config.tab.token.add_lp.form.base_token_amount',
            })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.add_lp.form.base_token_amount.desc',
            })}
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
              max={maxAmounts[Field.CURRENCY_A]?.toExact() ?? ''}
              step={1}
              onChange={(value) => {
                onFieldAInput(value);
              }}
            />
            <div>{formattedAmounts[Field.CURRENCY_B]}</div>
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 5, span: 8 }}>
            {!!quoteCurrency && !!feeAmount && (
              <Button
                type="primary"
                disabled={!formattedAmounts[Field.CURRENCY_A]}
                onClick={() => setPreviewAddLP(true)}
              >
                {intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create_pool.form.button.create',
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
            {invertPrice ? position?.amount1.toSignificant(4) : position?.amount0.toSignificant(4)}
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
        </Descriptions>
      </GlobalModal>
    </>
  );
};

export default TokenAddLP;
