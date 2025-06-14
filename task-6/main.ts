import {
  ContractClient,
  ContractFactory,
} from "./task-6-contracts/projects/task-6-contracts/smart_contracts/artifacts/contract/ContractClient";
import {
  account1 as creator,
  account2 as user,
  algorandClient,
  pinataToken,
} from "../config";
import { uploadJsonToPinata, uploadToPinataNode } from "../utils";
import path from "path";
import mime from "mime-types";
import fs from "fs";
import { calculateSHA256 } from "../utils";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
(async () => {
  const assetName = "Tokenizer Token";
  const assetUnitName = "TT";
  const assetDecimals = 6;
  const assetTotal = 10000;

  const assetCreateResult = await algorandClient.send.assetCreate({
    sender: creator.addr,
    total: BigInt(assetTotal * 10 ** assetDecimals),
    decimals: assetDecimals,
    assetName,
    unitName: assetUnitName,
    clawback: creator.addr,
    freeze: creator.addr,
    reserve: creator.addr,
    manager: creator.addr,
    signer: creator.signer,
  });

  console.log(`Asset created: ${assetCreateResult.assetId}`);

  const appFactory = new ContractFactory({
    algorand: algorandClient,
    defaultSender: creator.addr,
    defaultSigner: creator.signer,
  });

  const imagePath = path.join(__dirname, "100_badge.jpg");
  const imageCid = await uploadToPinataNode(
    imagePath,
    "100_badge.jpg",
    pinataToken
  );

  const mimeType = mime.lookup(imagePath);
  if (!mimeType) {
    throw new Error("Invalid mime type");
  }

  const blob = await fs.promises.readFile(imagePath);

  const imageHash = await calculateSHA256(blob);

  const metadata = {
    name: "Century Badge",
    unit_name: "CB",
    description: "This Badge is for having 100 Tokenizer Tokens",
    creator: creator.addr.toString(),
    image: `ipfs://${imageCid.IpfsHash}#arc3`,
    image_integrity: `sha256-${imageHash}`,
    image_mimetype: mimeType,
    properties: {
      noOfTokens: 100,
      assetId: Number(assetCreateResult.assetId),
    },
  };

  const metadataCid = await uploadJsonToPinata(
    metadata,
    "metadata.json",
    pinataToken
  );

  const { result: appCreateResult, appClient } =
    await appFactory.send.create.create({
      args: {
        assetId: assetCreateResult.assetId,
        name: "Century Badge",
        unit: "CB",
        metadataUrl: `ipfs://${metadataCid.IpfsHash}#arc3`,
        amountRequired: 100 * 10 ** assetDecimals,
      },
    });

  console.log(`App created: ${appCreateResult.appId}`);

  const appPayment = await algorandClient.send.payment({
    sender: creator.addr,
    amount: AlgoAmount.Algos(0.3),
    receiver: appCreateResult.appAddress,
    signer: creator.signer,
  });

  console.log(`App Funded with 0.3 Algos: ${appPayment.txIds[0]}`);

  const receiverOptInResult = await algorandClient.send.assetTransfer({
    sender: user.addr,
    receiver: user.addr,
    assetId: assetCreateResult.assetId,
    amount: BigInt(0),
    signer: user.signer,
  });
  console.log(`User opted in to asset: ${receiverOptInResult.txIds[0]}`);

  const sendTokensToUserResult = await algorandClient.send.assetTransfer({
    sender: creator.addr,
    receiver: user.addr,
    assetId: assetCreateResult.assetId,
    amount: BigInt(100 * 10 ** assetDecimals),
    signer: creator.signer,
  });
  console.log(`100 Tokens sent to user: ${sendTokensToUserResult.txIds[0]}`);

  const mintBadgeResult = await appClient.send.mintBadge({
    args: {},
    sender: user.addr,
    signer: user.signer,
    coverAppCallInnerTransactionFees: true,
    maxFee: AlgoAmount.Algos(0.004),
  });

  console.log(
    `Badge minted with ID: ${mintBadgeResult.return?.toString()} in SC After verifying of minimum threshold balance\nTxID: ${
      mintBadgeResult.txIds[0]
    }`
  );

  const claimBadgeResult = await appClient
    .newGroup()
    .addTransaction(
      await algorandClient.createTransaction.assetOptIn({
        assetId: mintBadgeResult.return!,
        sender: user.addr,
        signer: user.signer,
      }),
      user.signer
    )
    .claimBadge({
      args: {},
      sender: user.addr,
      signer: user.signer,
      maxFee: AlgoAmount.Algos(0.004),
    })
    .send({
      populateAppCallResources: true,
      coverAppCallInnerTransactionFees: true,
    });

  console.log(`Badge claimed TxID: ${claimBadgeResult.txIds[0]}`);
})();
