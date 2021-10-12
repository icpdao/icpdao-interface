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
import React, { useCallback, useMemo, useState } from 'react';
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

  const expandedRowTableColumn = useMemo(() => {
    return [
      {
        title: intl.formatMessage({ id: 'pages.account.icpper.expanded.table.column.1' }),
        dataIndex: 'dao_name',
        width: 60,
      },
      {
        title: intl.formatMessage({ id: 'pages.account.icpper.expanded.table.column.2' }),
        dataIndex: 'token',
        key: 'token',
        render: (_: any, record: any) => <>{`${record.token_name} (${record.token_symbol})`}</>,
        width: 60,
      },
      {
        title: intl.formatMessage({ id: 'pages.account.icpper.expanded.table.column.3' }),
        dataIndex: 'total_value',
        key: 'totalValue',
        render: (_: any, record: any) => (
          <>{parseFloat(record.total_value.toString() || '0').toFixed(2) || 0}</>
        ),
        width: 60,
      },
    ];
  }, [intl]);

  const expandedRowRender = useCallback(
    (record: any) => {
      console.log(record.token_stat);
      return (
        <Table
          size={'middle'}
          rowKey={'token_name'}
          columns={expandedRowTableColumn}
          dataSource={record.token_stat}
          pagination={false}
        />
      );
    },
    [expandedRowTableColumn],
  );

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
  const relationIcpperTitle = (
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
  const unrelationIcpperTitle = (
    <>
      <span style={{ marginRight: 6 }}>
        <FormattedMessage id={'pages.account.icpper.released_icpper'} />
      </span>
      <GlobalTooltip
        title={<FormattedMessage id={'pages.account.icpper.released_icpper.tooltip'} />}
        key={'icpper.tooltip'}
      />
    </>
  );
  const handleCancel = (id: string | undefined, github_login: string | undefined) => {
    setInviteCancelModalVisible(true);
    setInviteCancelId(id || '');
    setInviteCancelGithubLogin(github_login || '');
  };
  const relationIcpperColumns = [
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
      title: intl.formatMessage({ id: 'pages.account.icpper.table.column.5' }),
      dataIndex: 'has_reward_icpper_count',
      key: 'icpper',
    },
    {
      title: intl.formatMessage({ id: 'pages.account.icpper.table.column.6' }),
      key: 'tokens',
      render: (record: any) => (
        <>
          {record?.token_count || 0}{' '}
          {intl.formatMessage({ id: 'pages.account.icpper.table.column.6.text' })}
        </>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.account.icpper.table.column.7' }),
      key: 'action',
      render: (record: any) => (
        <a
          onClick={() => {
            handleCancel(record.id, record.github_login);
          }}
        >
          {intl.formatMessage({ id: 'pages.account.icpper.table.column.7.text' })}
        </a>
      ),
    },
  ];

  const unrelationIcpperColumns = [
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
      title: intl.formatMessage({ id: 'pages.account.icpper.table.column.5' }),
      dataIndex: 'has_reward_icpper_count',
      key: 'icpper',
    },
    {
      title: intl.formatMessage({ id: 'pages.account.icpper.table.column.6' }),
      key: 'tokens',
      render: (record: any) => (
        <>
          {record?.token_count || 0}{' '}
          {intl.formatMessage({ id: 'pages.account.icpper.table.column.6.text' })}
        </>
      ),
    },
  ];

  const invited = [];
  const relationIcpper = [];
  const unrelationIcpper = [];
  const icpperships = data?.icpperships;
  const preMentorIcppershipCountLimit = data?.pre_mentor_icppership_count_limit || 2;
  if (icpperships) {
    for (let i: number = 0; i < icpperships.length; i += 1) {
      if (icpperships[i].progress === 0 || icpperships[i].status === 1) {
        const datum = icpperships[i];
        const timeDistance = getTimeDistance(
          new Date().getTime() / 1000,
          icpperships[i].create_at || 0,
        );
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
      if (icpperships[i].progress === 1 && icpperships[i].status === 2) {
        const datum = icpperships[i];
        const beMentorDays = getTimeDistanceDays(
          new Date().getTime() / 1000,
          icpperships[i].accept_at || 0,
        );
        const acceptTime = getFormatTime(icpperships[i].accept_at || 0, 'LL');
        if (datum.relation === true)
          relationIcpper.push({
            key: i,
            id: datum.id || '',
            github_login: datum.icpper?.github_login || '',
            accept_time: acceptTime,
            be_mentor_days: beMentorDays,
            icpper_icpper_count: datum.icpper_icpper_count,
            has_reward_icpper_count: datum.has_reward_icpper_count,
            token_count: datum.token_count || 0,
            token_stat: datum.token_stat || [],
          });
        else
          unrelationIcpper.push({
            key: i,
            id: datum.id || '',
            github_login: datum.icpper?.github_login || '',
            accept_time: acceptTime,
            be_mentor_days: beMentorDays,
            icpper_icpper_count: datum.icpper_icpper_count,
            has_reward_icpper_count: datum.has_reward_icpper_count || 0,
            token_count: datum.token_count || 0,
            token_stat: datum.token_stat || [],
          });
      }
    }
  }
  return (
    <>
      <ProDescriptions key={'preicpper'} className={styles.first} column={1} title={preIcpperTitle}>
        {invited.length < preMentorIcppershipCountLimit && (
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
            const newData = oldData;
            if (newData?.icpperships) {
              newData.icpperships = newData?.icpperships.filter((d) => d.id !== inviteCancelId);
            }
            return newData;
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
            data?.icpperships?.push(newItem);
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
        key={'relationIcpper'}
        className={styles.second}
        column={1}
        title={relationIcpperTitle}
      />
      <div>
        <Table
          columns={relationIcpperColumns}
          dataSource={relationIcpper}
          pagination={false}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.token_stat && record.token_stat.length > 0,
          }}
        />
      </div>
      <ProDescriptions
        key={'unrelationIcpper'}
        className={styles.second}
        column={1}
        title={unrelationIcpperTitle}
      />
      <div>
        <Table
          columns={unrelationIcpperColumns}
          dataSource={unrelationIcpper}
          pagination={false}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.token_stat && record.token_stat.length > 0,
          }}
        />
      </div>
    </>
  );
};

export default IcpperList;
