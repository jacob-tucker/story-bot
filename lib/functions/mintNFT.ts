import { Address, createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
import { account } from "../utils/storyClient";
import { defaultNftContractAbi } from "../utils/solidity/defaultNftContractAbi";
import { nftContractAddress, rpcProviderUrl } from "../utils/constants";

export async function mintNFT(to: Address, uri: string) {
  console.log("Minting a new NFT...");
  const walletClient = createWalletClient({
    account: account,
    chain: sepolia,
    transport: http(rpcProviderUrl),
  });
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(rpcProviderUrl),
  });

  const { request } = await publicClient.simulateContract({
    address: nftContractAddress,
    functionName: "mint",
    args: [to, uri],
    abi: defaultNftContractAbi,
  });
  const hash = await walletClient.writeContract(request);
  console.log(`Minted NFT successful with hash: ${hash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const tokenId = Number(receipt.logs[0].topics[3]).toString();
  console.log(`Minted NFT tokenId: ${tokenId}`);
  return tokenId;
}
