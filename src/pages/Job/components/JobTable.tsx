import React, { useCallback, useMemo, useState } from 'react';
import { history } from 'umi';
import styles from './index.less';
import StatCard from '@/components/StatCard';
import type { TablePaginationConfig } from 'antd';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { Job, JobListQueryVariables, JobPrSchema } from '@/services/dao/generated';
import {
  JobSortedEnum,
  SortedTypeEnum,
  useAddJobPrMutation,
  useCreateJobMutation,
  useDeleteJobMutation,
  useDeleteJobPrMutation,
  useJobListQuery,
  useUpdateJobSizeMutation,
} from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { useIntl } from '@@/plugin-locale/localeExports';
import { DeleteFilled, EditFilled } from '@ant-design/icons';
import { request } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';

interface JobTableProps {
  queryVariables: JobListQueryVariables;
  userName: string;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Job;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode =
    inputType === 'number' ? (
      <InputNumber min={0.1} step={0.1} precision={1} size={'small'} />
    ) : (
      <Input size={'small'} />
    );

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const getCurrentPage = (offset: number, pageSize: number) => {
  return Math.ceil(offset / pageSize) + 1;
};

async function getGithubPRList(daoName: string, user: string) {
  return request('https://api.github.com/search/issues', {
    method: 'GET',
    params: { q: `is:open is:pr author:${user} archived:false user:${daoName}` },
  });
}

const JobTable: React.FC<JobTableProps> = ({ queryVariables, userName }) => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm();
  const [optionsPRs, setOptionsPRs] = useState<any[]>();
  const [editingRowId, setEditingRowId] = useState<string>('');
  const [markButtonLoading, setMarkButtonLoading] = useState<boolean>(false);
  const [jobPRsSelectOptions, setJobPRsSelectOptions] = useState({});
  const [jobPRsSelectDefault, setJobPRsSelectDefault] = useState({});
  const [jobQueryVar, setJobQueryVar] = useState<JobListQueryVariables>(queryVariables);
  const isEditing = useCallback((record: Job) => record.node?.id === editingRowId, [editingRowId]);
  const [createJobMutation] = useCreateJobMutation();
  const [addJobPR] = useAddJobPrMutation();
  const [deleteJobPR] = useDeleteJobPrMutation();
  const [updateJobSize] = useUpdateJobSizeMutation();
  const [deleteJob] = useDeleteJobMutation();
  useMemo(() => {
    setJobQueryVar(queryVariables);
  }, [queryVariables]);
  const { data, loading, error, refetch } = useJobListQuery({
    variables: jobQueryVar,
    fetchPolicy: 'no-cache',
  });
  useMemo(async () => {
    const ret = await getGithubPRList(jobQueryVar.daoName, userName || '');
    setOptionsPRs(ret?.items || []);
  }, [jobQueryVar, userName]);
  const updateJobPR = useCallback(
    async (jobId: string, prs: JobPrSchema[] | undefined) => {
      if (!prs) return;
      const options: any[] = [];
      const optionsURL: string[] = [];
      const optionsIds: string[] = [];
      prs.forEach((pr) => {
        const url = `https://github.com/${pr.githubRepoOwner}/${pr.githubRepoName}/pull/${pr.githubPrNumber}`;
        options.push({
          id: pr.id,
          value: pr.id,
          label: pr.title,
          url,
        });
        optionsURL.push(url);
        optionsIds.push(pr.id || '');
      });
      optionsPRs?.forEach((dpr) => {
        if (!optionsURL.includes(dpr.html_url)) {
          options.push({
            id: dpr.id,
            value: dpr.html_url,
            label: dpr.title,
            url: dpr.html_url,
          });
        }
      });
      setJobPRsSelectOptions((old) => ({
        ...old,
        [jobId]: options,
      }));
      setJobPRsSelectDefault((old) => ({
        ...old,
        [jobId]: optionsIds,
      }));
    },
    [optionsPRs],
  );
  useMemo(async () => {
    data?.jobs?.job?.forEach((job) => updateJobPR(job?.node?.id || '', job?.prs as any));
  }, [data, updateJobPR]);

  const save = useCallback(
    async (jobId: string) => {
      try {
        message.info('Job Size Updating');
        const row = await form.validateFields();
        await updateJobSize({
          variables: { id: jobId, size: row.node.size },
        });
        await refetch();
        message.success('Job Size Updated');
      } catch (e) {
        message.error('Job Size Update Failed');
      } finally {
        setEditingRowId('');
      }
    },
    [form, refetch, updateJobSize],
  );
  const tableChange = useCallback((pagination: TablePaginationConfig, sorter: any) => {
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
    setEditingRowId('');
  }, []);
  const remove = useCallback(
    async (record: Partial<Job>) => {
      await deleteJob({
        variables: { id: record.node?.id || '' },
      });
      await refetch();
    },
    [deleteJob, refetch],
  );
  if (!initialState || loading || error) {
    return <PageLoading />;
  }
  const currentUser = initialState.currentUser().profile.github_login;
  const cancel = () => {
    setEditingRowId('');
  };
  const edit = (record: Partial<Job>) => {
    if (record.node?.status !== 0 && record.node?.status !== 1) {
      message.error("Job Size Can't Update");
      return;
    }
    form.setFieldsValue({ ...record });
    setEditingRowId(record.node?.id || '');
  };

