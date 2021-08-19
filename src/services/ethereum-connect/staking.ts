import {BaseEthereumConnect, DAOStakingContract, ERC20Contract} from "@/services/ethereum-connect/index";

export class DAOStakingConnect extends BaseEthereumConnect {
  constructor(network: string, metamaskProvider: any) {
    super(network, metamaskProvider);
    this.contract = DAOStakingContract(this.provider);
    this.actionContract = DAOStakingContract(this.metamaskProvider);
  }

  async getICPD() {
    return await this.contract.ICPD()
  }

  async getICPDBalance(icpd: string, account: string) {
    const icpdContract = ERC20Contract(icpd, this.provider)
    return await icpdContract.balanceOf(account)
  }

  async getUserInfo(account: string) {
    return await this.contract.userInfo(account)
  }

  async getBonus(account: string) {
    return await this.contract.bonus(account)
  }

  async deposit(amount: string, tokenList: string[]) {
    const signer = this.metamaskProvider.getSigner();
    const contractWithSigner = this.actionContract.connect(signer);
    return await contractWithSigner.deposit(amount, tokenList)
  }

  async withdraw(amount: string) {
    const signer = this.metamaskProvider.getSigner();
    const contractWithSigner = this.actionContract.connect(signer);
    return await contractWithSigner.withdraw(amount)
  }

  async addTokenList(tokenList: string[]) {
    const signer = this.metamaskProvider.getSigner();
    const contractWithSigner = this.actionContract.connect(signer);
    return await contractWithSigner.addTokenList(tokenList)
  }

  async removeTokenList(tokenList: string[]) {
    const signer = this.metamaskProvider.getSigner();
    const contractWithSigner = this.actionContract.connect(signer);
    return await contractWithSigner.removeTokenList(tokenList)
  }

  async bonusWithdraw(tokenList: string[]) {
    const signer = this.metamaskProvider.getSigner();
    const contractWithSigner = this.actionContract.connect(signer);
    return await contractWithSigner.bonusWithdraw(tokenList)
  }

}
