import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(100);

const [ accAlice, accBob ] =
  await stdlib.newTestAccounts(2, startingBalance);
console.log('Hello, Alice and Bob!');

console.log('Launching...');
const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

const outcome = ['your number is not a match','your number is a match']

console.log('creator is creating testing NFT');

const theNFT = await stdlib.launchToken(accAlice, "Mona Lisa", "NFT", {supply:1});

const nftParams = {
  nftID: theNFT.id,
  numTickets: 10,
}

await accBob.tokenAccept(nftParams.nftID);

const shared = {
  getNum: (numTickets) => {
    const num = (Math.floor(Math.random() * numTickets) + 1);
    return num;
  },
  seeOutcome: (num) => {
    console.log('the outcome is $(outcome[num])')
  },
}


console.log('Starting backends...');
await Promise.all([
  backend.Alice(ctcAlice, {
    ...stdlib.hasRandom,
    ...shared,
    startRaffle: () => {
      console.log ('the raffle info is being sent to the contract');
      return nftParams;
    },
    seeHash: (value) => {
      console.log('the winning hash is ${value}');
    },
    // implement Alice's interact object here
  }),
  backend.Bob(ctcBob, {
    ...stdlib.hasRandom,
    ...shared,
    // implement Bob's interact object here
    showNum: (num) => {
console.log('your raffle number is ${num}')
    },
    seeWinner: (num) => {
      console.log('the winning number is ${num}')
          },
  }),
]);

console.log('Goodbye, Alice and Bob!');
