# 0 gas  vote-ton
* TON contest June 2nd to June 25th, 2023
* Submission by XPTeam
* contacts: https://t.me/UltraNihilist

## Description
This is a smart-contract voting tool that allows whitelisted users to vote without spending gas that utilizes the new **ECRECOVER** opcode in TVM. 

## Check node version
```
node -v
```
test on v18.12.1

## Install npm requirements
```
npm install
```
## Create .env
* Clone from env.example and paste your memonic instead of a template
* Get 2 TON test network tokens from https://t.me/testgiver_ton_bot to address from your mnemonic

## Set your unique parametrs to ballot.fc smartcomtract 
1. Define ballot_id
```
const slice ballot_id = "1"; 
```
2. Define vote_count_model_selector as 
 * 0 for Majority
 * 1 for Soft majority
 * 2 for Super majority

```
const int vote_count_model_selector = 1;
```
3. Define description

```
const slice description = "0 gas ballot for TON contest";  
```
4. Define admin address who will pay gas fees amd insert account addresses from whitelist to ton smartcontract
```
const slice admin_address = "EQBXpP9dhscDRSupkIlTM9XPE2aH8fiU3mRESthoq-kAPKm5"a;
```
5. Define hash from vote yes msg and vote no msg

```
;; hash from 'vote yes 0 gas ballot 1 blockchain TON'
const int hash_yes = 0x4e7319163dd79765dc8d107b6b1e88398a52cc044aeb83b13d73c4c9d672a9fb;
;; hash from 'vote no 0 gas ballot 1 blockchain TON'
const int hash_no = 0x4f9ff7568830010feccfa345803eea774465fe80c709ccca09ccf8858e146454;
```
## Compile ballot.fc to ballot.cell
```
npx func-js stdlib.fc ballot.fc --boc ballot.cell
```

result should be like this

```
Compiling using func v0.4.4
Compiled successfully!
Written output files.
```
## Check address 
```
npx ts-node address.ts
```
get "Ballot already deployed" if contract to this address already deployed 

## Deploy ballot.cell to ton blockchain
```
npx ts-node deploy.ts
```
result should be like this 
```
endpoint: https://ton.access.orbs.network/44A2c0ff5Bd3F8B62C092Ab4D238bEE463E644A2/1/testnet/toncenter-api-v2/jsonRPC
contract address: EQAxNScXBN5fMEn-cBg3lCm3hFrqMHyQZntSvphDcZ2HN5uV
wallet  EQBXpP9dhscDRSupkIlTM9XPE2aH8fiU3mRESthoq-kAPKm5  balance: 3959474228n
waiting for deploy transaction to confirm...
waiting for deploy transaction to confirm...
waiting for deploy transaction to confirm...
waiting for deploy transaction to confirm...
deploy transaction confirmed!
```
smartcontract address recorded to file ballot.txt

