import React, { useState } from 'react';
import type { DaoJobConfigQuery } from '@/services/dao/generated';
import { useDaoJobConfigQuery, useUpdateDaoJobConfigMutation } from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { Form, Button, Select, Row, Col, message, Space } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import momentTZ from 'moment-timezone';
import styles from './index.less';
import DayHourCascader from '@/pages/Dao/components/DayHourCascader';
import { getFormatTime } from '@/utils/utils';

type JobConfigProps = {
  daoId: string;
  nextStep?: () => void;
};

type JobConfigData = {
  timeZoneRegion?: string;
  deadline?: any[];
  pairBegin?: any[];
  pairEnd?: any[];
  votingBegin?: any[];
  votingEnd?: any[];
};

const timeZoneOptions = momentTZ.tz.names().map((v) => {
  return {
    value: v,
    label: v,
  };
});

const formatJobConfigData = (data: DaoJobConfigQuery | undefined): JobConfigData => {
  if (!data) return {};
  return {
    timeZoneRegion: data.daoJobConfig?.datum?.timeZoneRegion,
    deadline: [data.daoJobConfig?.datum?.deadlineDay, data.daoJobConfig?.datum?.deadlineTime],
    pairBegin: [data.daoJobConfig?.datum?.pairBeginDay, data.daoJobConfig?.datum?.pairBeginHour],
    pairEnd: [data.daoJobConfig?.datum?.pairEndDay, data.daoJobConfig?.datum?.pairEndHour],
    votingBegin: [
      data.daoJobConfig?.datum?.votingBeginDay,
      data.daoJobConfig?.datum?.votingBeginHour,
    ],
    votingEnd: [data.daoJobConfig?.datum?.votingEndDay, data.daoJobConfig?.datum?.votingEndHour],
  };
};

const formatSubmitJobConfigData = (data: any) => {
  const config = {
    daoId: '',
    timeZone: momentTZ.tz(data.timeZoneRegion).utcOffset(),
    timeZoneRegion: data.timeZoneRegion,
    deadlineDay: data.deadline[0],
    deadlineTime: data.deadline[1],
    pairBeginDay: data.pairBegin[0],
    pairBeginHour: data.pairBegin[1],
    pairEndDay: data.pairEnd[0],
    pairEndHour: data.pairEnd[1],
    votingBeginDay: data.votingBegin[0],
    votingBeginHour: data.votingBegin[1],
    votingEndDay: data.votingEnd[0],
    votingEndHour: data.votingEnd[1],
  };

  const validPair =
    config.pairBeginDay < config.pairEndDay ||
    (config.pairBeginDay === config.pairEndDay && config.pairBeginHour < config.pairEndHour);
  const validVoting =
    config.votingBeginDay < config.votingEndDay ||
    (config.votingBeginDay === config.votingEndDay &&
      config.votingBeginHour < config.votingEndHour);
  const valid: boolean = validPair && validVoting;
  return { valid, config };
};

