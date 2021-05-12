import type { TooltipProps } from 'antd/es/tooltip';
import {Tooltip} from 'antd';
import React from 'react';
import IconFont from "@/components/IconFont";

const GlobalTooltip: React.FC<TooltipProps> = ({ title, ...restProps }) => (
  <Tooltip placement="right"
           title={title}
           {...restProps}
  >
    <IconFont type={'icon-question'}/>
  </Tooltip>
);

export default GlobalTooltip;
