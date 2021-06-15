import React, { useCallback, useState } from 'react';
import type { TablePaginationConfig } from 'antd';
import { Avatar, Button, Space, Table, InputNumber, message } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import { FormattedMessage } from 'umi';
import type { DaoCycleProps } from '@/pages/Dao/components/cycle/index';
import type {
  CycleIcpperListQueryVariables,
  IcpperStatQuery,
  OwnerCycleIcpperListQueryVariables,
} from '@/services/dao/generated';
import {
  CycleIcpperStatSortedEnum,
  CycleIcpperStatSortedTypeEnum,
  useCycleIcpperListQuery,
  useOwnerCycleIcpperListQuery,
  useUpdateOwnerEiMutation,
} from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { UserOutlined, ControlTwoTone, ExclamationCircleTwoTone } from '@ant-design/icons';
import { history } from '@@/core/history';
import { getCurrentPage, getEIColor } from '@/utils/utils';

const ownerColumns = (
  daoId: string,
  currentEditing: string,
  updateOwnerEI: (ownerEI: number) => void,
  beginOrEndEditing: (recordId: string) => void,
) => {
  return [
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.icpper" />,
      dataIndex: ['icpper'],
      render: (_: any, record: IcpperStatQuery) => (
        <Space size="middle">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>
            <a
              onClick={(event) => {
                event.preventDefault();
                history.push(`/job?userName=${record.icpper?.githubLogin}&daoId=${daoId}`);
              }}
            >
              {record.icpper?.nickname}
            </a>
          </span>
        </Space>
      ),
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.job" />,
      dataIndex: ['datum', 'jobCount'],
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.size" />,
      dataIndex: ['datum', 'size'],
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.income" />,
      dataIndex: 'income',
      render: () => '-',
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.ie" />,
      dataIndex: ['datum', 'ei'],
      render: (_: any, record: IcpperStatQuery) => {
        if (!record?.datum?.voteEi) return <></>;

        let ownerEI;
        if (currentEditing === record.datum.id) {
          ownerEI = (
            <InputNumber
              size="small"
              precision={1}
              min={-0.2}
              max={0.2}
              step={0.1}
              defaultValue={record.datum.ownerEi || 0}
              readOnly
              autoFocus
              onChange={(value) => updateOwnerEI(value)}
            />
          );
        } else {
          if (record.datum.ownerEi && record.datum.ownerEi > 0) {
            ownerEI = <span style={{ color: '#2CA103' }}>+{record.datum?.ownerEi}</span>;
          }
          if (record.datum.ownerEi && record.datum.ownerEi < 0) {
            ownerEI = <span style={{ color: '#ED6C6C' }}>-{-record.datum?.ownerEi}</span>;
          }
        }
        return (
          <>
            <span style={{ color: getEIColor(record.datum.voteEi) }}>{record.datum?.voteEi}</span>
            {ownerEI}
            <ControlTwoTone onClick={() => beginOrEndEditing(record.datum?.id || '')} />
          </>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.last_ie" />,
      dataIndex: 'lastEi',
      render: (_: any, record: IcpperStatQuery) => {
        if (!record?.lastEi) return <></>;
        return (
          <>
            <span style={{ color: getEIColor(record.lastEi) }}>{record.lastEi}</span>
          </>
        );
      },
    },
  ];
};

const columns = (daoId: string) => {
  return [
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.icpper" />,
      dataIndex: ['icpper'],
      render: (_: any, record: IcpperStatQuery) => (
        <Space size="middle">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>
            <a
              onClick={(event) => {
                event.preventDefault();
                history.push(`/job?userName=${record.icpper?.githubLogin}&daoId=${daoId}`);
              }}
            >
              {record.icpper?.nickname}
            </a>
          </span>
        </Space>
      ),
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.job" />,
      dataIndex: ['datum', 'jobCount'],
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.size" />,
      dataIndex: ['datum', 'size'],
      render: (_: any, record: IcpperStatQuery) => (
        <>
          {record.datum?.size}
          {record.datum?.size && record.datum?.size >= 1.2 && (
            <ExclamationCircleTwoTone twoToneColor={'#2CA103'} />
          )}
          {record.datum?.size && record.datum?.size <= 0.8 && record.datum?.size > 0.4 && (
            <ExclamationCircleTwoTone twoToneColor={'#F1C84C'} />
          )}
          {record.datum?.size && record.datum?.size <= 0.4 && (
            <ExclamationCircleTwoTone twoToneColor={'#ED6C6C'} />
          )}
        </>
      ),
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.income" />,
      dataIndex: 'income',
      render: () => '-',
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.ie" />,
      dataIndex: ['datum', 'ei'],
      render: (_: any, record: IcpperStatQuery) => {
        if (!record?.datum?.ei) return <>-</>;
        return (
          <>
            <span style={{ color: getEIColor(record.datum.ei) }}>{record.datum?.ei}</span>
          </>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.dao.component.dao_cycle_icpper.table.head.last_ie" />,
      dataIndex: 'lastEi',
      render: (_: any, record: IcpperStatQuery) => {
        if (!record?.lastEi) return <></>;
        return (
          <>
            <span style={{ color: getEIColor(record.lastEi) }}>{record.lastEi}</span>
          </>
        );
      },
    },
  ];
};

export const OwnerDaoCycleIcpper: React.FC<DaoCycleProps> = ({ cycleId, daoId }) => {
  const intl = useIntl();
  const [queryVariable, setQueryVariable] = useState<OwnerCycleIcpperListQueryVariables>({
    cycleId,
    first: 20,
    offset: 0,
  });
  const [editingRow, setEditingRow] = useState<string>();
  const [editingOwnerEI, setEditingOwnerEI] = useState<number | undefined>();
  const { data, loading, error, refetch } = useOwnerCycleIcpperListQuery({
    variables: queryVariable,
  });
  const [updateOwnerEiMutation] = useUpdateOwnerEiMutation();
  const beginOrEndEditing = useCallback(
    async (recordId: string) => {
      if (editingRow === recordId) {
        if (editingOwnerEI !== undefined) {
          try {
            await updateOwnerEiMutation({
              variables: { statId: recordId, ownerEi: editingOwnerEI },
            });
            await refetch();
          } catch (e) {
            message.error('Update Owner EI Failed');
          }
        }
        setEditingRow('');
      } else {
        setEditingRow(recordId);
        setEditingOwnerEI(undefined);
      }
    },
    [editingOwnerEI, editingRow, refetch, updateOwnerEiMutation],
  );
  const changeEditingOwnerEI = useCallback((ownerEI: number) => {
    setEditingOwnerEI(ownerEI);
  }, []);
  const tableChange = useCallback((pagination: TablePaginationConfig, sorter: any) => {
    let sorted: CycleIcpperStatSortedEnum | undefined;
    if (sorter && sorter.field && sorter.field.includes('size')) {
      sorted = CycleIcpperStatSortedEnum.Size;
    }
    if (sorter && sorter.field && sorter.field.includes('income')) {
      sorted = CycleIcpperStatSortedEnum.Income;
    }
    if (sorter && sorter.field && sorter.field.includes('jobCount')) {
      sorted = CycleIcpperStatSortedEnum.JobCount;
    }
    let sortedType: CycleIcpperStatSortedTypeEnum | undefined;
    if (sorter && sorter.order === 'ascend') {
      sortedType = CycleIcpperStatSortedTypeEnum.Asc;
    }
    if (sorter && sorter.order === 'descend') {
      sortedType = CycleIcpperStatSortedTypeEnum.Desc;
    }
    setQueryVariable((old) => ({
      ...old,
      first: pagination.pageSize,
      offset: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
      sorted,
      sortedType,
    }));
    setEditingRow('');
    setEditingOwnerEI(undefined);
  }, []);
  if (loading || error) {
    return <PageLoading />;
  }

  return (
    <>
      <Button type="primary" size="large">
        {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.button.publish' })}
      </Button>

      <Table<IcpperStatQuery>
        columns={ownerColumns(
          daoId || '',
          editingRow || '',
          changeEditingOwnerEI,
          beginOrEndEditing,
        )}
        loading={loading}
        rowKey={(record) => record?.datum?.id || ''}
        dataSource={data?.cycle?.icpperStats?.nodes as any}
        onChange={(pagination, filters, sorter) => {
          tableChange(pagination, sorter);
        }}
        pagination={{
          pageSize: 10,
          total: data?.cycle?.icpperStats?.total || 0,
          current: getCurrentPage(queryVariable.offset || 0, 10),
        }}
      />
    </>
  );
};

export const DaoCycleIcpper: React.FC<DaoCycleProps> = ({ cycleId, daoId }) => {
  const intl = useIntl();
  const [queryVariable, setQueryVariable] = useState<CycleIcpperListQueryVariables>({
    cycleId,
    first: 20,
    offset: 0,
  });
  const { data, loading, error } = useCycleIcpperListQuery({ variables: queryVariable });

  const tableChange = useCallback((pagination: TablePaginationConfig, sorter: any) => {
    let sorted: CycleIcpperStatSortedEnum | undefined;
    if (sorter && sorter.field && sorter.field.includes('size')) {
      sorted = CycleIcpperStatSortedEnum.Size;
    }
    if (sorter && sorter.field && sorter.field.includes('income')) {
      sorted = CycleIcpperStatSortedEnum.Income;
    }
    if (sorter && sorter.field && sorter.field.includes('jobCount')) {
      sorted = CycleIcpperStatSortedEnum.JobCount;
    }
    let sortedType: CycleIcpperStatSortedTypeEnum | undefined;
    if (sorter && sorter.order === 'ascend') {
      sortedType = CycleIcpperStatSortedTypeEnum.Asc;
    }
    if (sorter && sorter.order === 'descend') {
      sortedType = CycleIcpperStatSortedTypeEnum.Desc;
    }
    setQueryVariable((old) => ({
      ...old,
      first: pagination.pageSize,
      offset: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
      sorted,
      sortedType,
    }));
  }, []);

  if (loading || error) {
    return <PageLoading />;
  }

  return (
    <>
      <Button type="primary" size="large">
        {intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.button.publish' })}
      </Button>

      <Table<IcpperStatQuery>
        columns={columns(daoId || '')}
        loading={loading}
        rowKey={(record) => record?.datum?.id || ''}
        dataSource={data?.cycle?.icpperStats?.nodes as any}
        onChange={(pagination, filters, sorter) => {
          tableChange(pagination, sorter);
        }}
        pagination={{
          pageSize: 10,
          total: data?.cycle?.icpperStats?.total || 0,
          current: getCurrentPage(queryVariable.offset || 0, 10),
        }}
      />
    </>
  );
};
