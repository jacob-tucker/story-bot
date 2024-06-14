import { toHex } from "viem";
import { account, client } from "../utils/storyClient";
import { uploadJSONToIPFS } from "./uploadJSONToIPFS";
import { mintNFT } from "./mintNFT";
import { nftContractAddress } from "../utils/constants";

export async function register(imageURL: string): Promise<string> {
  const { ipfsUri, ipfsJson } = await uploadJSONToIPFS({
    name: "Test Name",
    description: "Test Description",
    imageURL: imageURL,
  });

  const tokenId = await mintNFT(account.address, ipfsUri);
  const response = await client.ipAsset.register({
    nftContract: nftContractAddress, // your NFT contract address
    tokenId: tokenId,
    metadata: {
      metadataURI: ipfsUri || "test-metadata-uri", // uri of IP metadata
      metadataHash: toHex(ipfsJson || "test-metadata-hash", { size: 32 }), // hash of IP metadata
      nftMetadataHash: toHex(ipfsJson || "test-nft-metadata-hash", {
        size: 32,
      }), // hash of NFT metadata
    },
    txOptions: { waitForTransaction: true },
  });

  console.log(
    `Root IPA created at transaction hash ${response.txHash}, IPA ID: ${response.ipId}`
  );
  return response.ipId;
}
