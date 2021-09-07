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
  Table,
  Tag,
  TimePicker,
} from 'antd';
import styles from './index.less';
import type { Job, JobListQueryVariables, DaoSchema } from '@/services/dao/generated';
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
import { PlusOutlined } from '@ant-design/icons';
import { useRequest } from '@@/plugin-request/request';
import { renderJobTag } from '@/utils/pageHelper';

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
  jobIncome?: number | undefined;
};

const { Option } = Select;

const githubIssueLinkReg = /https:\/\/github.com\/(.+)\/(.+)\/issues\/(\d+)/;
const githubPRLinkReg = /https:\/\/github.com\/(.+)\/(.+)\/pull\/(\d+)/;

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
  const [newOrEditOrViewJobFormData, setNewOrEditOrViewJobFormData] = useState<newJobFormData>({
    issue: '',
    size: undefined,
    autoCreatePR: false,
    prs: [],
  });
  const [searchDateType, setSearchDateType] = useState<string>('date');
  // const [defaultDaoId, setDefaultDaoId] = useState(daoId || '');
  const [currentDao, setCurrentDao] = useState<DaoSchema>();
  const [newJobModalVisible, setNewJobModalVisible] = useState<boolean>(false);
  const [editJobModalVisible, setEditJobModalVisible] = useState<boolean>(false);
  const [viewJobModalVisible, setViewJobModalVisible] = useState<boolean>(false);
  const [jobQueryVar, setJobQueryVar] = useState<JobListQueryVariables>({
    daoName: '',
    offset: 0,
    first: 10,
  });
  const [choosePRData, setChoosePRData] = useState<choosePR[]>([]);
  const [backupChoosePRData, setBackupChoosePRData] = useState<choosePR[]>([]);
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

  const [getUserOpenPR, { data: userOpenPR, loading: getUserOpenPRLoading }] =
    useUserOpenPrLazyQuery({ fetchPolicy: 'no-cache' });
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
      choosePRs.push({
        id: prInfo.id || 0,
        title: prInfo.title || '',
        htmlUrl: prInfo.html_url || '',
        type: 'tmp',
      });
      prsID.push(prInfo.id || 0);
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
      await getJobList({ variables: jobQueryVar });
      setNewOrEditOrViewJobFormData({
        issue: '',
        size: undefined,
        autoCreatePR: false,
        prs: [],
      });
      setChoosePRData([]);
      setBackupChoosePRData([]);
      await newOrEditJobForm.resetFields();
    },
    [daoListReFetch, getJobList, jobQueryVar, newOrEditJobForm],
  );

  const choosePRTableRowSelection = useMemo(() => {
    console.log(newOrEditOrViewJobFormData.prs?.map((v) => v.id.toString()));
    return {
      onChange: (selectedRowKeys: React.Key[], selectedRows: choosePR[]) => {
        setNewOrEditOrViewJobFormData((old) => ({ ...old, prs: selectedRows }));
      },
      selectedRowKeys: newOrEditOrViewJobFormData.prs?.map((v) => v.id),
      getCheckboxProps: (record: choosePR) => ({
        name: record.id.toString(),
        disabled: newOrEditOrViewJobFormData.autoCreatePR || viewJobModalVisible,
      }),
    };
  }, [
    viewJobModalVisible,
    newOrEditOrViewJobFormData.autoCreatePR,
    newOrEditOrViewJobFormData.prs,
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

        await handlerModalCancel('new_job', !cont);
      } catch (e) {
        console.log(e);
        if (cont) setOkContinueButtonLoading(false);
        else setOkButtonLoading(false);
      }
    },
    [createJob, handlerModalCancel, newOrEditJobForm, newOrEditOrViewJobFormData],
  );

  const handlerSaveJob = useCallback(async () => {
    try {
      await newOrEditJobForm.validateFields();
      console.log(newOrEditOrViewJobFormData);
      if (!newOrEditOrViewJobFormData.jobId) return;
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
      await handlerModalCancel('edit_job');
    } catch (e) {
      setSaveButtonLoading(false);
    }
  }, [handlerModalCancel, newOrEditJobForm, newOrEditOrViewJobFormData, updateJob]);

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
      return (
        <Modal
          destroyOnClose={true}
          width={700}
          visible={type === 'new_job' ? newJobModalVisible : editJobModalVisible}
          title={intl.formatMessage({ id: `pages.job.modal.${type}.title` })}
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
                <Col span={7}>
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
                          setNewOrEditOrViewJobFormData((old) => ({ ...old, autoCreatePR: false }));
                        }
                      }}
                    >
                      {intl.formatMessage({ id: 'pages.job.modal.new_job.auto_create_pr' })}
                    </Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            {choosePRTable}
            {modalTag}
          </Spin>
        </Modal>
      );
    },
    [
      newJobModalVisible,
      editJobModalVisible,
      intl,
      okContinueButtonLoading,
      okButtonLoading,
      saveButtonLoading,
      handlerSaveJob,
      createJobLoading,
      updateJobLoading,
      newOrEditJobForm,
      newOrEditOrViewJobFormData.issue,
      newOrEditOrViewJobFormData.size,
      newOrEditOrViewJobFormData.autoCreatePR,
      choosePRTable,
      modalTag,
      handlerModalCancel,
      handlerNewJob,
      getChoosePRs,
      userName,
      choosePRData,
      getInputPR,
      handlerSearchChoosePR,
    ],
  );

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
        jobIncome: record.node?.income,
      });
      setNewJobModalVisible(false);
      setViewJobModalVisible(false);
      setEditJobModalVisible(true);
    },
    [getChoosePRs, userName],
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
      jobIncome: record.node?.income,
    });
    setNewJobModalVisible(false);
    setEditJobModalVisible(false);
    setViewJobModalVisible(true);
  }, []);

  useEffect(() => {
    if (daoListData?.daos?.dao && daoListData?.daos?.dao.length > 0) {
      let current: DaoSchema | undefined;
      daoListData?.daos?.dao.forEach((d) => {
        if (daoId && d?.datum?.id === daoId) {
          current = d.datum;
        }
      });
      setCurrentDao(current || daoListData.daos.dao[0]?.datum || undefined);
    }
  }, [daoId, daoListData]);

  useEffect(() => {
    if (currentDao)
      setJobQueryVar((old) => ({
        ...old,
        daoName: currentDao.name,
        userName,
      }));
  }, [currentDao, userName]);

  useEffect(() => {
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
          jobQueryVar={jobQueryVar}
          setJobQueryVar={setJobQueryVar}
          getJobList={getJobList}
          jobList={jobList}
        />
      );
    }
    return (
      <OtherUserJobTable
        openViewModal={handlerOpenViewModal}
        jobQueryVar={jobQueryVar}
        setJobQueryVar={setJobQueryVar}
        jobList={jobList}
      />
    );
  }, [isMy, handlerOpenViewModal, jobQueryVar, jobList, handlerOpenEditModal, getJobList]);

  const searchForm = useMemo(() => {
    return (
      <div key={'searchForm'} className={styles.SearchForm}>
        <Row>
          <Col span={21}>
            <Space direction={'horizontal'}>
              <Select
                size={'large'}
                showSearch
                className={styles.searchOrgNameSelect}
                optionFilterProp="children"
                value={currentDao?.id || ''}
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                notFoundContent={null}
                onSelect={async (value, option) => {
                  console.log(value);
                  if (option.children)
                    setJobQueryVar((old) => ({
                      ...old,
                      daoName: option.children,
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
          {isMy && (
            <Col span={3}>
              <Button
                type="primary"
                style={{ width: '100%' }}
                size={'large'}
                icon={<PlusOutlined />}
                onClick={() => setNewJobModalVisible(true)}
              >
                {intl.formatMessage({ id: 'pages.job.table.button' })}
              </Button>
            </Col>
          )}
        </Row>
      </div>
    );
  }, [currentDao?.id, daoListData?.daos?.dao, intl, isMy, parseTime, searchDateType]);

  const stat = useMemo(() => {
    return [
      {
        number: jobList.data?.jobs?.total || 0,
        title: intl.formatMessage({ id: 'component.card.stat.job' }),
      },
      {
        number: jobList.data?.jobs?.stat?.size || 0,
        title: intl.formatMessage({ id: 'component.card.stat.size' }),
      },
      {
        number: jobList.data?.jobs?.stat?.tokenCount || 0,
        title: currentDao?.tokenSymbol || intl.formatMessage({ id: 'component.card.stat.token' }),
      },
    ];
  }, [
    currentDao?.tokenSymbol,
    intl,
    jobList.data?.jobs?.stat?.size,
    jobList.data?.jobs?.stat?.tokenCount,
    jobList.data?.jobs?.total,
  ]);

  if (daoListLoading) {
    return <PageLoading />;
  }

  return (
    <>
      <div className={styles.statCard}>
        <StatCard data={stat} />
      </div>
      {searchForm}
      {jobTable}
      {newOrEditJobModal('new_job')}
      {newOrEditJobModal('edit_job')}
      {viewJobModal}
    </>
  );
};

export default TabJob;
