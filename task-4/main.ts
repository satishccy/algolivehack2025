import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import {
  algorandClient,
  account1,
  account2,
  account3,
  account4 as freeze,
} from "../config";

(async () => {
  const multisig = await algorandClient.account.multisig(
    {
      version: 1,
      threshold: 2,
      addrs: [account1.addr, account2.addr, account3.addr],
    },
    [account1, account2, account3]
  );

  console.log(
    `Created multisig account: ${multisig.addr.toString()} with threshold 2 and accounts [${account1.addr.toString()}, ${account2.addr.toString()}, ${account3.addr.toString()}]\n\n`
  );

  const fundMultisigTx = await algorandClient.send.payment({
    sender: account2.addr.toString(),
    receiver: multisig.addr.toString(),
    amount: AlgoAmount.Algos(0.2),
    signer: account2.signer,
  });

  console.log(
    `Funded multisig account with 0.2 ALGO\ntxId: ${fundMultisigTx.txIds[0]}\n\n`
  );

  const total = 1000;

  const decimals = 6;

  const assetName = "MyAsset";

  const unitName = "MYA";

  const assetCreateResult = await algorandClient.send.assetCreate({
    assetName: assetName,
    unitName: unitName,
    total: BigInt(total * 10 ** decimals),
    decimals: decimals,
    manager: multisig.addr.toString(),
    reserve: account1.addr.toString(),
    freeze: account1.addr.toString(),
    clawback: multisig.addr.toString(),
    sender: account1.addr.toString(),
    signer: account1.signer,
  });

  console.log(
    `Created asset: ${assetCreateResult.assetId} with manager as multisig account\n\n`
  );

  const assetFreezeAddressChangeTx = await algorandClient.send.assetConfig({
    assetId: assetCreateResult.assetId,
    manager: multisig.addr.toString(),
    reserve: account1.addr.toString(),
    freeze: freeze.addr.toString(),
    clawback: multisig.addr.toString(),
    sender: multisig.addr.toString(),
    signer: multisig.signer,
  });

  console.log(
    `Asset freeze address changed to: ${freeze.addr.toString()}\ntxId: ${
      assetFreezeAddressChangeTx.txIds[0]
    }`
  );
})();
