import React, {useState} from 'react';
import GlobalModal from "@/components/Modal";
import { useIntl, FormattedMessage } from 'umi';
import styles from './Home.less';
import {getUserInfo} from "@/utils/utils";
import {acceptIcpperships} from "@/services/icpdao-interface/icpperships";
import {useModel} from "@@/plugin-model/useModel";
import GlobalTooltip from "@/components/Tooltip";

export default (): React.ReactNode => {
  const { profile } = getUserInfo();
  let defaultWarning = false;
  let defaultWelcome = false;
  let welcome: {mentor: any, id: string} = {mentor: {}, id: ''};
  if (profile && profile.icppership && profile.icppership.progress === 0) {
    welcome = profile.icppership;
    defaultWelcome = true;
  }
  if (profile && profile.icppership && !profile.icppership.mentor) {
    defaultWarning = true;
  }

  const intl = useIntl();
  const [mentorWarningVisible, setMentorWarningVisible] = useState<boolean>(defaultWarning);
  const mentorWarningModal = (
    <GlobalModal
      key={'warningModal'}
      onOk={() => {setMentorWarningVisible(false)}}
      onCancel={() => {setMentorWarningVisible(false)}}
      footer={null}
      visible={mentorWarningVisible}>
      <div>
        <div className={styles.modalContentTitle}>
          {intl.formatMessage({id: 'pages.home.mentor.warning.title'})}
        </div>
        <div className={styles.modalContentP}>
          <p className={styles.title} dangerouslySetInnerHTML={{__html: intl.formatMessage({id: 'pages.home.mentor.warning.p1.title'})}} />
          <p>{intl.formatMessage({id: 'pages.home.mentor.warning.p1.content'})}</p>
        </div>
        <div className={styles.modalContentP}>
          <p className={styles.title} dangerouslySetInnerHTML={{__html: intl.formatMessage({id: 'pages.home.mentor.warning.p2.title'})}} />
          <p>{intl.formatMessage({id: 'pages.home.mentor.warning.p2.content'})}</p>
        </div>
        <div className={styles.modalContentP}>
          <p className={styles.title} dangerouslySetInnerHTML={{__html: intl.formatMessage({id: 'pages.home.mentor.warning.p3.title'})}} />
          <p>{intl.formatMessage({id: 'pages.home.mentor.warning.p3.content'})}</p>
        </div>
      </div>
    </GlobalModal>
  )

  const [mentorAcceptLoading, setMentorAcceptLoading] = useState(false)

  const [mentorWelcomeVisible, setMentorWelcomeVisible] = useState(defaultWelcome)
  const { initialState } = useModel('@@initialState');

  const handleAccept = async () => {
    setMentorAcceptLoading(true);
    try {
      await acceptIcpperships({id: welcome.id});
      if (initialState && initialState.fetchUserInfo) await initialState.fetchUserInfo();
    } finally {
      setMentorAcceptLoading(false);
      setMentorWelcomeVisible(false);
    }
  }
  const mentorWelcomeModal = (
    <GlobalModal
      key={'welcomeModal'}
      okText={intl.formatMessage({id: 'pages.home.mentor.welcome.ok'})}
      cancelText={intl.formatMessage({id: 'pages.home.mentor.welcome.cancel'})}
      confirmLoading={mentorAcceptLoading}
      onOk={handleAccept}
      onCancel={async () => {setMentorWelcomeVisible(false)}}
      visible={mentorWelcomeVisible}>
      <div>
        <div className={styles.modalContentTitle}>
          {intl.formatMessage({id: 'pages.home.mentor.welcome.title'})}
        </div>
        <div className={styles.modalContentP}
             dangerouslySetInnerHTML={{__html: intl.formatMessage({id: 'pages.home.mentor.welcome.p1'}, {github_login: welcome.mentor.github_login})}}
        />
        <div className={styles.modalContentP}>
          <span
            style={{paddingRight: 5}}
            dangerouslySetInnerHTML={{__html: intl.formatMessage({id: 'pages.home.mentor.welcome.p2'}, {github_login: welcome.mentor.github_login})}}
          />
          <GlobalTooltip title={<FormattedMessage id={'pages.home.mentor.welcome.p2.tooltip'} />} key={'p2.tooltip'} />
        </div>

        <div className={styles.modalContentP}>
          <span
            style={{paddingRight: 5}}
            dangerouslySetInnerHTML={{__html: intl.formatMessage({id: 'pages.home.mentor.welcome.p3'}, {github_login: welcome.mentor.github_login})}}
          />
          <GlobalTooltip title={<FormattedMessage id={'pages.home.mentor.welcome.p3.tooltip'} />} key={'p3.tooltip'} />
        </div>

        <div className={styles.modalContentP}>
          <span
            style={{paddingRight: 5}}
            dangerouslySetInnerHTML={{__html: intl.formatMessage({id: 'pages.home.mentor.welcome.p4'}, {github_login: welcome.mentor.github_login})}}
          />
          <GlobalTooltip title={<FormattedMessage id={'pages.home.mentor.welcome.p4.tooltip'} />} key={'p4.tooltip'} />
        </div>

        <div className={styles.modalContentP}
             dangerouslySetInnerHTML={{__html: intl.formatMessage({id: 'pages.home.mentor.welcome.p5'}, {github_login: welcome.mentor.github_login})}}
        />
      </div>
    </GlobalModal>
  )


  return [
    mentorWelcomeModal,
    mentorWarningModal
  ];
};
