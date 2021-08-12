import { DAOTokenContract, getInfuraProvider, getMetamaskProvider } from './index';

export class DAOTokenConnect {
  provider: any;
  metamaskProvider: any;
  contract: any;
  actionContract: any;

  constructor(tokenAddress: string, network: string, metamaskProvider: any) {
    this.provider = getInfuraProvider(network);
    this.metamaskProvider = getMetamaskProvider(metamaskProvider);
    this.contract = DAOTokenContract(tokenAddress, this.provider);
    this.actionContract = DAOTokenContract(tokenAddress, this.metamaskProvider);
  }

  async getTokenName() {
    return await this.contract.name();
  }
}
