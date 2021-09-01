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
import { EyeOutlined } from '@ant-design/icons';
import { renderJobTag } from '@/utils/pageHelper';

interface JobTableProps {
  jobQueryVar: JobListQueryVariables;
  setJobQueryVar: Dispatch<SetStateAction<JobListQueryVariables>>;
  jobList: any;
  openViewModal: (record: Job) => void;
}

const OtherUserJobTable: React.FC<JobTableProps> = ({
  jobQueryVar,
  setJobQueryVar,
  jobList,
  openViewModal,
}) => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');

  const tableChange = useCallback(
    (pagination: TablePaginationConfig, sorter: any) => {
      let sorted: JobSortedEnum | undefined;
      if (sorter && sorter.field && sorter.field.includes('size')) {
        sorted = JobSortedEnum.Size;
      }
      if (sorter && sorter.field && sorter.field.includes('income')) {
        sorted = JobSortedEnum.Income;
      }
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
      dataIndex: ['node', 'income'],
      render: (_: any, record: Job) => {
        if (record.node?.income) return <>{record.node.income}</>;
        return <>-</>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.job.table.operation' }),
      dataIndex: 'operation',
      render: (_: any, record: Job) => {
        return (
          <Space>
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
            pageSize: 10,
            total: jobList?.data?.jobs?.total || 0,
            current: getCurrentPage(jobQueryVar.offset || 0, 10),
          }}
        />
      </Form>
    </>
  );
};

export default OtherUserJobTable;
