import { Range } from './Range.js';
import { Field, Mina, PrivateKey, AccountUpdate } from 'o1js';

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
const zkAppInstance = new Range(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, async () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    await zkAppInstance.deploy();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
const status0 = zkAppInstance.status.get();
console.log('Range proof status:', status0.toString());


// ----------------------------------------------------
const txn1 = await Mina.transaction(senderAccount, async () => {
    await zkAppInstance.update(Field(55)); //Try a number more than 100, txn fails!
});
await txn1.prove();
await txn1.sign([senderKey]).send();
const num1 = zkAppInstance.status.get();
console.log('Range proof status after txn1:', num1.toString());

//The code snippet below fails because we can update 'status' once to 'true'.
//Verifies the range proof only once, and status is updated to true after that.
/*
const txn2 = await Mina.transaction(senderAccount, async () => {
    await zkAppInstance.update(Field(55)); //Try a number more than 100, txn fails!
});
await txn2.prove();
await txn2.sign([senderKey]).send();
const num2 = zkAppInstance.status.get();
console.log('Range proof status after txn1:', num2.toString());
*/
