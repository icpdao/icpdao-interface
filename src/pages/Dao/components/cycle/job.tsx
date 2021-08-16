import React, { useCallback, useState } from 'react';
import type { TablePaginationConfig } from 'antd';
import { Avatar, Button, message, Select, Space, Table, Progress } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import { FormattedMessage } from 'umi';
import type { DaoCycleProps } from './index';
import type { CycleJobListQueryVariables, JobQuery } from '@/services/dao/generated';
import {
  CycleVotePairTaskStatusEnum,
  JobsQueryPairTypeEnum,
  JobsQuerySortedEnum,
  JobsQuerySortedTypeEnum,
  UpdateJobVoteTypeByOwnerArgumentPairTypeEnum,
  useBeginCyclePairTaskMutation,
  useCycleJobListQuery,
  useCyclePairStatusQuery,
  useUpdateCycleJobVoteTypeByOwnerMutation,
} from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { getCurrentPage } from '@/utils/utils';
import { UserOutlined } from '@ant-design/icons';
import { history } from '@@/core/history';
import styles from './index.less';
import GlobalModal from '@/components/Modal';
import moment from 'moment';

const ownerColumns = (
  daoId: string,
  pairTypeFilter: number[] | undefined,
  disableUpdateJobPairType: boolean,
  updateJobPairType: (recordId: string, pairType: number) => void,
  updatingJobId: string,
) => {
  return [
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.icpper" />,
      dataIndex: 'user',
      key: 'user',
      render: (_: any, record: JobQuery) => (
        <Space size="middle">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>
            <a
              onClick={(event) => {
                event.preventDefault();
                history.push(`/job?userName=${record.user?.githubLogin}&daoId=${daoId}`);
              }}
            >
              {record.user?.nickname}
            </a>
          </span>
        </Space>
      ),
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.job" />,
      dataIndex: ['datum', 'id'],
      key: 'job',
      sorter: true,
      render: (_: any, record: JobQuery) => (
        <a
          href={`https://github.com/${record.datum?.githubRepoOwner}/${record.datum?.githubRepoName}/issues/${record.datum?.githubIssueNumber}`}
          target={'_blank'}
        >
          {record.datum?.title}
        </a>
      ),
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.size" />,
      dataIndex: ['datum', 'size'],
      key: 'size',
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.income" />,
      dataIndex: ['datum', 'income'],
      key: 'income',
      sorter: true,
      render: () => <>-</>,
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.vote_type" />,
      dataIndex: ['datum', 'pairType'],
      key: 'pairType',
      filters: [
        { text: 'All Vote', value: 1 },
        { text: 'Pair Vote', value: 0 },
      ],
      filterMultiple: false,
      filteredValue: pairTypeFilter,
      render: (_: any, record: JobQuery) => (
        <Select
          value={record.datum?.pairType}
          loading={updatingJobId === record.datum?.id}
          options={[
            { value: 1, label: 'All Vote' },
            { value: 0, label: 'Pair Vote' },
          ]}
          disabled={updatingJobId === record.datum?.id || disableUpdateJobPairType}
          style={{ width: 110 }}
          onChange={(value) => updateJobPairType(record.datum?.id || '', value)}
        />
      ),
    },
  ];
};

const columns = (daoId: string) => {
  return [
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.icpper" />,
      dataIndex: 'user',
      key: 'user',
      render: (_: any, record: JobQuery) => (
        <Space size="middle">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>
            <a
              onClick={(event) => {
                event.preventDefault();
                history.push(`/job?userName=${record.user?.githubLogin}&daoId=${daoId}`);
              }}
            >
              {record.user?.nickname}
            </a>
          </span>
        </Space>
      ),
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.job" />,
      dataIndex: ['datum', 'id'],
      key: 'job',
      sorter: true,
      render: (_: any, record: JobQuery) => (
        <a
          href={`https://github.com/${record.datum?.githubRepoOwner}/${record.datum?.githubRepoName}/issues/${record.datum?.githubIssueNumber}`}
          target={'_blank'}
        >
          {record.datum?.title}
        </a>
      ),
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.size" />,
      dataIndex: ['datum', 'size'],
      key: 'size',
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.income" />,
      dataIndex: ['datum', 'income'],
      key: 'income',
      sorter: true,
      render: () => <>-</>,
    },
  ];
};

