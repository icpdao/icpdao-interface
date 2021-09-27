import React, { useState } from 'react';
import GlobalModal from '@/components/Modal';
import { FormattedMessage, history, useIntl } from 'umi';
import styles from './index.less';
import { getUserInfo } from '@/utils/utils';
import { acceptIcpperships } from '@/services/icpdao-interface/icpperships';
import { useModel } from '@@/plugin-model/useModel';
import GlobalTooltip from '@/components/Tooltip';
import Content0 from './components/Content0';
import Content1 from './components/Content1';
import Content2 from './components/Content2';
import Content3 from './components/Content3';
import Content4 from './components/Content4';
import Footer from '@/components/Footer';
import { useHomeStatsQueryQuery } from '@/services/dao/generated';

export default (): React.ReactNode => {
  const { profile } = getUserInfo();
  let defaultWelcome = false;
  let welcome: { mentor: any; id: string } = { mentor: {}, id: '' };
  if (profile && profile.icppership && profile.icppership.progress === 0) {
    welcome = profile.icppership;
    defaultWelcome = true;
  }

  const intl = useIntl();

  const [mentorAcceptLoading, setMentorAcceptLoading] = useState(false);

  const [mentorWelcomeVisible, setMentorWelcomeVisible] = useState(defaultWelcome);
  const { refresh } = useModel('@@initialState');
  const { data, loading } = useHomeStatsQueryQuery();

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
      <Content0 />
      <Content1 statsData={data?.stats} loading={loading} />
      <Content2 />
      <Content3 />
      <Content4 />
      <Footer />
      {mentorWelcomeModal}
    </>
  );
};
