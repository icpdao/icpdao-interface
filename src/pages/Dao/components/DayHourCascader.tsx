import type { CascaderProps } from 'antd/es/cascader';
import { Cascader } from 'antd';
import React from 'react';
import { getDaysHours } from '@/utils/utils';

const dayHoursOptions = getDaysHours();

type DayHourCascaderProps = Omit<CascaderProps, 'options'>;

const DayHourCascader: React.FC<DayHourCascaderProps> = ({ displayRender, ...restProps }) => (
  <Cascader
    allowClear={false}
    {...restProps}
    options={dayHoursOptions}
    displayRender={(label) => `${label[0]} ${label[1]}:00`}
  />
);

export default DayHourCascader;
