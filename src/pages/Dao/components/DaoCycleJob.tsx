import React from 'react';
import { Button, Table } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import { FormattedMessage } from 'umi';

type DaoCycleJobProps = {
  daoId: string;
};

const columns = [
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.icpper" />,
    dataIndex: 'icpper',
    key: 'icpper',
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.job" />,
    dataIndex: 'job',
    key: 'job',
    sorter: true,
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.size" />,
    dataIndex: 'size',
    key: 'size',
    sorter: true,
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.income" />,
    dataIndex: 'income',
    key: 'income',
    sorter: true,
  },
  {
    title: <FormattedMessage id="pages.dao.component.dao_cycle_job.table.head.vote_type" />,
    dataIndex: 'voteType',
    key: 'voteType',
    filters: [
      { text: 'All Vote', value: 0 },
      { text: 'Pair Vote', value: 1 },
    ],
    filterMultiple: false,
    filteredValue: [0],
  },
];

const mockData = [
  {
    id: 1,
    icpper: 'icpper',
    job: 'xxx job title',
    size: 2,
    income: 3,
    voteType: 0,
  },
  {
    id: 2,
    icpper: 'icpper2',
    job: 'xxx job title 2',
    size: 3,
    income: 4,
    voteType: 1,
  },
];

const DaoCycleJob: React.FC<DaoCycleJobProps> = ({ daoId }) => {
  console.log(daoId);
  const intl = useIntl();
  const loading = false;

  return (
    <>
      <Button type="primary" size="large">
        {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_job.button.pair' })}
      </Button>

      <Table columns={columns} loading={loading} rowKey="id" dataSource={mockData} />
    </>
  );
};

export default DaoCycleJob;
