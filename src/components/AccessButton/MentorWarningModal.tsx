import { Button, Col, Modal, Row, Space } from 'antd';
import React, { useCallback } from 'react';
import styles from './MentorWarningModal.less';
import { useIntl } from '@@/plugin-locale/localeExports';

type MentorWarningModalProps = {
  visible: boolean;
  setVisible: (bool: boolean) => void;
};

const MentorWarningModal: React.FC<MentorWarningModalProps> = ({ visible, setVisible }) => {
  const intl = useIntl();

  const onOk = useCallback(() => {
    window.open('https://discord.gg/yz7AWVdRmj', '_blank');
    setVisible(false);
  }, [setVisible]);

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
      visible={visible}
      footer={
        <Row justify={'center'}>
          <Col>
            <Space direction={'vertical'} className={styles.ModalButtonSpace}>
              <Button block key={'submit'} type={'primary'} size={'large'} onClick={onOk}>
                {intl.formatMessage({ id: 'pages.home.mentor.warning.ok' })}
              </Button>
            </Space>
          </Col>
        </Row>
      }
      onCancel={() => {
        setVisible(false);
      }}
    >
      <div>
        <div className={styles.ModalContentTitle}>
          {intl.formatMessage({ id: 'pages.home.mentor.warning.title' })}
        </div>
        <div className={styles.ModalContentP}>
          <p
            className={styles.ModalContentPTitle}
            dangerouslySetInnerHTML={{
              __html: intl.formatMessage({ id: 'pages.home.mentor.warning.p1.title' }),
            }}
          />
          <p>{intl.formatMessage({ id: 'pages.home.mentor.warning.p1.content' })}</p>
        </div>
        <div className={styles.ModalContentP}>
          <p
            className={styles.ModalContentPTitle}
            dangerouslySetInnerHTML={{
              __html: intl.formatMessage({ id: 'pages.home.mentor.warning.p2.title' }),
            }}
          />
          <p>{intl.formatMessage({ id: 'pages.home.mentor.warning.p2.content' })}</p>
        </div>
        <div className={styles.ModalContentP}>
          <p
            className={styles.ModalContentPTitle}
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
