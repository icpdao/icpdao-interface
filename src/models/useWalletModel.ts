import { useEventEmitter } from 'ahooks';
import detectEthereumProvider from '@metamask/detect-provider';
import { EthereumNetwork, getMetamask } from '@/utils/utils';
import { DAOFactoryConnect } from '@/services/ethereum-connect/factory';
import { useMemo, useState } from 'react';
import { UniswapConnect } from '@/services/ethereum-connect/uniswap';
import { DAOStakingConnect } from '@/services/ethereum-connect/staking';

export default () => {
  const metamaskUserConnect = getMetamask();
  const event$ = useEventEmitter();
  const [metamaskProvider, setMetamaskProvider] = useState<any>();
  const [network, setNetwork] = useState<string>('homestead');
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  useMemo(async () => {
    setMetamaskProvider(await detectEthereumProvider({ mustBeMetaMask: true }));
    if (
      metamaskProvider &&
      metamaskProvider.isConnected() &&
      (await metamaskProvider['_metamask'].isUnlocked()) &&
      metamaskUserConnect === 'connect'
    ) {
      setNetwork(EthereumNetwork[await metamaskProvider.request({ method: 'eth_chainId' })]);
      setAccounts(await metamaskProvider.request({ method: 'eth_requestAccounts' }));
      metamaskProvider.on('accountsChanged', (acs: string[]) => {
        setAccounts(acs);
      });
      metamaskProvider.on('chainChanged', (cid: string) => {
        setNetwork(EthereumNetwork[cid]);
      });
      setIsConnected(true);
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
      daoStaking: new DAOStakingConnect(network, metamaskProvider),
      uniswapPool: new UniswapConnect(network, metamaskProvider),
    },
  };
};
