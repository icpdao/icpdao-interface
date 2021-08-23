// eslint-disable-next-line max-classes-per-file
import {
  BaseEthereumConnect, ERC20Contract, UniswapV3FactoryContract,
  UniswapV3PoolContract, UniswapV3PositionsContract, ZeroAddress,
} from "./index";
import { Token, Currency} from "@uniswap/sdk-core";
import { CurrencyAmount, Price } from "@uniswap/sdk-core";
import type {
  FeeAmount} from "@uniswap/v3-sdk";
import {
  encodeSqrtRatioX96,
  nearestUsableTick,
  Pool,
  priceToClosestTick, TICK_SPACINGS,
  TickMath,
  tickToPrice
} from "@uniswap/v3-sdk";
import { parseUnits } from '@ethersproject/units';
import JSBI from 'jsbi';
import type {ETH_CONNECT} from "./typings";

export enum UniswapBound {
  LOWER = 'LOWER',
  UPPER = 'UPPER',
}

export enum UniswapField {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}

export class UniswapPositionsConnect extends BaseEthereumConnect {
  factoryContract: any

  constructor(network: string, metamaskProvider: any) {
    super(network, metamaskProvider);
    this.contract = UniswapV3PositionsContract(this.provider);
    this.actionContract = UniswapV3PositionsContract(this.metamaskProvider);
  }

  async getPoolAddress(tokenA: Token, tokenB: Token, fee: number) {
    const factoryAddress = await this.contract.factory();
    this.factoryContract = UniswapV3FactoryContract(factoryAddress, this.provider);
    return await this.factoryContract.getPool(tokenA.address, tokenB.address, fee)
  }
}

export class UniswapConnect extends BaseEthereumConnect {
  positionsConnect: UniswapPositionsConnect

  constructor(network: string, metamaskProvider: any) {
    super(network, metamaskProvider);
    this.positionsConnect = new UniswapPositionsConnect(network, metamaskProvider);
  }

  private async getPoolAddress(token0: Token, token1: Token, fee: number) {
    return await this.positionsConnect.getPoolAddress(token0, token1, fee)
  }

  private static async getPoolImmutables(poolContract: any) {
    const immutables: ETH_CONNECT.UniswapPoolImmutables = {
      factory: await poolContract.factory(),
      token0: await poolContract.token0(),
      token1: await poolContract.token1(),
      fee: await poolContract.fee(),
      tickSpacing: await poolContract.tickSpacing(),
      maxLiquidityPerTick: await poolContract.maxLiquidityPerTick(),
    };
    return immutables;
  }

  private static async getPoolState(poolContract: any) {
    const slot = await poolContract.slot0();
    const PoolState: ETH_CONNECT.UniswapPoolState = {
      liquidity: await poolContract.liquidity(),
      sqrtPriceX96: slot[0],
      tick: slot[1],
      observationIndex: slot[2],
      observationCardinality: slot[3],
      observationCardinalityNext: slot[4],
      feeProtocol: slot[5],
      unlocked: slot[6],
    };
    return PoolState;
  }

  async getPool(token0: Token, token1: Token, fee: number): Promise<ETH_CONNECT.UniswapPoolInfo> {
    console.log({token0, token1, fee})
    const [tokenA, tokenB] = token0.sortsBefore(token1) ? [token0, token1] : [token1, token0];
    const invertPrice = Boolean(token0 && tokenA && !token0.equals(tokenA));
    const poolAddress = await this.getPoolAddress(tokenA, tokenB, fee);

    if (poolAddress === ZeroAddress) return {tokenA, tokenB, invertPrice};

    const poolContract = UniswapV3PoolContract(poolAddress, this.provider);
    const state = await UniswapConnect.getPoolState(poolContract);
    console.log({state});

    const pool = new Pool(
      tokenA,
      tokenB,
      fee,
      state.sqrtPriceX96.toString(),
      state.liquidity.toString(),
      state.tick
    );
    return {pool, tokenA, tokenB, invertPrice};
  }

