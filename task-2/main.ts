import {
  account1 as creator,
  account2 as receiver,
  account3 as freeze,
  account4 as clawback,
  algorandClient,
  pinataToken,
} from "../config";
import {
  calculateSHA256,
  uploadToPinataNode,
  uploadJsonToPinata,
  getAssetHolding,
} from "../utils";
import path from "path";
import mime from "mime-types";
import fs from "fs";

(async () => {
  const name = "Monko";
  const unitName = "MONKO";
  const total = 1000;
  const decimals = 4;
  const imagePath = path.join(__dirname, "monko.webp");
  const properties = {
    description: "Monko is a cute monkey",
  };
  const freezeAuthAddr = freeze.addr.toString();
  const clawbackAuthAddr = clawback.addr.toString();

  const imageCid = await uploadToPinataNode(
    imagePath,
    "monko.webp",
    pinataToken
  );

  const mimeType = mime.lookup(imagePath);
  if (!mimeType) {
    throw new Error("Invalid mime type");
  }

  const blob = await fs.promises.readFile(imagePath);

  const imageHash = await calculateSHA256(blob);

  const metadata = {
    name: name,
    unit_name: unitName,
    creator: creator.addr.toString(),
    image: `ipfs://${imageCid.IpfsHash}#arc3`,
    image_integrity: `sha256-${imageHash}`,
    image_mimetype: mimeType,
    properties: properties,
  };

  const metadataCid = await uploadJsonToPinata(
    metadata,
    "metadata.json",
    pinataToken
  );

  const nftMint = await algorandClient.send.assetCreate({
    sender: creator.addr,
    signer: creator.signer,
    total: BigInt(total * 10 ** decimals),
    decimals: decimals,
    url: `ipfs://${metadataCid.IpfsHash}#arc3`,
    defaultFrozen: false,
    unitName: unitName,
    assetName: name,
    manager: creator.addr.toString(),
    reserve: creator.addr.toString(),
    freeze: freezeAuthAddr,
    clawback: clawbackAuthAddr,
  });

  console.log(`NFT minted with ID: ${nftMint.assetId}`);

  const receiverOptIn = await algorandClient.send.assetTransfer({
    sender: receiver.addr,
    assetId: nftMint.assetId,
    amount: BigInt(0),
    receiver: receiver.addr,
    signer: receiver.signer,
  });

  console.log(
    `Receiver opted in to asset ${nftMint.assetId} with txID: ${receiverOptIn.txIds[0]}`
  );
  const assetBalance = await getAssetHolding(
    nftMint.assetId,
    receiver.addr.toString(),
    decimals
  );
  console.log(
    `Asset balance: ${assetBalance}`
  );

  const sendToReceiver = await algorandClient.send.assetTransfer({
    sender: creator.addr,
    assetId: nftMint.assetId,
    amount: BigInt(100 * 10 ** decimals),
    receiver: receiver.addr,
    signer: creator.signer,
  });

  console.log(
    `Asset [100 ${unitName}] sent to receiver: ${sendToReceiver.txIds[0]}`
  );

  const assetBalanceAfterTransfer = await getAssetHolding(
    nftMint.assetId,
    receiver.addr.toString(),
    decimals
  );
  console.log(
    `Asset balance for receiver after transfer: ${assetBalanceAfterTransfer}`
  );

  const clawbackTx = await algorandClient.send.assetTransfer({
    sender: clawback.addr,
    clawbackTarget: receiver.addr,
    assetId: nftMint.assetId,
    amount: BigInt(100 * 10 ** decimals),
    receiver: creator.addr,
    signer: clawback.signer,
  });

  console.log(
    `Clawbacked 100 ${unitName} from receiver to creator: ${clawbackTx.txIds[0]}`
  );

  const assetBalanceAfterClawback = await getAssetHolding(
    nftMint.assetId,
    receiver.addr.toString(),
    decimals
  );
  console.log(
    `Asset balance for receiver after clawback: ${assetBalanceAfterClawback}`
  );
})();
