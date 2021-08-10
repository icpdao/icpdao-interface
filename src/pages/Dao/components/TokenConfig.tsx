import React from 'react';
import { Tabs } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';

import styles from './index.less';
import TokenCreate from '@/pages/Dao/components/token/Create';

const { TabPane } = Tabs;

type TokenConfigProps = {
  daoId: string;
};

const TokenConfig: React.FC<TokenConfigProps> = () => {
  const intl = useIntl();

  return (
    <>
      <Tabs className={styles.tokenConfigTabs} defaultActiveKey="create" tabPosition={'left'}>
        <TabPane tab={intl.formatMessage({ id: 'pages.dao.config.tab.token.create' })} key="create">
          <TokenCreate />
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
