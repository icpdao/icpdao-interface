import { DAOTokenContract } from './index';
import { ERC20Connect } from '@/services/ethereum-connect/erc20';
import { ETH_CONNECT } from '@/services/ethereum-connect/typings';
import { WETH9 } from '@uniswap/sdk-core';

export class DAOTokenConnect extends ERC20Connect {
  constructor(tokenAddress: string, network: string, metamaskProvider: any) {
    super(tokenAddress, network, metamaskProvider);
    this.contract = DAOTokenContract(tokenAddress, this.provider);
    this.actionContract = DAOTokenContract(tokenAddress, this.metamaskProvider);
  }

  async getLPPool() {
    return await this.contract.lpPool();
  }

  async getTemporaryAmount() {
    return await this.contract.temporaryAmount();
  }

  async getManagers() {
    return await this.contract.managers();
  }

  async getMintAnchor() {
    return await this.contract.mintAnchor();
  }

  async createLPPoolOrLinkLPPool(body: ETH_CONNECT.CreateLPPool) {
    const signer = this.metamaskProvider.getSigner();
    const contractWithSigner = this.actionContract.connect(signer);
    console.log({ body });
    let value = '0';
    if (WETH9[this.chainId].address === body.quoteTokenAddress) {
      value = body.quoteTokenAmount;
    }
    return await contractWithSigner.createLPPoolOrLinkLPPool(
      body.baseTokenAmount,
      body.quoteTokenAddress,
      body.quoteTokenAmount,
      body.fee,
      body.tickLower,
      body.tickUpper,
      body.sqrtPriceX96,
      { value },
    );
  }

  async updateLPPool(body: ETH_CONNECT.AddLP) {
    const signer = this.metamaskProvider.getSigner();
    const contractWithSigner = this.actionContract.connect(signer);
    console.log({ body });
    return await contractWithSigner.updateLPPool(
      body.baseTokenAmount,
      body.tickLower,
      body.tickUpper,
    );
  }

  async addManager(managerAddress: string) {
    const signer = this.metamaskProvider.getSigner();
    const contractWithSigner = this.actionContract.connect(signer);
    return await contractWithSigner.addManager(managerAddress);
  }

  async removeManager(managerAddress: string) {
    const signer = this.metamaskProvider.getSigner();
    const contractWithSigner = this.actionContract.connect(signer);
    return await contractWithSigner.removeManager(managerAddress);
  }

  async mint(body: ETH_CONNECT.Mint) {
    const signer = this.metamaskProvider.getSigner();
    const contractWithSigner = this.actionContract.connect(signer);
    console.log(body);
    console.log([
      body.mintTokenAddressList,
      body.mintTokenAmountRatioList,
      body.startTimestamp,
      body.endTimestamp,
      body.tickLower,
      body.tickUpper,
    ]);
    return await contractWithSigner.mint(
      body.mintTokenAddressList,
      body.mintTokenAmountRatioList,
      body.startTimestamp.toString(),
      body.endTimestamp.toString(),
      body.tickLower,
      body.tickUpper,
    );
  }
}
