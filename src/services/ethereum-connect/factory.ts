import { BaseEthereumConnect, DAOFactoryContract, ZeroAddress } from './index';
import type { ETH_CONNECT } from './typings';
import type { BigNumber } from 'ethers';
import { ethers } from 'ethers';

export class DAOFactoryConnect extends BaseEthereumConnect {
  constructor(network: string, metamaskProvider: any) {
    super(network, metamaskProvider);
    console.log({ network, metamaskProvider });
    this.contract = DAOFactoryContract(this.provider);
    this.actionContract = DAOFactoryContract(this.metamaskProvider);
  }

  async getTokenAddress(ethDAOId: string) {
    console.log({ ethDAOId });
    // cause different network, so, should try/catch this place
    try {
      return await this.contract.tokens(ethDAOId);
    } catch (e) {
      return ZeroAddress;
    }
  }

  async createToken(body: ETH_CONNECT.CreateToken) {
    const genesisTokenAddressList: string[] = [];
    const genesisTokenAmountList: BigNumber[] = [];
    if (body.genesis && body.genesis.length > 0) {
      body.genesis.forEach((g) => {
        genesisTokenAddressList.push(g.address);
        genesisTokenAmountList.push(ethers.utils.parseUnits(g.value.toString(), 18));
      });
    }
    const mintArgs = body.mintArgs || {};
    if (body.mode === 'normal') {
      mintArgs.aDenominator = 10;
      mintArgs.aNumerator = (body.mintChangeValue || 0) * 10;
      mintArgs.bDenominator = body.mintChangeDays;
      mintArgs.bNumerator = 1;
      mintArgs.p = body.mintValue;
      mintArgs.c = 0;
      mintArgs.d = 0;
    }
    const signer = this.metamaskProvider.getSigner();
    const contractWithSigner = this.actionContract.connect(signer);
    return await contractWithSigner.deploy(
      body.ethDAOId,
      genesisTokenAddressList,
      genesisTokenAmountList,
      body.lpRatio,
      body.ownerAddress,
      {
        p: mintArgs.p,
        aNumerator: mintArgs.aNumerator,
        aDenominator: mintArgs.aDenominator,
        bNumerator: mintArgs.bNumerator,
        bDenominator: mintArgs.bDenominator,
        c: mintArgs.c,
        d: mintArgs.d,
      },
      body.tokenName,
      body.tokenSymbol,
    );
  }
}
