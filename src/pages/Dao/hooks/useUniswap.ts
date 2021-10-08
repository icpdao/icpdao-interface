import type { FeeAmount } from '@uniswap/v3-sdk/dist/';
import {
  encodeSqrtRatioX96,
  nearestUsableTick,
  Pool,
  Position,
  priceToClosestTick,
  TICK_SPACINGS,
  TickMath,
  tickToPrice,
} from '@uniswap/v3-sdk/dist/';
import type { Currency } from '@uniswap/sdk-core';
import { CurrencyAmount, Price, Rounding, WETH9, Token } from '@uniswap/sdk-core';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useMemo } from 'react';
import { BIG_INT_ZERO } from '@/services/ethereum-connect';
import JSBI from 'jsbi';
import { FACTORY_ADDRESS as V3_FACTORY_ADDRESS } from '@uniswap/v3-sdk';
import { parseUnits } from '@ethersproject/units';

type AddressMap = Record<number, string>;

export enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,

  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  OPTIMISM = 10,
  OPTIMISTIC_KOVAN = 69,
}

export const L1_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  SupportedChainId.GOERLI,
  SupportedChainId.KOVAN,
] as const;

export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}

export enum Bound {
  LOWER = 'LOWER',
  UPPER = 'UPPER',
}

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function constructSameAddressMap<T extends string>(
  address: T,
  additionalNetworks: SupportedChainId[] = [],
): { [chainId: number]: T } {
  return (L1_CHAIN_IDS as readonly SupportedChainId[])
    .concat(additionalNetworks)
    .reduce<{ [chainId: number]: T }>((memo, chainId) => {
      const copyMemo = memo;
      copyMemo[chainId] = address;
      return copyMemo;
    }, {});
}

export const MULTICALL_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0x1F98415757620B543A52E61c46B32eB19261F984', [
    SupportedChainId.OPTIMISTIC_KOVAN,
  ]),
  [SupportedChainId.OPTIMISM]: '0x90f872b3d8f33f305e0250db6A2761B354f7710A',
  [SupportedChainId.ARBITRUM_ONE]: '0xadF885960B47eA2CD9B55E6DAc6B42b7Cb2806dB',
  [SupportedChainId.ARBITRUM_RINKEBY]: '0xa501c031958F579dB7676fF1CE78AD305794d579',
};

export const V3_CORE_FACTORY_ADDRESSES: AddressMap = constructSameAddressMap(V3_FACTORY_ADDRESS, [
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
]);

export const WETH9_EXTENDED: Record<number, Token> = {
  ...WETH9,
  [SupportedChainId.OPTIMISM]: new Token(
    SupportedChainId.OPTIMISM,
    '0x4200000000000000000000000000000000000006',
    18,
    'WETH',
    'Wrapped Ether',
  ),
  [SupportedChainId.OPTIMISTIC_KOVAN]: new Token(
    SupportedChainId.OPTIMISTIC_KOVAN,
    '0x4200000000000000000000000000000000000006',
    18,
    'WETH',
    'Wrapped Ether',
  ),
  [SupportedChainId.ARBITRUM_ONE]: new Token(
    SupportedChainId.ARBITRUM_ONE,
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    18,
    'WETH',
    'Wrapped Ether',
  ),
  [SupportedChainId.ARBITRUM_RINKEBY]: new Token(
    SupportedChainId.ARBITRUM_RINKEBY,
    '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681',
    18,
    'WETH',
    'Wrapped Ether',
  ),
};

export function tryParseAmount<T extends Currency>(
  value?: string,
  currency?: T,
): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed !== '0') {
      return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(typedValueParsed));
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
}

export function tryParsePrice(baseToken?: Token, quoteToken?: Token, value?: string) {
  if (!baseToken || !quoteToken || !value) {
    return undefined;
  }

  if (!value.match(/^\d*\.?\d+$/)) {
    return undefined;
  }

  const [whole, fraction] = value.split('.');

  const decimals = fraction?.length ?? 0;
  const withoutDecimals = JSBI.BigInt((whole ?? '') + (fraction ?? ''));

  return new Price(
    baseToken,
    quoteToken,
    JSBI.multiply(JSBI.BigInt(10 ** decimals), JSBI.BigInt(10 ** baseToken.decimals)),
    JSBI.multiply(withoutDecimals, JSBI.BigInt(10 ** quoteToken.decimals)),
  );
}

