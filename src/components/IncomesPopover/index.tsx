import { Popover, Tag } from 'antd';
import type { Maybe, TokenIncomeSchema } from '@/services/dao/generated';
import * as React from 'react';
import { EthereumNetworkById } from '@/utils/utils';
import { renderIncomes } from '@/utils/pageHelper';

type IncomesPopoverProps = {
  incomes: Maybe<TokenIncomeSchema>[];
  chainId: number;
  tokenPrice: Record<string, number>;
};

const genContentByIncomes = (
  incomes: Maybe<TokenIncomeSchema>[],
  chainId: number,
  tokenPrice: Record<string, number>,
) => {
  const networkTag =
    chainId === 1 ? <></> : <Tag color={'magenta'} children={EthereumNetworkById[chainId]} />;
  return (
    <>
      {incomes.map((income) => {
        return (
          <div key={income?.tokenAddress}>
            {networkTag}
            {`${income?.tokenSymbol} ${renderIncomes([income], tokenPrice)}`}
          </div>
        );
      })}
    </>
  );
};

const IncomesPopover: React.FC<IncomesPopoverProps> = ({ incomes, chainId, tokenPrice }) => {
  if (incomes.length === 0) return <>{renderIncomes(incomes, tokenPrice)}</>;
  return (
    <Popover
      content={genContentByIncomes(incomes, chainId, tokenPrice)}
      trigger={'hover'}
      placement={'right'}
    >
      {renderIncomes(incomes, tokenPrice)}
    </Popover>
  );
};

export default IncomesPopover;
