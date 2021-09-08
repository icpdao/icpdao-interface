import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';

import styles from './index.less';
import TokenCreate from '@/pages/Dao/components/token/Create';
import { useDaoTokenConfigQuery } from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { useModel } from '@@/plugin-model/useModel';
import TokenCreateLP from '@/pages/Dao/components/token/CreateLP';
import TokenAddLP from '@/pages/Dao/components/token/AddLP';
import TokenManager from '@/pages/Dao/components/token/Manager';
import TokenMint from '@/pages/Dao/components/token/Mint';

const { TabPane } = Tabs;

type TokenConfigProps = {
  daoId: string;
};

export type TokenConfigComponentsProps = {
  daoId?: string;
  ethDAOId?: string;
  tokenAddress?: string;
  setTokenAddress?: (value: string) => void;
  setCurrentTab?: (value: string) => void;
};

const TokenConfig: React.FC<TokenConfigProps> = ({ daoId }) => {
  const intl = useIntl();
  const { data, loading, error } = useDaoTokenConfigQuery({ variables: { daoId } });
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [currentTab, setCurrentTab] = useState<string>('create');
  const { contract } = useModel('useWalletModel');

  useEffect(() => {
    if (!data?.daoTokenConfig?.ethDaoId) return;
    contract.daoFactory
      .getTokenAddress(data.daoTokenConfig.ethDaoId)
      .then((v: string) => setTokenAddress(v));
  }, [contract.daoFactory, data?.daoTokenConfig?.ethDaoId]);

  if (loading || error || !tokenAddress) return <PageLoading />;

  return (
    <>
      <Tabs
        className={styles.tokenConfigTabs}
        activeKey={currentTab}
        tabPosition={'left'}
        onChange={setCurrentTab}
      >
        <TabPane tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.create' })} key="create">
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
        >
          {currentTab === 'createPool' && <TokenCreateLP tokenAddress={tokenAddress} />}
        </TabPane>
        <TabPane tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.add_lp' })} key="addLP">
          {currentTab === 'addLP' && (
            <TokenAddLP tokenAddress={tokenAddress} setCurrentTab={setCurrentTab} />
          )}
        </TabPane>
        <TabPane
          tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.manager' })}
          key="manager"
        >
          {currentTab === 'manager' && <TokenManager tokenAddress={tokenAddress} />}
        </TabPane>
        <TabPane tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.mint' })} key="mint">
          {currentTab === 'mint' && (
            <TokenMint tokenAddress={tokenAddress} setCurrentTab={setCurrentTab} daoId={daoId} />
          )}
        </TabPane>
      </Tabs>
    </>
  );
};

export default TokenConfig;
