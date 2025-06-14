import FormDataNode from "form-data";
import fs from "fs";
import axios from "axios";
import { algorandClient } from "./config";

export interface PinataResponse {
  /**
   * IPFS content identifier (CID) of the uploaded file
   */
  IpfsHash: string;
  /**
   * Size of the pinned content in bytes
   */
  PinSize: number;
  /**
   * Timestamp of when the file was pinned
   */
  Timestamp: string;
  /**
   * Indicates if the file was already pinned previously
   */
  isDuplicate?: boolean;
}

async function uploadToPinataNode(
  filePath: string,
  fileName: string,
  token: string
): Promise<PinataResponse> {
  try {
    const formData = new FormDataNode();
    const fileStream = fs.createReadStream(filePath);
    formData.append("file", fileStream);

    const pinataMetadata = JSON.stringify({
      name: fileName,
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", pinataOptions);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": `multipart/form-data`,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data as PinataResponse;
  } catch (error) {
    console.error(`Error uploading file to Pinata: ${error}`);
    throw error;
  }
}

async function uploadJsonToPinata(
  json: any,
  name: string,
  token: string
): Promise<PinataResponse> {
  try {
    const data = JSON.stringify({
      pinataContent: json,
      pinataMetadata: { name: name || "metadata.json" },
    });

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      {
        headers: {
          "Content-Type": `application/json`,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data as PinataResponse;
  } catch (error) {
    console.error(`Error uploading JSON to Pinata: ${error}`);
    throw error;
  }
}

const calculateSHA256 = async (
  data: Buffer | Uint8Array | ArrayBuffer
): Promise<string> => {
  try {
    const crypto = require("crypto");
    const hash = crypto.createHash("sha256");
    hash.update(Buffer.from(data));
    return hash.digest("hex");
  } catch (error) {
    throw new Error("Error calculating SHA256");
  }
};

const getAssetHolding = async (
  assetId: bigint,
  address: string,
  decimals: number
) => {
  try {
  const assetBalanceAfterTransfer = await algorandClient.client.algod
    .accountAssetInformation(address, assetId)
    .do();
    return assetBalanceAfterTransfer.assetHolding
      ? assetBalanceAfterTransfer.assetHolding.amount / BigInt(10 ** decimals)
      : 0;
  } catch (error) {
    return 0;
  }
};

export {
  uploadToPinataNode,
  uploadJsonToPinata,
  calculateSHA256,
  getAssetHolding,
};
