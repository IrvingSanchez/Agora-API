import { createAuthenticatedClient } from "@interledger/open-payments";
import fs from "fs";

export async function makeOpenPaymentsClient() { 
  const privateKey = fs.readFileSync("./private.key", "utf8");
  const client = await createAuthenticatedClient({
      walletAddressUrl: process.env.CLIENTE_WALLET_ADDRESS_URL,
      privateKey: privateKey,
      keyId: process.env.CLIENTE_WALLET_KEY_ID
  });
  return client;
}