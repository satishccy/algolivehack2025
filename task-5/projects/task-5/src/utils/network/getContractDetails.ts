import { AlgorandClient } from "@algorandfoundation/algokit-utils/types/algorand-client";
import { TokenizerContractClient } from "../../contracts/TokenizerContractClient";
import { getAlgodConfigFromViteEnvironment } from "./getAlgoClientConfigs";

export const getContractDetails = () => {
  if (!import.meta.env.VITE_APPID || !import.meta.env.VITE_APPADDRESS) {
    throw new Error("Attempt to get contract details without specifying VITE_APPID in the environment variables");
  }

  const appId = Number(import.meta.env.VITE_APPID);
  const appAddress = import.meta.env.VITE_APPADDRESS;

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })
  const appClient = new TokenizerContractClient({
    appId: BigInt(appId),
    algorand,
  });

  return { appId, appAddress, appClient };
};
