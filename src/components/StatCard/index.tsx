import type { ReactNode } from 'react';
import React from 'react';

import { Card } from 'antd';

import styles from '@/components/StatCard/index.less';

export type StatCardDataItem = {
  number: number;
  title: string;
};

export type StatCardProps = {
  data: StatCardDataItem[];
};

const StatCard: React.FC<StatCardProps> = ({ data }) => {
  const nodeList: ReactNode[] = [];
  data.forEach((item) => {
    nodeList.push(
      <Card.Grid hoverable={false} className={styles.statCard} key={item.title}>
        <div>
          <div className={styles.statCardNumber}>{item.number}</div>
          <div className={styles.statCardName}>{item.title}</div>
        </div>
      </Card.Grid>,
    );
  });
  return <Card className={styles.stat}>{nodeList}</Card>;
};

export default StatCard;