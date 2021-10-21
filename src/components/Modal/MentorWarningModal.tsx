import { Button, Checkbox, Col, Modal, Row } from 'antd';
import React, { useState } from 'react';
import styles from './MentorWarningModal.less';
import { useIntl } from 'umi';

type MentorWarningModalProps = {
  visible: boolean;
  setVisible: (bool: boolean) => void;
  noLongerRemindCheckbox?: boolean;
};

const MentorWarningModal: React.FC<MentorWarningModalProps> = ({
  visible,
  setVisible,
  noLongerRemindCheckbox,
}) => {
  const intl = useIntl();
  const [mentorWarningNoLongerRemind, setMentorWarningNoLongerRemind] = useState<boolean>(false);

  return (
    <Modal
      maskClosable={true}
      destroyOnClose={true}
      key={'mentorWarning'}
      bodyStyle={{
        paddingTop: 62,
        textAlign: 'center',
        fontWeight: 400,
        overflowY: 'auto',
        padding: '62px 30px 20px 30px',
      }}
      className={styles.Modal}
      centered
      visible={visible}
      footer={
        noLongerRemindCheckbox === undefined || noLongerRemindCheckbox ? (
          <div className={styles.MentorWarningFooter}>
            <Checkbox
              checked={mentorWarningNoLongerRemind}
              onChange={(e) => {
                localStorage.setItem('mentor_no_longer_remind', e.target.checked ? '1' : '0');
                setMentorWarningNoLongerRemind(e.target.checked);
              }}
            >
              No longer remind
            </Checkbox>
          </div>
        ) : null
      }
      onCancel={() => {
        setVisible(false);
      }}
    >
      <div className={styles.ModalContent}>
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
        <Row justify={'center'} style={{ marginTop: '3rem' }}>
          <Col span={20}>
            <Button
              block
              key={'submit'}
              type={'primary'}
              size={'large'}
              onClick={() => {
                window.open('https://discord.gg/ACxJEUh68d', '_blank');
                setVisible(false);
              }}
            >
              {intl.formatMessage({ id: 'pages.home.mentor.warning.ok' })}
            </Button>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default MentorWarningModal;
