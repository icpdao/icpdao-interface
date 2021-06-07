import type { ReactNode } from 'react';
import React, { useCallback, useMemo, useState } from 'react';

import { Button, Table, Space, Avatar, Input, Dropdown, Menu } from 'antd';

import { DownOutlined, UserOutlined } from '@ant-design/icons';

import StatCard from '@/components/StatCard';

import styles from '@/pages/Dao/components/DaoList.less';
import { FormattedMessage, useIntl, history } from 'umi';
import { useDaoListQuery } from '@/services/dao/generated';
import { useAccess } from '@@/plugin-access/access';

const { Search } = Input;

export type SelectDropdownMenu = {
  key: string;
  title: string;
};

type SelectDropdownProps = {
  selectKey: string;
  menuList: SelectDropdownMenu[];
  onMenuClick: any;
};

type DaoTableParams = {
  filter: string;
  sorted?: string;
  sortedType?: string;
  search?: string;
  pageSize?: number;
  current?: number;
};

type DaoQueryParams = {
  filter: string;
  sorted?: string;
  sortedType?: string;
  search?: string;
  first?: number;
  offset?: number;
};

type DaoTableProps = {
  menuList: SelectDropdownMenu[];
};

export type DaoListProps = {
  menuList: SelectDropdownMenu[];
};

const columns = [
  {
    title: <FormattedMessage id="pages.dao.component.dao_list.table.head.dao_name" />,
    dataIndex: 'name',
    key: 'name',
    render: (_: any, record: any) => (
      <Space size="middle">
        <Avatar size="small" icon={<UserOutlined />} />
        <span>
          <a
            onClick={(event) => {
              event.preventDefault();
              history.push(`/dao/${record.id}`);
            }}
          >
            {record.name}
          </a>
        </span>
      </Space>
    ),
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_list.table.head.following" />,
    dataIndex: 'following',
    key: 'following',
    sorter: true,
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_list.table.head.job" />,
    dataIndex: 'job',
    key: 'job',
    sorter: true,
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_list.table.head.size" />,
    dataIndex: 'size',
    key: 'size',
    sorter: true,
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_list.table.head.token" />,
    dataIndex: 'token',
    key: 'token',
    sorter: true,
  },
  {
    title: '',
    key: 'action',
    render: (_: any, record: any) => {
      if (record.isFollowing) {
        return (
          <span>
            <FormattedMessage id="pages.dao.component.dao_list.table.aciton.following" />
          </span>
        );
      }
      if (record.isOwner) {
        return (
          <span>
            <FormattedMessage id="pages.dao.component.dao_list.table.aciton.owner" />
          </span>
        );
      }
      return <span></span>;
    },
  },
];

const SelectDropdown: React.FC<SelectDropdownProps> = ({ selectKey, menuList, onMenuClick }) => {
  let buttonTitle: string = menuList[0].title;
  const menuNodeList: ReactNode[] = [];
  menuList.forEach((item: SelectDropdownMenu) => {
    if (item.key === selectKey) {
      buttonTitle = item.title;
    }
    menuNodeList.push(<Menu.Item key={item.key}>{item.title}</Menu.Item>);
  });
  const filterMenu = <Menu onClick={onMenuClick}>{menuNodeList}</Menu>;

  return (
    <Dropdown overlay={filterMenu}>
      <Button size="large">
        {buttonTitle} <DownOutlined />
      </Button>
    </Dropdown>
  );
};

