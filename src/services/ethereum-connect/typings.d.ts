import type { DAOFactoryConnect } from './factory';
import type { DAOStakingConnect } from './staking';

export type ETHConnect = {
  network: string;
  contract: {
    daoFactory: DAOFactoryConnect;
    daoStaking: DAOStakingConnect;
  };
};

declare namespace ETH_CONNECT {
  type TokenGenesis = {
    address: string;
    value: number;
  };
  type CreateToken = {
    ethDAOId: string;
    genesis?: TokenGenesis[];
    lpRatio?: number;
    ownerAddress?: string;
    mintArgs?: {
      aNumerator?: number;
      aDenominator?: number;
      bNumerator?: number;
      bDenominator?: number;
      c?: number;
      d?: number;
      p?: number;
    };
    tokenName?: string;
    tokenSymbol?: string;
    mintChangeDays?: number;
    mintValue?: number;
    mintChangeValue?: number;
    mode?: string;
  };
}