export function tryParseTick(
  baseToken?: Token,
  quoteToken?: Token,
  feeAmount?: FeeAmount,
  value?: string,
): number | undefined {
  if (!baseToken || !quoteToken || !feeAmount || !value) {
    return undefined;
  }

  const price = tryParsePrice(baseToken, quoteToken, value);

  if (!price) {
    return undefined;
  }

  let tick: number;

  // check price is within min/max bounds, if outside return min/max
  const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator);

  if (JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)) {
    tick = TickMath.MAX_TICK;
  } else if (JSBI.lessThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO)) {
    tick = TickMath.MIN_TICK;
  } else {
    // this function is agnostic to the base, will always return the correct tick
    tick = priceToClosestTick(price);
  }

  return nearestUsableTick(tick, TICK_SPACINGS[feeAmount]);
}

export function getTickToPrice(
  baseToken?: Token,
  quoteToken?: Token,
  tick?: number,
): Price<Token, Token> | undefined {
  if (!baseToken || !quoteToken || typeof tick !== 'number') {
    return undefined;
  }
  return tickToPrice(baseToken, quoteToken, tick);
}

export function formatPrice(price: Price<Currency, Currency> | undefined, sigFigs: number) {
  if (!price) {
    return '-';
  }

  if (parseFloat(price.toFixed(sigFigs)) < 0.0001) {
    return '<0.0001';
  }

  return price.toSignificant(sigFigs);
}

export function formatTickPrice(
  price: Price<Token, Token> | undefined,
  atLimit: { [bound in Bound]?: boolean | undefined },
  direction: Bound,
  placeholder?: string,
) {
  if (atLimit[direction]) {
    return direction === Bound.LOWER ? '0' : '∞';
  }

  if (!price && placeholder !== undefined) {
    return placeholder;
  }

  return formatPrice(price, 5);
}

const MIN_NATIVE_CURRENCY_FOR_GAS: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)); // .01 ETH
/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function maxAmountSpend(
  currencyAmount?: CurrencyAmount<Currency>,
): CurrencyAmount<Currency> | undefined {
  if (!currencyAmount) return undefined;
  if (currencyAmount.currency.isNative) {
    if (JSBI.greaterThan(currencyAmount.quotient, MIN_NATIVE_CURRENCY_FOR_GAS)) {
      return CurrencyAmount.fromRawAmount(
        currencyAmount.currency,
        JSBI.subtract(currencyAmount.quotient, MIN_NATIVE_CURRENCY_FOR_GAS),
      );
    }
    return CurrencyAmount.fromRawAmount(currencyAmount.currency, JSBI.BigInt(0));
  }
  return currencyAmount;
}

