import algosdk from "algosdk";

const account = algosdk.generateAccount();

const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

console.log(`Mnemonic: ${mnemonic}`);
console.log(`Address: ${account.addr}`);
