import { ethers } from 'ethers';

import DAOFactoryABI from './abis/dao-factory.json';
import DAOStakingABI from './abis/dao-staking.json';
import DAOTokenABI from './abis/dao-token.json';
import { getNetwork } from '@ethersproject/networks';

export const DAOFactoryAddress = '0xb3318aD1F4a541829608e6B57acb5793fB45D048';
export const DAOStakingAddress = '0xfaA04c4318b96593bdD87b768Cc7bbF78b41b7fa';
export const ZeroAddress = '0x0000000000000000000000000000000000000000';

export function getProvider(network: string) {
  return ethers.getDefaultProvider(getNetwork(network), {
    infura: REACT_APP_ICPDAO_ETHEREUM_INFURA_KEY,
  });
}

export function getInfuraProvider(network: string) {
  return new ethers.providers.InfuraProvider(
    getNetwork(network),
    REACT_APP_ICPDAO_ETHEREUM_INFURA_KEY,
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
