import React, {useCallback, useMemo, useState} from 'react';
import {Form, Spin, Input, Space, Alert, Select, Avatar} from "antd";
import {request, useIntl} from "umi";
import {ETH_CONNECT} from "@/services/ethereum-connect/typings";
import {useModel} from "@@/plugin-model/useModel";
import {TokenConfigComponentsProps} from "@/pages/Dao/components/TokenConfig";
import {ZeroAddress} from "@/services/ethereum-connect";
import {DAOTokenConnect} from "@/services/ethereum-connect/token";
import {useRequest} from "@@/plugin-request/request";
import {EthereumChainId} from "@/utils/utils";
import Web3 from "web3";
import {ERC20Connect} from "@/services/ethereum-connect/erc20";
import {PageLoading} from "@ant-design/pro-layout";

type TokenInfo = {
  name: string;
  lpPool: string;
}

type TokenToSelect = {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
}

type TokenToSelects = {
  logoURI: string;
  name: string;
  timestamp: string;
  tokens: TokenToSelect[];
  version: {
    major: number; minor: number; patch: number;
  }
}

const getCoinGecko = async (network: string) => {
  const tokenList: TokenToSelects = await request(
    "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json",
  )
  const chainId = EthereumChainId[network];
  return tokenList.tokens.filter((t) => t.chainId === chainId);
}

const TokenCreateLP: React.FC<TokenConfigComponentsProps> = ({tokenAddress}) => {
  const intl = useIntl();
  const {metamaskProvider, network} = useModel("useWalletModel");
  const [formData, setFormData] = useState<ETH_CONNECT.CreateLP>({
    baseTokenAmount: 0, quoteTokenAmount: 0, quoteTokenAddress: '', fee: 500, tickLower: 0, tickUpper: 0, sqrtPriceX96: 0
  });
  const [loadingTransferComplete, setLoadingTransferComplete] = useState<boolean>(false);
  const [quoteTokenSelectValue, setQuoteTokenSelectValue] = useState<string>('');
  const [quoteTokenSelectList, setQuoteTokenSelectList] = useState<TokenToSelect[]>([]);
  const [coinGeckoList, setCoinGeckoList] = useState<TokenToSelect[]>([]);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({name: '', lpPool: ''});
  const tokenContract = useMemo(() => {
    if (tokenAddress && tokenAddress !== ZeroAddress) {
      return new DAOTokenConnect(tokenAddress, network, metamaskProvider)
    }
    return undefined;
  }, [metamaskProvider, network, tokenAddress]);
  useRequest(async () => {
    if (tokenContract) {
      setTokenInfo({
        name: await tokenContract.getTokenName(),
        lpPool: await tokenContract.getLPPool()
      })
    }
  })
  useMemo(async () => {
    setCoinGeckoList(await getCoinGecko(network))
  }, [network])
  useMemo(async () => {
    setQuoteTokenSelectList(coinGeckoList)
  }, [coinGeckoList])
  const handlerQuoteTokenSearch = useCallback(async (value) => {
    if (!value) setQuoteTokenSelectList(coinGeckoList);
    const rt = coinGeckoList.filter((v) => v.name === value || v.address === value);
    if (rt.length > 0) setQuoteTokenSelectList([rt[0]]);
    else if(Web3.utils.isAddress(value)) {
      const erc20 = new ERC20Connect(value, network, metamaskProvider);
      const name = await erc20.getTokenName()
      const symbol = await erc20.getTokenSymbol()
      setQuoteTokenSelectList([{
        address: value,
        chainId: 0,
        decimals: 18,
        logoURI: '',
        name,
        symbol
      }])
    } else setQuoteTokenSelectList([]);
  }, [coinGeckoList, metamaskProvider, network]);
  if (!!tokenAddress || !!tokenInfo.lpPool) {
    return <PageLoading />;
  }
  if (tokenAddress === ZeroAddress) {
    return <>
      <Alert
        message="Warning"
        description={intl.formatMessage({id: "pages.dao.config.tab.token.create_pool.notfound"})}
        type="warning"
        showIcon
      />
    </>
  }

  if (tokenInfo.lpPool !== ZeroAddress) {
    return <>
      <Alert
        message="Info"
        description={intl.formatMessage({id: "pages.dao.config.tab.token.create_pool.existed"})}
        type="info"
        showIcon
      />
    </>
  }
  return <>
    <Spin
      tip={intl.formatMessage({ id: 'pages.dao.config.tab.token.create_pool.loading' })}
      spinning={loadingTransferComplete}
    >
      <Form layout={"vertical"} name={'tokenCreateLP'}>
        <Space>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create_pool.form.base_token' })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.base_token.desc',
            })}
          >
            <Input disabled={true} defaultValue={tokenInfo.name} />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.create_pool.form.quote_token' })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.create_pool.form.quote_token.desc',
            })}
          >
            <Select
              showSearch
              value={quoteTokenSelectValue}
              placeholder={intl.formatMessage({ id: 'pages.dao.config.tab.token.create_pool.form.quote_token.pla' })}
              defaultActiveFirstOption={false}
              optionLabelProp={'tokenName'}
              filterOption={false}
              onSearch={handlerQuoteTokenSearch}
              onChange={setQuoteTokenSelectValue}
              style={{width: '300px'}}
            >
              {quoteTokenSelectList.map((t) => <Select.Option value={t.address} tokenName={t.name}>
                <Space>
                  <Avatar src={t.logoURI} />
                  <Space direction={"vertical"}>
                    <div>{t.symbol}</div>
                    <div>{t.name}</div>
                  </Space>
                </Space>
              </Select.Option>)}
            </Select>
          </Form.Item>
        </Space>
      </Form>
    </Spin>
  </>

};

export default TokenCreateLP;
