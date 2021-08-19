import {BaseEthereumConnect, ERC20Contract} from './index';
import {Token} from "@uniswap/sdk-core";
import { MaxUint256 } from '@ethersproject/constants';

export class ERC20Connect extends BaseEthereumConnect {
  tokenAddress: string;

  constructor(tokenAddress: string, network: string, metamaskProvider: any) {
    super(network, metamaskProvider);
    this.contract = ERC20Contract(tokenAddress, this.provider);
    this.actionContract = ERC20Contract(tokenAddress, this.metamaskProvider);
    this.tokenAddress = tokenAddress;
  }

  async getToken() {
    return new Token(
      this.chainId, this.tokenAddress, await this.getTokenDecimals(),
      await this.getTokenSymbol(), await this.getTokenName(),
    )
  }

  async getTokenName() {
    return await this.contract.name();
  }

  async getTokenSymbol() {
    return await this.contract.symbol();
  }

  async getTokenDecimals() {
    return await this.contract.decimals();
  }

  async getAllowance(owner: string, spender: string) {
    return await this.contract.allowance(owner, spender);
  }

  async getBalanceOf(account: string) {
    return await this.contract.balanceOf(account);
  }

  async approve(spender: string) {
    const signer = this.metamaskProvider.getSigner();
    const contractWithSigner = this.actionContract.connect(signer);
    return await contractWithSigner.approve(spender, MaxUint256)
  }
}