const DAOJobConfig: React.FC<JobConfigProps> = ({ daoId, nextStep }) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [updateDaoJobConfig] = useUpdateDaoJobConfigMutation();
  const [saveLoading, setSaveLoading] = useState(false);
  const { data, loading, error, refetch } = useDaoJobConfigQuery({
    variables: { daoId },
  });
  if (loading || error) {
    return <PageLoading />;
  }
  const formInitData = formatJobConfigData(data);
  return (
    <>
      <div className={styles.desc}>
        {intl.formatMessage({ id: 'pages.dao.config.tab.job.desc' })}
      </div>
      <Form
        form={form}
        layout="vertical"
        initialValues={formInitData}
        onFinish={async (values) => {
          setSaveLoading(true);
          const { valid, config: updateData } = formatSubmitJobConfigData(values);
          if (!valid) {
            form.resetFields();
            setSaveLoading(false);
            message.error(intl.formatMessage({ id: 'pages.dao.config.tab.job.form.error' }));
            return false;
          }
          try {
            updateData.daoId = daoId;
            await updateDaoJobConfig({
              variables: updateData,
            });
            await refetch();
            message.success(intl.formatMessage({ id: 'pages.dao.config.tab.job.form.success' }));
            if (nextStep) nextStep();
          } finally {
            setSaveLoading(false);
          }
          return true;
        }}
      >
        <Form.Item
          label={intl.formatMessage({ id: 'pages.dao.config.tab.job.form.timezone' })}
          name="timeZoneRegion"
        >
          <Select
            showSearch
            options={timeZoneOptions}
            style={{ width: 200 }}
            filterOption={(input, option) =>
              option?.value.toLowerCase().indexOf(input.toLowerCase()) !== -1
            }
          />
        </Form.Item>
        <Row className={styles.inlineFormRow} gutter={24}>
          <Col span={6}>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.dao.config.tab.job.form.deadline' })}
              tooltip={{
                title: intl.formatMessage({ id: 'pages.dao.config.tab.job.form.deadline.desc' }),
                placement: 'right',
              }}
              name="deadline"
            >
              <DayHourCascader />
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.dao.config.tab.job.form.pairing' })}
              tooltip={{
                title: intl.formatMessage({ id: 'pages.dao.config.tab.job.form.pairing.desc' }),
                placement: 'right',
              }}
            >
              <Form.Item name="pairBegin" className={styles.inlineFormSelect}>
                <DayHourCascader />
              </Form.Item>
              <span className={styles.inlineFormSpaceMark}>-</span>
              <Form.Item name="pairEnd" className={styles.inlineFormSelect}>
                <DayHourCascader />
              </Form.Item>
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.dao.config.tab.job.form.voting' })}
              tooltip={{
                title: intl.formatMessage({ id: 'pages.dao.config.tab.job.form.pairing.desc' }),
                placement: 'right',
              }}
            >
              <Form.Item name="votingBegin" className={styles.inlineFormSelect}>
                <DayHourCascader />
              </Form.Item>
              <span className={styles.inlineFormSpaceMark}>-</span>
              <Form.Item name="votingEnd" className={styles.inlineFormSelect}>
                <DayHourCascader />
              </Form.Item>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button htmlType="submit" type="primary" loading={saveLoading}>
            {intl.formatMessage({ id: 'pages.dao.config.tab.job.form.save' })}
          </Button>
        </Form.Item>
      </Form>
      <Space style={{ marginTop: 65 }} direction={'vertical'}>
        <Space style={{ marginBottom: 35 }}>
          {intl.formatMessage({ id: 'pages.dao.config.tab.job.cycle.title' })}
        </Space>
        <Space>
          <span style={{ fontWeight: 700 }}>
            {intl.formatMessage({ id: 'pages.dao.config.tab.job.cycle.deadline' })}
          </span>
          {getFormatTime(data?.daoJobConfig?.thisCycle?.beginAt || 0, 'LLL')}
          <span>-</span>
          {getFormatTime(data?.daoJobConfig?.thisCycle?.endAt || 0, 'LLL')}
        </Space>
        <Space>
          <span style={{ fontWeight: 700 }}>
            {intl.formatMessage({ id: 'pages.dao.config.tab.job.cycle.pairing' })}
          </span>
          {getFormatTime(data?.daoJobConfig?.thisCycle?.pairBeginAt || 0, 'LLL')}
          <span>-</span>
          {getFormatTime(data?.daoJobConfig?.thisCycle?.pairEndAt || 0, 'LLL')}
        </Space>
        <Space>
          <span style={{ fontWeight: 700 }}>
            {intl.formatMessage({ id: 'pages.dao.config.tab.job.cycle.voting' })}
          </span>
          {getFormatTime(data?.daoJobConfig?.thisCycle?.voteBeginAt || 0, 'LLL')}
          <span>-</span>
          {getFormatTime(data?.daoJobConfig?.thisCycle?.voteEndAt || 0, 'LLL')}
        </Space>
      </Space>
    </>
  );
};

export default DAOJobConfig;
