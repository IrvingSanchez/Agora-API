export type PendingGrant = {
  grantId: string;
  // Datos del paso 2 que necesitamos para el paso 5
  continueUri: string;
  continueAccessToken: string;
  // Para verificación de hash en finish
  clientNonce: string;       // nonce que tú enviaste en interact.finish
  interactNonce: string;     // "finish" que te regresó el AS (interact.finish)
  authServerUrl: string;     // URL usada para el POST /grant (normalmente userWalletAddress.authServer)
  // Opcional: metadatos del request
  userWalletAddressUrl: string;
  interval: string;
  debitAmount?: { value: string; assetCode: string; assetScale: number };
  // Estado
  status: "pending" | "approved" | "denied";
  // Resultado final
  finalAccessToken?: { value: string; manage?: string };
};

const pendingGrants = new Map<string, PendingGrant>();

export function savePendingGrant(p: PendingGrant) {
  pendingGrants.set(p.grantId, p);
}
export function getPendingGrant(grantId: string) {
  return pendingGrants.get(grantId) || null;
}
export function updatePendingGrant(grantId: string, patch: Partial<PendingGrant>) {
  const current = pendingGrants.get(grantId);
  if (!current) return;
  pendingGrants.set(grantId, { ...current, ...patch });
}
