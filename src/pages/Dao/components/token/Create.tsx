import React, { useCallback, useMemo, useState } from 'react';
import {
  Form,
  Upload,
  Button,
  InputNumber,
  Input,
  Radio,
  Row,
  Space,
  Modal,
  Table,
  Col,
  Descriptions,
  Spin,
} from 'antd';
import { UploadOutlined, ZoomInOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'umi';
import * as XLSX from 'xlsx';
import Web3 from 'web3';
import { useIntl } from '@@/plugin-locale/localeExports';
import GlobalModal from '@/components/Modal';
import type { TokenConfigComponentsProps } from '@/pages/Dao/components/TokenConfig';
import { ZeroAddress } from '@/services/ethereum-connect';
import type { ETH_CONNECT } from '@/services/ethereum-connect/typings';
import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';

type ValidateStatus = Parameters<typeof Form.Item>[0]['validateStatus'];

const allowUploadGenesisFileType = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

type validate = {
  validateStatus?: ValidateStatus;
  help?: string;
};

const TokenCreate: React.FC<TokenConfigComponentsProps> = ({ ethDAOId, tokenAddress }) => {
  const intl = useIntl();
  const { isConnected, contract, event$ } = useModel('useWalletModel');

  const [createFormData, setCreateFormData] = useState<ETH_CONNECT.CreateToken>({
    ethDAOId: ethDAOId || '',
    genesis: [],
    lpRatio: 0,
    ownerAddress: '',
    tokenName: '',
    tokenSymbol: '',
    mode: 'normal',
    mintChangeDays: 30,
    mintValue: 10,
    mintChangeValue: 0.5,
    mintArgs: {
      aNumerator: 1,
      aDenominator: 2,
      bNumerator: 1,
      bDenominator: 30,
      c: 0,
      d: 0,
      p: 10,
    },
  });
  const [createFormValidMsg, setCreateFormValidMsg] = useState<Record<string, validate>>();
  const [previewGenesis, setPreviewGenesis] = useState<boolean>(false);
  const [previewCreateModal, setPreviewCreateModal] = useState<boolean>(false);
  const [noticeReCreateModal, setNoticeReCreateModal] = useState<boolean>(false);
  const [confirmReCreateModal, setConfirmReCreateModal] = useState<boolean>(false);
  const [loadingDeployComplete, setLoadingDeployComplete] = useState<boolean>(false);
  const [disableConfirmReCreateButton, setDisableConfirmReCreateButton] = useState<boolean>(true);
  const { loading, run } = useRequest(
    async () => {
      console.log('createData', createFormData);
      const tx = await contract.daoFactory.createToken(createFormData);
      setPreviewCreateModal(false);
      setLoadingDeployComplete(true);
      const receipt = await tx.wait();
      const deployEvent = receipt.events.pop();
      setLoadingDeployComplete(false);
      console.log(deployEvent.args);
    },
    {
      manual: true,
    },
  );
  const readUploadExcel = useCallback((file) => {
    if (!allowUploadGenesisFileType.includes(file.type)) return false;
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file);
    fileReader.onload = (e) => {
      const { result } = e.target as any;
      const rs: ETH_CONNECT.TokenGenesis[] = [];
      const workbook = XLSX.read(result, { type: 'binary' });
      if (Object.keys(workbook.Sheets).length <= 0) return;
      const firstSheetKey = Object.keys(workbook.Sheets)[0];
      const sheetJSON = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetKey]);
      sheetJSON.forEach((d) => {
        const td = d as any;
        if (td.address && td.value && Web3.utils.isAddress(td.address)) {
          rs.push({ address: td.address, value: parseInt(td.value, 10) });
        }
      });
      if (rs.length > 0)
        setCreateFormData((old) => ({
          ...old,
          genesis: rs,
        }));
    };
    return true;
  }, []);
  const handlerCheckCreateFrom = useCallback(() => {
    if (
      createFormData.ownerAddress === '' ||
      !Web3.utils.isAddress(createFormData.ownerAddress || '')
    ) {
      setCreateFormValidMsg((old) => ({
        ...old,
        ownerAddress: {
          validateStatus: 'error',
          help: 'The owner address must be an Ethereum address.',
        },
      }));
      return false;
    }
    if (createFormData.tokenName === '') {
      setCreateFormValidMsg((old) => ({
        ...old,
        tokenName: {
          validateStatus: 'error',
          help: 'The token name cannot be empty.',
        },
      }));
      return false;
    }
    if (createFormData.tokenSymbol === '') {
      setCreateFormValidMsg((old) => ({
        ...old,
        tokenSymbol: {
          validateStatus: 'error',
          help: 'The token symbol cannot be empty.',
        },
      }));
      return false;
    }
    return true;
  }, [createFormData.ownerAddress, createFormData.tokenName, createFormData.tokenSymbol]);
  const handlerCreate = useCallback(() => {
    const checked = handlerCheckCreateFrom();
    if (checked) setPreviewCreateModal(true);
  }, [handlerCheckCreateFrom]);
  const handlerReCreate = useCallback(() => {
    const checked = handlerCheckCreateFrom();
    if (checked) setNoticeReCreateModal(true);
  }, [handlerCheckCreateFrom]);
  const formButton = useMemo(() => {
    if (tokenAddress !== ZeroAddress) {
      return (
        <Button type="primary" htmlType="submit" onClick={() => handlerReCreate()}>
          <FormattedMessage id={`pages.dao.config.tab.token.create.form.button.recreate`} />
        </Button>
      );
    }
    return (
      <Button type="primary" htmlType="submit" onClick={() => handlerCreate()}>
        <FormattedMessage id={`pages.dao.config.tab.token.create.form.button.create`} />
      </Button>
    );
  }, [handlerCreate, handlerReCreate, tokenAddress]);
  return (
    <>
      <Spin
        tip={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.loading' })}
        spinning={loadingDeployComplete}
      >
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} name={'tokenCreate'}>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.form.genesis' })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create.form.genesis.desc',
            })}
            validateStatus={createFormValidMsg?.genesis?.validateStatus}
            help={createFormValidMsg?.genesis?.help}
          >
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                return readUploadExcel(file);
              }}
              showUploadList={{
                showDownloadIcon: true,
                showRemoveIcon: true,
                downloadIcon: <ZoomInOutlined onClick={() => setPreviewGenesis(true)} />,
              }}
              accept={allowUploadGenesisFileType.join(',')}
            >
              <Button icon={<UploadOutlined />}>
                &nbsp;
                <FormattedMessage id={'pages.dao.config.tab.token.create.form.upload'} />
              </Button>
            </Upload>
            <a href="/token_gensis.xlsx" target={'_blank'}>
              template
            </a>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.form.lp_ratio' })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create.form.lp_ratio.desc',
            })}
            validateStatus={createFormValidMsg?.lpRatio?.validateStatus}
            help={createFormValidMsg?.lpRatio?.help}
          >
            <InputNumber
              min={0}
              max={100}
              defaultValue={createFormData.lpRatio}
              formatter={(value) => `${value} %`}
              parser={(value) => value?.replace(' %', '') as any}
              onChange={(value) => {
                setCreateFormData((old) => ({
                  ...old,
                  lpRatio: value,
                }));
              }}
            />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create.form.owner_address',
            })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create.form.owner_address.desc',
            })}
            validateStatus={createFormValidMsg?.ownerAddress?.validateStatus}
            help={createFormValidMsg?.ownerAddress?.help}
          >
            <Input
              value={createFormData.ownerAddress}
              style={{ width: 400 }}
              onChange={(e) => {
                if (e.target.value === '' || !Web3.utils.isAddress(e.target.value))
                  setCreateFormValidMsg((old) => ({
                    ...old,
                    ownerAddress: {
                      validateStatus: 'error',
                      help: 'The owner address must be an Ethereum address.',
                    },
                  }));
                else
                  setCreateFormValidMsg((old) => ({
                    ...old,
                    ownerAddress: {
                      validateStatus: 'success',
                    },
                  }));
                setCreateFormData((old) => ({
                  ...old,
                  ownerAddress: e.target.value,
                }));
              }}
            />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.form.token_name' })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create.form.token_name.desc',
            })}
            validateStatus={createFormValidMsg?.tokenName?.validateStatus}
            help={createFormValidMsg?.tokenName?.help}
          >
            <Input
              value={createFormData.tokenName}
              style={{ width: 400 }}
              onChange={(e) => {
                if (e.target.value === '')
                  setCreateFormValidMsg((old) => ({
                    ...old,
                    tokenName: {
                      validateStatus: 'error',
                      help: 'The token name cannot be empty.',
                    },
                  }));
                else
                  setCreateFormValidMsg((old) => ({
                    ...old,
                    tokenName: {
                      validateStatus: 'success',
                    },
                  }));
                setCreateFormData((old) => ({
                  ...old,
                  tokenName: e.target.value,
                }));
              }}
            />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create.form.token_symbol',
            })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create.form.token_symbol.desc',
            })}
            validateStatus={createFormValidMsg?.tokenSymbol?.validateStatus}
            help={createFormValidMsg?.tokenSymbol?.help}
          >
            <Input
              value={createFormData.tokenSymbol}
              style={{ width: 400 }}
              onChange={(e) => {
                if (e.target.value === '')
                  setCreateFormValidMsg((old) => ({
                    ...old,
                    tokenSymbol: {
                      validateStatus: 'error',
                      help: 'The token symbol cannot be empty.',
                    },
                  }));
                else
                  setCreateFormValidMsg((old) => ({
                    ...old,
                    tokenSymbol: {
                      validateStatus: 'success',
                    },
                  }));
                setCreateFormData((old) => ({
                  ...old,
                  tokenSymbol: e.target.value,
                }));
              }}
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Radio.Group
              defaultValue={'normal'}
              buttonStyle="solid"
              onChange={(v) =>
                setCreateFormData((old) => ({
                  ...old,
                  mode: v.target.value,
                }))
              }
            >
              <Radio.Button value="normal">
                <FormattedMessage id={`pages.dao.config.tab.token.create.form.normal`} />
              </Radio.Button>
              <Radio.Button value="expert">
                <FormattedMessage id={`pages.dao.config.tab.token.create.form.expert`} />
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          {createFormData.mode === 'normal' && (
            <>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_value',
                })}
                tooltip={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_value.desc',
                })}
                validateStatus={createFormValidMsg?.mintValue?.validateStatus}
                help={createFormValidMsg?.mintValue?.help}
              >
                <InputNumber
                  value={createFormData.mintValue}
                  min={0}
                  step={'1'}
                  onChange={(value) =>
                    setCreateFormData((old) => ({
                      ...old,
                      mintValue: value,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_change_days',
                })}
                tooltip={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_change_days.desc',
                })}
                validateStatus={createFormValidMsg?.mintChangeDays?.validateStatus}
                help={createFormValidMsg?.mintChangeDays?.help}
              >
                <InputNumber
                  value={createFormData.mintChangeDays}
                  min={1}
                  step={'1'}
                  onChange={(value) =>
                    setCreateFormData((old) => ({
                      ...old,
                      mintChangeDays: value,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_change_value',
                })}
                tooltip={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_change_value.desc',
                })}
                validateStatus={createFormValidMsg?.mintChangeValue?.validateStatus}
                help={createFormValidMsg?.mintChangeValue?.help}
              >
                <InputNumber
                  value={createFormData.mintChangeValue}
                  min={0.1}
                  step={'0.1'}
                  onChange={(value) =>
                    setCreateFormData((old) => ({
                      ...old,
                      mintChangeValue: value,
                    }))
                  }
                />
              </Form.Item>
            </>
          )}
          {createFormData.mode === 'expert' && (
            <Form.Item
              label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.form.mint_args' })}
              tooltip={intl.formatMessage({
                id: 'pages.dao.config.tab.token.create.form.mint_args.desc',
              })}
              validateStatus={createFormValidMsg?.mintArgs?.validateStatus}
              help={createFormValidMsg?.mintArgs?.help}
            >
              <Row style={{ marginBottom: 30 }}>
                <Space style={{ width: 200 }}>
                  <div style={{ width: 90, textAlign: 'right' }}>
                    <FormattedMessage id={`pages.dao.config.tab.token.create.form.mint_args.a_m`} />
                  </div>
                  <InputNumber
                    value={createFormData.mintArgs?.aNumerator}
                    min={0}
                    step={'1'}
                    onChange={(value) =>
                      setCreateFormData((old) => ({
                        ...old,
                        mintArgs: {
                          ...old.mintArgs,
                          aMolecular: value,
                        },
                      }))
                    }
                  />
                </Space>
                <Space style={{ width: 220 }}>
                  <div style={{ width: 110, textAlign: 'right' }}>
                    <FormattedMessage id={`pages.dao.config.tab.token.create.form.mint_args.a_d`} />
                  </div>
                  <InputNumber
                    value={createFormData.mintArgs?.aDenominator}
                    min={1}
                    step={'1'}
                    onChange={(value) =>
                      setCreateFormData((old) => ({
                        ...old,
                        mintArgs: {
                          ...old.mintArgs,
                          aDenominator: value,
                        },
                      }))
                    }
                  />
                </Space>
              </Row>
              <Row style={{ marginBottom: 30 }}>
                <Space style={{ width: 200 }}>
                  <div style={{ width: 90, textAlign: 'right' }}>
                    <FormattedMessage id={`pages.dao.config.tab.token.create.form.mint_args.b_m`} />
                  </div>
                  <InputNumber
                    value={createFormData.mintArgs?.bNumerator}
                    min={0}
                    step={'1'}
                    onChange={(value) =>
                      setCreateFormData((old) => ({
                        ...old,
                        mintArgs: {
                          ...old.mintArgs,
                          bMolecular: value,
                        },
                      }))
                    }
                  />
                </Space>
                <Space style={{ width: 220 }}>
                  <div style={{ width: 110, textAlign: 'right' }}>
                    <FormattedMessage id={`pages.dao.config.tab.token.create.form.mint_args.b_d`} />
                  </div>
                  <InputNumber
                    value={createFormData.mintArgs?.bDenominator}
                    min={1}
                    step={'1'}
                    onChange={(value) =>
                      setCreateFormData((old) => ({
                        ...old,
                        mintArgs: {
                          ...old.mintArgs,
                          bDenominator: value,
                        },
                      }))
                    }
                  />
                </Space>
              </Row>
              <Row style={{ marginBottom: 30 }}>
                <Space style={{ width: 200 }}>
                  <div style={{ width: 90, textAlign: 'right' }}>
                    <FormattedMessage id={`pages.dao.config.tab.token.create.form.mint_args.c`} />
                  </div>
                  <InputNumber
                    value={createFormData.mintArgs?.c}
                    min={0}
                    step={'1'}
                    onChange={(value) =>
                      setCreateFormData((old) => ({
                        ...old,
                        mintArgs: {
                          ...old.mintArgs,
                          c: value,
                        },
                      }))
                    }
                  />
                </Space>
                <Space style={{ width: 220 }}>
                  <div style={{ width: 110, textAlign: 'right' }}>
                    <FormattedMessage id={`pages.dao.config.tab.token.create.form.mint_args.p`} />
                  </div>
                  <InputNumber
                    value={createFormData.mintArgs?.p}
                    min={0}
                    step={'1'}
                    onChange={(value) =>
                      setCreateFormData((old) => ({
                        ...old,
                        mintArgs: {
                          ...old.mintArgs,
                          p: value,
                        },
                      }))
                    }
                  />
                </Space>
              </Row>
              <Row>
                <Space style={{ width: 200 }}>
                  <div style={{ width: 90, textAlign: 'right' }}>
                    <FormattedMessage id={`pages.dao.config.tab.token.create.form.mint_args.d`} />
                  </div>
                  <InputNumber
                    value={createFormData.mintArgs?.d}
                    min={0}
                    step={'1'}
                    onChange={(value) =>
                      setCreateFormData((old) => ({
                        ...old,
                        mintArgs: {
                          ...old.mintArgs,
                          d: value,
                        },
                      }))
                    }
                  />
                </Space>
              </Row>
            </Form.Item>
          )}
          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>{formButton}</Form.Item>
        </Form>
      </Spin>
      <Modal
        key={'previewGenesis'}
        visible={previewGenesis}
        maskClosable={true}
        destroyOnClose={true}
        maskStyle={{ top: 64, height: 'calc(100% - 130px)' }}
        bodyStyle={{
          paddingTop: 62,
          textAlign: 'center',
          fontWeight: 400,
          padding: '62px 30px 20px 30px',
        }}
        width={800}
        centered
        footer={null}
        onOk={() => {}}
        onCancel={() => setPreviewGenesis(false)}
      >
        <Table
          size="small"
          bordered
          key={'address'}
          pagination={false}
          summary={(pageData) => {
            let totalValue = 0;
            pageData.forEach(({ value }) => {
              totalValue += value;
            });
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>Summary</Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={2} index={1}>
                    {totalValue}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
          columns={[
            { title: 'Address', dataIndex: 'address', key: 'address' },
            { title: 'Value', dataIndex: 'value', key: 'value' },
          ]}
          dataSource={createFormData.genesis}
        />
      </Modal>
      <GlobalModal
        key={'previewCreate'}
        visible={previewCreateModal}
        onOk={async () => {
          if (!isConnected) {
            event$?.emit();
            return true;
          }
          await run();
          return true;
        }}
        confirmLoading={loading}
        width={800}
        okText={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.ok' })}
        cancelText={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.cancel' })}
        onCancel={() => setPreviewCreateModal(false)}
      >
        <Descriptions title="Preview Create" bordered column={2}>
          <Descriptions.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.form.genesis' })}
          >
            <ZoomInOutlined onClick={() => setPreviewGenesis(true)} />
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.form.lp_ratio' })}
          >
            {createFormData.lpRatio}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create.form.owner_address',
            })}
          >
            {createFormData.ownerAddress}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.form.token_name' })}
          >
            {createFormData.tokenName}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create.form.token_symbol',
            })}
          >
            {createFormData.tokenSymbol}
          </Descriptions.Item>
          {createFormData.mode === 'normal' && (
            <>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_value',
                })}
              >
                {createFormData.mintValue}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_change_days',
                })}
              >
                {createFormData.mintChangeDays}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_change_value',
                })}
              >
                {createFormData.mintChangeValue}
              </Descriptions.Item>
            </>
          )}
          {createFormData.mode === 'expert' && (
            <>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_args.a_m',
                })}
              >
                {createFormData.mintArgs?.aNumerator}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_args.a_d',
                })}
              >
                {createFormData.mintArgs?.aDenominator}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_args.b_m',
                })}
              >
                {createFormData.mintArgs?.bNumerator}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_args.b_d',
                })}
              >
                {createFormData.mintArgs?.bDenominator}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_args.c',
                })}
              >
                {createFormData.mintArgs?.c}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_args.p',
                })}
              >
                {createFormData.mintArgs?.p}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_args.d',
                })}
              >
                {createFormData.mintArgs?.d}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </GlobalModal>
      <GlobalModal
        key={'noticeReCreate'}
        visible={noticeReCreateModal}
        okText={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.ok' })}
        cancelText={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.cancel' })}
        onOk={() => {
          setConfirmReCreateModal(true);
        }}
        onCancel={() => setNoticeReCreateModal(false)}
      >
        <Space direction={'vertical'}>
          <div>
            <FormattedMessage id={`pages.dao.config.tab.token.create.recreate.notice.1`} />
          </div>
          <div>
            <FormattedMessage id={`pages.dao.config.tab.token.create.recreate.notice.2`} />
          </div>
          <div>
            <FormattedMessage id={`pages.dao.config.tab.token.create.recreate.notice.3`} />
          </div>
        </Space>
      </GlobalModal>
      <Modal
        key={'confirmReCreate'}
        visible={confirmReCreateModal}
        maskClosable={true}
        destroyOnClose={true}
        maskStyle={{ top: 64, height: 'calc(100% - 130px)' }}
        bodyStyle={{
          paddingTop: 32,
          textAlign: 'center',
          fontWeight: 400,
          padding: '62px 30px 20px 30px',
        }}
        centered
        footer={
          <Row justify={'center'}>
            <Col>
              <Space direction={'vertical'} style={{ width: 320 }}>
                <Button
                  block
                  key={'submit'}
                  type={'primary'}
                  size={'large'}
                  onClick={() => {
                    setConfirmReCreateModal(false);
                    setNoticeReCreateModal(false);
                    setPreviewCreateModal(true);
                  }}
                  disabled={disableConfirmReCreateButton}
                >
                  {intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.ok' })}
                </Button>
                <Button
                  block
                  key={'back'}
                  size={'large'}
                  onClick={() => setConfirmReCreateModal(false)}
                >
                  {intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.cancel' })}
                </Button>
              </Space>
            </Col>
          </Row>
        }
        onOk={() => {
          setConfirmReCreateModal(false);
          setNoticeReCreateModal(false);
          setPreviewCreateModal(true);
        }}
        onCancel={() => setConfirmReCreateModal(false)}
      >
        <Input
          placeholder={intl.formatMessage({
            id: 'pages.dao.config.tab.token.create.recreate.input.placeholder',
          })}
          onChange={(e) => {
            if (
              e.target.value ===
              intl.formatMessage({ id: 'pages.dao.config.tab.token.create.recreate.input' })
            ) {
              setDisableConfirmReCreateButton(false);
            }
          }}
        />
      </Modal>
    </>
  );
};

export default TokenCreate;
