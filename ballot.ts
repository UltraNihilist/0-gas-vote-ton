import { Contract, ContractProvider, Sender, Address, Cell, contractAddress, beginCell } from "ton-core";

export default class Ballot implements Contract {

  static createForDeploy(code: Cell, initialValue: number): Ballot {
    const data = beginCell()
      .storeUint(initialValue, 64)
      .storeUint(initialValue, 64)
      .storeUint(initialValue, 64)
      .storeUint(initialValue, 8)
      .storeUint(initialValue, 256)
      .storeRef(beginCell()
                .storeInt(0xA, 257)
                .storeUint(0xA, 256)
                .storeUint(0xA, 256)
                .storeUint(0xA, 8)
                .endCell())
      .endCell();
    const workchain = 0; // deploy to workchain 0
    const address = contractAddress(workchain, { code, data });
    return new Ballot(address, { code, data });
  }

  constructor(readonly address: Address, readonly init?: { code: Cell, data: Cell }) {}

  async sendDeploy(provider: ContractProvider, via: Sender) {
    await provider.internal(via, {
      value: "0.15", // send 0.15 TON to contract for rent
      bounce: false
    });
  }

  async getYesCount(provider: ContractProvider) {
    const { stack } = await provider.get("get_yes_count", []);
    return stack.readBigNumber();
  }

  async getNoCount(provider: ContractProvider) {
    const { stack } = await provider.get("get_no_count", []);
    return stack.readBigNumber();
  }

  async getVotersCount(provider: ContractProvider) {
    const { stack } = await provider.get("get_voters_count", []);
    return stack.readBigNumber();
  }

  async getVotingResult(provider: ContractProvider) {
    const { stack } = await provider.get("get_voting_result", []);
    return stack.readBigNumber();
  }

  async getWPH(provider: ContractProvider) {
    const { stack } = await provider.get("get_wph", []);
    return stack.readBigNumber();
  }

  async getY(provider: ContractProvider) {
    const { stack } = await provider.get("get_y", []);
    return stack.readCell();
  }

  async sendVoteYes(provider: ContractProvider, via: Sender) {
    const messageBody = beginCell()
      .storeUint(1, 32) // op (op #1 = yes)
      .storeUint(0, 64) // query id
      .storeUint(0x1f, 8) // v
      .storeUint(0x795fa121486c650d257a68dcd7fa4fc91b3d4e0241577aa4d71729c96a0b8e80, 256) // r
      .storeUint(0x6142918882610d8ceec6156a9395029236b33e342b404327004022101ed96f3b, 256) // s
      .endCell();
    await provider.internal(via, {
      value: "0.02", // send 0.02 TON for gas
      body: messageBody
    });
  }

  async sendVoteNo(provider: ContractProvider, via: Sender) {
    const messageBody = beginCell()
      .storeUint(2, 32) // op (op #2 = no)
      .storeUint(0, 64) // query id
      .storeUint(0, 8) // v
      .storeUint(0, 256) // r
      .storeUint(0, 256) // s
      .endCell();
    await provider.internal(via, {
      value: "0.02", // send 0.02 TON for gas
      body: messageBody
    });
  }

  async sendVoter(provider: ContractProvider, via: Sender) {
    const messageBody = beginCell()
      .storeUint(3, 32) // op (op #3 = set voter)
      .storeUint(0, 64) // query id
      .storeUint(0x0, 8) // 0
      .storeUint(0xCD234D93146635D857E5A20D347A5200CCCF3E0C6D2D2063159C57FFDF740312, 256) // set voter
      .storeUint(0x0, 256) // 0
      .endCell();
    await provider.internal(via, {
      value: "0.02", // send 0.02 TON for gas
      body: messageBody
    });
  }

}
