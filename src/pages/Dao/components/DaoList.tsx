import type { ReactNode } from 'react';
import React, { useCallback, useMemo, useState } from 'react';

import { Button, Table, Space, Avatar, Input, Dropdown, Menu } from 'antd';

import { DownOutlined, UserOutlined } from '@ant-design/icons';

import StatCard from '@/components/StatCard';

import styles from '@/pages/Dao/components/DaoList.less';
import { FormattedMessage, useIntl, history } from 'umi';
import { DaoFollowTypeEnum, useDaoListQuery, useFollowDaoMutation } from '@/services/dao/generated';
import { useAccess } from '@@/plugin-access/access';
import { getGithubOAuthUrl } from '@/components/RightHeader/AvatarDropdown';
import AccessButton from '@/components/AccessButton';
import { AccessEnum } from '@/access';

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

const columns = (renderAction: (record: any) => ReactNode) => {
  return [
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
      render: (_: any, record: any) => renderAction(record),
    },
  ];
};

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
  const access = useAccess();
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
  const [followDao] = useFollowDaoMutation();

  const [daoFollowedStatus, setDaoFollowedStatus] = useState<Record<string, boolean>>({});
  const [daoFollowButtonLoading, setDaoFollowButtonLoading] = useState<Record<string, boolean>>({});

  const handlerFollowDao = useCallback(
    async (daoId: string, followType: DaoFollowTypeEnum) => {
      if (access.noLogin()) {
        window.location.href = getGithubOAuthUrl();
        return;
      }
      setDaoFollowButtonLoading((old) => ({ ...old, [daoId]: true }));
      await followDao({ variables: { daoId, followType } });
      if (followType === DaoFollowTypeEnum.Add)
        setDaoFollowedStatus((old) => ({ ...old, [daoId]: true }));
      if (followType === DaoFollowTypeEnum.Delete)
        setDaoFollowedStatus((old) => ({ ...old, [daoId]: false }));
      setDaoFollowButtonLoading((old) => ({ ...old, [daoId]: false }));
    },
    [access, followDao],
  );

  const renderFollowColumn = useCallback(
    (record: any) => {
      if (record?.isOwner) {
        return (
          <Button size={'small'}>
            <FormattedMessage id="pages.dao.component.dao_list.table.action.owner" />
          </Button>
        );
      }
      const daoId = record?.id || '';
      const unfollowingDom = (
        <Button
          loading={daoFollowButtonLoading[daoId] || false}
          size={'small'}
          onClick={async () => {
            await handlerFollowDao(daoId, DaoFollowTypeEnum.Delete);
          }}
        >
          <FormattedMessage id="pages.dao.component.dao_list.table.action.unfollowing" />
        </Button>
      );
      const followingDom = (
        <Button
          loading={daoFollowButtonLoading[daoId] || false}
          size={'small'}
          type={'primary'}
          onClick={async () => {
            await handlerFollowDao(daoId, DaoFollowTypeEnum.Add);
          }}
        >
          <FormattedMessage id="pages.dao.component.dao_list.table.action.following" />
        </Button>
      );
      if (daoFollowedStatus[daoId] !== undefined) {
        return <>{daoFollowedStatus[daoId] ? unfollowingDom : followingDom}</>;
      }
      if (record?.isFollowing) {
        return unfollowingDom;
      }
      return followingDom;
    },
    [daoFollowButtonLoading, daoFollowedStatus, handlerFollowDao],
  );

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
        size: parseFloat(item?.stat?.size || '0').toFixed(1),
        token: parseFloat(item?.stat?.token || '0').toFixed(2),
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
        number: parseFloat(data.daos.stat?.size || '0').toFixed(1),
      },
      {
        title: intl.formatMessage({ id: 'pages.dao.component.dao_list.stat.card.income' }),
        number: parseFloat(data.daos.stat?.income || '0').toFixed(2),
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
        columns={columns(renderFollowColumn)}
        loading={loading}
        rowKey="name"
        dataSource={daoData}
        onChange={onChange}
        pagination={{
          pageSize,
          total: daoDataTotalCount,
          current: daoTableParams.current,
          showSizeChanger: false,
        }}
      />
    </>
  );
};

const DaoList: React.FC<DaoListProps> = ({ menuList }) => {
  const intl = useIntl();
  // const { mentorWarningModal, setMentorWarningModalVisible } = useMentorWarningModal(false);

  const onClick = useCallback(() => {
    history.push('/dao/create');
  }, []);

  const createButton = useMemo(() => {
    return (
      <AccessButton
        allow={AccessEnum.NOMARL}
        className={styles.createDao}
        type="primary"
        size="large"
        onClick={onClick}
      >
        {intl.formatMessage({ id: 'pages.dao.component.dao_list.create_dao' })}
      </AccessButton>
    );
  }, [intl, onClick]);

  return (
    <>
      <div className={styles.container}>
        {createButton}
        <DaoTable menuList={menuList} />
      </div>
    </>
  );
};

export default DaoList;
