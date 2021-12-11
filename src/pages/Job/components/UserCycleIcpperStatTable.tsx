import React, { useCallback, useMemo, useState } from 'react';
import type { IcpperStatQuery } from '@/services/dao/generated';
import { useUserCycleIcpperStatListQuery } from '@/services/dao/generated';

import type { TablePaginationConfig } from 'antd';
import { Table } from 'antd';
import { FormattedMessage } from 'umi';
import { useIntl } from '@@/plugin-locale/localeExports';
import { getFormatTime } from '@/utils/utils';
import { renderEi, renderSize } from '@/utils/pageHelper';
import { useTokenPrice } from '@/pages/Dao/hooks/useTokenPrice';
import IncomesPopover from '@/components/IncomesPopover';
import { useWallet } from '@/hooks/useWallet';
import { useWeb3React } from '@web3-react/core';

interface UserCycleIcpperStatTableProps {
  userName?: string;
  daoName?: string;
}

const pageSize = 10;

const UserCycleIcpperStatTable: React.FC<UserCycleIcpperStatTableProps> = ({
  userName,
  daoName,
}) => {
  const intl = useIntl();
  const [refetchloading, setRefetchloading] = useState(false);

  const { queryChainId } = useWallet(useWeb3React());

  const { data, refetch, loading } = useUserCycleIcpperStatListQuery({
    variables: {
      userName: userName || '',
      daoName: daoName || '',
      first: pageSize,
      offset: 0,
    },
  });

  const allIncomes = useMemo(() => {
    const res: any[] = [];
    data?.icpperStats?.nodes?.forEach((item) => {
      item?.datum?.incomes?.forEach((income) => {
        res.push(income);
      });
    });
    return res;
  }, [data?.icpperStats?.nodes]);

  const { tokenPrice } = useTokenPrice(allIncomes || []);

  const columns = useMemo(() => {
    return [
      {
        title: <FormattedMessage id="pages.job.cycle.table.head.cycle" />,
        width: '270px',
        render: (_: any, record: IcpperStatQuery) => {
          return <div>{getFormatTime(record.cycle?.beginAt || 0, 'LLL')}</div>;
        },
      },
      {
        title: <FormattedMessage id="pages.job.cycle.table.head.job" />,
        width: '270px',
        render: (_: any, record: IcpperStatQuery) => {
          return <div>{record.datum?.jobCount}</div>;
        },
      },
      {
        title: <FormattedMessage id="pages.job.cycle.table.head.size" />,
        width: '270px',
        render: (_: any, record: IcpperStatQuery) => {
          return renderSize(intl, record);
        },
      },
      {
        title: <FormattedMessage id="pages.job.cycle.table.head.income" />,
        width: '270px',
        render: (_: any, record: IcpperStatQuery) => (
          <IncomesPopover
            incomes={record.datum?.incomes || []}
            chainId={queryChainId}
            tokenPrice={tokenPrice}
          />
        ),
      },
      {
        title: <FormattedMessage id="pages.job.cycle.table.head.ei" />,
        width: '270px',
        render: (_: any, record: IcpperStatQuery) => {
          return renderEi(intl, record);
        },
      },
    ];
  }, [intl, tokenPrice, queryChainId]);

  const dataLoading = useMemo(() => {
    if (loading) {
      return loading;
    }
    if (refetchloading) {
      return refetchloading;
    }
    return false;
  }, [loading, refetchloading]);

  const tableChange = useCallback(
    async (pagination: TablePaginationConfig) => {
      setRefetchloading(true);
      await refetch({
        userName: userName || '',
        daoName: daoName || '',
        first: pagination.pageSize,
        offset: ((pagination.current || 1) - 1) * (pagination.pageSize || pageSize),
      });
      setRefetchloading(false);
    },
    [daoName, refetch, userName],
  );

  return (
    <>
      <Table<IcpperStatQuery>
        loading={dataLoading}
        rowKey={(record) => record?.datum?.id || ''}
        bordered
        dataSource={data?.icpperStats?.nodes as any}
        columns={columns}
        onChange={async (pagination) => {
          await tableChange(pagination);
        }}
        pagination={{
          pageSize,
          total: data?.icpperStats?.total || 0,
        }}
      />
    </>
  );
};

export default UserCycleIcpperStatTable;