## Get smartcontract initial storage
```
npx ts-node get.ts
```
result should be like this 
```
ballotAddress: EQAxNScXBN5fMEn-cBg3lCm3hFrqMHyQZntSvphDcZ2HN5uV
yes count: 0
no count:  0
voters count: 0
voting result: 0
wph: 0
ecr status: 10
ecr x1: 10
ecr x2: 10
ecr h: 10
remainingBits: 0
```
## Voter creates private key and public key
* For example we can https://www.bitaps.com/address
![Create pair keys](https://github.com/UltraNihilist/0-gas-vote-ton/blob/dc6f735ffbdfa9b413644aabd51ddd8977bbe944/screen02.jpg)
* Click Generate private key and then click Load
* Send public key to admin

## Voter creates signature from selected hash_yes or hash_no and sends it to admin
* Voters copy hash_yes or hash_no
* Using private key and any tool for secp256k1 ECDSA sign it, for example: https://www.bitaps.com/signature
![Sign vote](https://github.com/UltraNihilist/0-gas-vote-ton/blob/dc6f735ffbdfa9b413644aabd51ddd8977bbe944/screen03.jpg)
![Vote yes signature](https://github.com/UltraNihilist/0-gas-vote-ton/blob/dc6f735ffbdfa9b413644aabd51ddd8977bbe944/screen04.jpg)
![Vote no signature](https://github.com/UltraNihilist/0-gas-vote-ton/blob/dc6f735ffbdfa9b413644aabd51ddd8977bbe944/screen05.jpg)
* Send signature to admin
* Admin convert base64 signature to hex and split it to v, r, s

## Admin set whitelisted voter pubkey hash to smartcontract
* Admin convert public key to hash as uint256 using SHA256 or KESSAK256
* In file ballot.ts set voter uint256
```
async sendVoter(provider: ContractProvider, via: Sender) {
    const messageBody = beginCell()
      .storeUint(3, 32) // op (op #3 = set voter)
      .storeUint(0, 64) // query id
      .storeUint(0x0, 8) // 0
      .storeUint(0xCD234D93146635D857E5A20D347A5200CCCF3E0C6D2D2063159C57FFDF740312, 256) // set voter uint256 here
      .storeUint(0x0, 256) // 0
      .endCell();
    await provider.internal(via, {
      value: "0.02", // send 0.02 TON for gas
      body: messageBody
    });
  }
```
* Then save and send to smartcontract 
```
npx ts-node voter.ts
```
## Admin set vote yes or voter no with signature to ballot smartcontract
* In file sig.ts set base64 signature
```
let signature = 'H2C0dl9y9ezS3zcvW6UjE67/y9WmTpVcjAq+M/WHVWmzIZIA1A2L9VB9QsP7BDfZoZzcAFsFzlORFk7ZqYpW7f0=';
```
then run
```
npx ts-node sig.ts
```
as result get 65 bytes hex signature splitted to v r s
```
1f60b4765f72f5ecd2df372f5ba52313aeffcbd5a64e955c8c0abe33f5875569b3219200d40d8bf5507d42c3fb0437d9a19cdc005b05ce5391164ed9a98a56edfd
1f
60b4765f72f5ecd2df372f5ba52313aeffcbd5a64e955c8c0abe33f5875569b3
219200d40d8bf5507d42c3fb0437d9a19cdc005b05ce5391164ed9a98a56edfd

```

* In file ballot.ts set as uint8 v, uint256 r, uint256 s
vote yes
```
  async sendVoteYes(provider: ContractProvider, via: Sender) {
    const messageBody = beginCell()
      .storeUint(1, 32) // op (op #1 = yes)
      .storeUint(0, 64) // query id
      .storeUint(0x1f, 8) // v set here
      .storeUint(0x795fa121486c650d257a68dcd7fa4fc91b3d4e0241577aa4d71729c96a0b8e80, 256) // r set here
      .storeUint(0x6142918882610d8ceec6156a9395029236b33e342b404327004022101ed96f3b, 256) // s set here
      .endCell();
    await provider.internal(via, {
      value: "0.02", // send 0.02 TON for gas
      body: messageBody
    });
  }
```
or voter no 
```
  async sendVoteNo(provider: ContractProvider, via: Sender) {
    const messageBody = beginCell()
      .storeUint(2, 32) // op (op #2 = no)
      .storeUint(0, 64) // query id
      .storeUint(0x1f, 8) // v
      .storeUint(0x60b4765f72f5ecd2df372f5ba52313aeffcbd5a64e955c8c0abe33f5875569b3, 256) // r
      .storeUint(0x219200d40d8bf5507d42c3fb0437d9a19cdc005b05ce5391164ed9a98a56edfd, 256) // s
      .endCell();
    await provider.internal(via, {
      value: "0.02", // send 0.02 TON for gas
      body: messageBody
    });
  }
```
* Save and send to smartcontract
yes vote
```
npx ts-node yes.ts
```
or no vote
```
npx ts-node no.ts
```
## Admin repeate this for each voters from whitelist and pay gas

## Smartcontract verify signature using ECRECOVER opcode, add vote to ballot and update voting result onchain
https://docs.ton.org/learn/tvm-instructions/tvm-upgrade-2023-07#secp256k1

result look like
```
ballotAddress: EQDusQexLhLNqqr-SG5v9Sc__aPNG8aYo6IhhMNWH39urmMG
yes count: 5
no count:  1
voters count: 6
voting result: -1
wph: 54898817228196327118211742769704382035383962725247874981381720269086491934720
ecr status: 0
ecr x1: 255
ecr x2: 255
ecr h: 15
remainingBits: 0
```

Unfortunately ECRECOVER opcode returns only status 0 on any hash, v, r, s, which verifed success by other tools. It looks like a bug in the library as this is clearly not intended behaviour for this opcode 

Conclusion:
When ECRECOVER is fixed this tool can be used to let users participate in voting without spending gas, only voting admin needs to spend gas. It can later be slightly modified to create a multi-signature wallet for TON or a more comprehensive voting tool.
