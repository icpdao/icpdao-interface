import React, { useCallback, useState } from 'react';
import type { DaoIcppersQueryVariables, IcpperQuery } from '@/services/dao/generated';
import {
  IcppersQuerySortedEnum,
  IcppersQuerySortedTypeEnum,
  useDaoIcppersQuery,
} from '@/services/dao/generated';
import { useIntl } from '@@/plugin-locale/localeExports';
import StatCard from '@/components/StatCard';
import { getCurrentPage, getFormatTime } from '@/utils/utils';
import type { TablePaginationConfig } from 'antd';
import { Avatar, Space, Table } from 'antd';
import { FormattedMessage } from 'umi';
import { UserOutlined } from '@ant-design/icons';
import { history } from '@@/core/history';
import styles from './index.less';
import { useTokenPrice } from '@/pages/Dao/hooks/useTokenPrice';
import { renderIncomes } from '@/utils/pageHelper';
import IncomesPopover from '@/components/IncomesPopover';
import { useWallet } from '@/hooks/useWallet';
import { useWeb3React } from '@web3-react/core';

type DaoIcpperStatProps = {
  daoId: string;
  tokenSymbol?: string;
};

const DaoIcpperStat: React.FC<DaoIcpperStatProps> = ({ daoId }) => {
  const intl = useIntl();
  const { queryChainId } = useWallet(useWeb3React());

  const [queryVariable, setQueryVariable] = useState<DaoIcppersQueryVariables>({
    daoId,
    sorted: IcppersQuerySortedEnum.JoinTime,
    sortedType: IcppersQuerySortedTypeEnum.Desc,
    first: 10,
    offset: 0,
    tokenChainId: queryChainId.toString(),
    // tokenChainId: "1",
  });
  const { data, loading } = useDaoIcppersQuery({ variables: queryVariable });
  const { tokenPrice } = useTokenPrice(data?.dao?.icppers?.stat?.incomes || []);

  const tableChange = useCallback((pagination: TablePaginationConfig, sorter: any) => {
    let sorted: IcppersQuerySortedEnum;
    if (sorter && sorter.field && sorter.field.includes('size')) {
      sorted = IcppersQuerySortedEnum.Size;
    }
    if (sorter && sorter.field && sorter.field.includes('income')) {
      sorted = IcppersQuerySortedEnum.Income;
    }
    if (sorter && sorter.field && sorter.field.includes('jobCount')) {
      sorted = IcppersQuerySortedEnum.JobCount;
    }
    if (sorter && sorter.field && sorter.field.includes('joinTime')) {
      sorted = IcppersQuerySortedEnum.JoinTime;
    }
    let sortedType: IcppersQuerySortedTypeEnum;
    if (sorter && sorter.order === 'ascend') {
      sortedType = IcppersQuerySortedTypeEnum.Asc;
    }
    if (sorter && sorter.order === 'descend') {
      sortedType = IcppersQuerySortedTypeEnum.Desc;
    }
    setQueryVariable((old) => ({
      ...old,
      first: pagination.pageSize || 10,
      offset: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
      sorted,
      sortedType,
    }));
  }, []);

  const columns = [
    {
      title: <FormattedMessage id="pages.dao.component.dao_icpper.table.head.icpper" />,
      render: (_: any, record: IcpperQuery) => (
        <Space size="middle">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>
            <a
              onClick={(event) => {
                event.preventDefault();
                history.push(`/job?userName=${record.user?.githubLogin}&daoId=${daoId}`);
              }}
            >
              {record.user?.nickname}
            </a>
          </span>
        </Space>
      ),
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_icpper.table.head.job" />,
      dataIndex: 'jobCount',
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_icpper.table.head.size" />,
      dataIndex: 'size',
      sorter: true,
      render: (_: any, record: IcpperQuery) => <>{parseFloat(record.size || '0').toFixed(1)}</>,
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_icpper.table.head.income" />,
      key: 'income',
      sorter: false,
      render: (_: any, record: IcpperQuery) => (
        <IncomesPopover
          incomes={record.incomes || []}
          chainId={queryChainId}
          tokenPrice={tokenPrice}
        />
      ),
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_icpper.table.head.join_time" />,
      dataIndex: 'joinTime',
      render: (_: any, record: IcpperQuery) => <>{getFormatTime(record.joinTime || 0, 'LL')}</>,
      sorter: true,
    },
  ];

  const statCardData = [
    {
      title: intl.formatMessage({ id: 'pages.dao.component.dao_icpper.stat.icpper' }),
      number: data?.dao?.icppers?.stat?.icpperCount || 0,
    },
    {
      title: intl.formatMessage({ id: 'pages.dao.component.dao_icpper.stat.job' }),
      number: data?.dao?.icppers?.stat?.jobCount || 0,
    },
    {
      title: intl.formatMessage({ id: 'pages.dao.component.dao_icpper.stat.size' }),
      number: parseFloat(data?.dao?.icppers?.stat?.size || '0').toFixed(1) || 0,
    },
    {
      title: intl.formatMessage({ id: 'component.card.stat.income' }),
      number: renderIncomes(data?.dao?.icppers?.stat?.incomes || [], tokenPrice),
    },
  ];
  const dataSource = data?.dao?.icppers?.nodes || [];
  return (
    <>
      <div className={styles.TabFirstDom}>
        <StatCard data={statCardData} />
      </div>
      <Table
        columns={columns}
        loading={loading}
        rowKey={(record) => record?.user?.id || ''}
        dataSource={dataSource as IcpperQuery[]}
        onChange={(pagination, filters, sorter) => tableChange(pagination, sorter)}
        pagination={{
          pageSize: queryVariable.first,
          total: data?.dao?.icppers?.total || 0,
          current: getCurrentPage(queryVariable.offset || 0, queryVariable.first),
        }}
      />
    </>
  );
};

export default DaoIcpperStat;
