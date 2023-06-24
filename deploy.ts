import * as fs from "fs";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, Cell, WalletContractV4 } from "ton";
import Ballot from "./ballot"; 

async function deploy() {
  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  console.log("endpoint:", endpoint);
  const client = new TonClient({ endpoint });

  // prepare Ballot's initial code and data cells for deployment
  const ballotCode = Cell.fromBoc(fs.readFileSync("ballot.cell"))[0]; // compilation output from step 6
  const initialCounterValue = 0;
  const ballot = Ballot.createForDeploy(ballotCode, initialCounterValue);
  const contract_address = ballot.address.toString();
  // exit if contract is already deployed
  console.log("contract address:", contract_address);
  fs.writeFileSync('ballot.txt', contract_address, {flag:'w'});
  if (await client.isContractDeployed(ballot.address)) {
    return console.log("Ballot already deployed");
  }

  // open wallet v4 (notice the correct wallet version here)
  const mnemonic = String(fs.readFileSync(".env")) || "0";
  if (mnemonic == "0") {
    return console.log("can not get mnemonic from .env file");
  }
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

  if (!await client.isContractDeployed(wallet.address)) {
    return console.log("wallet is not deployed");
  }

  // open wallet and read the current seqno of the wallet
  const walletContract = client.open(wallet);
  const balance = await walletContract.getBalance();
  console.log("wallet ", wallet.address," balance:", balance);
  const walletSender = walletContract.sender(key.secretKey);
  const seqno = await walletContract.getSeqno();

  // send the deploy transaction
  const counterContract = client.open(ballot);
  await counterContract.sendDeploy(walletSender);

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    console.log("waiting for deploy transaction to confirm...");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("deploy transaction confirmed!");

}

deploy();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
