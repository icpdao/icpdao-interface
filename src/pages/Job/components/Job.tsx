import React, { useCallback, useState } from 'react';
import {
  DatePicker,
  TimePicker,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Table,
  Typography,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import styles from './index.less';
import StatCard from '@/components/StatCard';

type TabJobProps = {
  orgName?: string;
};

const { Option } = Select;

interface PR {
  id: string;
  title: string;
}

interface Item {
  id: string;
  title: string;
  size: number;
  prs: PR[];
  status: string;
  income: string;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const originData: Item[] = [];

for (let i = 0; i < 100; i += 1) {
  originData.push({
    id: i.toString(),
    title: `Edrward ${i}`,
    size: 32,
    prs: [],
    status: 'wait',
    income: '236',
  });
}

function PickerWithType({ type, onChange }: any) {
  if (type === 'time') return <TimePicker onChange={onChange} />;
  if (type === 'date') return <DatePicker onChange={onChange} />;
  return <DatePicker picker={type} onChange={onChange} />;
}

const TabJob: React.FC<TabJobProps> = ({ orgName }) => {
  const [form] = Form.useForm();
  const [searchOrgName, setSearchOrgName] = useState<string>(orgName || '');
  const [searchDate, setSearchDate] = useState<string>('date');
  const [editingRowId, setEditingRowId] = useState<string>('');
  const [tableData] = useState(originData);
  const cancel = () => {
    setEditingRowId('');
  };
  const isEditing = useCallback((record: Item) => record.id === editingRowId, [editingRowId]);
  const edit = (record: Partial<Item>) => {
    form.setFieldsValue({ ...record });
    setEditingRowId(record.id || '');
  };
  const data = [
    { id: '1', name: 'ICPDAO' },
    { id: '2', name: 'SIBBAY' },
    { id: '3', name: 'UNISWAP' },
    { id: '4', name: 'GITCOIN' },
  ];
  const stat = [
    {
      number: 24325,
      title: 'Job',
    },
    {
      number: 24325,
      title: 'Size',
    },
    {
      number: 24325,
      title: 'SHT',
    },
  ];

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      editable: true,
    },
    {
      title: 'Github Pr',
      dataIndex: 'prs',
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
    {
      title: 'Income',
      dataIndex: 'income',
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_: any, record: Item) => {
        const editing = isEditing(record);
        return editing ? (
          <span>
            <a onClick={() => setEditingRowId(record.id)} style={{ marginRight: 8 }}>
              Save
            </a>
          </span>
        ) : (
          <Typography.Link disabled={editingRowId !== ''} onClick={() => edit(record)}>
            <EditOutlined />
          </Typography.Link>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: col.dataIndex === 'size' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleSearch = async () => {};
  const handleSearchOrgName = async () => {};

  return (
    <>
      <Form form={form} key={'searchForm'} layout="inline" onFinish={handleSearch}>
        <Form.Item name="orgName" className={styles.searchOrgNameSelect}>
          <Select
            showSearch
            value={searchOrgName}
            filterOption={false}
            onSearch={handleSearchOrgName}
            onChange={setSearchOrgName}
            notFoundContent={null}
          >
            {data.map((d) => (
              <Option key={d.id} value={d.id}>
                {d.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item className={styles.searchDateTypeSelect}>
          <Select value={searchDate} onChange={setSearchDate}>
            <Option value="date">Date</Option>
            <Option value="week">Week</Option>
            <Option value="month">Month</Option>
            <Option value="quarter">Quarter</Option>
            <Option value="year">Year</Option>
          </Select>
        </Form.Item>
        <Form.Item className={styles.searchDateSelect}>
          <PickerWithType type={searchDate} onChange={(value: any) => console.log(value)} />
        </Form.Item>
      </Form>
      <div className={styles.statCard}>
        <StatCard data={stat} />
      </div>
      <Form
        form={form}
        key={'markForm'}
        className={styles.markForm}
        layout="inline"
        onFinish={handleSearch}
      >
        <Form.Item name="issueLink" className={styles.markIssueLink}>
          <Input />
        </Form.Item>
        <Form.Item
          className={styles.markSize}
          name="size"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            MARK
          </Button>
        </Form.Item>
      </Form>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={tableData}
          columns={mergedColumns}
          pagination={{
            onChange: cancel,
          }}
        />
      </Form>
    </>
  );
};

export default TabJob;
