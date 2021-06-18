import React, { useCallback, useEffect, useState } from 'react';
import type { TablePaginationConfig } from 'antd';
import { Avatar, Button, Space, Table, InputNumber, message, Progress, Tooltip } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import { FormattedMessage } from 'umi';
import type { DaoCycleProps } from '@/pages/Dao/components/cycle/index';
import type {
  CycleIcpperListQueryVariables,
  IcpperStatQuery,
  OwnerCycleIcpperListQueryVariables,
} from '@/services/dao/generated';
import {
  CycleIcpperStatSortedEnum,
  CycleIcpperStatSortedTypeEnum,
  CycleVoteResultPublishTaskStatusEnum,
  CycleVoteResultStatTaskStatusEnum,
  useBeginCycleVoteResultTaskMutation,
  useBeginPublishCycleTaskMutation,
  useCycleIcpperListQuery,
  useCyclePublishStatusQuery,
  useCycleVoteResultStatusQuery,
  useOwnerCycleIcpperListQuery,
  useUpdateOwnerEiMutation,
} from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { UserOutlined, ControlTwoTone, ExclamationCircleFilled } from '@ant-design/icons';
import { history } from '@@/core/history';
import { getCurrentPage, getEIColor } from '@/utils/utils';
import styles from './index.less';
import moment from 'moment';
import GlobalModal from '@/components/Modal';

const colorTooltip = (color: string, tipsText: string) => {
  if (tipsText === '') return <></>;
  return (
    <Tooltip placement="right" title={tipsText}>
      <ExclamationCircleFilled style={{ color, fontSize: 18, marginLeft: 10 }} />
    </Tooltip>
  );
};

const renderSize = (intl: any, record: IcpperStatQuery) => {
  if (!record?.datum?.size) return <>-</>;
  let color = '#262626';
  const tips: string[] = [];
  if (record.datum.haveTwoTimesLt08)
    tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.1' }));
  if (record.datum.haveTwoTimesLt04)
    tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.2' }));
  if (record.datum.beDeductedSizeByReview && record.datum.beDeductedSizeByReview > 0)
    tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.3' }));
  if (record.datum.unVotedAllVote)
    tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.4' }));
  const tipsText = tips.join(' ');
  if (tips.length > 0) color = '#ED6C6C';
  return (
    <>
      <span style={{ color }}>{record.datum?.size}</span>
      {colorTooltip(color, tipsText)}
    </>
  );
};

