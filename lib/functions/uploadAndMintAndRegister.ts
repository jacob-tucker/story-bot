import { Address, toHex } from "viem";
import { adminClient } from "../utils/storyClient";
import { uploadJSONToIPFS } from "./pinata/uploadJSONToIPFS";
import { mintNFT } from "./mintNFT";
import { nftContractAddress } from "../utils/constants";

export async function uploadAndMintAndRegister(
  imageURL: string,
  to: Address
): Promise<string> {
  const { ipfsUri, ipfsJson } = await uploadJSONToIPFS({
    name: "Test Name",
    description: "Test Description",
    imageURL: imageURL,
  });

  const tokenId = await mintNFT(to, ipfsUri);
  const response = await adminClient.ipAsset.register({
    nftContract: nftContractAddress, // your NFT contract address
    tokenId,
    // metadata: {
    //   metadataURI: ipfsUri || "test-metadata-uri", // uri of IP metadata
    //   metadataHash: toHex(ipfsJson || "test-metadata-hash", { size: 32 }), // hash of IP metadata
    //   nftMetadataHash: toHex(ipfsJson || "test-nft-metadata-hash", {
    //     size: 32,
    //   }), // hash of NFT metadata
    // },
    txOptions: { waitForTransaction: true },
  });

  console.log(
    `Root IPA created at transaction hash ${response.txHash}, IPA ID: ${response.ipId}`
  );
  return response.ipId;
}
