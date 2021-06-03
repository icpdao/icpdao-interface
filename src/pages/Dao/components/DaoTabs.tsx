import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useIntl } from 'umi';

import { Menu, Tabs, Dropdown, Empty } from 'antd';

const { TabPane } = Tabs;

type cycleContentProps = {
  daoId: string;
  selectKey: string | null;
};

type DaoTabsProps = {
  daoId: string;
};

type IcpperStatProps = {
  daoId: string;
};

type JobSatProps = {
  daoId: string;
};

type CycleIcpperProps = {
  daoId: string;
};

type CycleJobProps = {
  daoId: string;
};

type CycleVoteProps = {
  daoId: string;
};

const IcpperStat: React.FC<IcpperStatProps> = ({ daoId }) => {
  console.log('IcpperStat', daoId);
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};

const JobStat: React.FC<JobSatProps> = ({ daoId }) => {
  console.log('JobStat', daoId);
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};

const CycleIcpper: React.FC<CycleIcpperProps> = ({ daoId }) => {
  console.log('CycleIcpper', daoId);
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};

const CycleJob: React.FC<CycleJobProps> = ({ daoId }) => {
  console.log('CycleJob', daoId);
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};

const CycleVote: React.FC<CycleVoteProps> = ({ daoId }) => {
  console.log('CycleVote', daoId);
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};

const CycleContent: React.FC<cycleContentProps> = ({ selectKey, daoId }) => {
  console.log('cycleContent', daoId, selectKey);
  if (selectKey === 'icpper') {
    return <CycleIcpper daoId={daoId} />;
  }
  if (selectKey === 'job') {
    return <CycleJob daoId={daoId} />;
  }
  if (selectKey === 'vote') {
    return <CycleVote daoId={daoId} />;
  }
  return null;
};

const DaoTabs: React.FC<DaoTabsProps> = ({ daoId }) => {
  const intl = useIntl();
  const currentSelectMenuKey = useRef<string | null>(null);
  const [selectMenuKey, setSelectMenuKey] = useState<string | null>(null);
  const [selectTabKey, setSelectTabKey] = useState<string>('icpper');

  const menuKeyInfo = useMemo(() => {
    return {
      icpper: intl.formatMessage({ id: 'pages.dao.component.dao_tabs.tab.cycle.sub_tab.icpper' }),
      job: intl.formatMessage({ id: 'pages.dao.component.dao_tabs.tab.cycle.sub_tab.job' }),
      vote: intl.formatMessage({ id: 'pages.dao.component.dao_tabs.tab.cycle.sub_tab.vote' }),
    };
  }, [intl]);

  const tabKeyInfo = useMemo(() => {
    return {
      icpper: intl.formatMessage({ id: 'pages.dao.component.dao_tabs.tab.icpper' }),
      job: intl.formatMessage({ id: 'pages.dao.component.dao_tabs.tab.job' }),
      cycle: intl.formatMessage({ id: 'pages.dao.component.dao_tabs.tab.cycle' }),
    };
  }, [intl]);

  const handleMenuClick = useCallback((menuKey) => {
    currentSelectMenuKey.current = menuKey.key;
  }, []);

  const handleTabClick = useCallback((tabKey) => {
    if (tabKey !== 'cycle') {
      currentSelectMenuKey.current = null;
      setSelectMenuKey(null);
      setSelectTabKey(tabKey);
      return;
    }

    if (tabKey === 'cycle' && currentSelectMenuKey.current) {
      setSelectMenuKey(currentSelectMenuKey.current);
      setSelectTabKey(tabKey);
      currentSelectMenuKey.current = null;
      return;
    }

    setSelectTabKey((oldSelectTabKey) => {
      return oldSelectTabKey;
    });
  }, []);

  const cycleDropdownMenu = useMemo(() => {
    return (
      <Menu onClick={handleMenuClick}>
        <Menu.Item key="icpper">{menuKeyInfo.icpper}</Menu.Item>
        <Menu.Item key="job">{menuKeyInfo.job}</Menu.Item>
        <Menu.Item key="vote">{menuKeyInfo.vote}</Menu.Item>
      </Menu>
    );
  }, [handleMenuClick, menuKeyInfo]);

  const cycleDropdown = useMemo(() => {
    let text = tabKeyInfo.cycle;
    if (selectMenuKey) {
      text = `${tabKeyInfo.cycle}:${menuKeyInfo[selectMenuKey]}`;
    }
    return (
      <Dropdown overlay={cycleDropdownMenu}>
        <span>{text}</span>
      </Dropdown>
    );
  }, [cycleDropdownMenu, menuKeyInfo, selectMenuKey, tabKeyInfo]);

  return (
    <Tabs activeKey={selectTabKey} onTabClick={handleTabClick}>
      <TabPane tab={tabKeyInfo.icpper} key="icpper">
        <IcpperStat daoId={daoId} />
      </TabPane>

      <TabPane tab={tabKeyInfo.job} key="job">
        <JobStat daoId={daoId} />
      </TabPane>

      <TabPane tab={cycleDropdown} key="cycle">
        <CycleContent selectKey={selectMenuKey} daoId={daoId} />
      </TabPane>
    </Tabs>
  );
};

export default DaoTabs;
