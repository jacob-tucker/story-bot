const pinataSDK = require("@pinata/sdk");

export async function uploadJSONToIPFS(metadata: {
  name: string;
  description: string;
  imageURL: string;
}): Promise<{ ipfsUri: string; ipfsJson: any }> {
  // Pin the JSON
  const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
  const json = {
    name: metadata.name,
    description: metadata.description,
    image: metadata.imageURL,
  };
  const { IpfsHash: JsonIpfsHash } = await pinata.pinJSONToIPFS(json);
  return { ipfsUri: `ipfs://${JsonIpfsHash}`, ipfsJson: json };
}