const DaoTable: React.FC<DaoTableProps> = ({ menuList }) => {
  const pageSize = 10;
  const intl = useIntl();
  const [daoTableParams, setDaoTableParams] = useState<DaoTableParams>({
    filter: menuList[0].key,
    current: 1,
    pageSize,
  });

  const daoQueryParams = useMemo<DaoQueryParams>(() => {
    const tmp: any = { ...daoTableParams };
    if (daoTableParams.current && daoTableParams.pageSize) {
      tmp.first = daoTableParams.pageSize;
      tmp.offset = daoTableParams.pageSize * (daoTableParams.current - 1);
      delete tmp.current;
      delete tmp.pageSize;
    }
    return tmp;
  }, [daoTableParams]);

  const onMenuClick = useCallback((e: any) => {
    setDaoTableParams((oldParams) => {
      const updateValues: DaoQueryParams = {
        filter: e.key,
      };
      const res = { ...oldParams, ...updateValues };
      res.current = 1;
      res.pageSize = pageSize;
      return res;
    });
  }, []);

  const onChange = useCallback((pagination: any, filters: any, sorter: any, extra: any) => {
    setDaoTableParams((oldParams) => {
      const updateValues: DaoTableParams = {
        filter: oldParams.filter,
        pageSize: pagination.pageSize,
        current: pagination.current,
        sorted: sorter.field,
        sortedType: 'asc',
      };
      if (sorter.order === 'ascend') {
        updateValues.sortedType = 'asc';
      }
      if (sorter.order === 'descend') {
        updateValues.sortedType = 'desc';
      }
      const res = { ...oldParams, ...updateValues };
      if (!sorter.order) {
        delete res.sorted;
        delete res.sortedType;
      }
      if (extra.action === 'sort') {
        res.current = 1;
        res.pageSize = pageSize;
      }
      return res;
    });
  }, []);

  const onSearch = useCallback((value: string) => {
    setDaoTableParams((oldParams) => {
      const updateValues: DaoTableParams = {
        filter: oldParams.filter,
        search: value,
      };
      const res = { ...oldParams, ...updateValues };
      res.current = 1;
      res.pageSize = pageSize;
      if (value === '') {
        delete res.search;
      }
      return res;
    });
  }, []);

  const { data, loading } = useDaoListQuery({
    variables: daoQueryParams as any,
    fetchPolicy: 'no-cache',
  });

  const daoDataTotalCount: number = useMemo(() => {
    return data?.daos?.total || 0;
  }, [data]);

  const daoData: any[] = useMemo(() => {
    if (!data?.daos?.dao) {
      return [];
    }
    return data.daos.dao.map((item) => {
      return {
        id: item?.datum?.id,
        name: item?.datum?.name,
        following: item?.stat?.following,
        job: item?.stat?.job,
        size: item?.stat?.size,
        token: item?.stat?.token,
        isFollowing: item?.isFollowing,
        isOwner: item?.isOwner,
      };
    });
  }, [data]);

  const statCardData: any[] = useMemo(() => {
    if (!data?.daos?.dao) {
      return [
        {
          title: intl.formatMessage({ id: 'pages.dao.component.dao_list.stat.card.dao' }),
          number: 0,
        },
        {
          title: intl.formatMessage({ id: 'pages.dao.component.dao_list.stat.card.icpper' }),
          number: 0,
        },
        {
          title: intl.formatMessage({ id: 'pages.dao.component.dao_list.stat.card.size' }),
          number: 0,
        },
        {
          title: intl.formatMessage({ id: 'pages.dao.component.dao_list.stat.card.income' }),
          number: 0,
        },
      ];
    }
    return [
      {
        title: intl.formatMessage({ id: 'pages.dao.component.dao_list.stat.card.dao' }),
        number: data.daos.total,
      },
      {
        title: intl.formatMessage({ id: 'pages.dao.component.dao_list.stat.card.icpper' }),
        number: data.daos.stat?.icpper,
      },
      {
        title: intl.formatMessage({ id: 'pages.dao.component.dao_list.stat.card.size' }),
        number: data.daos.stat?.size,
      },
      {
        title: intl.formatMessage({ id: 'pages.dao.component.dao_list.stat.card.income' }),
        number: data.daos.stat?.income,
      },
    ];
  }, [data, intl]);

  return (
    <>
      <div className={styles.statCard}>
        <StatCard data={statCardData} />
      </div>

      <div className={styles.tableToolbar}>
        <Space>
          <Search
            placeholder={intl.formatMessage({
              id: 'pages.dao.component.dao_list.input.search.placeholder',
            })}
            onSearch={onSearch}
            size="large"
          />
          <SelectDropdown
            selectKey={daoTableParams.filter}
            menuList={menuList}
            onMenuClick={onMenuClick}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        loading={loading}
        rowKey="name"
        dataSource={daoData}
        onChange={onChange}
        pagination={{
          pageSize,
          total: daoDataTotalCount,
          current: daoTableParams.current,
        }}
      />
    </>
  );
};

const DaoList: React.FC<DaoListProps> = ({ menuList }) => {
  const access = useAccess();
  const intl = useIntl();

  const onClick = useCallback(() => {
    history.push('/dao/create');
  }, []);

  const canInviteIcpper = access.canInviteIcpper();

  const createButton = useMemo(() => {
    if (canInviteIcpper) {
      return (
        <Button type="primary" size="large" onClick={onClick}>
          {intl.formatMessage({ id: 'pages.dao.component.dao_list.create_dao' })}
        </Button>
      );
    }
    return null;
  }, [canInviteIcpper, intl, onClick]);

  return (
    <div className={styles.container}>
      {createButton}

      <DaoTable menuList={menuList} />
    </div>
  );
};

export default DaoList;
