import { Request, Response } from "express";
import { getOpenPaymentsClient } from "../services/opclient.service.js";
import { isFinalizedGrant } from "@interledger/open-payments";
import { getPendingGrant, savePendingGrant, updatePendingGrant } from "./memory.js";

export default class CommitController {
    static async registerCommit(req: Request, res: Response): Promise<void> {
        try {
            const client = await getOpenPaymentsClient();
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
                                actions: ['create', 'read'],
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
                        start: ['redirect'],
                        finish: {
                            method: 'redirect',
                            uri: process.env.CALLBACK_URL + '/api/commit/grant/callback',
                            nonce: "NONCE",
                        }
                    },
                },
            );

            savePendingGrant({
                grantId: "grantId",
                continueUri: futureOutgoingPaymentGrant.continue.uri,
                continueAccessToken: futureOutgoingPaymentGrant.continue.access_token.value,
                clientNonce: "",
                interactNonce: "pending.interact.finish", // este valor hace par con tu clientNonce para el hash
                authServerUrl: donorWalletUrl.authServer, // mismo endpoint usado en el request
                userWalletAddressUrl: donorWalletUrl,
                interval: "",
                debitAmount: {
                    assetCode: senderWalletAddress.assetCode,
                    assetScale: senderWalletAddress.assetScale,
                    value: debitAmount,
                },
                status: "pending"
            });

            res.status(200).json({ message: "Comando ejecutado con éxito", futureOutgoingPaymentGrant });
        } catch (error: any) {
            res.status(500).json({ message: "Error al ejecutar el comando", error: error.message });
        }
    }

    static async callbackCommit(req: Request, res: Response): Promise<void> {
        try {
            const client = await getOpenPaymentsClient();

            const { hash, interact_ref } = req.query;
            //const { uri, access_token, transactionId } = req.body;


            // Continue Future Outgoing Payment Grant
            const pending = getPendingGrant("grantId");


            const finalizedOutgoingPaymentGrant = await client.grant.continue({
                url: pending!.continueUri,
                accessToken: pending!.continueAccessToken
            }, { interact_ref }
            );

            if (!isFinalizedGrant(finalizedOutgoingPaymentGrant)) {
                throw new Error("Se espera que finalice la concesión")
            }

            //  Create Transaction and Save Access Token
            console.log(finalizedOutgoingPaymentGrant.access_token.value, finalizedOutgoingPaymentGrant.access_token.manage)

            updatePendingGrant("grantId", {
                continueUri: finalizedOutgoingPaymentGrant.access_token.manage,
                continueAccessToken: finalizedOutgoingPaymentGrant.access_token.value,
            });

            res.status(200).json({ message: "Comando ejecutado con éxito", finalizedOutgoingPaymentGrant });

        } catch (error: any) {
            res.status(500).json({ message: "Error al ejecutar el comando", error: error });
        }
    }

    static async finalizeCommit(req: Request, res: Response): Promise<void> {
        try {
            const client = await getOpenPaymentsClient();
            const pending = getPendingGrant("grantId");
            console.log({ pending })

            const { receiverWalletAddress } = req.body;


            const receivingWalletAddress = await client.walletAddress.get({
                url: receiverWalletAddress
            });

            const senderWalletAddress = await client.walletAddress.get({
                url: pending!.userWalletAddressUrl
            });

            console.log({ receivingWalletAddress });


            // 2. Obtener una conseción para un pago entrante - incoming payment 
            const incomingPaymentGrant = await client.grant.request(
                {
                    url: receivingWalletAddress.authServer
                },
                {
                    access_token: {
                        access: [
                            {
                                type: "incoming-payment",
                                actions: ["create", 'read','complete'],
                            }
                        ]
                    }
                }
            );

            if (!isFinalizedGrant(incomingPaymentGrant)) {
                throw new Error("Se espera finalizar la concesión");
            }

            console.log({ incomingPaymentGrant });


            // 3. Crear un pago entrante para el receptor
            const incomingPayment = await client.incomingPayment.create(
                {
                    url: receivingWalletAddress.resourceServer,
                    accessToken: incomingPaymentGrant.access_token.value
                },
                {
                    walletAddress: receivingWalletAddress.id
                }

            );

            console.log({ incomingPayment });


            const quoteGrant = await client.grant.request(
                {
                    url: senderWalletAddress.authServer
                },
                {
                    access_token: {
                        access: [
                            {
                                type: "quote",
                                actions: ["create"]
                            }
                        ]
                    }
                }
            );

            if (!isFinalizedGrant(quoteGrant)) {
                throw new Error("Se espera finalice la concesión");
            }

            console.log({ quoteGrant });

            // 5. Obtener una cotización para el remitente

            const quote = await client.quote.create(
                {
                    url: senderWalletAddress.resourceServer,
                    accessToken: quoteGrant.access_token.value
                },
                {
                    walletAddress: senderWalletAddress.id,
                    receiver: incomingPayment.id,
                    method: "ilp",
                    debitAmount: pending!.debitAmount!
                }
            );

            console.log({ quote });

            const outgoingPayment = await client.outgoingPayment.create(
                {
                    url: senderWalletAddress.resourceServer,
                    accessToken: pending!.continueAccessToken
                },
                {
                    walletAddress: senderWalletAddress.id,
                    quoteId: quote.id
                }
            );

            console.log({ outgoingPayment });

            const completedIncomingPayment = await client.incomingPayment.complete({
                url: incomingPayment.id,
                accessToken: incomingPaymentGrant.access_token.value,
            });

            console.log({ completedIncomingPayment });


            res.status(200).json({ message: "Comando ejecutado con éxito", outgoingPayment });
        } catch (error: any) {
            res.status(500).json({ message: "Error al ejecutar el comando", error: error });
        }
    }
}