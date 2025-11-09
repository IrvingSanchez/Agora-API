import { Request, Response } from "express";
import { makeOpenPaymentsClient } from "../services/opclient.service.js";
import { isFinalizedGrant } from "@interledger/open-payments";

export default class CommitController {
    static async registerCommit(req: Request, res: Response): Promise<void> {
        try {
            const client = await makeOpenPaymentsClient();
            const { donorWalletUrl, debitAmount } = req.body;

            // Get donor wallet
            const senderWalletAddress = await client.walletAddress.get({
                url: donorWalletUrl
            });

            // Create Future Outgoing Payment Grant

            const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
            const oneMonthSinglePayment = `R1/${nowIso}/P1M`

            const futureOutgoingPaymentGrant = await client.grant.request(
                {
                    url: senderWalletAddress.authServer,
                },
                {
                    access_token: {
                        access: [
                            {
                                identifier: senderWalletAddress.id,
                                type: 'outgoing-payment',
                                actions: ['create'],
                                limits: {
                                    interval: oneMonthSinglePayment,
                                    debitAmount: {
                                        assetCode: senderWalletAddress.assetCode,
                                        assetScale: senderWalletAddress.assetScale,
                                        value: debitAmount,
                                    },
                                },
                            },
                        ],
                    },
                    client: senderWalletAddress.id,
                    interact: {
                        start: ['redirect']
                    },
                },
            );

            res.status(200).json({ message: "Comando ejecutado con éxito", futureOutgoingPaymentGrant });
        } catch (error: any) {
            res.status(500).json({ message: "Error al ejecutar el comando", error: error.message });
        }
    }

    static async finalizeCommit(req: Request, res: Response): Promise<void> {
        try {
            const client = await makeOpenPaymentsClient();
            const { uri, access_token } = req.body;

            // Continue Future Outgoing Payment Grant

            const finalizedOutgoingPaymentGrant = await client.grant.continue({
                url: uri,
                accessToken: access_token
            });

            if (!isFinalizedGrant(finalizedOutgoingPaymentGrant)) {
                throw new Error("Se espera que finalice la concesión")
            }

            //  Create Transaction and Save Access Token
            console.log(finalizedOutgoingPaymentGrant.access_token.value, finalizedOutgoingPaymentGrant.access_token.manage)


            res.status(200).json({ message: "Comando ejecutado con éxito", finalizedOutgoingPaymentGrant });
        } catch (error: any) {
            res.status(500).json({ message: "Error al ejecutar el comando", error: error.message });
        }
    }
}