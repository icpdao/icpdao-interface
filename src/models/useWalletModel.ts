import { useEventEmitter } from 'ahooks';
import detectEthereumProvider from '@metamask/detect-provider';
import { EthereumChainId, EthereumNetwork, getMetamask } from '@/utils/utils';
import { DAOFactoryConnect } from '@/services/ethereum-connect/factory';
import { useEffect, useMemo, useState } from 'react';
import { UniswapConnect } from '@/services/ethereum-connect/uniswap';
import { DAOStakingConnect } from '@/services/ethereum-connect/staking';

export default () => {
  const metamaskUserConnect = getMetamask();
  const event$ = useEventEmitter();
  const [metamaskProvider, setMetamaskProvider] = useState<any>();
  const [network, setNetwork] = useState<string>('homestead');
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  useEffect(() => {
    detectEthereumProvider({ mustBeMetaMask: true }).then((v: any) => {
      setMetamaskProvider(v);
      if (!v) return;
      if (!v.isConnected()) return;
      if (metamaskUserConnect !== 'connect') return;
      v['_metamask'].isUnlocked().then((unl: boolean) => {
        if (!unl) return;
        v.request({ method: 'eth_chainId' }).then((chainId: any) => {
          setNetwork(EthereumNetwork[chainId]);
          v.request({ method: 'eth_requestAccounts' }).then((accs: any) => {
            setAccounts(accs);
            setIsConnected(true);
          });
        });
        v.on('accountsChanged', (acs: string[]) => {
          setAccounts(acs);
        });
        v.on('chainChanged', (cid: string) => {
          setNetwork(EthereumNetwork[cid]);
        });
      });
    });
  }, [metamaskUserConnect]);

  const contract = useMemo(() => {
    return {
      daoFactory: new DAOFactoryConnect(network, metamaskProvider),
      daoStaking: new DAOStakingConnect(network, metamaskProvider),
      uniswapPool: new UniswapConnect(network, metamaskProvider),
    };
  }, [metamaskProvider, network]);

  return {
    event$,
    network,
    chainId: EthereumChainId[network],
    setNetwork,
    metamaskProvider,
    setMetamaskProvider,
    accounts,
    account: accounts.length > 0 ? accounts[0] : undefined,
    setAccounts,
    isConnected,
    setIsConnected,
    contract,
  };
};
