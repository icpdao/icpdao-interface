import React, { useState } from 'react';
import { Row, Table } from 'antd';
import { FormattedMessage } from 'umi';
import styles from './index.less';
import type { DaoCycleProps } from './index';
import type {
  CycleVoteListQueryVariables,
  CycleVoteQuery,
  JobItemQuery,
} from '@/services/dao/generated';
import { useCycleVoteListQuery } from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { CheckCircleFilled } from '@ant-design/icons';

const voteRender = (data: JobItemQuery | null | undefined, voted: boolean | undefined) => {
  return (
    <>
      {voted === true && data?.datum?.pairType === 1 && (
        <Row>
          <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.pairing.voted" />
        </Row>
      )}
      {voted === false && data?.datum?.pairType === 1 && (
        <Row>
          <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.pairing.novoted" />
        </Row>
      )}
      <Row>{data?.user?.nickname}</Row>
      <Row>
        <a
          href={`https://github.com/${data?.datum?.githubRepoOwner}/${data?.datum?.githubRepoName}/${data?.datum?.githubIssueNumber}`}
          target="_blank"
        >
          {data?.datum?.title}
        </a>
      </Row>
      <Row>Size: {data?.datum?.size}</Row>
      {voted === true && data?.datum?.pairType === 0 && <CheckCircleFilled color={'#2F80ED'} />}
    </>
  );
};

const ownerColumns = [
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.head.pairings" />,
    dataIndex: ['leftJob', 'datum', 'id'],
    render: (_: any, record: CycleVoteQuery) => {
      return voteRender(record.leftJob, record.voteJob?.datum?.id === record.leftJob?.datum?.id);
    },
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.head.pairings" />,
    dataIndex: ['rightJob', 'datum', 'id'],
    render: (_: any, record: CycleVoteQuery) => {
      if (record.datum?.voteType === 1) {
        return {
          children: '',
          props: { colSpan: 0 },
        };
      }
      return voteRender(record.rightJob, record.voteJob?.datum?.id === record.leftJob?.datum?.id);
    },
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.head.voter" />,
    dataIndex: 'voter',
    sorter: true,
    render: (_: any, record: CycleVoteQuery) => {
      return <>{record.voter?.nickname}</>;
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
      { text: 'Myself', value: 3 },
    ],
    filterMultiple: false,
    filteredValue: [0],
    render: (_: any, record: any) => {
      console.log(_, record);
      return <div className="filter">actions</div>;
    },
  },
];

const DaoCycleVote: React.FC<DaoCycleProps> = ({ cycleId }) => {
  const [queryVariables] = useState<CycleVoteListQueryVariables>({ cycleId, first: 20, offset: 0 });
  const { data, loading, error } = useCycleVoteListQuery({ variables: queryVariables });

  if (loading || error) {
    return <PageLoading />;
  }

  return (
    <>
      <Table<CycleVoteQuery>
        className={styles.tabTable}
        rowClassName={styles.tableRow}
        columns={ownerColumns}
        loading={loading}
        rowKey={(record) => record?.datum?.id || ''}
        dataSource={data?.cycle?.votes?.nodes as any}
      />
    </>
  );
};

export default DaoCycleVote;
