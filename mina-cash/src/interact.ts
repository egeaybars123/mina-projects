import { Bank } from './Bank.js';
import { Field, Mina, PrivateKey, AccountUpdate, MerkleMap } from 'o1js';

const useProof = false;
const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key; //private key
const senderAccount = Local.testAccounts[1];
const senderKey = senderAccount.key; //this will interact with the contract

// ----------------------------------------------------
// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();
//console.log("public key: ", zkAppAddress.toBase58());

// create an instance of Square - and deploy it to zkAppAddress
const zkAppInstance = new Bank(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, async () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    await zkAppInstance.deploy();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

//Uuid array
const keys = [1, 2, 3, 4, 5, 6];
const balances = [10, 100, 115, 88, 22, 1000];
const creditScores = [1000, 1500, 2000, 2500, 500, 250];

const balanceMap = new MerkleMap();
const creditMap = new MerkleMap();

for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const balance = balances[i];
    const creditScore = creditScores[i];

    // Set the balance and credit score for the current key
    balanceMap.set(Field(key), Field(balance));
    creditMap.set(Field(key), Field(creditScore));
} 


const initStateTxn = await Mina.transaction(senderAccount, async () => {
    const balanceRoot = balanceMap.getRoot();
    const creditRoot = creditMap.getRoot();
    await zkAppInstance.initState(balanceRoot, creditRoot);
});
await initStateTxn.prove();
await initStateTxn.sign([senderKey]).send();

console.log("Initiated balance root state: ", zkAppInstance.balanceRoot.get());
console.log("Initiated creditScore root state: ", zkAppInstance.creditScoreRoot.get());

//PROVING BALANCE IN THE BANK
let witness = balanceMap.getWitness(Field(keys[3]));
let txn1 = await Mina.transaction(senderAccount, async () => {
    await zkAppInstance.proveBalance(witness, Field(keys[3]), Field(balances[3]), Field(50));
});
await txn1.prove();
await txn1.sign([senderKey]).send();
console.log('We have proven that uuid 4 has a balance of more than 50 in the bank');

//PROVING CREDIT SCORE FOR THE BANK.
witness = creditMap.getWitness(Field(keys[2]));
txn1 = await Mina.transaction(senderAccount, async () => {
    await zkAppInstance.proveCreditScore(witness, Field(keys[2]), Field(creditScores[2]), Field(1500));
});
await txn1.prove();
await txn1.sign([senderKey]).send();
console.log('We have proven that uuid 3 has a credit score of more than 1500 for the bank');