  const stat = [
    {
      number: data?.jobs?.total || 0,
      title: intl.formatMessage({ id: 'pages.job.stat.job' }),
    },
    {
      number: data?.jobs?.stat?.size || 0,
      title: intl.formatMessage({ id: 'pages.job.stat.size' }),
    },
    {
      number: data?.jobs?.stat?.tokenCount || 0,
      title: 'Sht',
    },
  ];

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
      editable: true,
      sorter: true,
      onCell: (record: Job) => ({
        record,
        inputType: 'number',
        dataIndex: ['node', 'size'],
        title: intl.formatMessage({ id: 'pages.job.table.size' }),
        editing: isEditing(record),
      }),
    },
    {
      title: intl.formatMessage({ id: 'pages.job.table.pr' }),
      dataIndex: 'prs',
      width: '300px',
      render: (_: any, record: Job) => {
        return (
          <Select
            showSearch
            mode={'tags'}
            maxTagCount={1}
            maxTagTextLength={15}
            maxTagPlaceholder={'...'}
            size={'small'}
            style={{ width: '100%' }}
            value={jobPRsSelectDefault[record.node?.id || '']}
            optionFilterProp="children"
            options={jobPRsSelectOptions[record.node?.id || '']}
            onSelect={async (value) => {
              try {
                const tmpJobPR = await addJobPR({
                  variables: { id: record.node?.id || '', addPr: value },
                });
                const ret = await getGithubPRList(jobQueryVar.daoName, userName || '');
                setOptionsPRs(ret?.items || []);
                await updateJobPR(record.node?.id || '', tmpJobPR.data?.updateJob?.job?.prs as any);
                message.success('Job Linked PR');
              } catch (e) {
                message.error('Job Linked Failed');
              }
            }}
            onDeselect={async (value) => {
              try {
                const tmpJobPR = await deleteJobPR({
                  variables: { id: record.node?.id || '', deletePr: value },
                });
                const ret = await getGithubPRList(jobQueryVar.daoName, userName || '');
                setOptionsPRs(ret?.items || []);
                await updateJobPR(record.node?.id || '', tmpJobPR.data?.updateJob?.job?.prs as any);
                message.success('Job Unlinked PR');
              } catch (e) {
                message.error('Job Unlinked Failed');
              }
            }}
            filterOption={(input, option) =>
              option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
              option?.value?.indexOf(input) >= 0
            }
          />
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.job.table.status' }),
      dataIndex: ['node', 'status'],
      render: (_: any, record: Job) => {
        switch (record.node?.status) {
          case 0:
            return <Tag color="magenta">Awaiting merger</Tag>;
          case 1:
            return <Tag color="orange">Merged</Tag>;
          case 2:
            return <Tag color="green">Awaiting Voting</Tag>;
          case 3:
            return <Tag color="blue">Waiting for token</Tag>;
          case 4:
            return <Tag color="purple">Token released</Tag>;
          default:
            return <Tag color="magenta" />;
        }
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.job.table.income' }),
      dataIndex: ['node', 'income'],
      render: () => {
        return <>-</>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.job.table.operation' }),
      dataIndex: 'operation',
      render: (_: any, record: Job) => {
        const editing = isEditing(record);
        return editing ? (
          <span>
            <a
              onClick={async () => {
                await save(record.node?.id || '');
              }}
              style={{ marginRight: 8 }}
            >
              Save
            </a>
            <a onClick={cancel} style={{ marginRight: 8 }}>
              Cancel
            </a>
          </span>
        ) : (
          <Space>
            <Typography.Link disabled={editingRowId !== ''} onClick={() => edit(record)}>
              <EditFilled />
            </Typography.Link>
            {record.node?.status === 0 && (
              <Typography.Link disabled={editingRowId !== ''} onClick={() => remove(record)}>
                <DeleteFilled />
              </Typography.Link>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div className={styles.statCard}>
        <StatCard data={stat} />
      </div>
      {userName === currentUser && (
        <Form
          key={'markForm'}
          className={styles.markForm}
          layout="inline"
          onFinish={async ({ issueLink, size }) => {
            setMarkButtonLoading(true);
            try {
              const created = await createJobMutation({ variables: { issueLink, size } });
              if (created.data?.createJob?.job?.node?.githubRepoOwner === queryVariables.daoName)
                await refetch();
              else
                history.push(`/job?daoId=${created.data?.createJob?.job?.node?.githubRepoOwner}`);
            } catch (e) {
              message.error('Mark Job Error');
            } finally {
              setMarkButtonLoading(false);
            }
            return true;
          }}
        >
          <Form.Item
            name="issueLink"
            className={styles.markIssueLink}
            rules={[
              { required: true, message: intl.formatMessage({ id: 'pages.job.mark.issue.desc' }) },
              {
                pattern: /https:\/\/github.com\/(.+)\/(.+)\/issues\/(\d+)/g,
                message: intl.formatMessage({ id: 'pages.job.mark.issue.desc' }),
              },
            ]}
          >
            <Input placeholder={intl.formatMessage({ id: 'pages.job.mark.issue.desc' })} />
          </Form.Item>
          <Form.Item
            className={styles.markSize}
            name="size"
            rules={[
              { required: true, message: intl.formatMessage({ id: 'pages.job.mark.size.desc' }) },
            ]}
          >
            <InputNumber
              style={{ width: 200 }}
              min={0.1}
              step={0.1}
              precision={1}
              placeholder={intl.formatMessage({ id: 'pages.job.mark.size.desc' })}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={markButtonLoading}>
              {intl.formatMessage({ id: 'pages.job.mark.button' })}
            </Button>
          </Form.Item>
        </Form>
      )}
      <Form form={form} component={false} key={'jobTable'}>
        <Table<Job>
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowKey={(record) => record?.node?.id || ''}
          bordered
          dataSource={data?.jobs?.job as any}
          columns={columns}
          onChange={(pagination, filters, sorter) => {
            tableChange(pagination, sorter);
          }}
          pagination={{
            pageSize: 10,
            total: data?.jobs?.total || 0,
            current: getCurrentPage(jobQueryVar.offset || 0, 10),
          }}
        />
      </Form>
    </>
  );
};

export default JobTable;
