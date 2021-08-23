import { useModel } from '@@/plugin-model/useModel';
import { useCallback, useMemo, useState } from 'react';
import type { ETH_CONNECT } from '@/services/ethereum-connect/typings';
import type { UniswapConnect } from '@/services/ethereum-connect/uniswap';
import {
  getTickToPrice,
  tickSpaceLimits,
  tryParseAmount,
  tryParseTick,
  UniswapBound,
  UniswapField,
} from '@/services/ethereum-connect/uniswap';
import type { Currency, Token } from '@uniswap/sdk-core';
import { CurrencyAmount, Price, Rounding } from '@uniswap/sdk-core';
import {
  encodeSqrtRatioX96,
  Pool,
  Position,
  priceToClosestTick,
  TICK_SPACINGS,
  TickMath,
  tickToPrice,
} from '@uniswap/v3-sdk';
import JSBI from 'jsbi';
import { BIG_INT_ZERO } from '@/services/ethereum-connect';
import type { DAOFactoryConnect } from '@/services/ethereum-connect/factory';
import type { EventEmitter } from 'ahooks/lib/useEventEmitter';
import type { DAOStakingConnect } from '@/services/ethereum-connect/staking';

export default (): {
  metamaskEvent$: EventEmitter<void>;
  metamaskIsConnected: boolean;
  network: string;
  metamaskProvider: any;
  accounts: string[];
  contract: {
    daoStaking: DAOStakingConnect;
    uniswapPool: UniswapConnect;
    daoFactory: DAOFactoryConnect;
  };
  formData: ETH_CONNECT.CreateLPForm;
  setFormDataFast: (newData: any) => void;
  poolInfo: ETH_CONNECT.UniswapPoolInfo;
  setPoolInfo: (
    value:
      | ((prevState: ETH_CONNECT.UniswapPoolInfo) => ETH_CONNECT.UniswapPoolInfo)
      | ETH_CONNECT.UniswapPoolInfo,
  ) => void;
  minPriceChange: (info: { offset: string | number; type: 'up' | 'down' }) => string | string;
  maxPriceChange: (info: { offset: string | number; type: 'up' | 'down' }) => string | string;
  parsedAmounts: {
    CURRENCY_A: CurrencyAmount<Currency> | undefined;
    CURRENCY_B: CurrencyAmount<Currency> | undefined;
  };
  formattedAmounts: any;
  minPrice: any;
  maxPrice: any;
  position: Position | undefined;
  ticksAtLimit: { [bound in UniswapBound]?: boolean | undefined };
  lowerPrice: Price<Token, Token> | undefined;
  upperPrice: Price<Token, Token> | undefined;
} => {
  const { event$, isConnected, metamaskProvider, network, accounts, contract } =
    useModel('useWalletModel');
  const [formData, setFormData] = useState<ETH_CONNECT.CreateLPForm>({
    baseTokenAmount: 0,
    quoteTokenAmount: 0,
    minPrice: true,
    maxPrice: true,
  });
  const [poolInfo, setPoolInfo] = useState<ETH_CONNECT.UniswapPoolInfo>({});

  const setFormDataFast = useCallback((newData) => {
    setFormData((old) => ({ ...old, ...newData }));
  }, []);

  const price = useMemo(() => {
    if (poolInfo.pool) {
      return poolInfo.pool && poolInfo.tokenA ? poolInfo.pool.priceOf(poolInfo.tokenA) : undefined;
    }
    const parsedQuoteAmount = tryParseAmount(
      (formData.startingPrice || 0).toString(),
      poolInfo.invertPrice ? poolInfo.tokenA : poolInfo.tokenB,
    );
    if (parsedQuoteAmount && poolInfo.tokenA && poolInfo.tokenB) {
      const baseAmount = tryParseAmount(
        '1',
        poolInfo.invertPrice ? poolInfo.tokenB : poolInfo.tokenA,
      );
      return baseAmount && parsedQuoteAmount
        ? new Price(
            baseAmount.currency,
            parsedQuoteAmount.currency,
            baseAmount.quotient,
            parsedQuoteAmount.quotient,
          )
        : undefined;
    }
    return undefined;
  }, [
    formData.startingPrice,
    poolInfo.invertPrice,
    poolInfo.pool,
    poolInfo.tokenA,
    poolInfo.tokenB,
  ]);
  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined;
    return (
      price &&
      sqrtRatioX96 &&
      !(
        JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO) &&
        JSBI.lessThan(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)
      )
    );
  }, [price]);

  useMemo(() => {
    let startingPrice = 0;
    if (price) {
      startingPrice = parseInt(
        poolInfo.invertPrice ? price?.invert()?.toSignificant(5) : price?.toSignificant(5),
        10,
      );
    }
    setFormDataFast({ startingPrice });
  }, [poolInfo.invertPrice, price, setFormDataFast]);

  const ticks = useMemo(() => {
    if (!formData.fee) return {};
    const ublower = () => {
      return poolInfo.invertPrice
        ? tryParseTick(poolInfo.tokenB, poolInfo.tokenA, formData.fee, formData.maxPrice.toString())
        : tryParseTick(
            poolInfo.tokenA,
            poolInfo.tokenB,
            formData.fee,
            formData.minPrice.toString(),
          );
    };
    const ubupper = () => {
      return poolInfo.invertPrice
        ? tryParseTick(poolInfo.tokenB, poolInfo.tokenA, formData.fee, formData.minPrice.toString())
        : tryParseTick(
            poolInfo.tokenA,
            poolInfo.tokenB,
            formData.fee,
            formData.maxPrice.toString(),
          );
    };
    return {
      [UniswapBound.LOWER]:
        (poolInfo.invertPrice && typeof formData.maxPrice === 'boolean') ||
        (!poolInfo.invertPrice && typeof formData.minPrice === 'boolean')
          ? tickSpaceLimits(formData.fee).LOWER
          : ublower(),
      [UniswapBound.UPPER]:
        (!poolInfo.invertPrice && typeof formData.maxPrice === 'boolean') ||
        (poolInfo.invertPrice && typeof formData.minPrice === 'boolean')
          ? tickSpaceLimits(formData.fee).UPPER
          : ubupper(),
    };
  }, [
    formData.fee,
    formData.maxPrice,
    formData.minPrice,
    poolInfo.invertPrice,
    poolInfo.tokenA,
    poolInfo.tokenB,
  ]);
  const { [UniswapBound.LOWER]: tickLower, [UniswapBound.UPPER]: tickUpper } = ticks || {};
  const ticksAtLimit = useMemo(() => {
    return {
      [UniswapBound.LOWER]: formData.fee && tickLower === tickSpaceLimits(formData.fee).LOWER,
      [UniswapBound.UPPER]: formData.fee && tickUpper === tickSpaceLimits(formData.fee).UPPER,
    };
  }, [formData.fee, tickLower, tickUpper]);
  const isSorted = useMemo(() => {
    return (
      formData.baseToken &&
      formData.quoteToken &&
      formData.baseToken.sortsBefore(formData.quoteToken)
    );
  }, [formData.baseToken, formData.quoteToken]);

  const pricesAtTicks = useMemo(() => {
    return {
      [UniswapBound.LOWER]: getTickToPrice(
        poolInfo.tokenA,
        poolInfo.tokenB,
        ticks[UniswapBound.LOWER],
      ),
      [UniswapBound.UPPER]: getTickToPrice(
        poolInfo.tokenA,
        poolInfo.tokenB,
        ticks[UniswapBound.UPPER],
      ),
    };
  }, [poolInfo.tokenA, poolInfo.tokenB, ticks]);
  const dependentField =
    formData.independentField === UniswapField.CURRENCY_A
      ? UniswapField.CURRENCY_B
      : UniswapField.CURRENCY_A;

  const currencies: { [field in UniswapField]?: Currency } = useMemo(
    () => ({
      [UniswapField.CURRENCY_A]: formData.baseToken,
      [UniswapField.CURRENCY_B]: formData.quoteToken,
    }),
    [formData.baseToken, formData.quoteToken],
  );

  const mockPool = useMemo(() => {
    if (formData.baseToken && formData.quoteToken && formData.fee && price && !invalidPrice) {
      const currentTick = priceToClosestTick(price);
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick);
      return new Pool(
        formData.baseToken,
        formData.quoteToken,
        formData.fee,
        currentSqrt,
        JSBI.BigInt(0),
        currentTick,
        [],
      );
    }
    return undefined;
  }, [formData.fee, invalidPrice, formData.baseToken, formData.quoteToken, price]);

  const poolForPosition: Pool | undefined = poolInfo.pool ?? mockPool;
  const { [UniswapBound.LOWER]: lowerPrice, [UniswapBound.UPPER]: upperPrice } = pricesAtTicks;
  const leftPrice = isSorted ? lowerPrice : upperPrice?.invert();
  const rightPrice = isSorted ? upperPrice : lowerPrice?.invert();

  const minPrice = ticksAtLimit[isSorted ? UniswapBound.LOWER : UniswapBound.UPPER]
    ? '0'
    : leftPrice?.toSignificant(5) ?? '';
  const maxPrice = ticksAtLimit[isSorted ? UniswapBound.UPPER : UniswapBound.LOWER]
    ? '∞'
    : rightPrice?.toSignificant(5) ?? '';

  const invalidRange = Boolean(
    typeof tickLower === 'number' && typeof tickUpper === 'number' && tickLower >= tickUpper,
  );
  const outOfRange = Boolean(
    !invalidRange &&
      price &&
      lowerPrice &&
      upperPrice &&
      (price.lessThan(lowerPrice) || price.greaterThan(upperPrice)),
  );

  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    formData.typedAmount?.toString(),
    currencies[formData.independentField || UniswapField.CURRENCY_A],
  );

  const dependentAmount = useMemo(() => {
    const wrappedIndependentAmount = independentAmount?.wrapped;
    const dependentCurrency =
      dependentField === UniswapField.CURRENCY_B ? formData.quoteToken : formData.baseToken;
    if (
      independentAmount &&
      wrappedIndependentAmount &&
      typeof tickLower === 'number' &&
      typeof tickUpper === 'number' &&
      poolForPosition
    ) {
      // if price is out of range or invalid range - return 0 (single deposit will be independent)
      if (outOfRange || invalidRange) {
        return undefined;
      }
      const position: Position | undefined = wrappedIndependentAmount.currency.equals(
        poolForPosition.token0,
      )
        ? Position.fromAmount0({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount0: independentAmount.quotient,
            useFullPrecision: true, // we want full precision for the theoretical position
          })
        : Position.fromAmount1({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount1: independentAmount.quotient,
          });
      const dependentTokenAmount = wrappedIndependentAmount.currency.equals(poolForPosition.token0)
        ? position.amount1
        : position.amount0;
      return (
        dependentCurrency &&
        CurrencyAmount.fromRawAmount(dependentCurrency, dependentTokenAmount.quotient)
      );
    }
    return undefined;
  }, [
    dependentField,
    formData.baseToken,
    formData.quoteToken,
    independentAmount,
    invalidRange,
    outOfRange,
    poolForPosition,
    tickLower,
    tickUpper,
  ]);

  const parsedAmounts: { [field in UniswapField]: CurrencyAmount<Currency> | undefined } =
    useMemo(() => {
      return {
        [UniswapField.CURRENCY_A]:
          formData.independentField === UniswapField.CURRENCY_A
            ? independentAmount
            : dependentAmount,
        [UniswapField.CURRENCY_B]:
          formData.independentField === UniswapField.CURRENCY_A
            ? dependentAmount
            : independentAmount,
      };
    }, [dependentAmount, independentAmount, formData.independentField]);
  const formattedAmounts = useMemo(() => {
    if (!formData.independentField) return {};
    return {
      [formData.independentField]: formData.typedAmount,
      [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    };
  }, [dependentField, formData.independentField, formData.typedAmount, parsedAmounts]);

  const minPriceUp = useCallback(() => {
    if (
      formData.baseToken?.wrapped &&
      formData.quoteToken?.wrapped &&
      typeof tickLower === 'number' &&
      formData.fee
    ) {
      const newPrice = tickToPrice(
        formData.baseToken?.wrapped,
        formData.quoteToken?.wrapped,
        tickLower + TICK_SPACINGS[formData.fee],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (
      !(typeof tickLower === 'number') &&
      formData.baseToken?.wrapped &&
      formData.quoteToken?.wrapped &&
      formData.fee &&
      poolInfo.pool
    ) {
      const newPrice = tickToPrice(
        formData.baseToken?.wrapped,
        formData.quoteToken?.wrapped,
        poolInfo.pool.tickCurrent + TICK_SPACINGS[formData.fee],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return '';
  }, [
    formData.baseToken?.wrapped,
    formData.fee,
    formData.quoteToken?.wrapped,
    poolInfo.pool,
    tickLower,
  ]);
  const minPriceDown = useCallback(() => {
    if (
      formData.baseToken?.wrapped &&
      formData.quoteToken?.wrapped &&
      typeof tickLower === 'number' &&
      formData.fee
    ) {
      const newPrice = tickToPrice(
        formData.baseToken?.wrapped,
        formData.quoteToken?.wrapped,
        tickLower - TICK_SPACINGS[formData.fee],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (
      !(typeof tickLower === 'number') &&
      formData.baseToken?.wrapped &&
      formData.quoteToken?.wrapped &&
      formData.fee &&
      poolInfo.pool
    ) {
      const newPrice = tickToPrice(
        formData.baseToken?.wrapped,
        formData.quoteToken?.wrapped,
        poolInfo.pool.tickCurrent - TICK_SPACINGS[formData.fee],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return '';
  }, [
    formData.baseToken?.wrapped,
    formData.fee,
    formData.quoteToken?.wrapped,
    poolInfo.pool,
    tickLower,
  ]);
  const maxPriceUp = useCallback(() => {
    if (
      formData.baseToken?.wrapped &&
      formData.quoteToken?.wrapped &&
      typeof tickUpper === 'number' &&
      formData.fee
    ) {
      const newPrice = tickToPrice(
        formData.baseToken?.wrapped,
        formData.quoteToken?.wrapped,
        tickUpper + TICK_SPACINGS[formData.fee],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (
      !(typeof tickUpper === 'number') &&
      formData.baseToken?.wrapped &&
      formData.quoteToken?.wrapped &&
      formData.fee &&
      poolInfo.pool
    ) {
      const newPrice = tickToPrice(
        formData.baseToken?.wrapped,
        formData.quoteToken?.wrapped,
        poolInfo.pool.tickCurrent + TICK_SPACINGS[formData.fee],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return '';
  }, [
    formData.baseToken?.wrapped,
    formData.fee,
    formData.quoteToken?.wrapped,
    poolInfo.pool,
    tickUpper,
  ]);
  const maxPriceDown = useCallback(() => {
    if (
      formData.baseToken?.wrapped &&
      formData.quoteToken?.wrapped &&
      typeof tickUpper === 'number' &&
      formData.fee
    ) {
      const newPrice = tickToPrice(
        formData.baseToken?.wrapped,
        formData.quoteToken?.wrapped,
        tickUpper - TICK_SPACINGS[formData.fee],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (
      !(typeof tickUpper === 'number') &&
      formData.baseToken?.wrapped &&
      formData.quoteToken?.wrapped &&
      formData.fee &&
      poolInfo.pool
    ) {
      const newPrice = tickToPrice(
        formData.baseToken?.wrapped,
        formData.quoteToken?.wrapped,
        poolInfo.pool.tickCurrent - TICK_SPACINGS[formData.fee],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return '';
  }, [
    formData.baseToken?.wrapped,
    formData.fee,
    formData.quoteToken?.wrapped,
    poolInfo.pool,
    tickUpper,
  ]);
  const minPriceChange = useCallback(
    (info: { offset: string | number; type: 'up' | 'down' }) => {
      if (info.type === 'up') return isSorted ? minPriceUp() : maxPriceDown();
      if (info.type === 'down') return isSorted ? minPriceDown() : maxPriceUp();
      return '';
    },
    [isSorted, maxPriceDown, maxPriceUp, minPriceDown, minPriceUp],
  );
  const maxPriceChange = useCallback(
    (info: { offset: string | number; type: 'up' | 'down' }) => {
      if (info.type === 'up') return isSorted ? maxPriceUp() : minPriceDown();
      if (info.type === 'down') return isSorted ? maxPriceDown() : minPriceUp();
      return '';
    },
    [isSorted, maxPriceDown, maxPriceUp, minPriceDown, minPriceUp],
  );

  const deposit0Disabled = Boolean(
    typeof tickUpper === 'number' && poolForPosition && poolForPosition.tickCurrent >= tickUpper,
  );
  const deposit1Disabled = Boolean(
    typeof tickLower === 'number' && poolForPosition && poolForPosition.tickCurrent <= tickLower,
  );

  const position: Position | undefined = useMemo(() => {
    if (
      !poolForPosition ||
      !formData.baseToken ||
      !formData.quoteToken ||
      typeof tickLower !== 'number' ||
      typeof tickUpper !== 'number' ||
      invalidRange
    ) {
      return undefined;
    }

    // mark as 0 if disabled because out of range
    const amount0 = !deposit0Disabled
      ? parsedAmounts?.[
          formData.baseToken.equals(poolForPosition.token0)
            ? UniswapField.CURRENCY_A
            : UniswapField.CURRENCY_B
        ]?.quotient
      : BIG_INT_ZERO;
    const amount1 = !deposit1Disabled
      ? parsedAmounts?.[
          formData.baseToken.equals(poolForPosition.token0)
            ? UniswapField.CURRENCY_B
            : UniswapField.CURRENCY_A
        ]?.quotient
      : BIG_INT_ZERO;

    if (amount0 !== undefined && amount1 !== undefined) {
      return Position.fromAmounts({
        pool: poolForPosition,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        useFullPrecision: true, // we want full precision for the theoretical position
      });
    }
    return undefined;
  }, [
    deposit0Disabled,
    deposit1Disabled,
    invalidRange,
    parsedAmounts,
    poolForPosition,
    formData.baseToken,
    formData.quoteToken,
    tickLower,
    tickUpper,
  ]);

  return {
    metamaskEvent$: event$,
    metamaskIsConnected: isConnected,
    network,
    metamaskProvider,
    accounts,
    contract,
    formData,
    setFormDataFast,
    poolInfo,
    setPoolInfo,
    minPriceChange,
    maxPriceChange,
    parsedAmounts,
    formattedAmounts,
    minPrice,
    maxPrice,
    position,
    ticksAtLimit,
    lowerPrice,
    upperPrice,
  };
};