  async getPoolByAddress(poolAddress: string, baseTokenAddress: string) {
    const poolContract = UniswapV3PoolContract(poolAddress, this.provider);
    const immutables = await UniswapConnect.getPoolImmutables(poolContract);
    const state = await UniswapConnect.getPoolState(poolContract);

    const invertPrice = Boolean(immutables.token0 !== baseTokenAddress)
    const tokenA = new Token(
      this.chainId,
      immutables.token0,
      await (ERC20Contract(immutables.token0, this.provider)).decimals(),
    )
    const tokenB = new Token(
      this.chainId,
      immutables.token1,
      await (ERC20Contract(immutables.token1, this.provider)).decimals(),
    )
    const pool = new Pool(
      tokenA,
      tokenB,
      immutables.fee,
      state.sqrtPriceX96.toString(),
      state.liquidity.toString(),
      state.tick
    );
    console.log({pool, tokenA, tokenB, invertPrice})
    return {pool, tokenA, tokenB, invertPrice}
  }
}

export function tryParseAmount<T extends Currency>(value?: string, currency?: T): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}


export function tryParsePrice(baseToken?: Token, quoteToken?: Token, value?: string) {
  if (!baseToken || !quoteToken || !value) {
    return undefined
  }

  if (!value.match(/^\d*\.?\d+$/)) {
    return undefined
  }

  const [whole, fraction] = value.split('.')

  const decimals = fraction?.length ?? 0
  const withoutDecimals = JSBI.BigInt((whole ?? '') + (fraction ?? ''))

  return new Price(
    baseToken,
    quoteToken,
    JSBI.multiply(JSBI.BigInt(10 ** decimals), JSBI.BigInt(10 ** baseToken.decimals)),
    JSBI.multiply(withoutDecimals, JSBI.BigInt(10 ** quoteToken.decimals))
  )
}

export function tryParseTick(
  baseToken?: Token,
  quoteToken?: Token,
  feeAmount?: FeeAmount,
  value?: string
): number | undefined {
  if (!baseToken || !quoteToken || !feeAmount || !value) {
    return undefined
  }

  const price = tryParsePrice(baseToken, quoteToken, value)

  if (!price) {
    return undefined
  }

  let tick: number

  // check price is within min/max bounds, if outside return min/max
  const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator)

  if (JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)) {
    tick = TickMath.MAX_TICK
  } else if (JSBI.lessThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO)) {
    tick = TickMath.MIN_TICK
  } else {
    // this function is agnostic to the base, will always return the correct tick
    tick = priceToClosestTick(price)
  }

  return nearestUsableTick(tick, TICK_SPACINGS[feeAmount])
}

export function getTickToPrice(baseToken?: Token, quoteToken?: Token, tick?: number): Price<Token, Token> | undefined {
  if (!baseToken || !quoteToken || typeof tick !== 'number') {
    return undefined
  }
  return tickToPrice(baseToken, quoteToken, tick)
}


export function tickSpaceLimits(feeAmount: FeeAmount) {
  return {
    [UniswapBound.LOWER]: feeAmount ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount]) : undefined,
    [UniswapBound.UPPER]: feeAmount ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount]) : undefined,
  }
}

export function formatPrice(price: Price<Currency, Currency> | undefined, sigFigs: number) {
  if (!price) {
    return '-'
  }

  if (parseFloat(price.toFixed(sigFigs)) < 0.0001) {
    return '<0.0001'
  }

  return price.toSignificant(sigFigs)
}


export function formatTickPrice(
  price: Price<Token, Token> | undefined,
  atLimit: { [bound in UniswapBound]?: boolean | undefined },
  direction: UniswapBound,
  placeholder?: string
) {
  if (atLimit[direction]) {
    return direction === UniswapBound.LOWER ? '0' : '∞'
  }

  if (!price && placeholder !== undefined) {
    return placeholder
  }

  return formatPrice(price, 5)
}


