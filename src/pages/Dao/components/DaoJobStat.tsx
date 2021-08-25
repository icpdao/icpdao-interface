import React, { useCallback, useState } from 'react';
import { useIntl } from '@@/plugin-locale/localeExports';
import type { DaoJobsQueryVariables, JobQuery } from '@/services/dao/generated';
import {
  JobsQuerySortedEnum,
  JobsQuerySortedTypeEnum,
  useDaoJobsQuery,
} from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import type { TablePaginationConfig } from 'antd';
import { Avatar, DatePicker, Form, Select, Space, Table, TimePicker } from 'antd';
import styles from './index.less';
import moment from 'moment';
import StatCard from '@/components/StatCard';
import { getCurrentPage } from '@/utils/utils';
import { FormattedMessage } from 'umi';
import { UserOutlined } from '@ant-design/icons';
import { history } from '@@/core/history';

type DaoJobSatProps = {
  daoId: string;
  tokenSymbol: string;
};

function PickerWithType({ type, onChange }: any) {
  if (type === 'time') return <TimePicker onChange={onChange} />;
  if (type === 'date') return <DatePicker onChange={onChange} />;
  return <DatePicker picker={type} onChange={onChange} />;
}

const DaoJobStat: React.FC<DaoJobSatProps> = ({ daoId, tokenSymbol }) => {
  const intl = useIntl();
  const [queryVariable, setQueryVariable] = useState<DaoJobsQueryVariables>({
    daoId,
    sorted: JobsQuerySortedEnum.Size,
    sortedType: JobsQuerySortedTypeEnum.Asc,
    first: 10,
    offset: 0,
  });
  const [searchDateType, setSearchDateType] = useState<string>('date');
  const parseTime = useCallback(
    (date: any) => {
      if (!date) return;
      const bt = moment(date).utc().startOf('day').unix();
      let et = 0;
      if (searchDateType === 'date') et = moment(date).utc().startOf('day').add(1, 'd').unix();
      if (searchDateType === 'week') et = moment(date).utc().startOf('day').add(1, 'w').unix();
      if (searchDateType === 'month') et = moment(date).utc().startOf('day').add(1, 'M').unix();
      if (searchDateType === 'quarter') et = moment(date).utc().startOf('day').add(1, 'Q').unix();
      if (searchDateType === 'year') et = moment(date).utc().startOf('day').add(1, 'y').unix();
      setQueryVariable((old) => ({
        ...old,
        beginTime: bt,
        endTime: et,
      }));
    },
    [setQueryVariable, searchDateType],
  );
  const tableChange = useCallback((pagination: TablePaginationConfig, sorter: any) => {
    let sorted: JobsQuerySortedEnum;
    if (sorter && sorter.field && sorter.field.includes('size')) {
      sorted = JobsQuerySortedEnum.Size;
    }
    if (sorter && sorter.field && sorter.field.includes('income')) {
      sorted = JobsQuerySortedEnum.Income;
    }
    let sortedType: JobsQuerySortedTypeEnum;
    if (sorter && sorter.order === 'ascend') {
      sortedType = JobsQuerySortedTypeEnum.Asc;
    }
    if (sorter && sorter.order === 'descend') {
      sortedType = JobsQuerySortedTypeEnum.Desc;
    }
    setQueryVariable((old) => ({
      ...old,
      first: pagination.pageSize || 10,
      offset: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
      sorted,
      sortedType,
    }));
  }, []);
  const { data, loading, error } = useDaoJobsQuery({ variables: queryVariable });
  if (loading || error) {
    return <PageLoading />;
  }
  const columns = [
    {
      title: <FormattedMessage id="pages.dao.component.dao_job.table.head.icpper" />,
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
      title: <FormattedMessage id="pages.dao.component.dao_job.table.head.job" />,
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
      title: <FormattedMessage id="pages.dao.component.dao_job.table.head.size" />,
      dataIndex: ['datum', 'size'],
      key: 'size',
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_job.table.head.income" />,
      dataIndex: ['datum', 'income'],
      key: 'income',
      sorter: true,
    },
  ];
  const statCardData = [
    {
      title: intl.formatMessage({ id: 'pages.dao.component.dao_job.stat.icpper' }),
      number: data?.dao?.jobs?.stat?.icpperCount || 0,
    },
    {
      title: intl.formatMessage({ id: 'pages.dao.component.dao_job.stat.job' }),
      number: data?.dao?.jobs?.stat?.jobCount || 0,
    },
    {
      title: intl.formatMessage({ id: 'pages.dao.component.dao_job.stat.size' }),
      number: data?.dao?.jobs?.stat?.size || 0,
    },
    {
      title: tokenSymbol,
      number: data?.dao?.jobs?.stat?.income || 0,
    },
  ];
  return (
    <>
      <Form className={styles.TabFirstDom} key={'filterJobsForm'} layout="inline">
        <Form.Item className={styles.SearchDateTypeSelect}>
          <Select value={searchDateType} onChange={setSearchDateType}>
            <Select.Option value="date">Date</Select.Option>
            <Select.Option value="week">Week</Select.Option>
            <Select.Option value="month">Month</Select.Option>
            <Select.Option value="quarter">Quarter</Select.Option>
            <Select.Option value="year">Year</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item className={styles.SearchDateSelect}>
          <PickerWithType type={searchDateType} onChange={(value: any) => parseTime(value)} />
        </Form.Item>
      </Form>
      <div className={styles.TabStatCard}>
        <StatCard data={statCardData} />
      </div>
      <Table
        columns={columns}
        loading={loading}
        rowKey={(record) => record?.user?.id || ''}
        dataSource={data?.dao?.jobs?.nodes as JobQuery[]}
        onChange={(pagination, filters, sorter) => tableChange(pagination, sorter)}
        pagination={{
          pageSize: 10,
          total: data?.dao?.jobs?.total || 0,
          current: getCurrentPage(queryVariable.offset || 0, 10),
        }}
      />
    </>
  );
};

export default DaoJobStat;
