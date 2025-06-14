import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import {
  account1 as creator,
  account2 as admin,
  account3 as recipient,
  algorandClient,
} from "../config";
import { TokenizerContractFactory } from "./task-3-contracts/projects/task-3-contracts/smart_contracts/artifacts/contract/TokenizerContractClient";
import { getAssetHolding } from "../utils";

(async () => {
  const tokenizerContract = new TokenizerContractFactory({
    algorand: algorandClient,
    defaultSender: admin.addr,
    defaultSigner: admin.signer,
  });

  const { result: appCreateResult, appClient } =
    await tokenizerContract.send.create.bare({});

  console.log(
    `App created at ${appCreateResult.appAddress} with ID ${appCreateResult.appId}`
  );

  const appPayment = await algorandClient.send.payment({
    sender: admin.addr,
    amount: AlgoAmount.Algos(0.2),
    receiver: appCreateResult.appAddress,
    signer: admin.signer,
  });

  console.log(`App Funded with 0.2 Algos: ${appPayment.txIds[0]}`);

  const assetName = "Tokenizer Token";
  const assetUnitName = "TT";
  const assetDecimals = 6;
  const assetTotal = 10000;
  const clawbackAddress = appCreateResult.appAddress;

  const assetCreateResult = await algorandClient.send.assetCreate({
    sender: creator.addr,
    total: BigInt(assetTotal * 10 ** assetDecimals),
    decimals: assetDecimals,
    assetName,
    unitName: assetUnitName,
    clawback: clawbackAddress,
    freeze: creator.addr,
    reserve: creator.addr,
    manager: creator.addr,
    signer: creator.signer,
  });

  console.log(
    `Asset created with ID ${assetCreateResult.assetId} with clawback address as app address`
  );

  const setAssetIdResult = await appClient.send.modifyAsa({
    args: {
      asaId: assetCreateResult.assetId,
    },
  });
  console.log(`Asset ID set in contract: ${setAssetIdResult.txIds[0]}`);

  const receiverOptInResult = await algorandClient.send.assetTransfer({
    sender: recipient.addr,
    receiver: recipient.addr,
    assetId: assetCreateResult.assetId,
    amount: BigInt(0),
    signer: recipient.signer,
  });
  console.log(`Receiver opted in to asset: ${receiverOptInResult.txIds[0]}`);

  const beforeAirdropRecipientBalance = await getAssetHolding(
    assetCreateResult.assetId,
    recipient.addr.toString(),
    assetDecimals
  );
  console.log(
    `Before airdrop recipient balance: ${beforeAirdropRecipientBalance}`
  );

  const airdropResult = await appClient.send.verifiedAirdrop({
    args: {
      amount: 100 * 10 ** assetDecimals,
      recipient: recipient.addr.toString(),
    },
    maxFee: AlgoAmount.Algos(0.002),
    coverAppCallInnerTransactionFees: true,
  });

  console.log(
    `Airdropped 100 tokens to ${recipient.addr}: ${airdropResult.txIds[0]}`
  );

  const afterAirdropRecipientBalance = await getAssetHolding(
    assetCreateResult.assetId,
    recipient.addr.toString(),
    assetDecimals
  );
  console.log(
    `After airdrop recipient balance: ${afterAirdropRecipientBalance}`
  );
})();
