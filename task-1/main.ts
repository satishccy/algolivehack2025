import {
  algorandClient,
  account1 as creator,
  account2 as receiver,
} from "../config";

(async () => {
  const total = 1000;

  const decimals = 6;

  const assetName = "MyAsset";

  const unitName = "MYA";

  const assetCreateResult = await algorandClient.send.assetCreate({
    assetName: assetName,
    unitName: unitName,
    total: BigInt(total * 10 ** decimals),
    decimals: decimals,
    sender: creator.addr.toString(),
    signer: creator.signer,
  });

  console.log(`Asset created with ID: ${assetCreateResult.assetId}`);

  const assetOptInResult = await algorandClient.send.assetOptIn({
    assetId: assetCreateResult.assetId,
    sender: receiver.addr.toString(),
    signer: receiver.signer,
  });

  console.log(`Receiver opted in to Asset: ${assetOptInResult.txIds[0]}`);

  const toSend = 100;
  const assetSendResult = await algorandClient.send.assetTransfer({
    assetId: assetCreateResult.assetId,
    sender: creator.addr.toString(),
    signer: creator.signer,
    receiver: receiver.addr.toString(),
    amount: BigInt(toSend * 10 ** decimals),
  });

  console.log(
    `Asset [${toSend} ${unitName}] sent to receiver: ${assetSendResult.txIds[0]}`
  );
})();
