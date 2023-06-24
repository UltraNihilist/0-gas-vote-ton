import * as fs from "fs";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, Cell, WalletContractV4 } from "ton";
import Ballot from "./ballot"; 

async function address() {
  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });
  // prepare Ballot's initial code and data cells for deployment
  const ballotCode = Cell.fromBoc(fs.readFileSync("ballot.cell"))[0]; // compilation output from step 6
  const initialCounterValue = 0; // to avoid collisions use current number of milliseconds since epoch as initial value
  // const initialCounterValue = Date.now(); // to avoid collisions use current number of milliseconds since epoch as initial value
  const ballot = Ballot.createForDeploy(ballotCode, initialCounterValue);
  const contract_address = ballot.address.toString();
  // exit if contract is already deployed
  console.log("contract address:", contract_address);
  fs.writeFileSync('ballot.txt', contract_address, {flag:'w'});
  if (await client.isContractDeployed(ballot.address)) {
    return console.log("Ballot already deployed");
  }

}

address();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
