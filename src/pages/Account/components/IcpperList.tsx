import { useRequest } from '@@/plugin-request/request';
import {
  getIcpperships,
  removeIcpperships,
  sendIcpperships,
} from '@/services/icpdao-interface/icpperships';
import { PageLoading } from '@ant-design/pro-layout';
import { getFormatTime, getTimeDistance, getTimeDistanceDays, getUserInfo } from '@/utils/utils';
import { FormattedMessage, useIntl } from 'umi';
import ProDescriptions from '@ant-design/pro-descriptions';
import { Button, Col, Row, Table } from 'antd';
import styles from '@/pages/Account/index.less';
import React, { useState } from 'react';
import GlobalModal from '@/components/Modal';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import GlobalTooltip from '@/components/Tooltip';

const handleRemoveInvite = async (id: string) => {
  try {
    return (await removeIcpperships({ id })) || {};
  } catch {
    return {};
  }
};

const handleSendInvite = async (githubLogin: string) => {
  try {
    return (await sendIcpperships({ icpper_github_login: githubLogin })) || {};
  } catch {
    return {};
  }
};

const IcpperList: React.FC = () => {
  const intl = useIntl();
  const [inviteCancelModalVisible, setInviteCancelModalVisible] = useState(false);
  const [inviteCancelModalRemoveLoading, setInviteCancelModalRemoveLoading] = useState(false);
  const [inviteCancelGithubLogin, setInviteCancelGithubLogin] = useState<string>('');
  const [inviteCancelId, setInviteCancelId] = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteModalSendLoading, setInviteModalSendLoading] = useState(false);
  const [inviteGithubLogin, setInviteGithubLogin] = useState<string>('');
  const { data, error, loading, mutate } = useRequest(() => {
    return getIcpperships();
  });

  if (loading || error) {
    return <PageLoading />;
  }

  const { profile } = getUserInfo();
  let inviteModalP2 = intl.formatMessage({ id: 'pages.account.icpper.invite.model.p2.nomentor' });
  if (profile.icppership?.mentor?.nickname) {
    inviteModalP2 = intl.formatMessage(
      { id: 'pages.account.icpper.invite.model.p2' },
      { github_login: profile.icppership?.mentor?.nickname || '' },
    );
  }
  const preIcpperTitle = (
    <>
      <span style={{ marginRight: 6 }}>
        <FormattedMessage id={'pages.account.icpper.preicpper'} />
      </span>
      <GlobalTooltip
        title={<FormattedMessage id={'pages.account.icpper.preicpper.tooltip'} />}
        key={'preicpper.tooltip'}
      />
    </>
  );
  const icpperTitle = (
    <>
      <span style={{ marginRight: 6 }}>
        <FormattedMessage id={'pages.account.icpper.icpper'} />
      </span>
      <GlobalTooltip
        title={<FormattedMessage id={'pages.account.icpper.icpper.tooltip'} />}
        key={'icpper.tooltip'}
      />
    </>
  );
  const handleCancel = (id: string | undefined, github_login: string | undefined) => {
    setInviteCancelModalVisible(true);
    setInviteCancelId(id || '');
    setInviteCancelGithubLogin(github_login || '');
  };
  const icpperColumns = [
    {
      title: intl.formatMessage({ id: 'pages.account.icpper.table.column.1' }),
      key: 'index',
      render: (text: any, record: any, index: number) => <>{index + 1}</>,
    },
    {
      title: intl.formatMessage({ id: 'pages.account.icpper.table.column.2' }),
      dataIndex: 'github_login',
      key: 'github_login',
    },
    {
      title: intl.formatMessage({ id: 'pages.account.icpper.table.column.3' }),
      dataIndex: 'accept_time',
      key: 'accept_time',
    },
    {
      title: intl.formatMessage({ id: 'pages.account.icpper.table.column.4' }),
      dataIndex: 'be_mentor_days',
      key: 'be_mentor_days',
    },
    {
      title: 'Icpper',
      dataIndex: 'icpper_icpper_count',
      key: 'icpper',
    },
    {
      title: intl.formatMessage({ id: 'pages.account.icpper.table.column.5' }),
      key: 'tokens',
      render: () => (
        <>20 {intl.formatMessage({ id: 'pages.account.icpper.table.column.5.text' })}</>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.account.icpper.table.column.6' }),
      key: 'action',
      render: (record: any) => (
        <a
          onClick={() => {
            handleCancel(record.id, record.github_login);
          }}
        >
          {intl.formatMessage({ id: 'pages.account.icpper.table.column.6.text' })}
        </a>
      ),
    },
  ];

  const invited = [];
  const icpper = [];
  if (data) {
    for (let i: number = 0; i < data.length; i += 1) {
      if (data[i].progress === 0 || data[i].status === 1) {
        const datum = data[i];
        const timeDistance = getTimeDistance(new Date().getTime() / 1000, data[i].create_at || 0);
        const waitMsg =
          datum.progress === 0 ? (
            <FormattedMessage id={'pages.account.icpper.input.invite.wait'} />
          ) : (
            <FormattedMessage id={'pages.account.icpper.input.invite.accept'} />
          );
        invited.push(
          <ProDescriptions.Item key={datum.id} valueType="text">
            <Row gutter={24} className={styles.row}>
              <Col span={20}>
                <Row className={styles.invited}>
                  <Col span={4}>{datum.icpper?.github_login}</Col>
                  <Col span={8}>
                    {intl.formatMessage(
                      { id: 'pages.account.icpper.input.invite.time' },
                      { days: timeDistance },
                    )}
                  </Col>
                  <Col span={8}>{waitMsg}</Col>
                </Row>
              </Col>
              <Col span={4}>
                <Button
                  block
                  onClick={() => {
                    handleCancel(datum.id, datum.icpper?.github_login);
                  }}
                >
                  <FormattedMessage id={'pages.account.icpper.invite.cancel'} />
                </Button>
              </Col>
            </Row>
          </ProDescriptions.Item>,
        );
      }
      if (data[i].progress === 1 && data[i].status === 2) {
        const datum = data[i];
        const beMentorDays = getTimeDistanceDays(
          new Date().getTime() / 1000,
          data[i].accept_at || 0,
        );
        const acceptTime = getFormatTime(data[i].accept_at || 0, 'LL');
        icpper.push({
          key: i,
          id: datum.id || '',
          github_login: datum.icpper?.github_login || '',
          accept_time: acceptTime,
          be_mentor_days: beMentorDays,
          icpper_icpper_count: datum.icpper_icpper_count,
        });
      }
    }
  }
  return (
    <>
      <ProDescriptions key={'preicpper'} className={styles.first} column={1} title={preIcpperTitle}>
        {invited.length < 2 && (
          <ProDescriptions.Item key={'input'} valueType="text">
            <ProForm<{ githubLogin: string }>
              submitter={{
                render: (props) => {
                  return (
                    <Col span={4} style={{ paddingLeft: 12, paddingRight: 12 }}>
                      <Button
                        block
                        type={'primary'}
                        htmlType={'submit'}
                        onClick={async () => {
                          props.form
                            ?.validateFields()
                            .then((values) => {
                              setInviteGithubLogin(values.githubLogin);
                              setInviteModalVisible(true);
                            })
                            .catch(() => {});
                        }}
                      >
                        <FormattedMessage id={'pages.account.icpper.invite'} />
                      </Button>
                    </Col>
                  );
                },
              }}
              className={'ant-row antd-pro-pages-account-index-row'}
              style={{ marginLeft: -12, marginRight: -12, rowGap: 0, height: 45 }}
            >
              <Col span={20} style={{ paddingLeft: 12, paddingRight: 12 }}>
                <ProFormText
                  name="githubLogin"
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({
                        id: 'pages.account.icpper.input.invite.placeholder',
                      }),
                    },
                  ]}
                  hasFeedback
                  placeholder={intl.formatMessage({
                    id: 'pages.account.icpper.input.invite.placeholder',
                  })}
                />
              </Col>
            </ProForm>
          </ProDescriptions.Item>
        )}
        {invited}
      </ProDescriptions>

      <GlobalModal
        key={'inviteCancelModal'}
        okText={intl.formatMessage({ id: 'pages.account.icpper.invite.cancel.model.ok' })}
        cancelText={intl.formatMessage({ id: 'pages.account.icpper.invite.cancel.model.cancel' })}
        onOk={async () => {
          setInviteCancelModalRemoveLoading(true);
          await handleRemoveInvite(inviteCancelId);
          mutate((oldData) => {
            return oldData?.filter((d) => d.id !== inviteCancelId);
          });
          setInviteCancelModalRemoveLoading(false);
          setInviteCancelModalVisible(false);
        }}
        onCancel={() => {
          setInviteCancelModalVisible(false);
          setInviteCancelGithubLogin('');
        }}
        confirmLoading={inviteCancelModalRemoveLoading}
        visible={inviteCancelModalVisible}
      >
        <div>
          <div className={styles.modalContentP}>
            <p
              dangerouslySetInnerHTML={{
                __html: intl.formatMessage(
                  { id: 'pages.account.icpper.invite.cancel.model.p1' },
                  { github_login: inviteCancelGithubLogin },
                ),
              }}
            />
          </div>
          <div className={styles.modalContentP}>
            <p
              dangerouslySetInnerHTML={{
                __html: intl.formatMessage(
                  { id: 'pages.account.icpper.invite.cancel.model.p2' },
                  { github_login: inviteCancelGithubLogin },
                ),
              }}
            />
          </div>
        </div>
      </GlobalModal>
      <GlobalModal
        key={'inviteModal'}
        okText={intl.formatMessage({ id: 'pages.account.icpper.invite.model.ok' })}
        cancelText={intl.formatMessage({ id: 'pages.account.icpper.invite.model.cancel' })}
        onOk={async () => {
          setInviteModalSendLoading(true);
          const { data: newItem } = await handleSendInvite(inviteGithubLogin);
          if (newItem) {
            data?.push(newItem);
            mutate(data);
          }
          setInviteModalSendLoading(false);
          setInviteModalVisible(false);
        }}
        onCancel={() => {
          setInviteModalVisible(false);
          setInviteGithubLogin('');
        }}
        confirmLoading={inviteModalSendLoading}
        visible={inviteModalVisible}
      >
        <div>
          <div className={styles.modalContentP}>
            <p
              dangerouslySetInnerHTML={{
                __html: intl.formatMessage(
                  { id: 'pages.account.icpper.invite.model.p1' },
                  { github_login: inviteGithubLogin },
                ),
              }}
            />
          </div>
          <div className={styles.modalContentP}>
            <p dangerouslySetInnerHTML={{ __html: inviteModalP2 }} />
          </div>
        </div>
      </GlobalModal>
      <ProDescriptions
        key={'icpper'}
        className={styles.second}
        column={1}
        title={icpperTitle}
      ></ProDescriptions>
      <div>
        <Table columns={icpperColumns} dataSource={icpper} />
      </div>
    </>
  );
};

export default IcpperList;
