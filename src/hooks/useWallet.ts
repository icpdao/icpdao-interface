import { EthereumNetwork, getMetamask, EthereumNetworkById, Injected } from '@/utils/utils';
import { DAOFactoryConnect } from '@/services/ethereum-connect/factory';
import { useCallback, useEffect, useMemo } from 'react';
import { UniswapConnect } from '@/services/ethereum-connect/uniswap';
import { DAOStakingConnect } from '@/services/ethereum-connect/staking';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';

export const useWallet = (context: Web3ReactContextInterface) => {
  const { active, activate, deactivate, account, chainId, library } = context;

  const defaultChainId = parseInt(ICPDAO_MINT_TOKEN_ETH_CHAIN_ID, 10);
  const defaultNetwork = EthereumNetworkById[defaultChainId];

  const connectMetamask = useCallback(async () => {
    try {
      if (!active) {
        await activate(Injected);
      }
    } catch (ex) {
      console.log(ex);
    }
  }, [activate, active]);

  const disconnectMetamask = useCallback(async () => {
    try {
      if (active) {
        await deactivate();
      }
    } catch (ex) {
      console.log(ex);
    }
  }, [active, deactivate]);

  const network = useMemo(() => {
    if (!chainId) return defaultNetwork;
    return EthereumNetwork[`0x${chainId.toString(16)}`];
  }, [chainId, defaultNetwork]);

  useEffect(() => {
    if (!active && activate && getMetamask()) connectMetamask();
  }, [activate, active, connectMetamask]);

  const queryChainId: number = useMemo(() => {
    if (active) {
      return chainId || defaultChainId;
    }
    return defaultChainId;
  }, [active, chainId, defaultChainId]);

  // useEffect(() => {
  //   detectEthereumProvider({ mustBeMetaMask: true, timeout: 5000 }).then((v: any) => {
  //     if (!v) return;
  //     setMetamaskProvider(v);
  //   });
  // }, [metamaskUserConnect]);
  //
  // useEffect(() => {
  //   if (!metamaskProvider || metamaskUserConnect !== 'connect' || !metamaskProvider.isConnected())
  //     return;
  //   metamaskProvider.request({ method: 'eth_chainId' }).then((chainId: any) => {
  //     setNetwork(EthereumNetwork[chainId]);
  //   });
  //   metamaskProvider.request({ method: 'eth_requestAccounts' }).then((accs: any) => {
  //     setAccounts(accs);
  //     setIsConnected(true);
  //   });
  //   metamaskProvider.on('accountsChanged', (acs: string[]) => {
  //     setAccounts(acs);
  //   });
  //   metamaskProvider.on('chainChanged', (cid: string) => {
  //     setNetwork(EthereumNetwork[cid]);
  //   });
  // }, [metamaskProvider, metamaskUserConnect]);

  const contract = useMemo(() => {
    return {
      daoFactory: new DAOFactoryConnect(network, library),
      daoStaking: new DAOStakingConnect(network, library),
      uniswapPool: new UniswapConnect(network, library),
    };
  }, [library, network]);

  return {
    network,
    chainId,
    defaultChainId,
    library,
    account,
    contract,
    active,
    connectMetamask,
    disconnectMetamask,
    queryChainId,
  };
};
