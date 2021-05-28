import type { ReactNode } from 'react';
import React, { useState } from 'react';

import { Button, Table, Space, Avatar, Input, Dropdown, Menu } from 'antd';

import { DownOutlined, UserOutlined } from '@ant-design/icons';

import StatCard from '@/components/StatCard';

import styles from '@/pages/Dao/components/DaoList.less';
import { useIntl, history } from 'umi';

const { Search } = Input;

const columns = [
  {
    title: 'No.',
    dataIndex: 'number',
    key: 'number',
    sorter: true,
  },
  {
    title: 'Dao name',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    render: (_, record) => (
      <Space size="middle">
        <Avatar size="small" icon={<UserOutlined />} />
        <span>{record.name}</span>
      </Space>
    ),
  },
  {
    title: 'Following',
    dataIndex: 'following',
    key: 'following',
    sorter: true,
  },
  {
    title: 'Job',
    dataIndex: 'job',
    key: 'job',
    sorter: true,
  },
  {
    title: 'Size',
    dataIndex: 'size',
    key: 'size',
    sorter: true,
  },
  {
    title: 'Token',
    dataIndex: 'token',
    key: 'token',
    sorter: true,
  },
  {
    title: '',
    key: 'action',
    render: () => <span>following</span>,
  },
];

const data = [
  {
    number: 1,
    name: 'icpdao',
    following: '6',
    job: '666',
    size: '1001',
    token: '123ID/$1231',
  },
  {
    number: 2,
    name: 'icpdao1',
    following: '6',
    job: '666',
    size: '1001',
    token: '123ID/$1231',
  },
  {
    number: 3,
    name: 'icpdao222',
    following: '6',
    job: '666',
    size: '1001',
    token: '123ID/$1231',
  },
];

export type SelectDropdownMenu = {
  key: string;
  title: string;
};

export type SelectDropdownProps = {
  selectKey: string;
  menuList: SelectDropdownMenu[];
  onMenuClick: any;
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

const DaoTable: React.FC = () => {
  const [daoData, setDaoData] = useState(data);
  const [loading, setLoading] = useState(false);
  const [filterSelectKey, sefilterSelectKey] = useState('all');
  const [searchText, setSearchText] = useState(null);

  console.log('searchText', searchText);
  const onChange = (pagination, filters, sorter, extra) => {
    console.log('onchange', extra);
    console.log(sorter);
    console.log(pagination);
    setLoading(true);
    setDaoData((oldData) => {
      return oldData.concat([
        {
          number: 4,
          name: 'icpdao33',
          following: '6',
          job: '666',
          size: '1001',
          token: '123ID/$1231',
        },
      ]);
    });
    setLoading(false);
  };

  const onSearch = (value) => {
    setSearchText(value);
  };

  const menuList: SelectDropdownMenu[] = [
    {
      key: 'all',
      title: 'All',
    },
    {
      key: 'following',
      title: 'Following',
    },
    {
      key: 'my_dao',
      title: 'My dao',
    },
  ];

  const statCardData = [
    {
      number: 123,
      title: 'Dao',
    },
    {
      number: 123,
      title: 'Dao',
    },
    {
      number: 123,
      title: 'Dao',
    },
    {
      number: 123,
      title: 'Dao',
    },
  ];

  const onMenuClick = (e) => {
    sefilterSelectKey(e.key);
  };

  return (
    <>
      <div className={styles.statCard}>
        <StatCard data={statCardData} />
      </div>

      <div className={styles.tableToolbar}>
        <Space>
          <Search placeholder="input search text" onSearch={onSearch} size="large" />
          <SelectDropdown
            selectKey={filterSelectKey}
            menuList={menuList}
            onMenuClick={onMenuClick}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        loading={loading}
        rowKey="number"
        dataSource={daoData}
        onChange={onChange}
      />
    </>
  );
};

const DaoList: React.FC = () => {
  const intl = useIntl();

  const onClick = () => {
    history.push('/dao/create');
  };

  return (
    <div className={styles.container}>
      <Button type="primary" size="large" onClick={onClick}>
        {intl.formatMessage({ id: 'pages.dao.component.dao_list.create_dao' })}
      </Button>

      <DaoTable />
    </div>
  );
};

export default DaoList;
