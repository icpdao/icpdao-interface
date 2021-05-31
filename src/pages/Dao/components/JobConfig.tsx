import React, { useState } from 'react';
import type { DaoJobConfigQuery } from '@/services/dao/generated';
import { useDaoJobConfigQuery, useUpdateDaoJobConfigMutation } from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { Form, Button, Select, Row, Col, message } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import momentTZ from 'moment-timezone';
import styles from './index.less';
import DayHourCascader from '@/pages/Dao/components/DayHourCascader';

type JobConfigProps = {
  daoId: string;
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
    timeZoneRegion: data.daoJobConfig?.timeZoneRegion,
    deadline: [data.daoJobConfig?.deadlineDay, data.daoJobConfig?.deadlineTime],
    pairBegin: [data.daoJobConfig?.pairBeginDay, data.daoJobConfig?.pairBeginHour],
    pairEnd: [data.daoJobConfig?.pairEndDay, data.daoJobConfig?.pairEndHour],
    votingBegin: [data.daoJobConfig?.votingBeginDay, data.daoJobConfig?.votingBeginHour],
    votingEnd: [data.daoJobConfig?.votingEndDay, data.daoJobConfig?.votingEndHour],
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

const DAOJobConfig: React.FC<JobConfigProps> = ({ daoId }) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [updateDaoJobConfig] = useUpdateDaoJobConfigMutation();
  const [saveLoading, setSaveLoading] = useState(false);
  const { data, loading, error } = useDaoJobConfigQuery({
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
          updateData.daoId = daoId;
          await updateDaoJobConfig({
            variables: updateData,
          });
          message.success(intl.formatMessage({ id: 'pages.dao.config.tab.job.form.success' }));
          setSaveLoading(false);
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
    </>
  );
};

export default DAOJobConfig;