const convertFilterDefault = (pairType: JobsQueryPairTypeEnum | undefined | null) => {
  if (pairType === JobsQueryPairTypeEnum.Pair) return [0];
  if (pairType === JobsQueryPairTypeEnum.All) return [1];
  return undefined;
};

export const OwnerDaoCycleJob: React.FC<DaoCycleProps> = ({ cycleId, cycle, daoId }) => {
  const intl = useIntl();
  const [queryVariables, setQueryVariables] = useState<CycleJobListQueryVariables>({
    cycleId,
    first: 10,
    offset: 0,
  });
  const [pairingModalVisible, setPairingModalVisible] = useState(false);
  const [pairing, setPairing] = useState<Record<string, any>>({});
  const [statusProps, setStatusProps] = useState<Record<string, any>>({});
  const [pairingPercent, setPairingPercent] = useState<number>(0);
  const [updatingJobId, setUpdatingJobId] = useState<string>('');
  const {
    data: pairStatusData,
    loading: pairStatusLoading,
    refetch: pairStatusRefetch,
  } = useCyclePairStatusQuery({ variables: { cycleId } });
  const { data, loading, error, refetch } = useCycleJobListQuery({ variables: queryVariables });
  const [updateCycleJobVoteTypeByOwnerMutation] = useUpdateCycleJobVoteTypeByOwnerMutation();
  const [beginCyclePairTaskMutation] = useBeginCyclePairTaskMutation();
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
      let pairType: JobsQueryPairTypeEnum | undefined;
      if (filters.pairType && filters.pairType.includes(1)) {
        pairType = JobsQueryPairTypeEnum.All;
      }
      if (filters.pairType && filters.pairType.includes(0)) {
        pairType = JobsQueryPairTypeEnum.Pair;
      }
      setQueryVariables((old) => ({
        ...old,
        first: pagination.pageSize,
        offset: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
        sorted,
        sortedType,
        pairType,
      }));
    },
    [],
  );
  const updateJobPairType = useCallback(
    async (recordId: string, pairType: number) => {
      try {
        setUpdatingJobId(recordId);
        const updPairType =
          pairType === 0
            ? UpdateJobVoteTypeByOwnerArgumentPairTypeEnum.Pair
            : UpdateJobVoteTypeByOwnerArgumentPairTypeEnum.All;
        await updateCycleJobVoteTypeByOwnerMutation({
          variables: { jobId: recordId, voteType: updPairType },
        });
        setUpdatingJobId('');
        await refetch();
        message.info('Update Job Pair Type Success');
      } catch (e) {
        message.error('Update Job Pair Type Failed');
      }
    },
    [refetch, updateCycleJobVoteTypeByOwnerMutation],
  );
  const beginPairing = useCallback(
    async (percent: number) => {
      try {
        const ps = await pairStatusRefetch();
        if (ps.data.cycle?.pairTask?.status === CycleVotePairTaskStatusEnum.Success) {
          setPairingPercent(100);
          setStatusProps({ status: 'success' });
        } else if (ps.data.cycle?.pairTask?.status === CycleVotePairTaskStatusEnum.Fail) {
          setPairingPercent(100);
          setStatusProps({ status: 'exception' });
        } else {
          setPairingPercent(percent);
          setTimeout(async () => await beginPairing(percent + 6), 2000);
        }
      } catch (e) {
        setPairingPercent(0);
        setStatusProps({ status: 'exception' });
      }
    },
    [pairStatusRefetch],
  );
  if (pairStatusLoading || loading || error) {
    return <PageLoading />;
  }
  const pairStatus = pairStatusData?.cycle?.pairTask?.status;
  const disablePairingButton =
    parseInt(moment.utc().format('X'), 10) < (cycle?.pairBeginAt || 0) ||
    parseInt(moment.utc().format('X'), 10) > (cycle?.pairEndAt || 0);
  return (
    <>
      {(pairStatus == null || false) && (
        <Button
          type="primary"
          size="large"
          disabled={disablePairingButton}
          onClick={() => setPairingModalVisible(true)}
          className={styles.ownerButton}
        >
          {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.button.pair' })}
        </Button>
      )}
      {(pairStatus === CycleVotePairTaskStatusEnum.Init ||
        pairStatus === CycleVotePairTaskStatusEnum.Pairing) && (
        <Button
          type="primary"
          loading={true}
          size="large"
          disabled={disablePairingButton}
          className={styles.ownerButton}
        >
          {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.button.pair' })}
        </Button>
      )}
      {(pairStatus === CycleVotePairTaskStatusEnum.Success ||
        pairStatus === CycleVotePairTaskStatusEnum.Fail) && (
        <Button
          type="primary"
          size="large"
          disabled={disablePairingButton}
          onClick={() => setPairingModalVisible(true)}
          className={styles.ownerButton}
        >
          {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.button.repair' })}
        </Button>
      )}

      <GlobalModal
        key={'pairingModal'}
        onOk={async () => {
          setPairing({ footer: null });
          await beginCyclePairTaskMutation({ variables: { cycleId } });
          beginPairing(0);
        }}
        destroyOnClose={true}
        onCancel={() => {
          setPairingModalVisible(false);
          setPairing({});
          setPairingPercent(0);
          setStatusProps({});
        }}
        okText={intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.modal.ok' })}
        cancelText={intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.modal.cancel' })}
        visible={pairingModalVisible}
        {...pairing}
      >
        {pairing.footer !== null && (
          <div className={styles.modalDesc}>
            {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.modal.desc' })}
          </div>
        )}
        {pairing.footer === null && (
          <div className={styles.modalProgress}>
            <Progress type="circle" percent={pairingPercent} {...statusProps} />
          </div>
        )}
      </GlobalModal>

      <Table<JobQuery>
        columns={ownerColumns(
          daoId || '',
          convertFilterDefault(queryVariables.pairType),
          disablePairingButton,
          updateJobPairType,
          updatingJobId,
        )}
        loading={loading}
        rowKey={(record) => record?.datum?.id || ''}
        dataSource={data?.cycle?.jobs?.nodes as any}
        onChange={(pagination, filters, sorter) => {
          tableChange(pagination, filters, sorter);
        }}
        pagination={{
          pageSize: 10,
          total: data?.cycle?.jobs?.total || 0,
          current: getCurrentPage(queryVariables.offset || 0, 10),
        }}
      />
    </>
  );
};

export const DaoCycleJob: React.FC<DaoCycleProps> = ({ cycleId, daoId }) => {
  const [queryVariables, setQueryVariables] = useState<CycleJobListQueryVariables>({
    cycleId,
    first: 10,
    offset: 0,
  });
  const { data, loading, error } = useCycleJobListQuery({ variables: queryVariables });

  const tableChange = useCallback((pagination: TablePaginationConfig, sorter: any) => {
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
    setQueryVariables((old) => ({
      ...old,
      first: pagination.pageSize,
      offset: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
      sorted,
      sortedType,
    }));
  }, []);

  if (loading || error) {
    return <PageLoading />;
  }

  return (
    <>
      <Table<JobQuery>
        columns={columns(daoId || '')}
        loading={loading}
        rowKey={(record) => record?.datum?.id || ''}
        dataSource={data?.cycle?.jobs?.nodes as any}
        onChange={(pagination, filters, sorter) => {
          tableChange(pagination, sorter);
        }}
        pagination={{
          pageSize: 10,
          total: data?.cycle?.jobs?.total || 0,
          current: getCurrentPage(queryVariables.offset || 0, 10),
        }}
      />
    </>
  );
};
