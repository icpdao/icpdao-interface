import {ERC20Contract, getInfuraProvider, getMetamaskProvider} from './index';

export class ERC20Connect {
  provider: any;
  metamaskProvider: any;
  contract: any;
  actionContract: any;

  constructor(tokenAddress: string, network: string, metamaskProvider: any) {
    this.provider = getInfuraProvider(network);
    this.metamaskProvider = getMetamaskProvider(metamaskProvider);
    this.contract = ERC20Contract(tokenAddress, this.provider);
    this.actionContract = ERC20Contract(tokenAddress, this.metamaskProvider);
  }

  async getTokenName() {
    return await this.contract.name();
  }

  async getTokenSymbol() {
    return await this.contract.symbol();
  }

  async approve() {}
}
