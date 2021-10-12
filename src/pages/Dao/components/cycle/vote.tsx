import React, { useCallback, useMemo, useState } from 'react';
import { message, Row, Table, TablePaginationConfig } from 'antd';
import { FormattedMessage } from 'umi';
import styles from './index.less';
import type { DaoCycleProps } from './index';
import type {
  CycleVoteListQueryVariables,
  CycleVoteQuery,
  JobItemQuery,
} from '@/services/dao/generated';
import {
  JobsQuerySortedEnum,
  JobsQuerySortedTypeEnum,
  useCycleVoteListQuery,
  useUpdateVotePairPublicMutation,
} from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import {
  CheckCircleFilled,
  FrownOutlined,
  HourglassOutlined,
  LockOutlined,
  SmileOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { useModel } from '@@/plugin-model/useModel';
import { getCurrentPage } from '@/utils/utils';

const voteRender = (data: JobItemQuery | null | undefined, voted: boolean | undefined) => {
  return (
    <div className={styles.voteCell}>
      <div className={styles.voteCellContent}>
        <Row>{data?.user?.nickname}</Row>
        <Row>
          <a
            href={`https://github.com/${data?.datum?.githubRepoOwner}/${data?.datum?.githubRepoName}/issues/${data?.datum?.githubIssueNumber}`}
            target="_blank"
          >
            {data?.datum?.title}
          </a>
        </Row>
        <Row>Size: {data?.datum?.size}</Row>
        {voted === true && data?.datum?.pairType === 0 && (
          <div className={styles.voteCellCheck}>
            <CheckCircleFilled style={{ fontSize: 21, color: '#2F80ED' }} />
          </div>
        )}
      </div>
    </div>
  );
};

const allVoteRender = (data: JobItemQuery | null | undefined, voted: number | null | undefined) => {
  return (
    <div className={styles.voteCell}>
      {!!voted && voted >= 50 && (
        <div className={styles.voteCellValidTips}>
          <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.pairing.voted" />
        </div>
      )}
      {!!voted && voted < 50 && (
        <div className={styles.voteCellNoValidTips}>
          <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.pairing.novoted" />
        </div>
      )}
      <div className={styles.voteCellContent}>
        <Row>{data?.user?.nickname}</Row>
        <Row>
          <a
            href={`https://github.com/${data?.datum?.githubRepoOwner}/${data?.datum?.githubRepoName}/issues/${data?.datum?.githubIssueNumber}`}
            target="_blank"
          >
            {data?.datum?.title}
          </a>
        </Row>
        <Row>Size: {data?.datum?.size}</Row>
      </div>
    </div>
  );
};

const columns = (
  owner: boolean,
  userId: string,
  filterValue: number,
  isCycleVoting: boolean,
  updateVotePairPublic: (voteId: string, isPublic: boolean) => void,
) => {
  return [
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.head.pairings" />,
      dataIndex: ['leftJob', 'datum', 'id'],
      colSpan: 2,
      render: (_: any, record: CycleVoteQuery) => {
        if (record.datum?.voteType === 1) {
          return {
            children: allVoteRender(record.leftJob, record?.datum?.voteResultStatTypeAll),
            props: { colSpan: 2 },
          };
        }
        return voteRender(record.leftJob, record.voteJob?.datum?.id === record.leftJob?.datum?.id);
      },
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.head.pairings" />,
      dataIndex: ['rightJob', 'datum', 'id'],
      colSpan: 0,
      render: (_: any, record: CycleVoteQuery) => {
        if (record.datum?.voteType === 1) {
          return {
            children: <span>{record.datum?.voteType}</span>,
            props: { colSpan: 0 },
          };
        }
        return voteRender(
          record.rightJob,
          record.voteJob?.datum?.id === record.rightJob?.datum?.id,
        );
      },
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_vote.table.head.voter" />,
      dataIndex: 'voter',
      sorter: true,
      render: (_: any, record: CycleVoteQuery) => {
        if (!owner) {
          return {
            children: <></>,
            props: { colSpan: 0 },
          };
        }
        if (record.datum?.voteType === 1) {
          return (
            <div className={styles.voterCell}>
              <div>Everyone</div>
            </div>
          );
        }
        return (
          <div className={styles.voterCell}>
            <div>{record.voter?.nickname}</div>
          </div>
        );
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
      filteredValue: [filterValue],
      render: (_: any, record: CycleVoteQuery) => {
        if (isCycleVoting) {
          return (
            <div className={styles.filterCell}>
              <div>
                <HourglassOutlined />
              </div>
            </div>
          );
        }
        if (record.datum?.voteType === 0) {
          if (record.voter?.id === userId && record.datum.isResultPublic) {
            return (
              <div className={styles.filterCell}>
                <div>
                  <UnlockOutlined
                    style={{ fontSize: 21, color: '#2F80ED', cursor: 'pointer' }}
                    onClick={() => updateVotePairPublic(record.datum?.id || '', false)}
                  />
                </div>
              </div>
            );
          }
          if (record.voter?.id === userId && !record.datum.isResultPublic) {
            return (
              <div className={styles.filterCell}>
                <div>
                  <LockOutlined
                    style={{ fontSize: 21, color: '#2F80ED', cursor: 'pointer' }}
                    onClick={() => updateVotePairPublic(record.datum?.id || '', true)}
                  />
                </div>
              </div>
            );
          }
          return <></>;
        }
        if (record.datum?.voteType === 1) {
          return (
            <div className={styles.filterCell}>
              <div>
                <Row style={{ marginBottom: 21 }}>
                  <span>
                    <SmileOutlined style={{ fontSize: 21 }} />
                  </span>
                  <span style={{ marginLeft: '12.5px' }}>
                    {record.datum.voteResultStatTypeAll}%
                  </span>
                </Row>
                <Row>
                  <span>
                    <FrownOutlined style={{ fontSize: 21 }} />
                  </span>
                  <span style={{ marginLeft: '12.5px' }}>
                    {100 - (record.datum.voteResultStatTypeAll || 0)}%
                  </span>
                </Row>
              </div>
            </div>
          );
        }
        return <></>;
      },
    },
  ];
};

const getFilterValue = (isPublic: boolean | undefined, isMyself: boolean | undefined) => {
  if (isPublic === undefined && isMyself === undefined) return 0;
  if (isPublic === false) return 1;
  if (isPublic === true) return 2;
  if (isMyself === true) return 3;
  return 0;
};

const DaoCycleVote: React.FC<DaoCycleProps> = ({ cycleId, cycle, userRole }) => {
  const { initialState } = useModel('@@initialState');
  const [queryVariables, setQueryVariables] = useState<CycleVoteListQueryVariables>({
    cycleId,
    first: 20,
    offset: 0,
  });

  const { data, loading, error, refetch } = useCycleVoteListQuery({
    variables: queryVariables,
    fetchPolicy: 'no-cache',
  });
  useMemo(() => {
    refetch();
  }, [refetch]);
  const [updateVotePairPublicMutation] = useUpdateVotePairPublicMutation();
  const userId = useMemo(() => {
    return initialState?.currentUser()?.profile?.id || '';
  }, [initialState]);
  const updateVotePairPublic = useCallback(
    async (voteId: string, isPublic: boolean) => {
      try {
        const uvd = await updateVotePairPublicMutation({ variables: { voteId, isPublic } });
        await refetch();
        if (uvd.data?.changeVoteResultPublic?.ok) message.success('Update Vote Public Success');
        else message.error('Update Vote Public Failed');
      } catch (e) {
        message.error('Update Vote Public Failed');
      }
    },
    [refetch, updateVotePairPublicMutation],
  );
  const tableChange = useCallback(
    (pagination: TablePaginationConfig, filters: any, sorter: any) => {
      let sorted: JobsQuerySortedEnum | undefined;
      if (sorter && sorter.field && sorter.field.includes('size')) {
        sorted = JobsQuerySortedEnum.Size;
      }
      if (sorter && sorter.field && sorter.field.includes('income')) {
        sorted = JobsQuerySortedEnum.Income;
      }
      let sortedType: JobsQuerySortedTypeEnum | undefined;
      if (sorter && sorter.order === 'ascend') {
        sortedType = JobsQuerySortedTypeEnum.Asc;
      }
      if (sorter && sorter.order === 'descend') {
        sortedType = JobsQuerySortedTypeEnum.Desc;
      }
      let isPublic: boolean | undefined;
      let isMyself: boolean | undefined;
      if (filters.filter && filters.filter.includes(0)) {
        isPublic = undefined;
        isMyself = undefined;
      }
      if (filters.filter && filters.filter.includes(1)) {
        isPublic = false;
        isMyself = undefined;
      }
      if (filters.filter && filters.filter.includes(2)) {
        isPublic = true;
        isMyself = undefined;
      }
      if (filters.filter && filters.filter.includes(3)) {
        isPublic = undefined;
        isMyself = true;
      }
      setQueryVariables((old) => ({
        ...old,
        first: pagination.pageSize,
        offset: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
        sorted,
        sortedType,
        isPublic,
        isMyself,
      }));
    },
    [],
  );
  if (loading || error) {
    return <PageLoading />;
  }

  const isCycleVoting = parseInt(moment.utc().format('X'), 10) <= (cycle?.voteEndAt || 0);
  return (
    <>
      <Table<CycleVoteQuery>
        className={styles.tabTable}
        rowClassName={styles.tableRow}
        columns={columns(
          userRole === 'owner',
          userId,
          getFilterValue(
            queryVariables.isPublic || undefined,
            queryVariables.isMyself || undefined,
          ),
          isCycleVoting,
          updateVotePairPublic,
        )}
        loading={loading}
        rowKey={(record) => record?.datum?.id || ''}
        dataSource={data?.cycle?.votes?.nodes as any}
        onChange={(pagination, filters, sorter) => {
          tableChange(pagination, filters, sorter);
        }}
        pagination={{
          pageSize: queryVariables.first || 10,
          total: data?.cycle?.votes?.total || 0,
          current: getCurrentPage(queryVariables.offset || 0, queryVariables.first || 10),
        }}
      />
    </>
  );
};

export default DaoCycleVote;
