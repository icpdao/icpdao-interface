import type { ModalProps } from 'antd/es/modal';
import { Button, Col, Modal, Row, Space } from 'antd';
import React, { useCallback, useState } from 'react';
import styles from './MentorWarningModal.less';
import { useIntl } from '@@/plugin-locale/localeExports';

const MentorWarningModal: React.FC<ModalProps> = ({ visible }) => {
  const intl = useIntl();
  const [mentorWarningVisible, setMentorWarningVisible] = useState<boolean | undefined>(visible);

  const onOk = useCallback(() => {
    window.open('https://discord.gg/yz7AWVdRmj', '_blank');
    setMentorWarningVisible(false);
  }, []);

  return (
    <Modal
      maskClosable={true}
      destroyOnClose={true}
      maskStyle={{ top: 64, height: 'calc(100% - 130px)' }}
      bodyStyle={{
        paddingTop: 62,
        textAlign: 'center',
        fontWeight: 400,
        padding: '62px 30px 20px 30px',
      }}
      width={493}
      centered
      visible={mentorWarningVisible}
      footer={
        <Row justify={'center'}>
          <Col>
            <Space direction={'vertical'} className={styles.modalButtonSpace}>
              <Button block key={'submit'} type={'primary'} size={'large'} onClick={onOk}>
                {intl.formatMessage({ id: 'pages.home.mentor.warning.ok' })}
              </Button>
            </Space>
          </Col>
        </Row>
      }
      onCancel={() => {
        setMentorWarningVisible(false);
      }}
    >
      <div>
        <div className={styles.modalContentTitle}>
          {intl.formatMessage({ id: 'pages.home.mentor.warning.title' })}
        </div>
        <div className={styles.modalContentP}>
          <p
            className={styles.modalContentPTitle}
            dangerouslySetInnerHTML={{
              __html: intl.formatMessage({ id: 'pages.home.mentor.warning.p1.title' }),
            }}
          />
          <p>{intl.formatMessage({ id: 'pages.home.mentor.warning.p1.content' })}</p>
        </div>
        <div className={styles.modalContentP}>
          <p
            className={styles.modalContentPTitle}
            dangerouslySetInnerHTML={{
              __html: intl.formatMessage({ id: 'pages.home.mentor.warning.p2.title' }),
            }}
          />
          <p>{intl.formatMessage({ id: 'pages.home.mentor.warning.p2.content' })}</p>
        </div>
        <div className={styles.modalContentP}>
          <p
            className={styles.modalContentPTitle}
            dangerouslySetInnerHTML={{
              __html: intl.formatMessage({ id: 'pages.home.mentor.warning.p3.title' }),
            }}
          />
          <p>{intl.formatMessage({ id: 'pages.home.mentor.warning.p3.content' })}</p>
        </div>
      </div>
    </Modal>
  );
};

export default MentorWarningModal;

export const useMentorWarningModal = (defaultVisible: boolean) => {
  const [visible, setVisible] = useState(defaultVisible);

  const mentorWarningModal = <MentorWarningModal key={'warningModal'} visible={visible} />;

  return {
    mentorWarningModal,
    setVisible,
  };
};
