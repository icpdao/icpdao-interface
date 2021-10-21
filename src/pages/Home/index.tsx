import React, { useCallback, useMemo, useState } from 'react';
import GlobalModal from '@/components/Modal';
import { FormattedMessage, history, useIntl } from 'umi';
import styles from './index.less';
import { getUserInfo } from '@/utils/utils';
import { acceptIcpperships } from '@/services/icpdao-interface/icpperships';
import { useModel } from '@@/plugin-model/useModel';
import GlobalTooltip from '@/components/Tooltip';
import Content0 from './components/Content0';
import Content2 from './components/Content2';
import Content1 from './components/Content1';
import Content3 from './components/Content3';
import Footer from '@/components/Footer';
import { useHomeStatsQueryQuery } from '@/services/dao/generated';
import { useUniswapV3TokenListQuery } from '@/services/uniswap-v3/generated';

export default (): React.ReactNode => {
  const { profile } = getUserInfo();

  const intl = useIntl();

  const [mentorAcceptLoading, setMentorAcceptLoading] = useState(false);
  const [welcome, setWelcome] = useState<{ mentor: any; id: string }>({ mentor: {}, id: '' });
  const [mentorWelcomeVisible, setMentorWelcomeVisible] = useState(false);
  const { refresh } = useModel('@@initialState');
  const { chainId } = useModel('useWalletModel');
  const { openGuideEvent, closeGuideEvent } = useModel('useGuideModel');
  const { data } = useHomeStatsQueryQuery({
    variables: { tokenChainId: chainId?.toString() || '1' },
  });

  const queryTokenIds = useMemo(() => {
    const cid = chainId?.toString() || '1';
    if (cid !== '1') return [];
    return (
      data?.stats?.incomes
        ?.filter((ic) => ic?.tokenChainId === cid)
        .map((ic) => {
          return ic?.tokenAddress || '';
        })
        .filter((ic) => !!ic) || []
    );
  }, [chainId, data?.stats?.incomes]);

  console.log({ queryTokenIds });

  const { data: uniswapV3Tokens } = useUniswapV3TokenListQuery({
    variables: { tokenIds: queryTokenIds },
  });

  const incomePrices = useMemo(() => {
    const cid = chainId?.toString() || '1';
    let prices = 0;
    const uniswapPrice: Record<string, number> = {};
    uniswapV3Tokens?.tokens.forEach((tk) => {
      uniswapPrice[tk.id] = tk.volumeUSD / tk.volume;
    });
    data?.stats?.incomes
      ?.filter((ic) => ic?.tokenChainId === cid)
      .forEach((ic) => {
        if (!ic?.income || !ic?.tokenAddress || !uniswapPrice[ic.tokenAddress]) return;
        prices += uniswapPrice[ic.tokenAddress] * ic.income;
      });
    return prices;
  }, [chainId, data?.stats?.incomes, uniswapV3Tokens?.tokens]);

  const openModal = useCallback(() => {
    const noLongerRemind = localStorage.getItem('no_longer_remind') || '0';
    if (noLongerRemind !== '1') {
      openGuideEvent.emit();
    } else if (profile && profile.icppership && profile.icppership.progress === 0) {
      setWelcome(profile.icppership);
      setMentorWelcomeVisible(true);
    }
  }, [openGuideEvent, profile]);

  closeGuideEvent.useSubscription(() => {
    if (profile && profile.icppership && profile.icppership.progress === 0) {
      setWelcome(profile.icppership);
      setMentorWelcomeVisible(true);
    }
  });

  const handleAccept = async () => {
    setMentorAcceptLoading(true);
    try {
      await acceptIcpperships({ id: welcome.id });
      await refresh();
    } finally {
      setMentorAcceptLoading(false);
      setMentorWelcomeVisible(false);
      history.push('/account/mentor');
    }
  };
  const mentorWelcomeModal = (
    <GlobalModal
      key={'welcomeModal'}
      okText={intl.formatMessage({ id: 'pages.home.mentor.welcome.ok' })}
      cancelText={intl.formatMessage({ id: 'pages.home.mentor.welcome.cancel' })}
      confirmLoading={mentorAcceptLoading}
      onOk={handleAccept}
      onCancel={async () => {
        setMentorWelcomeVisible(false);
      }}
      visible={mentorWelcomeVisible}
    >
      <div>
        <div className={styles.modalContentTitle}>
          {intl.formatMessage({ id: 'pages.home.mentor.welcome.title' })}
        </div>
        <div
          className={styles.modalContentP}
          dangerouslySetInnerHTML={{
            __html: intl.formatMessage(
              { id: 'pages.home.mentor.welcome.p1' },
              { github_login: welcome.mentor.github_login },
            ),
          }}
        />
        <div className={styles.modalContentP}>
          <span
            style={{ paddingRight: 5 }}
            dangerouslySetInnerHTML={{
              __html: intl.formatMessage(
                { id: 'pages.home.mentor.welcome.p2' },
                { github_login: welcome.mentor.github_login },
              ),
            }}
          />
          <GlobalTooltip
            title={<FormattedMessage id={'pages.home.mentor.welcome.p2.tooltip'} />}
            key={'p2.tooltip'}
          />
        </div>

        <div className={styles.modalContentP}>
          <span
            style={{ paddingRight: 5 }}
            dangerouslySetInnerHTML={{
              __html: intl.formatMessage(
                { id: 'pages.home.mentor.welcome.p3' },
                { github_login: welcome.mentor.github_login },
              ),
            }}
          />
          <GlobalTooltip
            title={<FormattedMessage id={'pages.home.mentor.welcome.p3.tooltip'} />}
            key={'p3.tooltip'}
          />
        </div>

        <div className={styles.modalContentP}>
          <span
            style={{ paddingRight: 5 }}
            dangerouslySetInnerHTML={{
              __html: intl.formatMessage(
                { id: 'pages.home.mentor.welcome.p4' },
                { github_login: welcome.mentor.github_login },
              ),
            }}
          />
          <GlobalTooltip
            title={<FormattedMessage id={'pages.home.mentor.welcome.p4.tooltip'} />}
            key={'p4.tooltip'}
          />
        </div>

        <div
          className={styles.modalContentP}
          dangerouslySetInnerHTML={{
            __html: intl.formatMessage(
              { id: 'pages.home.mentor.welcome.p5' },
              { github_login: welcome.mentor.github_login },
            ),
          }}
        />
      </div>
    </GlobalModal>
  );

  return (
    <>
      <Content0 openModal={openModal} />
      <Content1 />
      <Content2 statsData={data?.stats} incomePrices={incomePrices} />
      <Content3 />
      <Footer />
      {mentorWelcomeModal}
    </>
  );
};