export function useUniswap(
  states: {
    inputState?: { field: Field; typedValue: string; noLiquidity: boolean };
    leftRangeState?: string | true;
    rightRangeState?: string | true;
    startPriceState?: string;
  },
  setStates: {
    setInputState: Dispatch<
      SetStateAction<{ field: Field; typedValue: string; noLiquidity: boolean } | undefined>
    >;
    setLeftRangeState: Dispatch<SetStateAction<string | true>>;
    setRightRangeState: Dispatch<SetStateAction<string | true>>;
    setStartPriceState: Dispatch<SetStateAction<string | undefined>>;
  },
  balances: (CurrencyAmount<Currency> | undefined)[],
  poolInfo?: [PoolState, Pool | null],
  currencyA?: Currency,
  currencyB?: Currency,
  feeAmount?: FeeAmount,
  baseCurrency?: Currency,
  // override for existing position
  existingPosition?: Position,
  account?: string,
): {
  pool?: Pool | null;
  poolState: PoolState;
  ticks: { [bound in Bound]?: number | undefined };
  price?: Price<Token, Token>;
  pricesAtTicks: {
    [bound in Bound]?: Price<Token, Token> | undefined;
  };
  currencies: { [field in Field]?: Currency };
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> };
  dependentField: Field;
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> };
  position: Position | undefined;
  noLiquidity?: boolean;
  errorMessage?: string;
  invalidPool: boolean;
  outOfRange: boolean;
  invalidRange: boolean;
  depositADisabled: boolean;
  depositBDisabled: boolean;
  invertPrice: boolean;
  ticksAtLimit: { [bound in Bound]?: boolean | undefined };
  onFieldAInput: (value: string) => void;
  onFieldBInput: (value: string) => void;
  onLeftRangeInput: (value: string) => void;
  onRightRangeInput: (value: string) => void;
  onStartPriceInput: (value: string) => void;
  leftPrice: Price<Token, Token> | undefined;
  rightPrice: Price<Token, Token> | undefined;
  getDecrementLower: () => string;
  getIncrementLower: () => string;
  getDecrementUpper: () => string;
  getIncrementUpper: () => string;
  formattedAmounts: Record<string, string | undefined>;
  maxAmounts: { [field in Field]?: CurrencyAmount<Currency> };
  isSorted: boolean | undefined;
  priceLower: Price<Token, Token> | undefined;
  priceUpper: Price<Token, Token> | undefined;
  tickLower: number | undefined;
  tickUpper: number | undefined;
  getNoQuoteTokenPrice: (
    currentTick: any,
  ) => { [bound in Bound]?: Price<Token, Token> | undefined };
} {
  const {
    inputState,
    leftRangeState: leftRangeTypedValue,
    rightRangeState: rightRangeTypedValue,
    startPriceState: startPriceTypedValue,
  } = states;
  const { field: independentField, typedValue } = inputState || { field: Field.CURRENCY_A };
  const { setInputState, setLeftRangeState, setRightRangeState, setStartPriceState } = useMemo(
    () => setStates,
    [setStates],
  );
  console.log({ independentField, typedValue });

  const dependentField =
    independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;

  // currencies
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA,
      [Field.CURRENCY_B]: currencyB,
    }),
    [currencyA, currencyB],
  );

  // formatted with tokens
  const [tokenA, tokenB, baseToken] = useMemo(
    () => [currencyA?.wrapped, currencyB?.wrapped, baseCurrency?.wrapped],
    [currencyA, currencyB, baseCurrency],
  );

  const [token0, token1] = useMemo(() => {
    if (tokenA && tokenB) return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
    return [undefined, undefined];
  }, [tokenA, tokenB]);

  const currencyBalances: { [field in Field]?: CurrencyAmount<Currency> } = {
    [Field.CURRENCY_A]: balances[0],
    [Field.CURRENCY_B]: balances[1],
  };

  // pool
  const [poolState, pool] = poolInfo || [PoolState.NOT_EXISTS];
  const noLiquidity = poolState === PoolState.NOT_EXISTS;

  // note to parse inputs in reverse
  const invertPrice = Boolean(baseToken && token0 && !baseToken.equals(token0));

  // always returns the price with 0 as base token
  const price: Price<Token, Token> | undefined = useMemo(() => {
    // if no liquidity use typed value
    if (noLiquidity) {
      const parsedQuoteAmount = tryParseAmount(startPriceTypedValue, invertPrice ? token0 : token1);
      console.log({ noLiquidity, startPriceTypedValue, invertPrice, parsedQuoteAmount });

      if (parsedQuoteAmount && token0 && token1) {
        const baseAmount = tryParseAmount('1', invertPrice ? token1 : token0);
        const pc =
          baseAmount && parsedQuoteAmount
            ? new Price(
                baseAmount.currency,
                parsedQuoteAmount.currency,
                baseAmount.quotient,
                parsedQuoteAmount.quotient,
              )
            : undefined;
        return (invertPrice ? pc?.invert() : pc) ?? undefined;
      }
      return undefined;
    }
    // get the amount of quote currency
    return pool && token0 ? pool.priceOf(token0) : undefined;
  }, [noLiquidity, startPriceTypedValue, invertPrice, token1, token0, pool]);

  // check for invalid price input (converts to invalid ratio)
  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined;
    const invalid =
      price &&
      sqrtRatioX96 &&
      !(
        JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO) &&
        JSBI.lessThan(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)
      );
    return invalid;
  }, [price]);

  // used for ratio calculation when pool not initialized
  const mockPool = useMemo(() => {
    if (tokenA && tokenB && feeAmount && price && !invalidPrice) {
      const currentTick = priceToClosestTick(price);
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick);
      return new Pool(tokenA, tokenB, feeAmount, currentSqrt, JSBI.BigInt(0), currentTick, []);
    }
    return undefined;
  }, [feeAmount, invalidPrice, price, tokenA, tokenB]);

  // if pool exists use it, if not use the mock pool
  const poolForPosition: Pool | undefined = pool ?? mockPool;

  // lower and upper limits in the tick space for `feeAmount`
  const tickSpaceLimits: {
    [bound in Bound]: number | undefined;
  } = useMemo(
    () => ({
      [Bound.LOWER]: feeAmount
        ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount])
        : undefined,
      [Bound.UPPER]: feeAmount
        ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount])
        : undefined,
    }),
    [feeAmount],
  );

  // parse typed range values and determine closest ticks
  // lower should always be a smaller tick
  const ticks: Record<string, number | undefined> = useMemo(() => {
    console.log({
      existingPosition,
      feeAmount,
      invertPrice,
      leftRangeTypedValue,
      rightRangeTypedValue,
      token0,
      token1,
      tickSpaceLimits,
    });
    let bl;
    let bu;
    if (typeof existingPosition?.tickLower === 'number') {
      bl = existingPosition.tickLower;
    } else if (
      (invertPrice && false) ||
      (!invertPrice && typeof leftRangeTypedValue === 'boolean')
    ) {
      bl = tickSpaceLimits[Bound.LOWER];
    } else {
      bl = invertPrice
        ? tryParseTick(token1, token0, feeAmount, rightRangeTypedValue?.toString())
        : tryParseTick(token0, token1, feeAmount, leftRangeTypedValue?.toString());
    }
    if (typeof existingPosition?.tickUpper === 'number') {
      bu = existingPosition.tickUpper;
    } else if (
      (!invertPrice && typeof rightRangeTypedValue === 'boolean') ||
      (invertPrice && typeof leftRangeTypedValue === 'boolean')
    ) {
      bu = tickSpaceLimits[Bound.UPPER];
    } else {
      bu = invertPrice
        ? tryParseTick(token1, token0, feeAmount, leftRangeTypedValue?.toString())
        : tryParseTick(token0, token1, feeAmount, rightRangeTypedValue?.toString());
    }
    return {
      [Bound.LOWER]: bl,
      [Bound.UPPER]: bu,
    };
  }, [
    existingPosition,
    feeAmount,
    invertPrice,
    leftRangeTypedValue,
    rightRangeTypedValue,
    token0,
    token1,
    tickSpaceLimits,
  ]);

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {};

  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: feeAmount && tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: feeAmount && tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper, feeAmount],
  );

  // mark invalid range
  const invalidRange = Boolean(
    typeof tickLower === 'number' && typeof tickUpper === 'number' && tickLower >= tickUpper,
  );

  // always returns the price with 0 as base token
  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
    };
  }, [token0, token1, ticks]);
  const { [Bound.LOWER]: lowerPrice, [Bound.UPPER]: upperPrice } = pricesAtTicks;

  // liquidity range warning
  const outOfRange = Boolean(
    !invalidRange &&
      price &&
      lowerPrice &&
      upperPrice &&
      (price.lessThan(lowerPrice) || price.greaterThan(upperPrice)),
  );

  // amounts
  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    typedValue,
    currencies[independentField],
  );

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    // we wrap the currencies just to get the price in terms of the other token
    const wrappedIndependentAmount = independentAmount?.wrapped;
    const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA;
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
    independentAmount,
    outOfRange,
    dependentField,
    currencyB,
    currencyA,
    tickLower,
    tickUpper,
    poolForPosition,
    invalidRange,
  ]);
  console.log({ tickLower, tickUpper });
  const parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]:
        independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]:
        independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    };
  }, [dependentAmount, independentAmount, independentField]);
  console.log({ parsedAmounts, typedValue, independentAmount, dependentAmount });

  // single deposit only if price is out of range
  const deposit0Disabled = Boolean(
    typeof tickUpper === 'number' && poolForPosition && poolForPosition.tickCurrent >= tickUpper,
  );
  const deposit1Disabled = Boolean(
    typeof tickLower === 'number' && poolForPosition && poolForPosition.tickCurrent <= tickLower,
  );

  // sorted for token order
  const depositADisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenA && poolForPosition.token0.equals(tokenA)) ||
        (deposit1Disabled && poolForPosition && tokenA && poolForPosition.token1.equals(tokenA)),
    );
  const depositBDisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenB && poolForPosition.token0.equals(tokenB)) ||
        (deposit1Disabled && poolForPosition && tokenB && poolForPosition.token1.equals(tokenB)),
    );

  // create position entity based on users selection
  const position: Position | undefined = useMemo(() => {
    if (
      !poolForPosition ||
      !tokenA ||
      !tokenB ||
      typeof tickLower !== 'number' ||
      typeof tickUpper !== 'number' ||
      invalidRange
    ) {
      return undefined;
    }

    // mark as 0 if disabled because out of range
    const amount0 = !deposit0Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_A : Field.CURRENCY_B]
          ?.quotient
      : BIG_INT_ZERO;
    const amount1 = !deposit1Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_B : Field.CURRENCY_A]
          ?.quotient
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
    parsedAmounts,
    poolForPosition,
    tokenA,
    tokenB,
    deposit0Disabled,
    deposit1Disabled,
    invalidRange,
    tickLower,
    tickUpper,
  ]);

  let errorMessage: string | undefined;
  if (!account) {
    errorMessage = `Connect Wallet`;
  }

  if (poolState === PoolState.INVALID) {
    errorMessage = errorMessage ?? `Invalid pair`;
  }

  if (invalidPrice) {
    errorMessage = errorMessage ?? `Invalid price input`;
  }

  if (
    (!parsedAmounts[Field.CURRENCY_A] && !depositADisabled) ||
    (!parsedAmounts[Field.CURRENCY_B] && !depositBDisabled)
  ) {
    errorMessage = errorMessage ?? `Enter an amount`;
  }

  const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } =
    parsedAmounts;

  if (currencyAAmount && currencyBalances?.[Field.CURRENCY_A]?.lessThan(currencyAAmount)) {
    errorMessage = `Insufficient ${currencies[Field.CURRENCY_A]?.symbol} balance`;
  }

  if (currencyBAmount && currencyBalances?.[Field.CURRENCY_B]?.lessThan(currencyBAmount)) {
    errorMessage = `Insufficient ${currencies[Field.CURRENCY_B]?.symbol} balance`;
  }

  const invalidPool = poolState === PoolState.INVALID;

  // ----
  const onFieldAInput = useCallback(
    (value: string) => {
      setInputState({
        field: Field.CURRENCY_A,
        typedValue: value.toString(),
        noLiquidity: noLiquidity === true,
      });
    },
    [noLiquidity, setInputState],
  );

  const onFieldBInput = useCallback(
    (value: string) => {
      setInputState({
        field: Field.CURRENCY_B,
        typedValue: value.toString(),
        noLiquidity: noLiquidity === true,
      });
    },
    [noLiquidity, setInputState],
  );

  const onLeftRangeInput = useCallback(
    (value: string) => {
      setLeftRangeState(value?.toString() || true);
    },
    [setLeftRangeState],
  );

  const onRightRangeInput = useCallback(
    (value: string) => {
      setRightRangeState(value?.toString() || true);
    },
    [setRightRangeState],
  );

  const onStartPriceInput = useCallback(
    (value: string) => {
      setStartPriceState(value?.toString());
    },
    [setStartPriceState],
  );

  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = useMemo(
    () => pricesAtTicks,
    [pricesAtTicks],
  );

  const isSorted = useMemo(() => tokenA && tokenB && tokenA.sortsBefore(tokenB), [tokenA, tokenB]);

  const leftPrice = useMemo(
    () => (isSorted ? priceLower : priceUpper?.invert()),
    [isSorted, priceLower, priceUpper],
  );
  const rightPrice = useMemo(
    () => (isSorted ? priceUpper : priceLower?.invert()),
    [isSorted, priceLower, priceUpper],
  );

  const maxTick = useMemo(() => {
    if (!feeAmount) return undefined;
    return Math.floor(TickMath.MAX_TICK / TICK_SPACINGS[feeAmount]) * TICK_SPACINGS[feeAmount];
  }, [feeAmount]);

  const minTick = useMemo(() => {
    if (!feeAmount) return undefined;
    return Math.ceil(TickMath.MIN_TICK / TICK_SPACINGS[feeAmount]) * TICK_SPACINGS[feeAmount];
  }, [feeAmount]);

  const getNearestTickLower = useCallback(
    (currentTick) => {
      if (!maxTick || !feeAmount) return undefined;
      const tickSpacing = TICK_SPACINGS[feeAmount];
      const bei = Math.floor((maxTick - currentTick) / tickSpacing);
      return maxTick - tickSpacing * bei;
    },
    [feeAmount, maxTick],
  );

  const getNearestTickUpper = useCallback(
    (currentTick) => {
      if (!minTick || !feeAmount) return undefined;
      const tickSpacing = TICK_SPACINGS[feeAmount];
      const bei = Math.floor((currentTick - minTick) / tickSpacing);
      return minTick + tickSpacing * bei;
    },
    [feeAmount, minTick],
  );

  const getNoQuoteTokenPrice = useCallback(
    (currentTick) => {
      if (invertPrice)
        return {
          [Bound.UPPER]: getTickToPrice(token0, token1, getNearestTickUpper(currentTick)),
        };
      return {
        [Bound.LOWER]: getTickToPrice(token0, token1, getNearestTickLower(currentTick)),
      };
    },
    [getNearestTickLower, getNearestTickUpper, invertPrice, token0, token1],
  );

  const getDecrementLower = useCallback(() => {
    if (currencyA?.wrapped && currencyB?.wrapped && typeof tickLower === 'number' && feeAmount) {
      const newPrice = tickToPrice(
        currencyA?.wrapped,
        currencyB?.wrapped,
        tickLower - TICK_SPACINGS[feeAmount],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (
      !(typeof tickLower === 'number') &&
      currencyA?.wrapped &&
      currencyB?.wrapped &&
      feeAmount &&
      pool
    ) {
      const newPrice = tickToPrice(
        currencyA?.wrapped,
        currencyB?.wrapped,
        pool.tickCurrent - TICK_SPACINGS[feeAmount],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return '';
  }, [currencyA?.wrapped, currencyB?.wrapped, tickLower, feeAmount, pool]);

  const getIncrementLower = useCallback(() => {
    if (currencyA?.wrapped && currencyB?.wrapped && typeof tickLower === 'number' && feeAmount) {
      const newPrice = tickToPrice(
        currencyA?.wrapped,
        currencyB?.wrapped,
        tickLower + TICK_SPACINGS[feeAmount],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (
      !(typeof tickLower === 'number') &&
      currencyA?.wrapped &&
      currencyB?.wrapped &&
      feeAmount &&
      pool
    ) {
      const newPrice = tickToPrice(
        currencyA?.wrapped,
        currencyB?.wrapped,
        pool.tickCurrent + TICK_SPACINGS[feeAmount],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return '';
  }, [currencyA?.wrapped, currencyB?.wrapped, tickLower, feeAmount, pool]);

  const getDecrementUpper = useCallback(() => {
    if (currencyA?.wrapped && currencyB?.wrapped && typeof tickUpper === 'number' && feeAmount) {
      const newPrice = tickToPrice(
        currencyA?.wrapped,
        currencyB?.wrapped,
        tickUpper - TICK_SPACINGS[feeAmount],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (
      !(typeof tickUpper === 'number') &&
      currencyA?.wrapped &&
      currencyB?.wrapped &&
      feeAmount &&
      pool
    ) {
      const newPrice = tickToPrice(
        currencyA?.wrapped,
        currencyB?.wrapped,
        pool.tickCurrent - TICK_SPACINGS[feeAmount],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return '';
  }, [currencyA?.wrapped, currencyB?.wrapped, tickUpper, feeAmount, pool]);

  const getIncrementUpper = useCallback(() => {
    if (currencyA?.wrapped && currencyB?.wrapped && typeof tickUpper === 'number' && feeAmount) {
      const newPrice = tickToPrice(
        currencyA?.wrapped,
        currencyB?.wrapped,
        tickUpper + TICK_SPACINGS[feeAmount],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (
      !(typeof tickUpper === 'number') &&
      currencyA?.wrapped &&
      currencyB?.wrapped &&
      feeAmount &&
      pool
    ) {
      const newPrice = tickToPrice(
        currencyA?.wrapped,
        currencyB?.wrapped,
        pool.tickCurrent + TICK_SPACINGS[feeAmount],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return '';
  }, [currencyA?.wrapped, currencyB?.wrapped, tickUpper, feeAmount, pool]);

  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    };
  }, [dependentField, independentField, parsedAmounts, typedValue]);

  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = useMemo(() => {
    return [Field.CURRENCY_A, Field.CURRENCY_B].reduce((accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      };
    }, {});
  }, [currencyBalances]);

  // const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = useMemo(() => {
  //   return [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
  //     (accumulator, field) => {
  //       return {
  //         ...accumulator,
  //         [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
  //       }
  //     },
  //     {}
  //   )
  // }, [maxAmounts, parsedAmounts])

  return {
    dependentField,
    currencies,
    pool,
    poolState,
    currencyBalances,
    parsedAmounts,
    ticks,
    price,
    pricesAtTicks,
    position,
    noLiquidity,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
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
    getNoQuoteTokenPrice,
  };
}

export function currencyId(currency: Currency): string {
  if (currency.isNative) return 'ETH';
  if (currency.isToken) return currency.address;
  throw new Error('invalid currency');
}
