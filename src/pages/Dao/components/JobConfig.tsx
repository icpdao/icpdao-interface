import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { DaoJobConfigQuery } from '@/services/dao/generated';
import {
  useDaoJobConfigQuery,
  useUpdateDaoJobConfigMutation,
  useDaoJobConfigPreviewNextCycleQuery,
  useUpdateDaoJobConfigManualMutation,
} from '@/services/dao/generated';
import { Form, Button, Select, Row, Col, message, Space, Skeleton, Radio } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import momentTZ from 'moment-timezone';
import styles from './index.less';
import DayHourCascader from '@/pages/Dao/components/DayHourCascader';
import { getFormatTime } from '@/utils/utils';
import IconFont from '@/components/IconFont';

type JobConfigProps = {
  daoId: string;
  nextStep?: () => void;
};

type CycleInfoProps = {
  title: string;
  loading: boolean;
  hasData: boolean;
  beginAt: number;
  endAt: number;
  pairBeginAt: number;
  pairEndAt: number;
  voteBeginAt: number;
  voteEndAt: number;
};

type JobConfigData = {
  timeZoneRegion?: string;
  deadline?: any[];
  pairBegin?: any[];
  pairEnd?: any[];
  votingBegin?: any[];
  votingEnd?: any[];
  manual?: boolean;
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
    manual: data.daoJobConfig?.datum?.manual || false,
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
    manual: data.manual,
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

const CycleInfo: React.FC<CycleInfoProps> = ({
  title,
  loading,
  hasData,
  beginAt,
  endAt,
  pairBeginAt,
  pairEndAt,
  voteBeginAt,
  voteEndAt,
}) => {
  const intl = useIntl();

  if (loading) {
    return (
      <div style={{ marginBottom: 65 }}>
        <Space direction={'vertical'}>
          <Space>{title}</Space>
          <Space>LOADING</Space>
        </Space>
      </div>
    );
  }

  if (hasData) {
    return (
      <Space style={{ marginBottom: 65 }} direction={'vertical'}>
        <Space style={{ marginBottom: 15 }}>{title}</Space>
        <Space>
          <span style={{ fontWeight: 700 }}>
            {intl.formatMessage({ id: 'pages.dao.config.tab.job.cycle.deadline' })}
          </span>
          {getFormatTime(beginAt, 'LLL')}
          <span>-</span>
          {getFormatTime(endAt, 'LLL')}
        </Space>
        <Space>
          <span style={{ fontWeight: 700 }}>
            {intl.formatMessage({ id: 'pages.dao.config.tab.job.cycle.pairing' })}
          </span>
          {getFormatTime(pairBeginAt, 'LLL')}
          <span>-</span>
          {getFormatTime(pairEndAt, 'LLL')}
        </Space>
        <Space>
          <span style={{ fontWeight: 700 }}>
            {intl.formatMessage({ id: 'pages.dao.config.tab.job.cycle.voting' })}
          </span>
          {getFormatTime(voteBeginAt, 'LLL')}
          <span>-</span>
          {getFormatTime(voteEndAt, 'LLL')}
        </Space>
      </Space>
    );
  }
  return (
    <div style={{ marginBottom: 65 }}>
      <Space direction={'vertical'}>
        <Space>{title}</Space>
        <Space>NO CYCLE</Space>
      </Space>
    </div>
  );
};

const DAOJobConfig: React.FC<JobConfigProps> = ({ daoId, nextStep }) => {
  const intl = useIntl();
  const [previewNextCycle, setPreviewNextCycle] = useState<any>(undefined);
  const [showPreview, setShowPreview] = useState(false);
  const [form] = Form.useForm();
  const [updateDaoJobConfig] = useUpdateDaoJobConfigMutation();
  const [updateDaoJobConfigManual] = useUpdateDaoJobConfigManualMutation();
  const [saveLoading, setSaveLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { data, loading, error, refetch } = useDaoJobConfigQuery({
    variables: { daoId },
  });

  const [manual, setManual] = useState<boolean>(false);

  useEffect(() => {
    if (!data?.daoJobConfig?.datum?.manual) return;
    setManual(data.daoJobConfig.datum.manual);
  }, [data?.daoJobConfig?.datum?.manual]);

  const formInitData = useMemo(() => {
    return formatJobConfigData(data);
  }, [data]);

  const existedLastCycle = useMemo(() => {
    return data?.daoJobConfig?.existedLastCycle;
  }, [data]);

  const nextCycle = useMemo(() => {
    return data?.daoJobConfig?.getNextCycle;
  }, [data]);

  const previewNextCycleQuery = useDaoJobConfigPreviewNextCycleQuery({
    skip: true,
    fetchPolicy: 'no-cache',
  });

  const handlePreviewNextCycle = useCallback(async () => {
    setPreviewLoading(true);
    setShowPreview(true);
    const values = form.getFieldsValue();
    const { valid, config: updateData } = formatSubmitJobConfigData(values);
    if (!valid) {
      form.resetFields();
      setPreviewLoading(false);
      setPreviewNextCycle(undefined);
      setShowPreview(false);
      message.error(intl.formatMessage({ id: 'pages.dao.config.tab.job.form.error' }));
      return false;
    }
    if (!updateData) return false;
    try {
      updateData.daoId = daoId;
      const res = await previewNextCycleQuery.refetch({
        daoId: updateData.daoId,
        timeZone: updateData.timeZone,
        deadlineDay: updateData.deadlineDay,
        deadlineTime: updateData.deadlineTime,
        pairBeginDay: updateData.pairBeginDay,
        pairBeginHour: updateData.pairBeginHour,
        pairEndDay: updateData.pairEndDay,
        pairEndHour: updateData.pairEndHour,
        votingBeginDay: updateData.votingBeginDay,
        votingBeginHour: updateData.votingBeginHour,
        votingEndDay: updateData.votingEndDay,
        votingEndHour: updateData.votingEndHour,
      });
      setPreviewNextCycle(res.data?.daoJobConfig?.previewNextCycle);
    } finally {
      setPreviewLoading(false);
    }
    return true;
  }, [daoId, form, intl, previewNextCycleQuery]);

  const showNextCycle = useMemo(() => {
    if (showPreview) {
      return previewNextCycle;
    }
    return nextCycle;
  }, [nextCycle, previewNextCycle, showPreview]);

  if (loading || error) {
    return <Skeleton active />;
  }

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
          if (values.manual) {
            await updateDaoJobConfigManual({ variables: { daoId, manual: values.manual } });
            await refetch();
            message.success(intl.formatMessage({ id: 'pages.dao.config.tab.job.form.success' }));
            setShowPreview(false);
            setSaveLoading(false);
            return true;
          }
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
            setShowPreview(false);
            setSaveLoading(false);
          }
          return true;
        }}
      >
        <Form.Item name="manual">
          <Radio.Group onChange={(e) => setManual(!!e.target.value)}>
            <Radio value={true}>
              {intl.formatMessage({ id: 'pages.dao.config.tab.job.form.manual' })}
            </Radio>
            <Radio value={false}>
              {intl.formatMessage({ id: 'pages.dao.config.tab.job.form.un_manual' })}
            </Radio>
          </Radio.Group>
        </Form.Item>
        {!manual && (
          <>
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
                    title: intl.formatMessage({
                      id: 'pages.dao.config.tab.job.form.deadline.desc',
                    }),
                    placement: 'right',
                    icon: <IconFont type={'icon-question'} />,
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
                    icon: <IconFont type={'icon-question'} />,
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
                    icon: <IconFont type={'icon-question'} />,
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
          </>
        )}
        <Form.Item>
          <Button htmlType="submit" type="primary" loading={saveLoading}>
            {intl.formatMessage({ id: 'pages.dao.config.tab.job.form.save' })}
          </Button>
          {!manual && (
            <Button
              type="primary"
              style={{ margin: '0 8px' }}
              loading={previewLoading}
              onClick={handlePreviewNextCycle}
            >
              {intl.formatMessage({ id: 'pages.dao.config.tab.job.form.preview' })}
            </Button>
          )}
        </Form.Item>
      </Form>
      {!manual && (
        <>
          <CycleInfo
            title={intl.formatMessage({
              id: 'pages.dao.config.tab.job.cycle.existed_last_cycle.title',
            })}
            loading={false}
            hasData={!!existedLastCycle}
            beginAt={existedLastCycle?.beginAt || 0}
            endAt={existedLastCycle?.endAt || 0}
            pairBeginAt={existedLastCycle?.pairBeginAt || 0}
            pairEndAt={existedLastCycle?.pairEndAt || 0}
            voteBeginAt={existedLastCycle?.voteBeginAt || 0}
            voteEndAt={existedLastCycle?.voteEndAt || 0}
          />
          <CycleInfo
            title={intl.formatMessage({ id: 'pages.dao.config.tab.job.cycle.next_cycle.title' })}
            loading={showPreview && previewLoading}
            hasData={!!showNextCycle}
            beginAt={showNextCycle?.beginAt || 0}
            endAt={showNextCycle?.endAt || 0}
            pairBeginAt={showNextCycle?.pairBeginAt || 0}
            pairEndAt={showNextCycle?.pairEndAt || 0}
            voteBeginAt={showNextCycle?.voteBeginAt || 0}
            voteEndAt={showNextCycle?.voteEndAt || 0}
          />
        </>
      )}
    </>
  );
};

export default DAOJobConfig;
