// eslint-disable-next-line max-classes-per-file
import {
  BaseEthereumConnect,
  ERC20Contract,
  UniswapV3FactoryContract,
  UniswapV3PoolContract,
  UniswapV3PositionsContract,
  ZeroAddress,
} from './index';
import { Token } from '@uniswap/sdk-core';
import type { FeeAmount } from '@uniswap/v3-sdk';
import { Pool } from '@uniswap/v3-sdk';
import type { ETH_CONNECT } from './typings';

export class UniswapPositionsConnect extends BaseEthereumConnect {
  factoryContract: any;

  constructor(network: string, metamaskProvider: any) {
    super(network, metamaskProvider);
    this.contract = UniswapV3PositionsContract(this.provider);
    this.actionContract = UniswapV3PositionsContract(this.metamaskProvider);
  }

  async getPoolAddress(tokenA: Token, tokenB: Token, fee: number) {
    const factoryAddress = await this.contract.factory();
    this.factoryContract = UniswapV3FactoryContract(factoryAddress, this.provider);
    return await this.factoryContract.getPool(tokenA.address, tokenB.address, fee);
  }
}

export class UniswapConnect extends BaseEthereumConnect {
  positionsConnect: UniswapPositionsConnect;

  constructor(network: string, metamaskProvider: any) {
    super(network, metamaskProvider);
    this.positionsConnect = new UniswapPositionsConnect(network, metamaskProvider);
  }

  private async getPoolAddress(token0: Token, token1: Token, fee: number) {
    return await this.positionsConnect.getPoolAddress(token0, token1, fee);
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

  async getPool(
    token0: Token,
    token1: Token,
    fee: FeeAmount,
  ): Promise<ETH_CONNECT.UniswapPoolInfo> {
    console.log({ token0, token1, fee });
    const [tokenA, tokenB] = token0.sortsBefore(token1) ? [token0, token1] : [token1, token0];
    const invertPrice = Boolean(token0 && tokenA && !token0.equals(tokenA));
    const poolAddress = await this.getPoolAddress(tokenA, tokenB, fee);

    if (poolAddress === ZeroAddress) return { tokenA, tokenB, invertPrice };

    const poolContract = UniswapV3PoolContract(poolAddress, this.provider);
    const state = await UniswapConnect.getPoolState(poolContract);
    console.log({ state });

    const pool = new Pool(
      tokenA,
      tokenB,
      fee,
      state.sqrtPriceX96.toString(),
      state.liquidity.toString(),
      state.tick,
    );
    return { pool, tokenA, tokenB, invertPrice, sqrtPriceX96: state.sqrtPriceX96 };
  }

  async getPoolByAddress(poolAddress: string, baseTokenAddress: string) {
    const poolContract = UniswapV3PoolContract(poolAddress, this.provider);
    const immutables = await UniswapConnect.getPoolImmutables(poolContract);
    const state = await UniswapConnect.getPoolState(poolContract);

    const invertPrice = Boolean(immutables.token0 !== baseTokenAddress);
    const tokenA = new Token(
      this.chainId,
      immutables.token0,
      await ERC20Contract(immutables.token0, this.provider).decimals(),
    );
    const tokenB = new Token(
      this.chainId,
      immutables.token1,
      await ERC20Contract(immutables.token1, this.provider).decimals(),
    );
    const pool = new Pool(
      tokenA,
      tokenB,
      immutables.fee,
      state.sqrtPriceX96.toString(),
      state.liquidity.toString(),
      state.tick,
    );
    console.log({ pool, tokenA, tokenB, invertPrice });
    return { pool, tokenA, tokenB, invertPrice };
  }
}
