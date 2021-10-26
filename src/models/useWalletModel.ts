import { useEventEmitter } from 'ahooks';
import detectEthereumProvider from '@metamask/detect-provider';
import { EthereumChainId, EthereumNetwork, getMetamask, EthereumNetworkById } from '@/utils/utils';
import { DAOFactoryConnect } from '@/services/ethereum-connect/factory';
import { useEffect, useMemo, useState } from 'react';
import { UniswapConnect } from '@/services/ethereum-connect/uniswap';
import { DAOStakingConnect } from '@/services/ethereum-connect/staking';

export default () => {
  const event$ = useEventEmitter();
  const [metamaskProvider, setMetamaskProvider] = useState<any>();
  const defaultChainId = parseInt(ICPDAO_MINT_TOKEN_ETH_CHAIN_ID, 10);
  const defaultNetwork = EthereumNetworkById[defaultChainId];
  const [network, setNetwork] = useState<string>(defaultNetwork);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const metamaskUserConnect = useMemo(() => {
    return getMetamask();
  }, []);

  useEffect(() => {
    detectEthereumProvider({ mustBeMetaMask: true, timeout: 5000 }).then((v: any) => {
      if (!v) return;
      setMetamaskProvider(v);
    });
  }, [metamaskUserConnect]);

  useEffect(() => {
    if (!metamaskProvider || metamaskUserConnect !== 'connect' || !metamaskProvider.isConnected())
      return;
    metamaskProvider.request({ method: 'eth_chainId' }).then((chainId: any) => {
      setNetwork(EthereumNetwork[chainId]);
    });
    metamaskProvider.request({ method: 'eth_requestAccounts' }).then((accs: any) => {
      setAccounts(accs);
      setIsConnected(true);
    });
    metamaskProvider.on('accountsChanged', (acs: string[]) => {
      setAccounts(acs);
    });
    metamaskProvider.on('chainChanged', (cid: string) => {
      setNetwork(EthereumNetwork[cid]);
    });
  }, [metamaskProvider, metamaskUserConnect]);

  const contract = useMemo(() => {
    return {
      daoFactory: new DAOFactoryConnect(network, metamaskProvider),
      daoStaking: new DAOStakingConnect(network, metamaskProvider),
      uniswapPool: new UniswapConnect(network, metamaskProvider),
    };
  }, [metamaskProvider, network]);

  const account = useMemo(() => {
    return accounts.length > 0 ? accounts[0] : undefined;
  }, [accounts]);

  return {
    event$,
    network,
    chainId: EthereumChainId[network],
    setNetwork,
    metamaskProvider,
    setMetamaskProvider,
    accounts,
    account,
    setAccounts,
    isConnected,
    setIsConnected,
    contract,
  };
};
