import React, { useState } from 'react';
import { Tabs } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';

import styles from './index.less';
import TokenCreate from '@/pages/Dao/components/token/Create';
import { useDaoTokenConfigQuery } from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { useRequest } from '@@/plugin-request/request';
import { ZeroAddress } from '@/services/ethereum-connect';
import { useModel } from '@@/plugin-model/useModel';

const { TabPane } = Tabs;

type TokenConfigProps = {
  daoId: string;
};

export type TokenConfigComponentsProps = {
  ethDAOId: string;
  tokenAddress?: string;
};

const TokenConfig: React.FC<TokenConfigProps> = ({ daoId }) => {
  const intl = useIntl();
  const { data, loading, error } = useDaoTokenConfigQuery({ variables: { daoId } });
  const [tokenAddress, setTokenAddress] = useState<string>(ZeroAddress);
  const { contract } = useModel('useWalletModel');
  useRequest(
    async () => {
      const ta = await contract.daoFactory.getTokenAddress(data?.daoTokenConfig?.ethDaoId || '');
      setTokenAddress(ta);
      return ta;
    },
    {
      ready: !loading && !error,
    },
  );
  if (loading || error) return <PageLoading />;
  return (
    <>
      <Tabs className={styles.tokenConfigTabs} defaultActiveKey="create" tabPosition={'left'}>
        <TabPane tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.create' })} key="create">
          <TokenCreate
            ethDAOId={data?.daoTokenConfig?.ethDaoId || ''}
            tokenAddress={tokenAddress || ZeroAddress}
          />
        </TabPane>
        <TabPane
          tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.create_pool' })}
          key="createPool"
        >
          Content of Tab Pane 2
        </TabPane>
        <TabPane tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.add_lp' })} key="addLP">
          Content of Tab Pane 3
        </TabPane>
        <TabPane
          tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.manager' })}
          key="manager"
        >
          Content of Tab Pane 3
        </TabPane>
        <TabPane tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.mint' })} key="mint">
          Content of Tab Pane 3
        </TabPane>
      </Tabs>
    </>
  );
};

export default TokenConfig;
