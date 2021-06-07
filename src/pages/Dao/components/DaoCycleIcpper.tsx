import React from 'react';
import { Button, Table } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import { FormattedMessage } from 'umi';

type DaoCycleIcpperProps = {
  daoId: string;
};

const columns = [
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.icpper" />,
    dataIndex: 'icpper',
    key: 'icpper',
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.job" />,
    dataIndex: 'job',
    key: 'job',
    sorter: true,
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.size" />,
    dataIndex: 'size',
    key: 'size',
    sorter: true,
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.income" />,
    dataIndex: 'income',
    key: 'income',
    sorter: true,
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.ie" />,
    dataIndex: 'ie',
    key: 'ie',
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.last_ie" />,
    dataIndex: 'lastIe',
    key: 'lastIe',
  },
];

const mockData = [
  {
    icpper: 'icpper',
    job: 1,
    size: 2,
    income: 3,
    ie: 0.9,
    lastIe: 1,
  },
];

const DaoCycleIcpper: React.FC<DaoCycleIcpperProps> = ({ daoId }) => {
  console.log(daoId);
  const intl = useIntl();
  const loading = false;

  return (
    <>
      <Button type="primary" size="large">
        {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.button.publish' })}
      </Button>

      <Table columns={columns} loading={loading} rowKey="icpper" dataSource={mockData} />
    </>
  );
};

export default DaoCycleIcpper;
