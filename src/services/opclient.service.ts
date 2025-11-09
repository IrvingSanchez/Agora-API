import { createAuthenticatedClient } from "@interledger/open-payments";
import fs from "fs";

let clientInstance: any = null;

export async function getOpenPaymentsClient() {
  if (!clientInstance) {
    const privateKey = fs.readFileSync("./private.key", "utf8");
    clientInstance = await createAuthenticatedClient({
      walletAddressUrl: process.env.CLIENTE_WALLET_ADDRESS_URL!,
      privateKey,
      keyId: process.env.CLIENTE_WALLET_KEY_ID!,
    });
    console.log("✅ OpenPaymentsClient inicializado globalmente");
  }
  console.log("✅ OpenPaymentsClient usado globalmente");

  return clientInstance;
}