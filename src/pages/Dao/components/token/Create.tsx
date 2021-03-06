import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Alert,
  Skeleton,
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
import { formatUnits, isAddress, parseUnits } from 'ethers/lib/utils';
import IconFont from '@/components/IconFont';
import { BigNumber } from 'ethers';
import { useSubgraphV1ExistedTokenInfoLazyQuery } from '@/services/subgraph-v1/generated';
import { getFormatTime } from '@/utils/utils';
import { useWallet } from '@/hooks/useWallet';
import { useWeb3React } from '@web3-react/core';
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

const genDefaultCreateForm: (value: string | undefined) => ETH_CONNECT.CreateToken = (
  ethDAOId: string | undefined,
) => {
  return {
    ethDAOId: ethDAOId || '',
    genesis: [],
    lpRatio: 0,
    lpTotalAmount: BigNumber.from(0),
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
  };
};

const TokenCreate: React.FC<TokenConfigComponentsProps> = ({
  ethDAOId,
  daoId,
  tokenAddress,
  setTokenAddress,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const defaultCreateForm = genDefaultCreateForm(ethDAOId);
  const { active, contract } = useWallet(useWeb3React());
  const { event$ } = useModel('useWalletModel');
  const [createFormData, setCreateFormData] = useState<ETH_CONNECT.CreateToken>(defaultCreateForm);
  const [createFormValidMsg, setCreateFormValidMsg] = useState<Record<string, validate>>();
  const [previewGenesis, setPreviewGenesis] = useState<boolean>(false);
  const [previewCreateModal, setPreviewCreateModal] = useState<boolean>(false);
  const [noticeReCreateModal, setNoticeReCreateModal] = useState<boolean>(false);
  const [confirmReCreateModal, setConfirmReCreateModal] = useState<boolean>(false);
  const [loadingDeployComplete, setLoadingDeployComplete] = useState<boolean>(false);
  const [disableConfirmReCreateButton, setDisableConfirmReCreateButton] = useState<boolean>(true);
  const [lockRecreateFormEdit, setLockRecreateFormEdit] = useState<boolean>(false);

  const [getExistedTokenInfo, existedTokenInfo] = useSubgraphV1ExistedTokenInfoLazyQuery();

  useEffect(() => {
    if (tokenAddress && tokenAddress !== ZeroAddress) {
      getExistedTokenInfo({ variables: { tokenId: tokenAddress.toLowerCase() } });
    }
  }, [getExistedTokenInfo, tokenAddress]);

  useEffect(() => {
    if (tokenAddress && tokenAddress !== ZeroAddress) {
      console.log({ tokenAddress });
      setLockRecreateFormEdit(true);
    }
  }, [tokenAddress]);

  useEffect(() => {
    if (!existedTokenInfo.loading && existedTokenInfo.data?.token) {
      let mode = 'normal';
      if (
        !(
          existedTokenInfo.data.token.mintArgs.aDenominator === 10 &&
          existedTokenInfo.data.token.mintArgs.bNumerator === 1 &&
          existedTokenInfo.data.token.mintArgs.c === 0 &&
          existedTokenInfo.data.token.mintArgs.d === 0
        )
      ) {
        mode = 'expert';
      }
      setCreateFormData({
        ethDAOId: existedTokenInfo.data?.token.daoID,
        genesis: [],
        lpRatio: existedTokenInfo.data.token.lpRatio,
        lpTotalAmount: BigNumber.from(existedTokenInfo.data.token.lpTotalAmount),
        ownerAddress: existedTokenInfo.data.token.owner,
        tokenName: existedTokenInfo.data.token.name,
        tokenSymbol: existedTokenInfo.data.token.symbol,
        mode,
        mintChangeDays: mode === 'normal' ? existedTokenInfo.data.token.mintArgs.bDenominator : 30,
        mintValue:
          mode === 'normal'
            ? parseInt(formatUnits(BigNumber.from(existedTokenInfo.data.token.mintArgs.p), 18))
            : 10,
        mintChangeValue:
          mode === 'normal' ? existedTokenInfo.data.token.mintArgs.aNumerator / 10 : 0.5,
        mintArgs: {
          aNumerator: existedTokenInfo.data.token.mintArgs.aNumerator,
          aDenominator: existedTokenInfo.data.token.mintArgs.aDenominator,
          bNumerator: existedTokenInfo.data.token.mintArgs.bNumerator,
          bDenominator: existedTokenInfo.data.token.mintArgs.bDenominator,
          c: existedTokenInfo.data.token.mintArgs.c,
          d: existedTokenInfo.data.token.mintArgs.d,
          p: parseInt(formatUnits(BigNumber.from(existedTokenInfo.data.token.mintArgs.p), 18)),
        },
      });
    }
  }, [existedTokenInfo?.data?.token, existedTokenInfo.loading]);

  const createdTimeDesc = useMemo(() => {
    if (!!existedTokenInfo.data && !!existedTokenInfo.data.token?.createdAtTimestamp) {
      return (
        <div>
          Created At:{' '}
          <span style={{ color: '#ff7a45' }}>
            {getFormatTime(
              parseInt(existedTokenInfo.data.token?.createdAtTimestamp, 10) || 0,
              'LL',
            )}
          </span>
        </div>
      );
    }
    return <></>;
  }, [existedTokenInfo.data]);

  const { loading, run } = useRequest(
    async () => {
      if (!daoId) return;
      try {
        console.log('createData', createFormData);
        console.log('createData lp total', createFormData.lpTotalAmount?.toString());
        const tx = await contract.daoFactory.createToken(createFormData);
        setPreviewCreateModal(false);
        setLoadingDeployComplete(true);
        const receipt = await tx.wait();
        const deployEvent = receipt.events.pop();
        console.log(deployEvent.args);
        if (setTokenAddress && deployEvent.args && deployEvent.args.length > 0) {
          // setCreateFormData(defaultCreateForm);
          setTokenAddress(deployEvent.args[deployEvent.args.length - 1] || '');
        }
        setLoadingDeployComplete(false);
      } catch (e) {
        console.log(e);
        setPreviewCreateModal(false);
        setLoadingDeployComplete(false);
      }
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
        if (td.address && td.value && isAddress(td.address)) {
          rs.push({ address: td.address, value: parseFloat(td.value) });
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

  if (!tokenAddress) {
    return <Skeleton active />;
  }

  return (
    <>
      {tokenAddress !== ZeroAddress && (
        <div style={{ marginBottom: 30 }}>
          <Alert
            message="Info"
            description={
              <>
                <div>
                  {intl.formatMessage({ id: 'pages.dao.config.tab.token.create.existed.p1' })}
                </div>
                <div>
                  {intl.formatMessage({ id: 'pages.dao.config.tab.token.create.existed.p2' })}
                </div>
                {createdTimeDesc}
              </>
            }
            type="info"
            showIcon
          />
        </div>
      )}
      <Spin
        tip={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.loading' })}
        spinning={loadingDeployComplete}
      >
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} name={'tokenCreate'} form={form}>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.form.genesis' })}
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.create.form.genesis.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
            validateStatus={createFormValidMsg?.genesis?.validateStatus}
            help={createFormValidMsg?.genesis?.help}
          >
            <Upload
              disabled={lockRecreateFormEdit}
              maxCount={1}
              beforeUpload={(file) => {
                return readUploadExcel(file);
              }}
              showUploadList={{
                showDownloadIcon: true,
                showRemoveIcon: true,
                downloadIcon: <ZoomInOutlined onClick={() => setPreviewGenesis(true)} />,
              }}
              customRequest={({ file, onSuccess }) => {
                if (onSuccess) onSuccess(file, {} as any);
                return {
                  abort() {
                    console.log('upload progress is aborted.');
                  },
                };
              }}
              accept={allowUploadGenesisFileType.join(',')}
            >
              <Button icon={<UploadOutlined />} disabled={lockRecreateFormEdit}>
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
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.create.form.lp_ratio.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
            validateStatus={createFormValidMsg?.lpRatio?.validateStatus}
            help={createFormValidMsg?.lpRatio?.help}
          >
            <InputNumber
              disabled={lockRecreateFormEdit}
              min={0}
              value={createFormData.lpRatio}
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
              id: 'pages.dao.config.tab.token.create.form.lp_total_amount',
            })}
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.create.form.lp_total_amount.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
            validateStatus={createFormValidMsg?.lpTotalAmount?.validateStatus}
            help={createFormValidMsg?.lpTotalAmount?.help}
          >
            <InputNumber
              disabled={lockRecreateFormEdit}
              min={'0'}
              value={formatUnits(createFormData?.lpTotalAmount || 0, 18)}
              onChange={(value) => {
                setCreateFormData((old) => ({
                  ...old,
                  lpTotalAmount: parseUnits(value?.toString() || '0', 18),
                }));
              }}
            />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create.form.owner_address',
            })}
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.create.form.owner_address.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
            validateStatus={createFormValidMsg?.ownerAddress?.validateStatus}
            help={createFormValidMsg?.ownerAddress?.help}
          >
            <Input
              disabled={lockRecreateFormEdit}
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
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.create.form.token_name.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
            validateStatus={createFormValidMsg?.tokenName?.validateStatus}
            help={createFormValidMsg?.tokenName?.help}
          >
            <Input
              disabled={lockRecreateFormEdit}
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
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.create.form.token_symbol.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
            validateStatus={createFormValidMsg?.tokenSymbol?.validateStatus}
            help={createFormValidMsg?.tokenSymbol?.help}
          >
            <Input
              disabled={lockRecreateFormEdit}
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
              disabled={lockRecreateFormEdit}
              value={createFormData.mode}
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
                tooltip={{
                  title: intl.formatMessage({
                    id: 'pages.dao.config.tab.token.create.form.mint_value.desc',
                  }),
                  icon: <IconFont type={'icon-question'} />,
                }}
                validateStatus={createFormValidMsg?.mintValue?.validateStatus}
                help={createFormValidMsg?.mintValue?.help}
              >
                <InputNumber
                  disabled={lockRecreateFormEdit}
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
                tooltip={{
                  title: intl.formatMessage({
                    id: 'pages.dao.config.tab.token.create.form.mint_change_days.desc',
                  }),
                  icon: <IconFont type={'icon-question'} />,
                }}
                validateStatus={createFormValidMsg?.mintChangeDays?.validateStatus}
                help={createFormValidMsg?.mintChangeDays?.help}
              >
                <InputNumber
                  disabled={lockRecreateFormEdit}
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
                tooltip={{
                  title: intl.formatMessage({
                    id: 'pages.dao.config.tab.token.create.form.mint_change_value.desc',
                  }),
                  icon: <IconFont type={'icon-question'} />,
                }}
                validateStatus={createFormValidMsg?.mintChangeValue?.validateStatus}
                help={createFormValidMsg?.mintChangeValue?.help}
              >
                <InputNumber
                  disabled={lockRecreateFormEdit}
                  value={createFormData.mintChangeValue}
                  min={0.1}
                  step={0.1}
                  precision={1}
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
              tooltip={{
                title: intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create.form.mint_args.desc',
                }),
                icon: <IconFont type={'icon-question'} />,
              }}
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
          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            {!!tokenAddress && tokenAddress !== ZeroAddress && lockRecreateFormEdit && (
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => setLockRecreateFormEdit(false)}
              >
                <FormattedMessage
                  id={`pages.dao.config.tab.token.create.form.button.lock_recreate`}
                />
              </Button>
            )}
            {!!tokenAddress && tokenAddress !== ZeroAddress && !lockRecreateFormEdit && (
              <Button type="primary" htmlType="submit" onClick={() => handlerReCreate()}>
                <FormattedMessage id={`pages.dao.config.tab.token.create.form.button.recreate`} />
              </Button>
            )}
            {!!tokenAddress && tokenAddress === ZeroAddress && (
              <Button type="primary" htmlType="submit" onClick={() => handlerCreate()}>
                <FormattedMessage id={`pages.dao.config.tab.token.create.form.button.create`} />
              </Button>
            )}
          </Form.Item>
        </Form>
      </Spin>
      <Modal
        key={'previewGenesis'}
        visible={previewGenesis}
        maskClosable={true}
        destroyOnClose={true}
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
          rowKey={'address'}
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
          if (!active) {
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
            span={2}
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
            label={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create.form.lp_total_amount',
            })}
          >
            {formatUnits(createFormData?.lpTotalAmount || '0', 18)}
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
