import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CycleQuery,
  useBeginCycleVoteResultTaskMutation,
  useBeginPublishCycleTaskMutation,
  useCycleVoteResultStatusLazyQuery,
  useCyclePublishStatusLazyQuery,
  CycleVoteResultStatTaskStatusEnum,
  CycleVoteResultPublishTaskStatusEnum,
} from '@/services/dao/generated';
import { useIntl } from 'umi';
import moment from 'moment';
import { Button, Progress, Tooltip } from 'antd';
import styles from '@/pages/Dao/components/cycle/index.less';
import GlobalModal from '@/components/Modal';

const StepStat: React.FC<{ currentCycle: CycleQuery }> = ({ currentCycle }) => {
  const intl = useIntl();

  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [resultStating, setResultStating] = useState<Record<string, any>>({});
  const [publishStating, setPublishStating] = useState<Record<string, any>>({});
  const [statusProps, setStatusProps] = useState<Record<string, any>>({});
  const [publishStatusProps, setPublishStatusProps] = useState<Record<string, any>>({});
  const [resultPercent, setResultPercent] = useState<number>(0);
  const [publishResultPercent, setPublishResultPercent] = useState<number>(0);

  const [voteResultStatus, setVoteResultStatus] = useState<CycleVoteResultStatTaskStatusEnum>();
  const [publishResultStatus, setPublishResultStatus] =
    useState<CycleVoteResultPublishTaskStatusEnum>();

  const [queryCycleVoteResultStatus, cycleVoteResultStatusResult] =
    useCycleVoteResultStatusLazyQuery({ fetchPolicy: 'no-cache' });
  const [queryCyclePublishStatusStatus, cyclePublishStatusResult] = useCyclePublishStatusLazyQuery({
    fetchPolicy: 'no-cache',
  });

  const [beginCycleVoteResultTaskMutation] = useBeginCycleVoteResultTaskMutation();
  const [beginPublishCycleTaskMutation] = useBeginPublishCycleTaskMutation();

  const cycleId = useMemo(() => {
    return currentCycle.datum?.id || '';
  }, [currentCycle.datum?.id]);

  useEffect(() => {
    if (!currentCycle.voteResultStatTask?.status) return;
    setVoteResultStatus(currentCycle.voteResultStatTask?.status);
  }, [currentCycle.voteResultStatTask?.status]);

  useEffect(() => {
    if (!currentCycle.voteResultPublishTask?.status) return;
    setPublishResultStatus(currentCycle.voteResultPublishTask?.status);
  }, [currentCycle.voteResultPublishTask?.status]);

  const beginVoteResultStat = useCallback(async () => {
    try {
      setResultPercent(resultPercent + 6);
      await queryCycleVoteResultStatus();
    } catch (e) {
      setResultPercent(0);
      setStatusProps({ status: 'exception' });
    }
  }, [queryCycleVoteResultStatus, resultPercent]);

  useEffect(() => {
    if (!cycleVoteResultStatusResult.data?.cycle?.voteResultStatTask?.status) return;
    const ss = cycleVoteResultStatusResult.data?.cycle?.voteResultStatTask?.status;
    if (ss === CycleVoteResultStatTaskStatusEnum.Success) {
      setResultPercent(100);
      setStatusProps({ status: 'success' });
    } else if (ss === CycleVoteResultStatTaskStatusEnum.Fail) {
      setResultPercent(100);
      setStatusProps({ status: 'exception' });
    } else {
      setTimeout(beginVoteResultStat, 2000);
    }
  }, [beginVoteResultStat, cycleVoteResultStatusResult.data?.cycle?.voteResultStatTask?.status]);

  const beginPublishResultStat = useCallback(async () => {
    try {
      setPublishResultPercent(publishResultPercent + 6);
      await queryCyclePublishStatusStatus();
    } catch (e) {
      setPublishResultPercent(0);
      setPublishStatusProps({ status: 'exception' });
    }
  }, [publishResultPercent, queryCyclePublishStatusStatus]);

  useEffect(() => {
    if (!cyclePublishStatusResult.data?.cycle?.voteResultPublishTask?.status) return;
    const ss = cyclePublishStatusResult.data?.cycle?.voteResultPublishTask?.status;
    if (ss === CycleVoteResultPublishTaskStatusEnum.Success) {
      setPublishResultPercent(100);
      setPublishStatusProps({ status: 'success' });
    } else if (ss === CycleVoteResultPublishTaskStatusEnum.Fail) {
      setPublishResultPercent(100);
      setPublishStatusProps({ status: 'exception' });
    } else {
      setTimeout(beginPublishResultStat, 2000);
    }
  }, [beginPublishResultStat, cyclePublishStatusResult.data?.cycle?.voteResultPublishTask?.status]);

  const disablePublishButton = useMemo(() => {
    return (
      (!!currentCycle.datum?.voteResultPublishedAt &&
        currentCycle.datum?.voteResultPublishedAt > 0) ||
      (!!publishResultStatus && publishResultStatus !== CycleVoteResultPublishTaskStatusEnum.Fail)
    );
  }, [currentCycle.datum?.voteResultPublishedAt, publishResultStatus]);

  const disableCountEIButton = useMemo(() => {
    return parseInt(moment.utc().format('X'), 10) < (currentCycle.datum?.voteEndAt || 0);
  }, [currentCycle.datum?.voteEndAt]);

  const loadingCountEIButton = useMemo(() => {
    return (
      voteResultStatus === CycleVoteResultStatTaskStatusEnum.Init ||
      voteResultStatus === CycleVoteResultStatTaskStatusEnum.Stating
    );
  }, [voteResultStatus]);

  return (
    <>
      {voteResultStatus === CycleVoteResultStatTaskStatusEnum.Success && (
        <Tooltip
          placement="right"
          title={intl.formatMessage({ id: 'pages.dao.home.step.pairing.vote_publish.tips' })}
        >
          <Button
            type="primary"
            size="large"
            disabled={disablePublishButton}
            className={styles.ownerButton}
            onClick={() => setPublishModalVisible(true)}
          >
            {intl.formatMessage({ id: 'pages.dao.home.step.pairing.vote_publish' })}
          </Button>
        </Tooltip>
      )}

      {voteResultStatus !== CycleVoteResultStatTaskStatusEnum.Success && (
        <Tooltip
          placement="right"
          title={intl.formatMessage({ id: 'pages.dao.home.step.pairing.vote_result.tips' })}
        >
          <Button
            type="primary"
            size="large"
            loading={loadingCountEIButton}
            disabled={disableCountEIButton}
            className={styles.ownerButton}
            onClick={() => setResultModalVisible(true)}
          >
            {intl.formatMessage({ id: 'pages.dao.home.step.pairing.vote_result' })}
          </Button>
        </Tooltip>
      )}

      <GlobalModal
        key={'voteResultModal'}
        onOk={async () => {
          setResultStating({ footer: null });
          await beginCycleVoteResultTaskMutation({ variables: { cycleId } });
          beginVoteResultStat();
        }}
        destroyOnClose={true}
        onCancel={() => {
          setResultModalVisible(false);
          setResultPercent(0);
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
          setPublishStating({ footer: null });
          await beginPublishCycleTaskMutation({ variables: { cycleId } });
          beginPublishResultStat();
        }}
        destroyOnClose={true}
        onCancel={() => {
          setPublishModalVisible(false);
          setPublishResultPercent(0);
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
    </>
  );
};

export default StepStat;
