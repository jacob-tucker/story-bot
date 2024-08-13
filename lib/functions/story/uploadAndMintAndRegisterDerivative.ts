import { Address, toHex } from "viem";
import { adminClient } from "../../utils/storyClient";
import { uploadJSONToIPFS } from "../pinata/uploadJSONToIPFS";
import { mintNFT } from "../mintNFT";
import { nftContractAddress } from "../../utils/constants";

export async function uploadAndMintAndRegisterDerivative(
  imageURL: string,
  to: Address,
  parentIpId: Address
): Promise<string> {
  const { ipfsUri, ipfsJson } = await uploadJSONToIPFS({
    name: "Test Name",
    description: "Test Description",
    imageURL: imageURL,
  });

  const tokenId = await mintNFT(to, ipfsUri);
  console.log({ tokenId, parentIpId });
  try {
    const response = await adminClient.ipAsset.registerDerivativeIp({
      nftContract: nftContractAddress, // your NFT contract address
      tokenId,
      derivData: {
        parentIpIds: [parentIpId],
        licenseTermsIds: ["2"],
      },
      metadata: {
        metadataURI: "test-uri",
        metadataHash: toHex("test-metadata-hash", { size: 32 }),
        nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
      },
      txOptions: { waitForTransaction: true },
    });

    console.log(
      `Derivative IPA created at transaction hash ${response.txHash}, IPA ID: ${response.ipId}`
    );
    return response.ipId;
  } catch (e) {
    console.log(e);
  }
}
