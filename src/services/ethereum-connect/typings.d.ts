import type { DAOFactoryConnect } from './factory';
import type { DAOStakingConnect } from './staking';
import type { ethers } from 'ethers';
import type { Currency, Token } from '@uniswap/sdk-core';
import type { FeeAmount, Pool } from '@uniswap/v3-sdk';
import type { BigNumber } from 'ethers';
import type { Field } from '@/pages/Dao/hooks/useUniswap';

export type ETHConnect = {
  network: string;
  contract: {
    daoFactory: DAOFactoryConnect;
    daoStaking: DAOStakingConnect;
  };
};

declare namespace ETH_CONNECT {
  type TokenGenesis = {
    address: string;
    value: number;
  };
  type CreateToken = {
    ethDAOId: string;
    genesis?: TokenGenesis[];
    lpRatio?: number;
    ownerAddress?: string;
    mintArgs?: {
      aNumerator?: number;
      aDenominator?: number;
      bNumerator?: number;
      bDenominator?: number;
      c?: number;
      d?: number;
      p?: number;
    };
    tokenName?: string;
    tokenSymbol?: string;
    mintChangeDays?: number;
    mintValue?: number;
    mintChangeValue?: number;
    mode?: string;
  };
  type CreateLPForm = {
    baseToken?: Currency;
    quoteToken?: Currency;
    baseTokenAmount?: number;
    quoteTokenAmount?: number;
    fee?: FeeAmount;
    startingPrice?: number;
    independentField?: Field;
    typedAmount?: number;

    minPrice: string | true;
    maxPrice: string | true;
  };
  type CreateLPPool = {
    baseTokenAmount: string;
    quoteTokenAddress: string;
    quoteTokenAmount: string;
    fee: number;
    tickLower: number;
    tickUpper: number;
    sqrtPriceX96: string;
  };
  type AddLP = {
    baseTokenAmount: string;
    tickLower: number;
    tickUpper: number;
  };
  type Mint = {
    mintTokenAddressList: string[];
    mintTokenAmountRatioList: number[];
    startTimestamp: number;
    endTimestamp: number;
    tickLower: number;
    tickUpper: number;
  };
  type UniswapPoolImmutables = {
    factory: string;
    token0: string;
    token1: string;
    fee: number;
    tickSpacing: number;
    maxLiquidityPerTick: ethers.BigNumber;
  };
  type UniswapPoolState = {
    liquidity: ethers.BigNumber;
    sqrtPriceX96: ethers.BigNumber;
    tick: number;
    observationIndex: number;
    observationCardinality: number;
    observationCardinalityNext: number;
    feeProtocol: number;
    unlocked: boolean;
  };
  type UniswapPoolInfo = {
    pool?: Pool;
    tokenA?: Token;
    tokenB?: Token;
    invertPrice?: boolean;
    sqrtPriceX96?: BigNumber;
    tickLower?: number;
    tickUpper?: number;
  };
}
