import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address } from "ton";
import Ballot from "./ballot";
import * as fs from "fs"; 

async function main() {
  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });

  // open Ballot instance by address
  const ballotAddress = Address.parse(fs.readFileSync('ballot.txt', 'utf8')); 
  const ballot = new Ballot(ballotAddress);
  const ballotContract = client.open(ballot);
  console.log("ballotAddress:", fs.readFileSync('ballot.txt', 'utf8'));

  // call the getter on chain
  const ballotYesCountValue = await ballotContract.getYesCount();
  console.log("yes count:", ballotYesCountValue.toString());

  // call the getter on chain
  const ballotNoCountValue = await ballotContract.getNoCount();
  console.log("no count: ", ballotNoCountValue.toString());

  // call the getter on chain
  const ballotVotersCountValue = await ballotContract.getVotersCount();
  console.log("voters count:", ballotVotersCountValue.toString());

  // call the getter on chain
  const ballotVotingResultValue = await ballotContract.getVotingResult();
  console.log("voting result:", ballotVotingResultValue.toString());

  // call the getter on chain
  const ballotWPH = await ballotContract.getWPH();
  console.log("wph:", ballotWPH.toString());
  
  // call the getter on chain
  const y = await ballotContract.getY();
  // console.log("y:", y.asSlice().remainingBits);
  let slice = y.beginParse();
  let v1 = slice.loadInt(257);
  console.log("ecr status:", v1);
  let v2 = slice.loadUint(256);
  console.log("ecr x1:", v2);
  let v3 = slice.loadUint(256);
  console.log("ecr x2:", v3);
  let v4 = slice.loadUint(8);
  console.log("ecr h:", v4);
  slice.endParse();
  console.log("remainingBits:", slice.remainingBits);

}

main();