const ownerColumns = (
  intl: any,
  daoId: string,
  currentEditing: string,
  canUpdateOwnerEI: boolean,
  updateOwnerEI: (ownerEI: number) => void,
  beginOrEndEditing: (recordId: string) => void,
) => {
  return [
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.icpper" />,
      dataIndex: ['icpper'],
      render: (_: any, record: IcpperStatQuery) => (
        <Space size="middle">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>
            <a
              onClick={(event) => {
                event.preventDefault();
                history.push(`/job?userName=${record.icpper?.githubLogin}&daoId=${daoId}`);
              }}
            >
              {record.icpper?.nickname}
            </a>
          </span>
        </Space>
      ),
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.job" />,
      dataIndex: ['datum', 'jobCount'],
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.size" />,
      dataIndex: ['datum', 'size'],
      sorter: true,
      render: (_: any, record: IcpperStatQuery) => renderSize(intl, record),
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.income" />,
      dataIndex: 'income',
      render: () => '-',
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.ie" />,
      dataIndex: ['datum', 'ei'],
      render: (_: any, record: IcpperStatQuery) => {
        if (!record?.datum?.voteEi) return <></>;
        const tips: string[] = [];
        let color: string = 'inherit';
        if (record.datum.ei < 0.4) {
          color = '#ED6C6C';
          tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.7' }));
        } else if (record.datum.ei < 0.8) {
          color = '#F1C84C';
          tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.6' }));
        } else if (record.datum.ei >= 1.2) {
          color = '#2CA103';
          tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.5' }));
        }

        if (record.beReviewerHasWarningUsers && record.beReviewerHasWarningUsers.length > 0) {
          color = '#ED6C6C';
          tips.push(
            intl.formatMessage(
              { id: 'pages.dao.component.dao_cycle_icpper.tips.8' },
              { nicknames: record.beReviewerHasWarningUsers.map((d) => d?.nickname).join(' @') },
            ),
          );
        }

        const tipsText = tips.join(' ');
        let ownerEI;
        if (currentEditing === record.datum.id) {
          ownerEI = (
            <InputNumber
              size="small"
              precision={1}
              min={-0.2}
              max={0.2}
              step={0.1}
              defaultValue={record.datum.ownerEi || 0}
              autoFocus
              style={{ marginLeft: 15 }}
              onChange={(value) => updateOwnerEI(value)}
            />
          );
        } else {
          if (record.datum.ownerEi && record.datum.ownerEi > 0) {
            ownerEI = <span style={{ color }}>+{record.datum?.ownerEi}</span>;
          }
          if (record.datum.ownerEi && record.datum.ownerEi < 0) {
            ownerEI = <span style={{ color }}>-{-record.datum?.ownerEi}</span>;
          }
        }
        return (
          <>
            <span style={{ color }}>{record.datum?.voteEi}</span>
            {ownerEI}
            {canUpdateOwnerEI && (
              <span style={{ marginLeft: 20 }}>
                <ControlTwoTone onClick={() => beginOrEndEditing(record.datum?.id || '')} />
              </span>
            )}
            {!canUpdateOwnerEI && tips.length > 0 && colorTooltip(color, tipsText)}
          </>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.last_ie" />,
      dataIndex: 'lastEi',
      render: (_: any, record: IcpperStatQuery) => {
        if (!record?.lastEi) return <>-</>;
        return (
          <>
            <span style={{ color: getEIColor(record.lastEi) }}>{record.lastEi}</span>
          </>
        );
      },
    },
  ];
};

const columns = (intl: any, daoId: string) => {
  return [
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.icpper" />,
      dataIndex: ['icpper'],
      render: (_: any, record: IcpperStatQuery) => (
        <Space size="middle">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>
            <a
              onClick={(event) => {
                event.preventDefault();
                history.push(`/job?userName=${record.icpper?.githubLogin}&daoId=${daoId}`);
              }}
            >
              {record.icpper?.nickname}
            </a>
          </span>
        </Space>
      ),
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.job" />,
      dataIndex: ['datum', 'jobCount'],
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.size" />,
      dataIndex: ['datum', 'size'],
      sorter: true,
      render: (_: any, record: IcpperStatQuery) => renderSize(intl, record),
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.income" />,
      dataIndex: 'income',
      render: () => '-',
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.ie" />,
      dataIndex: ['datum', 'ei'],
      render: (_: any, record: IcpperStatQuery) => {
        if (!record?.datum?.ei) return <>-</>;
        const tips: string[] = [];
        let color: string = 'inherit';
        if (record.datum.ei < 0.4) {
          color = '#ED6C6C';
          tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.7' }));
        } else if (record.datum.ei < 0.8) {
          color = '#F1C84C';
          tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.6' }));
        } else if (record.datum.ei >= 1.2) {
          color = '#2CA103';
          tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.5' }));
        }

        if (record.beReviewerHasWarningUsers && record.beReviewerHasWarningUsers.length > 0) {
          color = '#ED6C6C';
          tips.push(
            intl.formatMessage(
              { id: 'pages.dao.component.dao_cycle_icpper.tips.8' },
              { nicknames: record.beReviewerHasWarningUsers.map((d) => d?.nickname).join(' @') },
            ),
          );
        }

        const tipsText = tips.join(' ');
        return (
          <>
            <span style={{ color: getEIColor(record.datum.ei) }}>{record.datum?.ei}</span>
            {tips.length > 0 && colorTooltip(color, tipsText)}
          </>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.last_ie" />,
      dataIndex: 'lastEi',
      render: (_: any, record: IcpperStatQuery) => {
        if (!record?.lastEi) return <>-</>;
        return (
          <>
            <span style={{ color: getEIColor(record.lastEi) }}>{record.lastEi}</span>
          </>
        );
      },
    },
  ];
};

export const OwnerDaoCycleIcpper: React.FC<DaoCycleProps> = ({ cycle, cycleId, daoId }) => {
  const intl = useIntl();
  const [queryVariable, setQueryVariable] = useState<OwnerCycleIcpperListQueryVariables>({
    cycleId,
    first: 20,
    offset: 0,
  });
  const [editingRow, setEditingRow] = useState<string>();
  const [editingOwnerEI, setEditingOwnerEI] = useState<number | undefined>();
  const [canUpdateOwnerEI, setCanUpdateOwnerEI] = useState<boolean>(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [resultStating, setResultStating] = useState<Record<string, any>>({});
  const [publishStating, setPublishStating] = useState<Record<string, any>>({});
  const [statusProps, setStatusProps] = useState<Record<string, any>>({});
  const [publishStatusProps, setPublishStatusProps] = useState<Record<string, any>>({});
  const [resultPercent, setResultPercent] = useState<number>(0);
  const [publishResultPercent, setPublishResultPercent] = useState<number>(0);

  const { data, loading, error, refetch } = useOwnerCycleIcpperListQuery({
    variables: queryVariable,
  });
  const { data: voteResultData, refetch: voteResultDataRefetch } = useCycleVoteResultStatusQuery({
    variables: { cycleId },
  });
  const { data: publishResultData, refetch: publishResultDataRefetch } = useCyclePublishStatusQuery(
    {
      variables: { cycleId },
    },
  );
  const [beginCycleVoteResultTaskMutation] = useBeginCycleVoteResultTaskMutation();
  const [beginPublishCycleTaskMutation] = useBeginPublishCycleTaskMutation();
  const [updateOwnerEiMutation] = useUpdateOwnerEiMutation();
  const beginVoteResultStat = useCallback(
    async (percent: number) => {
      try {
        setResultStating({ footer: null });
        const ps = await voteResultDataRefetch();
        if (
          ps.data.cycle?.voteResultStatTask?.status === CycleVoteResultStatTaskStatusEnum.Success
        ) {
          setResultPercent(100);
          setStatusProps({ status: 'success' });
          setCanUpdateOwnerEI(true);
        } else if (
          ps.data.cycle?.voteResultStatTask?.status === CycleVoteResultStatTaskStatusEnum.Fail
        ) {
          setResultPercent(100);
          setStatusProps({ status: 'exception' });
        } else {
          setResultPercent(percent);
          setTimeout(async () => await beginVoteResultStat(percent + 6), 2000);
        }
      } catch (e) {
        setResultPercent(0);
        setStatusProps({ status: 'exception' });
      }
    },
    [voteResultDataRefetch],
  );
  const beginPublishResultStat = useCallback(
    async (percent: number) => {
      try {
        setPublishStating({ footer: null });
        const ps = await publishResultDataRefetch();
        if (
          ps.data.cycle?.voteResultPublishTask?.status ===
          CycleVoteResultPublishTaskStatusEnum.Success
        ) {
          setPublishResultPercent(100);
          setPublishStatusProps({ status: 'success' });
          setCanUpdateOwnerEI(false);
        } else if (
          ps.data.cycle?.voteResultPublishTask?.status === CycleVoteResultPublishTaskStatusEnum.Fail
        ) {
          setPublishResultPercent(100);
          setPublishStatusProps({ status: 'exception' });
        } else {
          setPublishResultPercent(percent);
          setTimeout(async () => await beginPublishResultStat(percent + 6), 2000);
        }
      } catch (e) {
        setPublishResultPercent(0);
        setPublishStatusProps({ status: 'exception' });
      }
    },
    [publishResultDataRefetch],
  );
  const beginOrEndEditing = useCallback(
    async (recordId: string) => {
      if (editingRow === recordId) {
        if (editingOwnerEI !== undefined) {
          try {
            await updateOwnerEiMutation({
              variables: { statId: recordId, ownerEi: editingOwnerEI.toString() },
            });
            await refetch();
          } catch (e) {
            message.error('Update Owner EI Failed');
          }
        }
        setEditingRow('');
      } else {
        setEditingRow(recordId);
        setEditingOwnerEI(undefined);
      }
    },
    [editingOwnerEI, editingRow, refetch, updateOwnerEiMutation],
  );
  const changeEditingOwnerEI = useCallback((ownerEI: number) => {
    setEditingOwnerEI(ownerEI);
  }, []);
  const tableChange = useCallback((pagination: TablePaginationConfig, sorter: any) => {
    let sorted: CycleIcpperStatSortedEnum | undefined;
    if (sorter && sorter.field && sorter.field.includes('size')) {
      sorted = CycleIcpperStatSortedEnum.Size;
    }
    if (sorter && sorter.field && sorter.field.includes('income')) {
      sorted = CycleIcpperStatSortedEnum.Income;
    }
    if (sorter && sorter.field && sorter.field.includes('jobCount')) {
      sorted = CycleIcpperStatSortedEnum.JobCount;
    }
    let sortedType: CycleIcpperStatSortedTypeEnum | undefined;
    if (sorter && sorter.order === 'ascend') {
      sortedType = CycleIcpperStatSortedTypeEnum.Asc;
    }
    if (sorter && sorter.order === 'descend') {
      sortedType = CycleIcpperStatSortedTypeEnum.Desc;
    }
    setQueryVariable((old) => ({
      ...old,
      first: pagination.pageSize,
      offset: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
      sorted,
      sortedType,
    }));
    setEditingRow('');
    setEditingOwnerEI(undefined);
  }, []);
  useEffect(() => {
    setCanUpdateOwnerEI(!!cycle && !!cycle.voteResultStatAt && !cycle.voteResultPublishedAt);
  }, [cycle]);
  if (loading || error) {
    return <PageLoading />;
  }

  const voteResultStatus = voteResultData?.cycle?.voteResultStatTask?.status;
  const publishResultStatus = publishResultData?.cycle?.voteResultPublishTask?.status;
  const disablePublishButton =
    (!!cycle?.voteResultPublishedAt && cycle?.voteResultPublishedAt > 0) ||
    (!!publishResultStatus && publishResultStatus !== CycleVoteResultPublishTaskStatusEnum.Fail);
  const disableCountEIButton = parseInt(moment.utc().format('X'), 10) < (cycle?.voteEndAt || 0);
  const loadingCountEIButton =
    voteResultStatus === CycleVoteResultStatTaskStatusEnum.Init ||
    voteResultStatus === CycleVoteResultStatTaskStatusEnum.Stating;
  return (
    <>
      {voteResultStatus === CycleVoteResultStatTaskStatusEnum.Success && (
        <Button
          type="primary"
          size="large"
          disabled={disablePublishButton}
          className={styles.ownerButton}
          onClick={() => setPublishModalVisible(true)}
        >
          {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.button.publish' })}
        </Button>
      )}

      {voteResultStatus !== CycleVoteResultStatTaskStatusEnum.Success && (
        <Button
          type="primary"
          size="large"
          loading={loadingCountEIButton}
          disabled={disableCountEIButton}
          className={styles.ownerButton}
          onClick={() => setResultModalVisible(true)}
        >
          {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.button.count_ei' })}
        </Button>
      )}

      <GlobalModal
        key={'voteResultModal'}
        onOk={async () => {
          beginVoteResultStat(0);
          await beginCycleVoteResultTaskMutation({ variables: { cycleId } });
        }}
        destroyOnClose={true}
        onCancel={() => {
          setResultModalVisible(false);
          setResultStating({});
          setStatusProps({});
        }}
        okText={intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.modal.ok' })}
        cancelText={intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.modal.cancel' })}
        visible={resultModalVisible}
        {...resultStating}
      >
        {resultStating.footer !== null && (
          <div className={styles.modalDesc}>
            {intl.formatMessage({
              id: 'pages.dao.component.dao_cycle_icpper.vote_result.modal.desc',
            })}
          </div>
        )}
        {resultStating.footer === null && (
          <div className={styles.modalProgress}>
            <Progress type="circle" percent={resultPercent} {...statusProps} />
          </div>
        )}
      </GlobalModal>

      <GlobalModal
        key={'publishModal'}
        onOk={async () => {
          beginPublishResultStat(0);
          await beginPublishCycleTaskMutation({ variables: { cycleId } });
        }}
        destroyOnClose={true}
        onCancel={() => {
          setPublishModalVisible(false);
          setPublishStating({});
          setPublishStatusProps({});
        }}
        okText={intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.modal.ok' })}
        cancelText={intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.modal.cancel' })}
        visible={publishModalVisible}
        {...publishStating}
      >
        {publishStating.footer !== null && (
          <div className={styles.modalDesc}>
            {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.publish.modal.desc' })}
          </div>
        )}
        {publishStating.footer === null && (
          <div className={styles.modalProgress}>
            <Progress type="circle" percent={publishResultPercent} {...publishStatusProps} />
          </div>
        )}
      </GlobalModal>

      <Table<IcpperStatQuery>
        columns={ownerColumns(
          intl,
          daoId || '',
          editingRow || '',
          canUpdateOwnerEI,
          changeEditingOwnerEI,
          beginOrEndEditing,
        )}
        loading={loading}
        rowKey={(record) => record?.datum?.id || ''}
        dataSource={data?.cycle?.icpperStats?.nodes as any}
        onChange={(pagination, filters, sorter) => {
          tableChange(pagination, sorter);
        }}
        pagination={{
          pageSize: 10,
          total: data?.cycle?.icpperStats?.total || 0,
          current: getCurrentPage(queryVariable.offset || 0, 10),
        }}
      />
    </>
  );
};

export const DaoCycleIcpper: React.FC<DaoCycleProps> = ({ cycleId, daoId }) => {
  const intl = useIntl();
  const [queryVariable, setQueryVariable] = useState<CycleIcpperListQueryVariables>({
    cycleId,
    first: 20,
    offset: 0,
  });
  const { data, loading, error } = useCycleIcpperListQuery({ variables: queryVariable });

  const tableChange = useCallback((pagination: TablePaginationConfig, sorter: any) => {
    let sorted: CycleIcpperStatSortedEnum | undefined;
    if (sorter && sorter.field && sorter.field.includes('size')) {
      sorted = CycleIcpperStatSortedEnum.Size;
    }
    if (sorter && sorter.field && sorter.field.includes('income')) {
      sorted = CycleIcpperStatSortedEnum.Income;
    }
    if (sorter && sorter.field && sorter.field.includes('jobCount')) {
      sorted = CycleIcpperStatSortedEnum.JobCount;
    }
    let sortedType: CycleIcpperStatSortedTypeEnum | undefined;
    if (sorter && sorter.order === 'ascend') {
      sortedType = CycleIcpperStatSortedTypeEnum.Asc;
    }
    if (sorter && sorter.order === 'descend') {
      sortedType = CycleIcpperStatSortedTypeEnum.Desc;
    }
    setQueryVariable((old) => ({
      ...old,
      first: pagination.pageSize,
      offset: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
      sorted,
      sortedType,
    }));
  }, []);

  if (loading || error) {
    return <PageLoading />;
  }

  return (
    <>
      <Table<IcpperStatQuery>
        columns={columns(intl, daoId || '')}
        loading={loading}
        rowKey={(record) => record?.datum?.id || ''}
        dataSource={data?.cycle?.icpperStats?.nodes as any}
        onChange={(pagination, filters, sorter) => {
          tableChange(pagination, sorter);
        }}
        pagination={{
          pageSize: 10,
          total: data?.cycle?.icpperStats?.total || 0,
          current: getCurrentPage(queryVariable.offset || 0, 10),
        }}
      />
    </>
  );
};
