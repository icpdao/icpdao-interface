import React, { useCallback, useState } from 'react';
import type { TablePaginationConfig } from 'antd';
import { Avatar, Button, message, Select, Space, Table } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import { FormattedMessage } from 'umi';
import type { DaoCycleProps } from './index';
import type { CycleJobListQueryVariables, JobQuery } from '@/services/dao/generated';
import {
  JobsQueryPairTypeEnum,
  JobsQuerySortedEnum,
  JobsQuerySortedTypeEnum,
  UpdateJobVoteTypeByOwnerArgumentPairTypeEnum,
  useCycleJobListQuery,
  useUpdateCycleJobVoteTypeByOwnerMutation,
} from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { getCurrentPage } from '@/utils/utils';
import { UserOutlined } from '@ant-design/icons';
import { history } from '@@/core/history';

const ownerColumns = (
  daoId: string,
  updateJobPairType: (recordId: string, pairType: number) => void,
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
          href={`https://github.com/${record.datum?.githubRepoOwner}/${record.datum?.githubRepoName}/${record.datum?.githubIssueNumber}`}
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
        { text: 'All Vote', value: 0 },
        { text: 'Pair Vote', value: 1 },
      ],
      filterMultiple: false,
      filteredValue: [0],
      render: (_: any, record: JobQuery) => (
        <Select
          defaultValue={record.datum?.pairType}
          options={[
            { value: 0, label: 'All Vote' },
            { value: 0, label: 'Pair Vote' },
          ]}
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
          href={`https://github.com/${record.datum?.githubRepoOwner}/${record.datum?.githubRepoName}/${record.datum?.githubIssueNumber}`}
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

export const OwnerDaoCycleJob: React.FC<DaoCycleProps> = ({ cycleId, daoId }) => {
  const intl = useIntl();
  const [queryVariables, setQueryVariables] = useState<CycleJobListQueryVariables>({
    cycleId,
    first: 10,
    offset: 0,
    pairType: JobsQueryPairTypeEnum.Pair,
  });

  const { data, loading, error, refetch } = useCycleJobListQuery({ variables: queryVariables });
  const [updateCycleJobVoteTypeByOwnerMutation] = useUpdateCycleJobVoteTypeByOwnerMutation();
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
      console.log(filters);
      setQueryVariables((old) => ({
        ...old,
        first: pagination.pageSize,
        offset: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
        sorted,
        sortedType,
      }));
    },
    [],
  );
  const updateJobPairType = useCallback(
    async (recordId: string, pairType: number) => {
      try {
        const updPairType =
          pairType === 0
            ? UpdateJobVoteTypeByOwnerArgumentPairTypeEnum.Pair
            : UpdateJobVoteTypeByOwnerArgumentPairTypeEnum.All;
        await updateCycleJobVoteTypeByOwnerMutation({
          variables: { jobId: recordId, voteType: updPairType },
        });
        await refetch();
      } catch (e) {
        message.error('Update Job Pair Type Failed');
      }
    },
    [refetch, updateCycleJobVoteTypeByOwnerMutation],
  );
  if (loading || error) {
    return <PageLoading />;
  }

  return (
    <>
      <Button type="primary" size="large">
        {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.button.pair' })}
      </Button>
      <Table<JobQuery>
        columns={ownerColumns(daoId || '', updateJobPairType)}
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
