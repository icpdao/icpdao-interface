import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  TimePicker,
} from 'antd';
import styles from './index.less';
import type { Job, JobListQueryVariables } from '@/services/dao/generated';
import {
  useCreateJobMutation,
  useIssueInfoLazyQuery,
  useIssueTimelineLazyQuery,
  useJobListLazyQuery,
  useUpdateJobMutation,
  useUserJobDaoListQuery,
  useUserOpenPrLazyQuery,
} from '@/services/dao/generated';
import moment from 'moment';
import { PageLoading } from '@ant-design/pro-layout';
import OwnerJobTable from '@/pages/Job/components/OwnerJobTable';
import OtherUserJobTable from '@/pages/Job/components/OtherUserJobTable';
import { useModel } from '@@/plugin-model/useModel';
import { FormattedMessage, useIntl } from 'umi';
import StatCard from '@/components/StatCard';
import { PlusOutlined, QuestionOutlined } from '@ant-design/icons';
import { useRequest } from '@@/plugin-request/request';
import { renderIncomes, renderIncomesWithD, renderJobTag } from '@/utils/pageHelper';
import { defaultPageSize } from '@/pages/Job/components/OtherUserJobTable';
import {
  clearNewJobExpertMode,
  getNewJobExpertMode,
  getUserInfo,
  setNewJobExpertMode,
} from '@/utils/utils';
import MentorWarningModal from '@/components/Modal/MentorWarningModal';
import { useTokenPrice } from '@/pages/Dao/hooks/useTokenPrice';
import { useWallet } from '@/hooks/useWallet';
import { useWeb3React } from '@web3-react/core';

type TabJobProps = {
  daoId?: string;
  userName?: string;
};

type choosePR = {
  id: number;
  htmlUrl: string;
  title: string;
  type: 'tmp' | 'link' | 'open';
};

type newJobFormData = {
  issue: string;
  size: number | undefined;
  autoCreatePR: boolean;
  prs?: choosePR[];
  jobId?: string;
  jobStatus?: number | undefined;
  jobIncome?: string | undefined;
};

const { Option } = Select;

const githubIssueLinkReg = /https:\/\/github.com\/(.+)\/(.+)\/issues\/(\d+)/;
const githubPRLinkReg = /https:\/\/github.com\/(.+)\/(.+)\/pull\/(\d+)/;
// const workInfoURL =
//   'https://icpdao.gitbook.io/icpdao/yong-hu-zhi-dao/biao-ji-gong-xian-tou-piao/biao-ji-gong-xian';

function PickerWithType({ type, onChange, size }: any) {
  if (type === 'time')
    return <TimePicker style={{ width: '100%' }} size={size} onChange={onChange} />;
  if (type === 'date')
    return <DatePicker style={{ width: '100%' }} size={size} onChange={onChange} />;
  return <DatePicker style={{ width: '100%' }} size={size} picker={type} onChange={onChange} />;
}

