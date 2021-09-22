import type { Dispatch, SetStateAction } from 'react';
import React, { useCallback, useState } from 'react';
import type { TablePaginationConfig } from 'antd';
import { Form, Popconfirm, Space, Table, Typography } from 'antd';
import type { Job, JobListQueryVariables } from '@/services/dao/generated';
import { JobSortedEnum, SortedTypeEnum, useDeleteJobMutation } from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { useIntl } from '@@/plugin-locale/localeExports';
import { ArrowDownOutlined, DeleteFilled, EditFilled, EyeOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import { getCurrentPage } from '@/utils/utils';
import { renderJobTag } from '@/utils/pageHelper';
import { defaultPageSize } from '@/pages/Job/components/OtherUserJobTable';

interface JobTableProps {
  jobQueryVar: JobListQueryVariables;
  setJobQueryVar: Dispatch<SetStateAction<JobListQueryVariables>>;
  jobList: any;
  getJobList: any;
  openEditModal: (record: Job) => void;
  openViewModal: (record: Job) => void;
  openAdjustSizeModal: (record: Job, status: 'increase' | 'decrease') => void;
}

const OwnerJobTable: React.FC<JobTableProps> = ({
  jobQueryVar,
  setJobQueryVar,
  jobList,
  getJobList,
  openEditModal,
  openViewModal,
  openAdjustSizeModal,
}) => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm();
  const [jobDeleteLoading, setJobDeleteLoading] = useState<Record<string, boolean>>({});
  const [jobDeleteVisible, setJobDeleteVisible] = useState<Record<string, boolean>>({});
  const [deleteJob] = useDeleteJobMutation();
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
  const remove = useCallback(
    async (record: Partial<Job>) => {
      await deleteJob({
        variables: { id: record.node?.id || '' },
      });
      await getJobList({ variables: jobQueryVar });
    },
    [deleteJob, getJobList, jobQueryVar],
  );
  if (!initialState) {
    return <PageLoading />;
  }

  const columns = [
    {
      title: intl.formatMessage({ id: 'pages.job.table.title' }),
      dataIndex: ['node', 'title'],
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
            {record.node?.status !== undefined && record.node.status === 0 && (
              <Typography.Link onClick={() => openEditModal(record)}>
                <EditFilled />
              </Typography.Link>
            )}
            {record.node?.status !== undefined && record.node.status === 1 && (
              <Typography.Link onClick={() => openAdjustSizeModal(record, 'decrease')}>
                <ArrowDownOutlined />
              </Typography.Link>
            )}
            <Typography.Link onClick={() => openViewModal(record)}>
              <EyeOutlined />
            </Typography.Link>
            {record.node?.status === 0 && (
              <Popconfirm
                placement={'right'}
                title={intl.formatMessage({ id: 'pages.job.table.delete.pop_confirm' })}
                okText="Yes"
                cancelText="No"
                visible={jobDeleteVisible[record.node?.id || ''] || false}
                okButtonProps={{ loading: jobDeleteLoading[record.node?.id || ''] || false }}
                onConfirm={async () => {
                  try {
                    setJobDeleteLoading((old) => ({ ...old, [record.node?.id || '']: true }));
                    await remove(record);
                  } finally {
                    setJobDeleteLoading((old) => ({ ...old, [record.node?.id || '']: false }));
                    setJobDeleteVisible((old) => ({ ...old, [record.node?.id || '']: false }));
                  }
                }}
                onCancel={() =>
                  setJobDeleteVisible((old) => ({ ...old, [record.node?.id || '']: false }))
                }
              >
                <Typography.Link
                  onClick={() =>
                    setJobDeleteVisible((old) => ({ ...old, [record.node?.id || '']: true }))
                  }
                >
                  <DeleteFilled />
                </Typography.Link>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Form form={form} component={false} key={'jobTable'}>
        <Table<Job>
          rowKey={(record) => record?.node?.id || ''}
          bordered
          dataSource={jobList?.data?.jobs?.job as any}
          loading={jobList?.loading || false}
          columns={columns}
          onChange={(pagination, filters, sorter) => {
            tableChange(pagination, sorter);
          }}
          pagination={{
            pageSize: defaultPageSize,
            total: jobList?.data?.data?.jobs?.total || 0,
            current: getCurrentPage(jobQueryVar.offset || 0, defaultPageSize),
          }}
        />
      </Form>
    </>
  );
};

export default OwnerJobTable;
