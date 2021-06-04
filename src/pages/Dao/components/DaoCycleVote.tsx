import React from 'react';
import { Table } from 'antd';
import { FormattedMessage } from 'umi';
import styles from './DaoCycleVote.less';

type DaoCycleVoteProps = {
  daoId: string;
};

const columns = [
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.head.pairings" />,
    dataIndex: 'pairings',
    key: 'pairings',
    render: (_: any, record: any) => {
      if (record.type === 0) {
        return (
          <div className="pairings">
            <div className="left">
              <div className="content">
                <div>name</div>
                <div>https://xxxxx.com</div>
                <div>Size: xxxx</div>
              </div>
            </div>
            <div className="right">
              <div className="content">
                <div>name</div>
                <div>https://xxxxx.com</div>
                <div>Size: xxxx</div>
              </div>
            </div>
          </div>
        );
      }
      if (record.type === 1) {
        return (
          <div className="pairings">
            <div className="all">
              <div className="content">
                <div>name</div>
                <div>https://xxxxx.com</div>
                <div>Size: xxxx</div>
              </div>
            </div>
          </div>
        );
      }
      return null;
    },
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.head.voter" />,
    dataIndex: 'voter',
    key: 'voter',
    sorter: true,
    render: (_: any, record: any) => {
      return <div className="voter">{record.voter}</div>;
    },
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.head.filter" />,
    dataIndex: 'filter',
    key: 'filter',
    filters: [
      { text: 'All', value: 0 },
      { text: 'Secret', value: 1 },
      { text: 'Public', value: 2 },
      { text: 'Mysel', value: 3 },
    ],
    filterMultiple: false,
    filteredValue: [0],
    render: (_: any, record: any) => {
      console.log(_, record);
      return <div className="filter">actions</div>;
    },
  },
];

const mockData = [
  {
    id: 1,
    left: 'icpper',
    right: 'xxx job title',
    type: 0,
    voter: 'user1',
  },
  {
    id: 1,
    left: 'xxx',
    right: 'xxx',
    type: 1,
    voter: 'user2',
  },
];

const DaoCycleVote: React.FC<DaoCycleVoteProps> = ({ daoId }) => {
  console.log(daoId);
  const loading = false;

  return (
    <>
      <Table
        rowClassName={styles.tableRow}
        columns={columns}
        loading={loading}
        rowKey="id"
        dataSource={mockData}
      />
    </>
  );
};

export default DaoCycleVote;
