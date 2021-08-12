import type { Dispatch, SetStateAction } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import styles from './index.less';
import StatCard from '@/components/StatCard';
import type { TablePaginationConfig } from 'antd';
import { Form, Spin, Select, Table, Tag } from 'antd';
import type { Job, JobListQueryVariables, JobPrSchema } from '@/services/dao/generated';
import { JobSortedEnum, SortedTypeEnum, useJobListQuery } from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { useIntl } from '@@/plugin-locale/localeExports';
import { LoadingOutlined } from '@ant-design/icons';
import { request } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';

interface JobTableProps {
  jobQueryVar: JobListQueryVariables;
  userName: string | undefined;
  setJobQueryVar: Dispatch<SetStateAction<JobListQueryVariables>>;
}

const getCurrentPage = (offset: number, pageSize: number) => {
  return Math.ceil(offset / pageSize) + 1;
};

async function getGithubPRList(daoName: string, user: string) {
  return request('https://api.github.com/search/issues', {
    method: 'GET',
    params: { q: `is:open is:pr author:${user} archived:false user:${daoName}` },
  });
}

const OtherUserJobTable: React.FC<JobTableProps> = ({ jobQueryVar, userName, setJobQueryVar }) => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm();
  const [optionsPRs, setOptionsPRs] = useState<any[]>();
  const [editingRowId, setEditingRowId] = useState<string>('');
  const [jobPRsSelectOptions, setJobPRsSelectOptions] = useState({});
  const [jobPRsSelectDefault, setJobPRsSelectDefault] = useState({});
  const [jobPRsSelectLoading] = useState<Record<string, boolean>>({});
  const isEditing = useCallback((record: Job) => record.node?.id === editingRowId, [editingRowId]);

  const { data, loading, error } = useJobListQuery({
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
      setEditingRowId('');
    },
    [setJobQueryVar],
  );

  if (!initialState || loading || error) {
    return <PageLoading />;
  }

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
          <Spin
            spinning={jobPRsSelectLoading[record.node?.id || ''] || false}
            indicator={<LoadingOutlined style={{ fontSize: 20 }} />}
          >
            <Select
              showSearch
              disabled
              loading={jobPRsSelectLoading[record.node?.id || ''] || false}
              mode={'tags'}
              maxTagCount={1}
              maxTagTextLength={15}
              maxTagPlaceholder={'...'}
              size={'small'}
              style={{ width: '100%' }}
              value={jobPRsSelectDefault[record.node?.id || '']}
              optionFilterProp="children"
              options={jobPRsSelectOptions[record.node?.id || '']}
              filterOption={(input, option) =>
                option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
                option?.value?.indexOf(input) >= 0
              }
            />
          </Spin>
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
  ];

  return (
    <>
      <div className={styles.statCard}>
        <StatCard data={stat} />
      </div>
      <Form form={form} component={false} key={'jobTable'}>
        <Table<Job>
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

export default OtherUserJobTable;
