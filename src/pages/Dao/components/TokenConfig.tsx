import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Skeleton, Tabs } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';

import styles from './index.less';
import TokenCreate from '@/pages/Dao/components/token/Create';
import { useDaoTokenConfigQuery, useUpdateDaoBaseInfoMutation } from '@/services/dao/generated';
import { useModel } from '@@/plugin-model/useModel';
import TokenCreateLP from '@/pages/Dao/components/token/CreateLP';
import TokenAddLP from '@/pages/Dao/components/token/AddLP';
import TokenManager from '@/pages/Dao/components/token/Manager';
import TokenMint from '@/pages/Dao/components/token/Mint';
import { DAOTokenConnect } from '@/services/ethereum-connect/token';
import { ZeroAddress } from '@/services/ethereum-connect';
import { history } from 'umi';

const { TabPane } = Tabs;

type TokenConfigProps = {
  daoId: string;
  tokenSymbol: string;
  subType?: string;
};

export type TokenConfigComponentsProps = {
  daoId?: string;
  ethDAOId?: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  lpPoolAddress?: string;
  tokenContract?: DAOTokenConnect;
  setTokenAddress?: (value: string) => void;
  setLPPoolAddress?: (value: string) => void;
  setCurrentTab?: (value: string) => void;
};

const TokenConfig: React.FC<TokenConfigProps> = ({ daoId, tokenSymbol, subType }) => {
  const intl = useIntl();
  const { data, loading, error } = useDaoTokenConfigQuery({ variables: { daoId } });
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [currentTokenSymbol, setCurrentTokenSymbol] = useState<string>();
  const [lpPoolAddress, setLPPoolAddress] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<string>(subType || 'create');
  const { chainId, contract, network, metamaskProvider, isConnected, event$ } =
    useModel('useWalletModel');
  const [updateDaoBaseInfo] = useUpdateDaoBaseInfoMutation();

  const goCurrentTab = useCallback(
    (nextType) => {
      history.push(`/dao/${daoId}/config/token/${nextType}`);
      setCurrentTab(nextType);
    },
    [daoId],
  );

  const factoryContractChecked = useMemo(async () => {
    if (!contract.daoFactory) return;
    return await contract.daoFactory.check();
  }, [contract.daoFactory]);

  useEffect(() => {
    if (!data?.daoTokenConfig?.ethDaoId) return;
    contract.daoFactory.getTokenAddress(data.daoTokenConfig.ethDaoId).then((v: any) => {
      console.log(v);
      setTokenAddress(v.token);
    });
  }, [contract.daoFactory, data?.daoTokenConfig?.ethDaoId]);

  const tokenContract = useMemo(() => {
    if (!tokenAddress || tokenAddress === ZeroAddress) return undefined;
    return new DAOTokenConnect(tokenAddress, network, metamaskProvider);
  }, [metamaskProvider, network, tokenAddress]);

  useEffect(() => {
    if (!tokenContract) return;
    tokenContract.getLPPool().then((pd) => {
      setLPPoolAddress(pd);
    });
  }, [tokenContract]);

  useEffect(() => {
    if (!tokenContract) return;
    tokenContract.getToken().then((tokenInfo) => {
      setCurrentTokenSymbol(tokenInfo.symbol);
      if (tokenSymbol === tokenInfo.symbol) return;
      updateDaoBaseInfo({
        variables: {
          id: daoId,
          tokenAddress,
          tokenName: tokenInfo.name,
          tokenSymbol: tokenInfo.symbol,
          tokenChainId: chainId,
        },
      });
    });
  }, [
    daoId,
    metamaskProvider,
    network,
    tokenAddress,
    tokenContract,
    tokenSymbol,
    chainId,
    updateDaoBaseInfo,
  ]);

  const handlerMetamaskConnect = useCallback(() => {
    event$?.emit();
  }, [event$]);

  if (loading || error || !tokenAddress || !factoryContractChecked) return <Skeleton active />;

  return (
    <>
      {!isConnected && (
        <Button type="primary" onClick={() => handlerMetamaskConnect()}>
          {intl.formatMessage({
            id: 'pages.common.connect',
          })}
        </Button>
      )}
      {isConnected && (
        <Tabs
          className={styles.tokenConfigTabs}
          activeKey={currentTab}
          tabPosition={'left'}
          onChange={goCurrentTab}
        >
          <TabPane
            tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.create' })}
            key="create"
          >
            {currentTab === 'create' && (
              <TokenCreate
                ethDAOId={data?.daoTokenConfig?.ethDaoId || ''}
                tokenAddress={tokenAddress}
                setTokenAddress={setTokenAddress}
                daoId={daoId}
              />
            )}
          </TabPane>
          <TabPane
            tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.create_pool' })}
            key="createPool"
            disabled={!tokenAddress || tokenAddress === ZeroAddress}
          >
            {currentTab === 'createPool' && (
              <TokenCreateLP
                lpPoolAddress={lpPoolAddress}
                tokenAddress={tokenAddress}
                setLPPoolAddress={setLPPoolAddress}
                tokenContract={tokenContract}
              />
            )}
          </TabPane>
          <TabPane
            tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.add_lp' })}
            key="addLP"
            disabled={
              !tokenAddress ||
              tokenAddress === ZeroAddress ||
              !lpPoolAddress ||
              lpPoolAddress === ZeroAddress
            }
          >
            {currentTab === 'addLP' && (
              <TokenAddLP
                lpPoolAddress={lpPoolAddress}
                tokenContract={tokenContract}
                tokenAddress={tokenAddress}
                setCurrentTab={goCurrentTab}
              />
            )}
          </TabPane>
          <TabPane
            tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.manager' })}
            key="manager"
            disabled={!tokenAddress || tokenAddress === ZeroAddress}
          >
            {currentTab === 'manager' && <TokenManager tokenContract={tokenContract} />}
          </TabPane>
          <TabPane
            tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.mint' })}
            key="mint"
            disabled={!tokenAddress || tokenAddress === ZeroAddress}
          >
            {currentTab === 'mint' && (
              <TokenMint
                tokenAddress={tokenAddress}
                tokenSymbol={currentTokenSymbol}
                setCurrentTab={goCurrentTab}
                daoId={daoId}
                lpPoolAddress={lpPoolAddress}
                tokenContract={tokenContract}
              />
            )}
          </TabPane>
        </Tabs>
      )}
    </>
  );
};

export default TokenConfig;
