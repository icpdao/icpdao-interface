import type { Dispatch, SetStateAction } from 'react';
import React, { useCallback } from 'react';
import type { TablePaginationConfig } from 'antd';
import { Form, Space, Table, Typography } from 'antd';
import type { Job, JobListQueryVariables } from '@/services/dao/generated';
import { JobSortedEnum, SortedTypeEnum } from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import { getCurrentPage } from '@/utils/utils';
import { ArrowUpOutlined, EyeOutlined } from '@ant-design/icons';
import { renderJobTag } from '@/utils/pageHelper';
import IncomesPopover from '@/components/IncomesPopover';

export const defaultPageSize = 10;

interface JobTableProps {
  jobQueryVar: JobListQueryVariables;
  setJobQueryVar: Dispatch<SetStateAction<JobListQueryVariables>>;
  jobList: any;
  openViewModal: (record: Job) => void;
  openAdjustSizeModal: (record: Job, status: 'increase' | 'decrease') => void;
  tokenPrice: Record<string, number>;
  chainId: number;
}

const OtherUserJobTable: React.FC<JobTableProps> = ({
  jobQueryVar,
  setJobQueryVar,
  jobList,
  openViewModal,
  openAdjustSizeModal,
  tokenPrice,
  chainId,
}) => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');

  const tableChange = useCallback(
    (pagination: TablePaginationConfig, sorter: any) => {
      let sorted: JobSortedEnum | undefined;
      if (sorter && sorter.field && sorter.field.includes('size')) {
        sorted = JobSortedEnum.Size;
      }
      // if (sorter && sorter.field && sorter.field.includes('income')) {
      //   sorted = JobSortedEnum;
      // }
      let sortedType: SortedTypeEnum | undefined;
      if (sorter && sorter.order === 'ascend') {
        sortedType = SortedTypeEnum.Asc;
      }
      if (sorter && sorter.order === 'descend') {
        sortedType = SortedTypeEnum.Desc;
      }
      setJobQueryVar((old) => ({
        ...old,
        first: pagination.pageSize,
        offset: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
        sorted,
        sortedType,
      }));
    },
    [setJobQueryVar],
  );

  if (!initialState) {
    return <PageLoading />;
  }

  const columns = [
    {
      title: intl.formatMessage({ id: 'pages.job.table.title' }),
      dataIndex: ['node', 'title'],
      width: '270px',
      render: (_: any, record: Job) => {
        return (
          <a
            target={'_blank'}
            href={`https://github.com/${record?.node?.githubRepoOwner}/${record?.node?.githubRepoName}/issues/${record?.node?.githubIssueNumber}`}
            style={{ marginRight: 8 }}
          >
            {record.node?.title}
          </a>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.job.table.size' }),
      dataIndex: ['node', 'size'],
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.job.table.status' }),
      dataIndex: ['node', 'status'],
      render: (_: any, record: Job) => {
        return renderJobTag(intl, record.node?.status);
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.job.table.income' }),
      key: 'incomes',
      sorter: false,
      render: (_: any, record: Job) => (
        <IncomesPopover
          incomes={record.node?.incomes || []}
          chainId={chainId}
          tokenPrice={tokenPrice}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.job.table.operation' }),
      dataIndex: 'operation',
      render: (_: any, record: Job) => {
        const reviewers: number[] = record.prs?.map((pr) => pr?.mergedUserGithubUserId || 0) || [];
        return (
          <Space>
            {record.node?.status !== undefined &&
              record.node.status === 1 &&
              reviewers.includes(initialState.currentUser()?.profile?.github_user_id) && (
                <Typography.Link onClick={() => openAdjustSizeModal(record, 'increase')}>
                  <ArrowUpOutlined />
                </Typography.Link>
              )}
            <Typography.Link onClick={() => openViewModal(record)}>
              <EyeOutlined />
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Form component={false} key={'jobTable'}>
        <Table<Job>
          rowKey={(record) => record?.node?.id || ''}
          bordered
          dataSource={jobList?.data?.jobs?.job as any}
          columns={columns}
          loading={jobList?.loading || false}
          onChange={(pagination, filters, sorter) => {
            tableChange(pagination, sorter);
          }}
          pagination={{
            pageSize: jobQueryVar.first || 10,
            total: jobList?.data?.jobs?.total || 0,
            current: getCurrentPage(jobQueryVar.offset || 0, jobQueryVar.first || 10),
          }}
        />
      </Form>
    </>
  );
};

export default OtherUserJobTable;
