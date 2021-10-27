import { ethers } from 'ethers';

import DAOFactoryABI from './abis/dao-factory.json';
import DAOStakingABI from './abis/dao-staking.json';
import DAOTokenABI from './abis/dao-token.json';
import ERC20ABI from './abis/erc20.json';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { abi as INonfungiblePositionManagerABI } from '@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json';
import { abi as IUniswapV3FactoryABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json';
import { getAddress } from '@ethersproject/address';
import { getNetwork } from '@ethersproject/networks';
import { EthereumChainId } from '@/utils/utils';
import JSBI from 'jsbi';
import { ADDRESS_ZERO } from '@uniswap/v3-sdk';

export const DAOFactoryAddress = '0x865A1691DF940507792ca927916ee324E1B9CB2b';
export const DAOStakingAddress = '0x772Bd6D46c35cC7882c1a9cebB33c928A1Ea0B72';
export const ZeroAddress = ADDRESS_ZERO;
export const BIG_INT_ZERO = JSBI.BigInt(0);
export const UniswapPoolAddress = '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8';
export const UniswapV3PositionsAddress = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';

export function getProvider(network: string) {
  return ethers.getDefaultProvider(getNetwork(network), {
    infura: REACT_APP_ICPDAO_ETHEREUM_INFURA_KEY,
    alchemy: REACT_APP_ICPDAO_ETHEREUM_ALCHEMY_KEY,
    etherscan: REACT_APP_ICPDAO_ETHEREUM_ETHERSCAN_KEY,
  });
}

export function getInfuraProvider(network: string) {
  return new ethers.providers.InfuraProvider(
    getNetwork(network),
    REACT_APP_ICPDAO_ETHEREUM_INFURA_KEY,
  );
}

export function getEtherscanProvider(network: string) {
  return new ethers.providers.EtherscanProvider(
    getNetwork(network),
    REACT_APP_ICPDAO_ETHEREUM_ETHERSCAN_KEY,
  );
}

export function getMetamaskProvider(provider: any) {
  if (!provider) return undefined;
  return new ethers.providers.Web3Provider(provider);
}

export function DAOFactoryContract(provider: any) {
  return new ethers.Contract(DAOFactoryAddress, DAOFactoryABI, provider);
}

export function DAOStakingContract(provider: any) {
  return new ethers.Contract(DAOStakingAddress, DAOStakingABI, provider);
}

export function DAOTokenContract(tokenAddress: string, provider: any) {
  return new ethers.Contract(tokenAddress, DAOTokenABI, provider);
}

export function ERC20Contract(tokenAddress: string, provider: any) {
  return new ethers.Contract(tokenAddress, ERC20ABI, provider);
}

export function UniswapV3PositionsContract(provider: any) {
  return new ethers.Contract(UniswapV3PositionsAddress, INonfungiblePositionManagerABI, provider);
}

export function UniswapV3PoolContract(poolAddress: string, provider: any) {
  return new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
}

export function UniswapV3FactoryContract(factoryAddress: string, provider: any) {
  return new ethers.Contract(factoryAddress, IUniswapV3FactoryABI, provider);
}

export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

export class BaseEthereumConnect {
  provider: any;
  metamaskProvider: any;
  contract: any;
  actionContract: any;
  network: string;
  chainId: number;

  constructor(network: string, metamaskProvider: any) {
    this.provider = getProvider(network);
    this.metamaskProvider = getMetamaskProvider(metamaskProvider);
    this.network = network;
    this.chainId = EthereumChainId[network];
  }

  getAddressHistory(address: string) {
    return getEtherscanProvider(this.network).getHistory(address);
  }
}
