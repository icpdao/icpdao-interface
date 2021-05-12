import type { ModalProps } from 'antd/es/modal';
import {Button, Col, Modal, Row, Space} from 'antd';
import React from 'react';
import styles from './index.less';

const GlobalModal: React.FC<ModalProps> = ({ confirmLoading, onCancel, onOk, cancelText, okText, ...restProps }) => (
  <Modal
    maskClosable={true}
    destroyOnClose={true}
    maskStyle={{top: 64, height: 'calc(100% - 130px)'}}
    bodyStyle={{paddingTop: 62, textAlign: 'center', fontWeight: 400, padding: '62px 30px 20px 30px'}}
    width={493}
    centered
    footer={<Row justify={'center'}>
      <Col>
        <Space direction={'vertical'} className={styles.globalModalButtonSpace}>
          <Button block key={'submit'} type={'primary'} size={'large'} onClick={onOk} loading={confirmLoading}>
            {okText}
          </Button>
          <Button block key={'back'} size={'large'} onClick={onCancel}>
            {cancelText}
          </Button>
        </Space>
      </Col>
    </Row>}
    onOk={onOk}
    onCancel={onCancel}
    {...restProps} />
);

export default GlobalModal;
