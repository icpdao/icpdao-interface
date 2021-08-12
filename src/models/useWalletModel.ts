import { useEventEmitter } from 'ahooks';
import detectEthereumProvider from '@metamask/detect-provider';
import { EthereumNetwork, getMetamask } from '@/utils/utils';
import { DAOFactoryConnect } from '@/services/ethereum-connect/factory';
import { useMemo, useState } from 'react';

export default () => {
  const metamaskUserConnect = getMetamask();
  const event$ = useEventEmitter();
  const [metamaskProvider, setMetamaskProvider] = useState<any>();
  const [network, setNetwork] = useState<string>('homestead');
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  useMemo(async () => {
    setMetamaskProvider(await detectEthereumProvider({ mustBeMetaMask: true }));
    if (metamaskProvider) {
      setNetwork(EthereumNetwork[await metamaskProvider.request({ method: 'eth_chainId' })]);
      setAccounts(await metamaskProvider.request({ method: 'eth_requestAccounts' }));
      metamaskProvider.on('accountsChanged', (acs: string[]) => {
        setAccounts(acs);
      });
      metamaskProvider.on('chainChanged', (cid: string) => {
        setNetwork(EthereumNetwork[cid]);
      });
      if (metamaskUserConnect !== 'disconnect') setIsConnected(true);
    }
  }, [metamaskProvider, metamaskUserConnect]);

  return {
    event$,
    network,
    setNetwork,
    metamaskProvider,
    setMetamaskProvider,
    accounts,
    setAccounts,
    isConnected,
    setIsConnected,
    contract: {
      daoFactory: new DAOFactoryConnect(network, metamaskProvider),
      daoStaking: new DAOFactoryConnect(network, metamaskProvider),
    },
  };
};
