import { useMemo } from 'react';
import { useUniswapV3TokenListQuery } from '@/services/uniswap-v3/generated';
import type { Maybe, TokenIncomeSchema } from '@/services/dao/generated';

export function useTokenPrice(incomes: Maybe<TokenIncomeSchema>[]) {
  const tokens = useMemo(() => {
    const ts: string[] = [];
    incomes.forEach((ins) => {
      if (ins?.tokenAddress && !ts.includes(ins.tokenAddress)) ts.push(ins.tokenAddress);
    });
    return ts;
  }, [incomes]);

  const { data: uniswapV3TokenData } = useUniswapV3TokenListQuery({
    variables: { tokenIds: tokens },
  });

  const tokenPrice: Record<string, number> = useMemo(() => {
    const obj = {};
    uniswapV3TokenData?.tokens.forEach((ts) => {
      obj[ts.id] = ts.volumeUSD / ts.volume;
    });
    return obj;
  }, [uniswapV3TokenData?.tokens]);

  return { tokenPrice };
}
