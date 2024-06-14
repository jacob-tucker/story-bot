import { http } from "viem";
import { Account, privateKeyToAccount, Address } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { rpcProviderUrl } from "./constants";

const privateKey: Address = `0x${process.env.WALLET_PRIVATE_KEY}`;
export const account: Account = privateKeyToAccount(privateKey);

const config: StoryConfig = {
  transport: http(rpcProviderUrl),
  account: account, // the account object from above
  chainId: "sepolia",
};
export const client = StoryClient.newClient(config);
