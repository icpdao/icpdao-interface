import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { CycleQuery } from '@/services/dao/generated';
import {
  CycleVotePairTaskStatusEnum,
  useBeginCyclePairTaskMutation,
  useCyclePairStatusLazyQuery,
} from '@/services/dao/generated';
import { Button, Progress, Tooltip } from 'antd';
import styles from '@/pages/Dao/components/cycle/index.less';
import moment from 'moment';
import { useIntl } from 'umi';
import GlobalModal from '@/components/Modal';

const StepPairing: React.FC<{ currentCycle: CycleQuery; refetch: any }> = ({
  currentCycle,
  refetch,
}) => {
  const intl = useIntl();
  const [pairingModalVisible, setPairingModalVisible] = useState(false);
  const [pairing, setPairing] = useState<Record<string, any>>({});
  const [statusProps, setStatusProps] = useState<Record<string, any>>({});
  const [pairingPercent, setPairingPercent] = useState<number>(0);
  const [beginCyclePairTaskMutation] = useBeginCyclePairTaskMutation();
  const [pairStatus, setPairStatus] = useState<CycleVotePairTaskStatusEnum>();

  useEffect(() => {
    if (!currentCycle?.pairTask?.status) return;
    setPairStatus(currentCycle?.pairTask?.status);
  }, [currentCycle?.pairTask?.status]);

  const [queryCyclePairStatus, cyclePairStatusResult] = useCyclePairStatusLazyQuery({
    fetchPolicy: 'no-cache',
  });

  const beginPairing = useCallback(async () => {
    try {
      setPairingPercent(pairingPercent + 6);
      await queryCyclePairStatus({ variables: { cycleId: currentCycle.datum?.id || '' } });
    } catch (e) {
      setPairingPercent(0);
      setStatusProps({ status: 'exception' });
    }
  }, [currentCycle.datum?.id, pairingPercent, queryCyclePairStatus]);

  useEffect(() => {
    if (!cyclePairStatusResult.data?.cycle?.pairTask?.status) return;
    const ss = cyclePairStatusResult.data?.cycle?.pairTask?.status;
    setPairStatus(ss);
    if (ss === CycleVotePairTaskStatusEnum.Success) {
      setPairingPercent(100);
      setStatusProps({ status: 'success' });
      refetch();
    } else if (ss === CycleVotePairTaskStatusEnum.Fail) {
      setPairingPercent(100);
      setStatusProps({ status: 'exception' });
    } else {
      setTimeout(beginPairing, 2000);
    }
  }, [beginPairing, cyclePairStatusResult.data?.cycle?.pairTask?.status]);

  const disablePairingButton = useMemo(() => {
    return (
      parseInt(moment.utc().format('X'), 10) < (currentCycle?.datum?.pairBeginAt || 0) ||
      parseInt(moment.utc().format('X'), 10) > (currentCycle?.datum?.pairEndAt || 0)
    );
  }, [currentCycle?.datum?.pairBeginAt, currentCycle?.datum?.pairEndAt]);

  const cycleId = useMemo(() => {
    return currentCycle?.datum?.id || '';
  }, [currentCycle?.datum?.id]);

  return (
    <>
      {(pairStatus == null || false) && (
        <Tooltip
          placement="right"
          title={intl.formatMessage({ id: 'pages.dao.home.step.pairing.pair.tips' })}
        >
          <Button
            type="primary"
            size="large"
            block
            disabled={disablePairingButton}
            onClick={() => setPairingModalVisible(true)}
            className={styles.ownerButton}
          >
            {intl.formatMessage({ id: 'pages.dao.home.step.pairing.button.pair' })}
          </Button>
        </Tooltip>
      )}
      {(pairStatus === CycleVotePairTaskStatusEnum.Init ||
        pairStatus === CycleVotePairTaskStatusEnum.Pairing) && (
        <Tooltip
          placement="right"
          title={intl.formatMessage({ id: 'pages.dao.home.step.pairing.pair.tips' })}
        >
          <Button
            type="primary"
            loading={true}
            size="large"
            block
            disabled={disablePairingButton}
            className={styles.ownerButton}
          >
            {intl.formatMessage({ id: 'pages.dao.home.step.pairing.button.pair' })}
          </Button>
        </Tooltip>
      )}
      {(pairStatus === CycleVotePairTaskStatusEnum.Success ||
        pairStatus === CycleVotePairTaskStatusEnum.Fail) && (
        <Tooltip
          placement="right"
          title={intl.formatMessage({ id: 'pages.dao.home.step.pairing.repair.tips' })}
        >
          <Button
            type="primary"
            size="large"
            block
            disabled={disablePairingButton}
            onClick={() => setPairingModalVisible(true)}
            className={styles.ownerButton}
          >
            {intl.formatMessage({ id: 'pages.dao.home.step.pairing.button.repair' })}
          </Button>
        </Tooltip>
      )}
      <GlobalModal
        key={'pairingModal'}
        onOk={async () => {
          setPairing({ footer: null });
          await beginCyclePairTaskMutation({ variables: { cycleId } });
          beginPairing();
        }}
        destroyOnClose={true}
        onCancel={() => {
          setPairingModalVisible(false);
          setPairing({});
          setPairingPercent(0);
          setStatusProps({});
        }}
        okText={intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.modal.ok' })}
        cancelText={intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.modal.cancel' })}
        visible={pairingModalVisible}
        {...pairing}
      >
        {pairing.footer !== null && (
          <div className={styles.modalDesc}>
            {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.modal.desc' })}
          </div>
        )}
        {pairing.footer === null && (
          <div className={styles.modalProgress}>
            <Progress type="circle" percent={pairingPercent} {...statusProps} />
          </div>
        )}
      </GlobalModal>
    </>
  );
};

export default StepPairing;
