import React, { useCallback, useMemo, useState } from 'react';
import { DatePicker, Form, Select, TimePicker } from 'antd';
import styles from './index.less';
import type { JobListQueryVariables } from '@/services/dao/generated';
import { useUserJobDaoListQuery } from '@/services/dao/generated';
import moment from 'moment';
import { PageLoading } from '@ant-design/pro-layout';
import OwnerJobTable from '@/pages/Job/components/OwnerJobTable';
import OtherUserJobTable from '@/pages/Job/components/OtherUserJobTable';
import { useModel } from '@@/plugin-model/useModel';

type TabJobProps = {
  daoId?: string;
  userName?: string;
};

const { Option } = Select;

function PickerWithType({ type, onChange }: any) {
  if (type === 'time') return <TimePicker onChange={onChange} />;
  if (type === 'date') return <DatePicker onChange={onChange} />;
  return <DatePicker picker={type} onChange={onChange} />;
}

const TabJob: React.FC<TabJobProps> = ({ daoId, userName }) => {
  const { initialState } = useModel('@@initialState');

  const [form] = Form.useForm();
  const [searchDateType, setSearchDateType] = useState<string>('date');
  const [defaultDaoId, setDefaultDaoId] = useState(daoId || '');
  const [jobQueryVar, setJobQueryVar] = useState<JobListQueryVariables>({
    daoName: '',
    offset: 0,
    first: 10,
  });
  const parseTime = useCallback(
    (date: any) => {
      if (!date) {
        return;
      }
      const bt = moment(date).utc().startOf('day').unix();
      let et = 0;
      if (searchDateType === 'date') et = moment(date).utc().startOf('day').add(1, 'd').unix();
      if (searchDateType === 'week') et = moment(date).utc().startOf('day').add(1, 'w').unix();
      if (searchDateType === 'month') et = moment(date).utc().startOf('day').add(1, 'M').unix();
      if (searchDateType === 'quarter') et = moment(date).utc().startOf('day').add(1, 'Q').unix();
      if (searchDateType === 'year') et = moment(date).utc().startOf('day').add(1, 'y').unix();
      setJobQueryVar((old) => ({
        ...old,
        beginTime: bt,
        endTime: et,
      }));
    },
    [setJobQueryVar, searchDateType],
  );

  const { data, loading, error, refetch } = useUserJobDaoListQuery({
    variables: { userName },
  });
  useMemo(async () => {
    if (data?.daos?.dao && data?.daos?.dao.length > 0) {
      let defaultDao: any;
      data?.daos?.dao.forEach((d) => {
        if (defaultDaoId && d?.datum?.id === defaultDaoId) {
          defaultDao = d.datum;
        }
      });
      setDefaultDaoId(defaultDao?.id || data.daos.dao[0]?.datum?.id || '');
      const daoNameParam = defaultDao?.name || data?.daos?.dao[0]?.datum?.name || null;
      setJobQueryVar((old) => ({
        ...old,
        daoName: daoNameParam,
        userName,
      }));
    }
  }, [data, defaultDaoId, userName]);

  const isMy = initialState && userName === initialState.currentUser().profile?.github_login;
  const jobTable = useMemo(() => {
    if (isMy) {
      return (
        <OwnerJobTable
          jobQueryVar={jobQueryVar}
          userName={userName}
          daoId={defaultDaoId}
          refetchSelect={refetch}
          setJobQueryVar={setJobQueryVar}
        />
      );
    }
    return <OtherUserJobTable jobQueryVar={jobQueryVar} setJobQueryVar={setJobQueryVar} />;
  }, [defaultDaoId, isMy, jobQueryVar, refetch, userName]);

  if (loading || error) {
    return <PageLoading />;
  }

  const daoOption = data?.daos?.dao?.map((d) => (
    <Option key={d?.datum?.id || ''} value={d?.datum?.id || ''}>
      {d?.datum?.name}
    </Option>
  ));

  return (
    <>
      <Form
        form={form}
        key={'searchForm'}
        layout="inline"
        initialValues={{ daoName: jobQueryVar.daoName }}
      >
        <Form.Item name="daoName" className={styles.searchOrgNameSelect}>
          <Select
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            notFoundContent={null}
            onSelect={async (value, option) => {
              setJobQueryVar((old) => ({
                ...old,
                daoName: option.children,
              }));
            }}
          >
            {daoOption}
          </Select>
        </Form.Item>
        <Form.Item className={styles.searchDateTypeSelect}>
          <Select value={searchDateType} onChange={setSearchDateType}>
            <Option value="date">Date</Option>
            <Option value="week">Week</Option>
            <Option value="month">Month</Option>
            <Option value="quarter">Quarter</Option>
            <Option value="year">Year</Option>
          </Select>
        </Form.Item>
        <Form.Item className={styles.searchDateSelect}>
          <PickerWithType type={searchDateType} onChange={(value: any) => parseTime(value)} />
        </Form.Item>
      </Form>
      {jobTable}
    </>
  );
};

export default TabJob;
