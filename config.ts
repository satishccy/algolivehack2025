import { config } from "dotenv";
import path from "path";

config({ path: path.join(__dirname, ".env") });
import { nullLogger } from "@algorandfoundation/algokit-utils/types/logging";
import { AlgorandClient, Config } from "@algorandfoundation/algokit-utils";
import algosdk from "algosdk";

Config.configure({ logger: nullLogger });

if (
  !process.env.MNEMONIC ||
  !process.env.MNEMONIC2 ||
  !process.env.MNEMONIC3 ||
  !process.env.MNEMONIC4 ||
  !process.env.NETWORK ||
  !process.env.PINATA_TOKEN
) {
  throw new Error(
    "MNEMONIC or MNEMONIC2 or MNEMONIC3 or MNEMONIC4 or NETWORK or PINATA_TOKEN is not set in .env file"
  );
}

export const mnemonic = process.env.MNEMONIC;
export const mnemonic2 = process.env.MNEMONIC2;
export const mnemonic3 = process.env.MNEMONIC3;
export const mnemonic4 = process.env.MNEMONIC4;
export const network = process.env.NETWORK;
export const pinataToken = process.env.PINATA_TOKEN;

export const account1 = {
  ...algosdk.mnemonicToSecretKey(mnemonic),
  signer: algosdk.makeBasicAccountTransactionSigner(
    algosdk.mnemonicToSecretKey(mnemonic)
  ),
};
export const account2 = {
  ...algosdk.mnemonicToSecretKey(mnemonic2),
  signer: algosdk.makeBasicAccountTransactionSigner(
    algosdk.mnemonicToSecretKey(mnemonic2)
  ),
};

export const account3 = {
  ...algosdk.mnemonicToSecretKey(mnemonic3),
  signer: algosdk.makeBasicAccountTransactionSigner(
    algosdk.mnemonicToSecretKey(mnemonic3)
  ),
};

export const account4 = {
  ...algosdk.mnemonicToSecretKey(mnemonic4),
  signer: algosdk.makeBasicAccountTransactionSigner(
    algosdk.mnemonicToSecretKey(mnemonic4)
  ),
};

export const algorandClient =
  network === "testnet"
    ? AlgorandClient.testNet()
    : network === "mainnet"
    ? AlgorandClient.mainNet()
    : AlgorandClient.defaultLocalNet();