const TabJob: React.FC<TabJobProps> = ({ daoId, userName }) => {
  const { initialState } = useModel('@@initialState');
  const intl = useIntl();
  const [newOrEditJobForm] = Form.useForm();
  const [adjustJobSizeForm] = Form.useForm();
  const [expert, setExpert] = useState<boolean>(false);
  const [howWorkModalVisible, setHowWorkModalVisible] = useState<boolean>(false);
  const [mentorWarningVisible, setMentorWarningVisible] = useState<boolean>(false);

  useEffect(() => {
    setExpert(getNewJobExpertMode());
  }, []);
  const handlerExpertMode = useCallback((checked: boolean) => {
    setExpert(checked);
    if (checked) setNewJobExpertMode();
    else clearNewJobExpertMode();
  }, []);
  const [newOrEditOrViewJobFormData, setNewOrEditOrViewJobFormData] = useState<newJobFormData>({
    issue: '',
    size: undefined,
    autoCreatePR: false,
    prs: [],
  });
  const [searchDateType, setSearchDateType] = useState<string>('date');
  // const [defaultDaoId, setDefaultDaoId] = useState(daoId || '');
  const [currentDao, setCurrentDao] = useState<any>();
  const [newJobModalVisible, setNewJobModalVisible] = useState<boolean>(false);
  const [editJobModalVisible, setEditJobModalVisible] = useState<boolean>(false);
  const [viewJobModalVisible, setViewJobModalVisible] = useState<boolean>(false);
  const [adjustJobSizeStatus, setAdjustJobSizeStatus] = useState<string>('');
  const [jobQueryVar, setJobQueryVar] = useState<JobListQueryVariables>({
    daoName: '',
    offset: 0,
    first: defaultPageSize,
  });
  const [choosePRData, setChoosePRData] = useState<choosePR[]>([]);
  const [backupChoosePRData, setBackupChoosePRData] = useState<choosePR[]>([]);
  const { queryChainId } = useWallet(useWeb3React());
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

  const {
    data: daoListData,
    loading: daoListLoading,
    refetch: daoListReFetch,
  } = useUserJobDaoListQuery({
    variables: { userName },
    fetchPolicy: 'no-cache',
  });

  const [getJobList, jobList] = useJobListLazyQuery({
    fetchPolicy: 'no-cache',
  });

  const { tokenPrice } = useTokenPrice(jobList?.data?.jobs?.stat?.incomes || []);

  const [getUserOpenPR, { data: userOpenPR, loading: getUserOpenPRLoading }] =
    useUserOpenPrLazyQuery({
      fetchPolicy: 'no-cache',
      onCompleted: (data) => {
        if (expert) return;
        const userUnMergePR = JSON.parse(data.openGithub?.data);
        if (userUnMergePR && userUnMergePR.items && userUnMergePR.items.length > 0) {
          const upr = userUnMergePR.items[0];
          setNewOrEditOrViewJobFormData((old) => ({
            ...old,
            autoCreatePR: false,
            prs: [
              {
                id: upr.id || 0,
                title: upr.title || '',
                htmlUrl: upr.html_url || '',
                type: 'open',
              },
            ],
          }));
        } else {
          setNewOrEditOrViewJobFormData((old) => ({ ...old, autoCreatePR: true, prs: [] }));
        }
      },
    });
  const [getIssueInfo, { data: issueInfo, loading: getIssueInfoLoading }] = useIssueInfoLazyQuery({
    fetchPolicy: 'no-cache',
  });
  const [getIssueTimeline, { data: issueTimeline, loading: getIssueTimelineLoading }] =
    useIssueTimelineLazyQuery({ fetchPolicy: 'no-cache' });

  const { loading: getChoosePRsLoading, run: getChoosePRs } = useRequest(
    async (user, issueLink: string) => {
      if (!issueLink) return;
      const parseIssue = githubIssueLinkReg.exec(issueLink);
      console.log(issueLink, parseIssue);
      if (!parseIssue) return;
      await getIssueTimeline({
        variables: { daoName: parseIssue[1], parameter: [parseIssue[2], parseIssue[3]] },
      });
      await getUserOpenPR({
        variables: { daoName: parseIssue[1], parameter: [user] },
        context: { errorPolicy: 'ignore' },
      });
    },
    {
      manual: true,
      debounceInterval: 500,
    },
  );

  useEffect(() => {
    const choosePRs: choosePR[] = [];
    const prsID: number[] = [];
    if (newOrEditOrViewJobFormData.prs) {
      newOrEditOrViewJobFormData.prs.forEach((p) => {
        choosePRs.push({
          id: p.id || 0,
          title: p.title || '',
          htmlUrl: p.htmlUrl || '',
          type: 'link',
        });
        prsID.push(p.id || 0);
      });
    }
    if (issueInfo?.openGithub?.data) {
      const prInfo = JSON.parse(issueInfo?.openGithub?.data);
      if (!prsID.includes(prInfo.id || 0)) {
        choosePRs.push({
          id: prInfo.id || 0,
          title: prInfo.title || '',
          htmlUrl: prInfo.html_url || '',
          type: 'tmp',
        });
        prsID.push(prInfo.id || 0);
      }
    }
    if (issueTimeline?.openGithub?.data) {
      const issueConnectPR = JSON.parse(issueTimeline?.openGithub?.data);
      issueConnectPR.forEach((ipr: any) => {
        if (
          ipr.event === 'cross-referenced' &&
          ipr.source &&
          ipr.source.issue &&
          ipr.source.issue.pull_request &&
          !prsID.includes(ipr.source.issue.id || 0) &&
          userName === ipr.source.issue.user?.login
        ) {
          choosePRs.push({
            id: ipr.source.issue.id || 0,
            title: ipr.source.issue.title || '',
            htmlUrl: ipr.source.issue.html_url || '',
            type: 'link',
          });
          prsID.push(ipr.source.issue.id || 0);
        }
      });
    }
    if (userOpenPR?.openGithub?.data) {
      const userUnMergePR = JSON.parse(userOpenPR?.openGithub?.data);
      if (userUnMergePR && userUnMergePR.items) {
        userUnMergePR.items.forEach((upr: any) => {
          if (!prsID.includes(upr.id || 0)) {
            choosePRs.push({
              id: upr.id || 0,
              title: upr.title || '',
              htmlUrl: upr.html_url || '',
              type: 'open',
            });
            prsID.push(upr.id || 0);
          }
        });
      }
    }
    choosePRs.sort((a, b) => a.id - b.id);
    setChoosePRData(choosePRs);
    setBackupChoosePRData(choosePRs);
  }, [
    issueInfo?.openGithub?.data,
    issueTimeline?.openGithub?.data,
    newOrEditOrViewJobFormData.prs,
    userName,
    userOpenPR?.openGithub?.data,
  ]);

  const { loading: getInputPRLoading, run: getInputPR } = useRequest(
    async (prLink: string) => {
      if (!prLink) return;
      const parsePR = githubPRLinkReg.exec(prLink);
      if (!parsePR) return;
      await getIssueInfo({
        variables: { daoName: parsePR[1], parameter: [parsePR[2], parsePR[3]] },
      });
    },
    { manual: true, debounceInterval: 500 },
  );

  const handlerSearchChoosePR = useCallback(
    (value: string) => {
      if (!value) {
        setChoosePRData(backupChoosePRData);
        return;
      }
      const ret: choosePR[] = [];
      choosePRData.forEach((cpr) => {
        if (cpr.title.includes(value) || cpr.htmlUrl.includes(value)) ret.push(cpr);
      });
      setChoosePRData(ret);
    },
    [backupChoosePRData, choosePRData],
  );

  const handlerModalCancel = useCallback(
    async (type: 'new_job' | 'edit_job' | 'view_job', closeModal: boolean = true) => {
      const clearFormData = {
        issue: '',
        size: undefined,
        autoCreatePR: false,
        prs: [],
      };
      setNewOrEditOrViewJobFormData(clearFormData);
      await newOrEditJobForm.setFieldsValue({
        [`${type}issue`]: clearFormData.issue,
        [`${type}size`]: clearFormData.size,
        [`${type}autoCreatePR`]: clearFormData.autoCreatePR,
      });
      await newOrEditJobForm.resetFields();
      setChoosePRData([]);
      setBackupChoosePRData([]);

      if (closeModal) {
        if (type === 'new_job') {
          setNewJobModalVisible(false);
        } else if (type === 'edit_job') {
          setEditJobModalVisible(false);
        } else {
          setViewJobModalVisible(false);
        }
      }
      await daoListReFetch();
    },
    [daoListReFetch, newOrEditJobForm],
  );

  const handlerAdjustSizeModalCancel = useCallback(async () => {
    setAdjustJobSizeStatus('');
    await daoListReFetch();
    const clearFormData = {
      issue: '',
      size: undefined,
      autoCreatePR: false,
      prs: [],
    };
    setNewOrEditOrViewJobFormData(clearFormData);
    setChoosePRData([]);
    setBackupChoosePRData([]);
    await adjustJobSizeForm.setFieldsValue({
      [`adjustIssue`]: clearFormData.issue,
      [`adjustSize`]: clearFormData.size,
      [`adjustAutoCreatePR`]: clearFormData.autoCreatePR,
    });
    await adjustJobSizeForm.resetFields();
  }, [daoListReFetch, adjustJobSizeForm]);

  const choosePRTableRowSelection = useMemo(() => {
    const selectedRowKeys = newOrEditOrViewJobFormData.prs?.map((v) => v.id);
    return {
      onChange: (_: React.Key[], selectedRows: choosePR[]) => {
        setNewOrEditOrViewJobFormData((old) => ({ ...old, prs: selectedRows }));
      },
      selectedRowKeys,
      getCheckboxProps: (record: choosePR) => ({
        name: record.id.toString(),
        disabled:
          newOrEditOrViewJobFormData.autoCreatePR ||
          viewJobModalVisible ||
          adjustJobSizeStatus !== '',
      }),
    };
  }, [
    newOrEditOrViewJobFormData.prs,
    newOrEditOrViewJobFormData.autoCreatePR,
    viewJobModalVisible,
    adjustJobSizeStatus,
  ]);

  const choosePRTable = useMemo(() => {
    return (
      <Table<choosePR>
        size={'small'}
        rowKey={(record) => record?.id || ''}
        bordered
        dataSource={choosePRData as any}
        loading={
          getChoosePRsLoading ||
          getInputPRLoading ||
          getUserOpenPRLoading ||
          getIssueInfoLoading ||
          getIssueTimelineLoading ||
          false
        }
        rowSelection={{
          type: 'checkbox',
          ...choosePRTableRowSelection,
        }}
        columns={[
          {
            title: intl.formatMessage({ id: 'pages.job.modal.new_job.pr.table.head.title' }),
            dataIndex: 'title',
            key: 'title',
            render: (_: any, record: choosePR) => {
              return (
                <a href={record.htmlUrl} target={'_blank'}>
                  {record.title}
                </a>
              );
            },
          },
        ]}
        scroll={{ y: 300 }}
        pagination={false}
      />
    );
  }, [
    choosePRData,
    choosePRTableRowSelection,
    getChoosePRsLoading,
    getInputPRLoading,
    getIssueInfoLoading,
    getIssueTimelineLoading,
    getUserOpenPRLoading,
    intl,
  ]);

  const [createJob, { loading: createJobLoading }] = useCreateJobMutation();
  const [updateJob, { loading: updateJobLoading }] = useUpdateJobMutation();
  const [okButtonLoading, setOkButtonLoading] = useState<boolean>(false);
  const [okContinueButtonLoading, setOkContinueButtonLoading] = useState<boolean>(false);
  const [saveButtonLoading, setSaveButtonLoading] = useState<boolean>(false);

  const handlerNewJob = useCallback(
    async (cont: boolean) => {
      try {
        const checkedData = await newOrEditJobForm.validateFields();
        if (!newOrEditOrViewJobFormData.size || newOrEditOrViewJobFormData.size === 0) {
          console.error('find size 0');
          return;
        }
        if (cont) setOkContinueButtonLoading(true);
        else setOkButtonLoading(true);
        console.log(checkedData, newOrEditOrViewJobFormData);
        await createJob({
          variables: {
            issueLink: newOrEditOrViewJobFormData.issue,
            size: newOrEditOrViewJobFormData.size || 0,
            autoCreatePR: newOrEditOrViewJobFormData.autoCreatePR,
            PRList: newOrEditOrViewJobFormData.prs?.map((p) => ({ id: p.id, htmlUrl: p.htmlUrl })),
          },
        });
        if (cont) setOkContinueButtonLoading(false);
        else setOkButtonLoading(false);
        await getJobList({ variables: jobQueryVar });
        await handlerModalCancel('new_job', !cont);
      } catch (e) {
        console.log(e);
        if (cont) setOkContinueButtonLoading(false);
        else setOkButtonLoading(false);
      }
    },
    [
      createJob,
      getJobList,
      handlerModalCancel,
      jobQueryVar,
      newOrEditJobForm,
      newOrEditOrViewJobFormData,
    ],
  );

  const handlerSaveJob = useCallback(async () => {
    try {
      await newOrEditJobForm.validateFields();
      console.log(newOrEditOrViewJobFormData);
      if (
        !newOrEditOrViewJobFormData.jobId ||
        !newOrEditOrViewJobFormData.size ||
        newOrEditOrViewJobFormData.size === 0
      )
        return;
      setSaveButtonLoading(true);
      await updateJob({
        variables: {
          id: newOrEditOrViewJobFormData.jobId,
          size: newOrEditOrViewJobFormData.size || 0,
          autoCreatePR: newOrEditOrViewJobFormData.autoCreatePR,
          PRList: newOrEditOrViewJobFormData.prs?.map((p) => ({ id: p.id, htmlUrl: p.htmlUrl })),
        },
      });
      setSaveButtonLoading(false);
      await getJobList({ variables: jobQueryVar });
      await handlerModalCancel('edit_job');
    } catch (e) {
      setSaveButtonLoading(false);
    }
  }, [
    getJobList,
    handlerModalCancel,
    jobQueryVar,
    newOrEditJobForm,
    newOrEditOrViewJobFormData,
    updateJob,
  ]);

  const handlerAdjustJobSize = useCallback(async () => {
    try {
      console.log(newOrEditOrViewJobFormData);
      if (!newOrEditOrViewJobFormData.jobId || !newOrEditOrViewJobFormData.size) return;
      setSaveButtonLoading(true);
      await updateJob({
        variables: {
          id: newOrEditOrViewJobFormData.jobId,
          size: newOrEditOrViewJobFormData.size || 0,
          autoCreatePR: newOrEditOrViewJobFormData.autoCreatePR,
          PRList: newOrEditOrViewJobFormData.prs?.map((p) => ({ id: p.id, htmlUrl: p.htmlUrl })),
        },
      });
      setSaveButtonLoading(false);
      await getJobList({ variables: jobQueryVar });
      await handlerAdjustSizeModalCancel();
    } catch (e) {
      setSaveButtonLoading(false);
    }
  }, [
    getJobList,
    handlerAdjustSizeModalCancel,
    jobQueryVar,
    newOrEditOrViewJobFormData,
    updateJob,
  ]);

  const modalTag = useMemo(() => {
    if (newOrEditOrViewJobFormData.jobStatus === undefined && !newOrEditOrViewJobFormData.jobIncome)
      return <></>;
    return (
      <Space className={styles.ModalTag}>
        {newOrEditOrViewJobFormData.jobStatus !== undefined &&
          renderJobTag(intl, newOrEditOrViewJobFormData.jobStatus)}
        {!!newOrEditOrViewJobFormData.jobIncome && (
          <Tag color="purple">income: {newOrEditOrViewJobFormData.jobIncome}</Tag>
        )}
      </Space>
    );
  }, [intl, newOrEditOrViewJobFormData.jobIncome, newOrEditOrViewJobFormData.jobStatus]);

  const newOrEditJobModal = useCallback(
    (type: 'new_job' | 'edit_job') => {
      const simpleModeDisabled =
        !expert &&
        !newOrEditOrViewJobFormData.autoCreatePR &&
        (!newOrEditOrViewJobFormData.prs || newOrEditOrViewJobFormData.prs?.length === 0);
      return (
        <Modal
          destroyOnClose={true}
          width={700}
          visible={type === 'new_job' ? newJobModalVisible : editJobModalVisible}
          title={
            <Space size={30}>
              <div>{intl.formatMessage({ id: `pages.job.modal.${type}.title` })}</div>
              <div>
                <Switch
                  defaultChecked={expert}
                  onChange={handlerExpertMode}
                  checkedChildren={intl.formatMessage({ id: 'pages.job.modal.expert.mode' })}
                />
              </div>
            </Space>
          }
          footer={
            <Space direction={'horizontal'} className={styles.globalModalButtonSpace}>
              <Button block key={'back'} onClick={() => handlerModalCancel(type)}>
                {intl.formatMessage({ id: 'pages.job.modal.button.cancel' })}
              </Button>
              {type === 'new_job' ? (
                <>
                  <Button
                    block
                    key={'back'}
                    type={'primary'}
                    disabled={simpleModeDisabled}
                    loading={okContinueButtonLoading}
                    onClick={() => handlerNewJob(true)}
                  >
                    {intl.formatMessage({ id: 'pages.job.modal.button.ok_continue' })}
                  </Button>
                  <Button
                    block
                    key={'submit'}
                    type={'primary'}
                    loading={okButtonLoading}
                    disabled={simpleModeDisabled}
                    onClick={() => handlerNewJob(false)}
                  >
                    {intl.formatMessage({ id: 'pages.job.modal.button.ok' })}
                  </Button>
                </>
              ) : (
                <Button
                  block
                  key={'submit'}
                  loading={saveButtonLoading}
                  type={'primary'}
                  onClick={handlerSaveJob}
                >
                  {intl.formatMessage({ id: 'pages.job.modal.button.save' })}
                </Button>
              )}
            </Space>
          }
          onOk={() => {}}
          onCancel={() => handlerModalCancel(type)}
        >
          <Spin spinning={createJobLoading || updateJobLoading}>
            <Form
              form={newOrEditJobForm}
              key={`${type}Form`}
              initialValues={{
                [`${type}issue`]: newOrEditOrViewJobFormData.issue,
                [`${type}size`]: newOrEditOrViewJobFormData.size,
                [`${type}autoCreatePR`]: newOrEditOrViewJobFormData.autoCreatePR,
              }}
            >
              <Row gutter={30}>
                <Col span={17}>
                  <Form.Item
                    name={`${type}issue`}
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({ id: 'pages.job.modal.new_job.issue.help' }),
                      },
                      {
                        pattern: githubIssueLinkReg,
                        message: intl.formatMessage({ id: 'pages.job.modal.new_job.issue.help' }),
                      },
                    ]}
                  >
                    <Input
                      disabled={type === 'edit_job'}
                      value={newOrEditOrViewJobFormData.issue}
                      onChange={async () => {
                        try {
                          const checked = await newOrEditJobForm.validateFields([`${type}issue`]);
                          await getChoosePRs(userName, checked[`${type}issue`]);
                          setNewOrEditOrViewJobFormData((old) => ({
                            ...old,
                            issue: checked[`${type}issue`],
                          }));
                        } catch (e) {
                          console.log(e);
                        }
                      }}
                      placeholder={intl.formatMessage({ id: 'pages.job.modal.new_job.issue.pla' })}
                    />
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item
                    name={`${type}size`}
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({ id: 'pages.job.modal.new_job.size.help' }),
                      },
                      {
                        type: 'number',
                        min: 0.1,
                        message: intl.formatMessage({
                          id: 'pages.job.modal.new_job.size.min.help',
                        }),
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0.1}
                      step={0.1}
                      precision={1}
                      value={newOrEditOrViewJobFormData.size}
                      placeholder={intl.formatMessage({ id: 'pages.job.modal.new_job.size.pla' })}
                      onChange={async () => {
                        try {
                          const checked = await newOrEditJobForm.validateFields([`${type}size`]);
                          setNewOrEditOrViewJobFormData((old) => ({
                            ...old,
                            size: checked[`${type}size`],
                          }));
                        } catch (e) {
                          console.log(e);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={30}>
                {expert && (
                  <Col span={17}>
                    <Form.Item name={`${type}searchPR`}>
                      <Input
                        allowClear
                        disabled={newOrEditOrViewJobFormData.autoCreatePR}
                        onPressEnter={() => {
                          if (choosePRData.length > 0)
                            setNewOrEditOrViewJobFormData((old) => ({
                              ...old,
                              prs: [choosePRData[0]],
                            }));
                        }}
                        onChange={async (event) => {
                          const v = event.target.value;
                          if (githubPRLinkReg.test(v)) {
                            await getInputPR(v);
                          } else {
                            handlerSearchChoosePR(v);
                          }
                        }}
                        placeholder={intl.formatMessage({ id: 'pages.job.modal.new_job.pr.pla' })}
                      />
                    </Form.Item>
                  </Col>
                )}
                {(expert || newOrEditOrViewJobFormData.autoCreatePR) && (
                  <Col span={7} style={!expert ? { float: 'right', marginLeft: 'auto' } : {}}>
                    <Form.Item name={`${type}autoCreatePR`}>
                      <Checkbox
                        checked={newOrEditOrViewJobFormData.autoCreatePR}
                        onChange={(v) => {
                          if (v.target.checked) {
                            setNewOrEditOrViewJobFormData((old) => ({
                              ...old,
                              autoCreatePR: true,
                              prs: [],
                            }));
                          } else {
                            if (type === 'edit_job') {
                              message.info(
                                intl.formatMessage({
                                  id: 'pages.job.modal.edit_job.warn.auto_create_pr',
                                }),
                              );
                              return;
                            }
                            setNewOrEditOrViewJobFormData((old) => ({
                              ...old,
                              autoCreatePR: false,
                            }));
                          }
                        }}
                      >
                        {intl.formatMessage({ id: 'pages.job.modal.new_job.auto_create_pr' })}
                      </Checkbox>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Form>
            {(expert ||
              (newOrEditOrViewJobFormData.prs && newOrEditOrViewJobFormData.prs.length > 0)) &&
              choosePRTable}
            {modalTag}
          </Spin>
        </Modal>
      );
    },
    [
      choosePRData,
      choosePRTable,
      createJobLoading,
      editJobModalVisible,
      expert,
      getChoosePRs,
      getInputPR,
      handlerExpertMode,
      handlerModalCancel,
      handlerNewJob,
      handlerSaveJob,
      handlerSearchChoosePR,
      intl,
      modalTag,
      newJobModalVisible,
      newOrEditJobForm,
      newOrEditOrViewJobFormData.autoCreatePR,
      newOrEditOrViewJobFormData.issue,
      newOrEditOrViewJobFormData.prs,
      newOrEditOrViewJobFormData.size,
      okButtonLoading,
      okContinueButtonLoading,
      saveButtonLoading,
      updateJobLoading,
      userName,
    ],
  );

  const adjustJobSizeModal = useMemo(() => {
    return (
      <Modal
        destroyOnClose={true}
        width={700}
        visible={adjustJobSizeStatus !== ''}
        title={intl.formatMessage({ id: `pages.job.modal.adjust_size.title` })}
        footer={
          <Space direction={'horizontal'} className={styles.globalModalButtonSpace}>
            <Button block key={'back'} onClick={handlerAdjustSizeModalCancel}>
              {intl.formatMessage({ id: 'pages.job.modal.button.cancel' })}
            </Button>
            <Button
              block
              key={'submit'}
              loading={saveButtonLoading}
              type={'primary'}
              onClick={handlerAdjustJobSize}
            >
              {intl.formatMessage({ id: 'pages.job.modal.button.save' })}
            </Button>
          </Space>
        }
        onOk={() => {}}
        onCancel={handlerAdjustSizeModalCancel}
      >
        <Spin spinning={updateJobLoading}>
          <Form
            form={adjustJobSizeForm}
            key={`adjustForm`}
            initialValues={{
              adjustIssue: newOrEditOrViewJobFormData.issue,
              adjustSize: newOrEditOrViewJobFormData.size,
              adjustAutoCreatePR: newOrEditOrViewJobFormData.autoCreatePR,
            }}
          >
            <Row gutter={30}>
              <Col span={17}>
                <Form.Item name={`adjustIssue`}>
                  <Input
                    disabled={true}
                    value={newOrEditOrViewJobFormData.issue}
                    placeholder={intl.formatMessage({ id: 'pages.job.modal.new_job.issue.pla' })}
                  />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item
                  name={`adjustSize`}
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({ id: 'pages.job.modal.new_job.size.help' }),
                    },
                    {
                      type: 'number',
                      min: 0.1,
                      message: intl.formatMessage({ id: 'pages.job.modal.new_job.size.min.help' }),
                    },
                    {
                      validator: (_, value) => {
                        if (
                          adjustJobSizeStatus === 'increase' &&
                          newOrEditOrViewJobFormData.size &&
                          newOrEditOrViewJobFormData.size >= value
                        ) {
                          return Promise.reject(
                            new Error(
                              intl.formatMessage({
                                id: 'pages.job.modal.adjust_size.increase.warn',
                              }),
                            ),
                          );
                        }
                        if (
                          adjustJobSizeStatus === 'decrease' &&
                          newOrEditOrViewJobFormData.size &&
                          newOrEditOrViewJobFormData.size <= value
                        ) {
                          return Promise.reject(
                            new Error(
                              intl.formatMessage({
                                id: 'pages.job.modal.adjust_size.decrease.warn',
                              }),
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0.1}
                    step={0.1}
                    precision={1}
                    value={newOrEditOrViewJobFormData.size}
                    placeholder={intl.formatMessage({ id: 'pages.job.modal.new_job.size.pla' })}
                    onChange={async () => {
                      try {
                        const checked = await adjustJobSizeForm.validateFields([`adjustSize`]);
                        setNewOrEditOrViewJobFormData((old) => ({
                          ...old,
                          size: checked.adjustSize,
                        }));
                      } catch (e) {
                        console.log(e);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          {choosePRTable}
        </Spin>
      </Modal>
    );
  }, [
    adjustJobSizeStatus,
    intl,
    handlerAdjustSizeModalCancel,
    saveButtonLoading,
    handlerAdjustJobSize,
    updateJobLoading,
    adjustJobSizeForm,
    newOrEditOrViewJobFormData.issue,
    newOrEditOrViewJobFormData.size,
    newOrEditOrViewJobFormData.autoCreatePR,
    choosePRTable,
  ]);

  const viewJobModal = useMemo(() => {
    return (
      <Modal
        destroyOnClose={true}
        width={700}
        visible={viewJobModalVisible}
        title={intl.formatMessage({ id: `pages.job.modal.view_job.title` })}
        footer={
          <Space direction={'horizontal'} className={styles.globalModalButtonSpace}>
            <Button block key={'back'} onClick={() => handlerModalCancel('view_job')}>
              {intl.formatMessage({ id: 'pages.job.modal.button.cancel' })}
            </Button>
          </Space>
        }
        onOk={() => {}}
        onCancel={() => handlerModalCancel('view_job')}
      >
        <Form
          form={newOrEditJobForm}
          key={`viewJobForm`}
          initialValues={{
            viewJobIssue: newOrEditOrViewJobFormData.issue,
            viewJobSize: newOrEditOrViewJobFormData.size,
          }}
        >
          <Row gutter={30}>
            <Col span={17}>
              <Form.Item name={`viewJobIssue`}>
                <Input value={newOrEditOrViewJobFormData.issue} disabled />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item name={`viewJobSize`}>
                <InputNumber
                  disabled
                  style={{ width: '100%' }}
                  precision={1}
                  value={newOrEditOrViewJobFormData.size}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {choosePRTable}
        {modalTag}
      </Modal>
    );
  }, [
    choosePRTable,
    handlerModalCancel,
    intl,
    modalTag,
    newOrEditJobForm,
    newOrEditOrViewJobFormData.issue,
    newOrEditOrViewJobFormData.size,
    viewJobModalVisible,
  ]);

  const handlerOpenEditModal = useCallback(
    async (record: Job) => {
      const issue = `https://github.com/${record.node?.githubRepoOwner}/${record.node?.githubRepoName}/issues/${record.node?.githubIssueNumber}`;
      console.log(issue, record.prs);
      await getChoosePRs(userName, issue);
      setNewOrEditOrViewJobFormData({
        issue,
        size: record.node?.size,
        autoCreatePR: record.node?.hadAutoCreatePr || false,
        prs: record.prs?.map((p) => ({
          id: p?.githubPrId || 0,
          htmlUrl: `https://github.com/${p?.githubRepoOwner}/${p?.githubRepoName}/issues/${p?.githubPrNumber}`,
          title: p?.title || '',
          type: 'link',
        })),
        jobId: record.node?.id || undefined,
        jobStatus: record.node?.status,
        jobIncome: renderIncomesWithD(record.node?.incomes || []),
      });
      setNewJobModalVisible(false);
      setViewJobModalVisible(false);
      setEditJobModalVisible(true);
    },
    [getChoosePRs, userName],
  );

  const handlerOpenAdjustSizeModal = useCallback(
    async (record: Job, status: 'increase' | 'decrease') => {
      const issue = `https://github.com/${record.node?.githubRepoOwner}/${record.node?.githubRepoName}/issues/${record.node?.githubIssueNumber}`;
      console.log(issue, record.prs);
      setNewOrEditOrViewJobFormData({
        issue,
        size: record.node?.size,
        autoCreatePR: record.node?.hadAutoCreatePr || false,
        prs: record.prs?.map((p) => ({
          id: p?.githubPrId || 0,
          htmlUrl: `https://github.com/${p?.githubRepoOwner}/${p?.githubRepoName}/issues/${p?.githubPrNumber}`,
          title: p?.title || '',
          type: 'link',
        })),
        jobId: record.node?.id || undefined,
        jobStatus: record.node?.status,
        jobIncome: renderIncomesWithD(record.node?.incomes || []),
      });
      setNewJobModalVisible(false);
      setViewJobModalVisible(false);
      setEditJobModalVisible(false);
      setAdjustJobSizeStatus(status);
    },
    [],
  );

  const handlerOpenViewModal = useCallback((record: Job) => {
    const issue = `https://github.com/${record.node?.githubRepoOwner}/${record.node?.githubRepoName}/issues/${record.node?.githubIssueNumber}`;
    setNewOrEditOrViewJobFormData({
      issue,
      size: record.node?.size,
      autoCreatePR: record.node?.hadAutoCreatePr || false,
      prs: record.prs?.map((p) => ({
        id: p?.githubPrId || 0,
        htmlUrl: `https://github.com/${p?.githubRepoOwner}/${p?.githubRepoName}/issues/${p?.githubPrNumber}`,
        title: p?.title || '',
        type: 'link',
      })),
      jobId: record.node?.id || undefined,
      jobStatus: record.node?.status,
      jobIncome: renderIncomesWithD(record.node?.incomes || []),
    });
    setNewJobModalVisible(false);
    setEditJobModalVisible(false);
    setViewJobModalVisible(true);
  }, []);

  const handlerUpdateCurrentDao = useCallback(
    (currentId = undefined) => {
      if (daoListData?.daos?.dao && daoListData?.daos?.dao.length > 0) {
        let current: any | undefined;
        daoListData?.daos?.dao.forEach((d) => {
          if (currentId && d?.datum && d?.datum?.id === currentId) {
            current = d;
          }
        });
        setCurrentDao(current || daoListData.daos.dao[0] || undefined);
      }
    },
    [daoListData?.daos?.dao],
  );

  useEffect(() => {
    handlerUpdateCurrentDao(daoId);
  }, [daoId, daoListData, handlerUpdateCurrentDao]);

  useEffect(() => {
    if (currentDao)
      setJobQueryVar((old) => ({
        ...old,
        daoName: currentDao.datum.name,
        userName,
        tokenChainId: queryChainId.toString(),
      }));
  }, [currentDao, userName, queryChainId]);

  useEffect(() => {
    if (jobQueryVar.daoName === '') return;
    getJobList({ variables: jobQueryVar });
  }, [getJobList, jobQueryVar]);

  const isMy = useMemo(() => {
    return initialState && userName === initialState.currentUser().profile?.github_login;
  }, [initialState, userName]);

  const jobTable = useMemo(() => {
    if (isMy) {
      return (
        <OwnerJobTable
          openEditModal={handlerOpenEditModal}
          openViewModal={handlerOpenViewModal}
          openAdjustSizeModal={handlerOpenAdjustSizeModal}
          jobQueryVar={jobQueryVar}
          setJobQueryVar={setJobQueryVar}
          getJobList={getJobList}
          jobList={jobList}
          tokenPrice={tokenPrice}
          chainId={queryChainId}
        />
      );
    }
    return (
      <OtherUserJobTable
        openViewModal={handlerOpenViewModal}
        openAdjustSizeModal={handlerOpenAdjustSizeModal}
        jobQueryVar={jobQueryVar}
        setJobQueryVar={setJobQueryVar}
        jobList={jobList}
        tokenPrice={tokenPrice}
        chainId={queryChainId}
      />
    );
  }, [
    isMy,
    handlerOpenViewModal,
    handlerOpenAdjustSizeModal,
    jobQueryVar,
    jobList,
    handlerOpenEditModal,
    getJobList,
    tokenPrice,
    queryChainId,
  ]);

  const handlerOpenNewJobModal = useCallback(() => {
    setNewJobModalVisible(true);
  }, []);

  const searchFormButton = useMemo(() => {
    if (isMy)
      return (
        <Space size={'middle'} style={{ float: 'right', marginLeft: 'auto' }}>
          <Button
            onClick={() => setHowWorkModalVisible(true)}
            size={'large'}
            block
            icon={<QuestionOutlined />}
          >
            {intl.formatMessage({ id: 'pages.job.table.info' })}
          </Button>
          {isMy && (
            <Button
              type="primary"
              block
              size={'large'}
              icon={<PlusOutlined />}
              onClick={handlerOpenNewJobModal}
            >
              {intl.formatMessage({ id: 'pages.job.table.button' })}
            </Button>
          )}
        </Space>
      );
    return (
      <Button
        onClick={() => setHowWorkModalVisible(true)}
        size={'large'}
        block
        icon={<QuestionOutlined />}
      >
        {intl.formatMessage({ id: 'pages.job.table.info' })}
      </Button>
    );
  }, [handlerOpenNewJobModal, intl, isMy]);

  const searchForm = useMemo(() => {
    return (
      <div key={'searchForm'} className={styles.SearchForm}>
        <Row justify={'space-between'}>
          <Col>
            <Space direction={'horizontal'}>
              <Select
                size={'large'}
                showSearch
                className={styles.searchOrgNameSelect}
                optionFilterProp="children"
                value={currentDao?.datum?.id || ''}
                filterOption={(input, option) =>
                  ((option?.label as string) || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                notFoundContent={null}
                onSelect={async (value, option) => {
                  console.log(value, option.label);
                  if (option.label) handlerUpdateCurrentDao(value);
                  setJobQueryVar((old) => ({
                    ...old,
                    daoName: option.label as string,
                  }));
                }}
                options={
                  daoListData?.daos?.dao?.map((d) => ({
                    label: d?.datum?.name || '',
                    value: d?.datum?.id || '',
                  })) || []
                }
              />
              <Select
                size={'large'}
                value={searchDateType}
                onChange={setSearchDateType}
                className={styles.searchDateTypeSelect}
              >
                <Option value="date">
                  <FormattedMessage id={'component.day_select.date'} />
                </Option>
                <Option value="week">
                  <FormattedMessage id={'component.day_select.week'} />
                </Option>
                <Option value="month">
                  <FormattedMessage id={'component.day_select.month'} />
                </Option>
                <Option value="quarter">
                  <FormattedMessage id={'component.day_select.quarter'} />
                </Option>
                <Option value="year">
                  <FormattedMessage id={'component.day_select.year'} />
                </Option>
              </Select>
              <PickerWithType
                size={'large'}
                className={styles.searchDateSelect}
                type={searchDateType}
                onChange={(value: any) => parseTime(value)}
              />
            </Space>
          </Col>
          <Col>{searchFormButton}</Col>
        </Row>
      </div>
    );
  }, [
    currentDao?.datum?.id,
    daoListData?.daos?.dao,
    handlerUpdateCurrentDao,
    parseTime,
    searchDateType,
    searchFormButton,
  ]);

  const stat = useMemo(() => {
    return [
      {
        number: jobList.data?.jobs?.total || 0,
        title: intl.formatMessage({ id: 'component.card.stat.job' }),
      },
      {
        number: parseFloat(jobList.data?.jobs?.stat?.size?.toString() || '0').toFixed(1),
        title: intl.formatMessage({ id: 'component.card.stat.size' }),
      },
      {
        number: renderIncomes(jobList.data?.jobs?.stat?.incomes || [], tokenPrice),
        title: intl.formatMessage({ id: 'component.card.stat.token' }),
      },
    ];
  }, [
    tokenPrice,
    intl,
    jobList.data?.jobs?.stat?.size,
    jobList.data?.jobs?.stat?.incomes,
    jobList.data?.jobs?.total,
  ]);

  const mentorWarning = useMemo(() => {
    return (
      <MentorWarningModal visible={mentorWarningVisible} setVisible={setMentorWarningVisible} />
    );
  }, [mentorWarningVisible]);

  useEffect(() => {
    const { profile } = getUserInfo();
    if (
      profile &&
      profile.icppership &&
      (profile.icppership.progress === 0 || profile.icppership.status === 2)
    )
      return;
    const noLongerRemind = localStorage.getItem('mentor_no_longer_remind') || '0';
    if (
      jobList?.data?.jobs?.job &&
      jobList?.data?.jobs?.job?.length >= 1 &&
      noLongerRemind !== '1'
    ) {
      setMentorWarningVisible(true);
    }
  }, [jobList?.data?.jobs?.job]);

  if (daoListLoading) {
    return <PageLoading />;
  }

  return (
    <>
      <div className={styles.statCard}>
        <StatCard data={stat} />
      </div>
      <Modal
        key={'howWorkModal'}
        maskClosable={true}
        bodyStyle={{
          paddingTop: 62,
          textAlign: 'center',
          fontWeight: 400,
          padding: '8px 8px 0 8px',
        }}
        destroyOnClose={true}
        width={800}
        visible={howWorkModalVisible}
        footer={null}
        onOk={() => setHowWorkModalVisible(false)}
        onCancel={() => setHowWorkModalVisible(false)}
      >
        <iframe
          width="100%"
          height="450px"
          src="https://www.youtube.com/embed/3NAu34guPkU"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Modal>
      {searchForm}
      {jobTable}
      {newOrEditJobModal('new_job')}
      {newOrEditJobModal('edit_job')}
      {viewJobModal}
      {adjustJobSizeModal}
      {mentorWarning}
    </>
  );
};

export default TabJob;
