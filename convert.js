import { createAuthenticatedClient, isFinalizedGrant } from "@interledger/open-payments";
import fs from "fs";
import Readline from "readline/promises";
import dotenv from 'dotenv';

// a. Importar dependencias y configurar el cliente
(async () => {

    dotenv.config();
    const privateKey = fs.readFileSync("private.key", "utf8");
    const client = await createAuthenticatedClient({
        walletAddressUrl: process.env.CLIENTE_WALLET_ADDRESS_URL,
        privateKey: privateKey,
        keyId: process.env.CLIENTE_WALLET_KEY_ID
    })

    // b. Crear una instancia del cliente Open Payments
    // c. Cargar la clave privada del archivo
    // d. Configurar las direcciones de las billeteras del remitente y el receptor


    // Flujo de pago entre pares

    // 1. Obtener una conseción para un pago entrante - wallet Address
    const userWalletAddress = await client.walletAddress.get({
        url: "https://ilp.interledger-test.dev/alicetest"
    });

    console.log({ userWalletAddress });

    const receivingWalletAddress = await client.walletAddress.get({
        url: "https://ilp.interledger-test.dev/ferreteria"
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
                        actions: ["create"],
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
            url: userWalletAddress.authServer
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
            url: userWalletAddress.resourceServer,
            accessToken: quoteGrant.access_token.value
        },
        {
            walletAddress: userWalletAddress.id,
            receiver: incomingPayment.id,
            method: "ilp",
            debitAmount: {
                value: '1000',
                assetCode: 'USD',
                assetScale: 2
            }
        }
    );

    console.log({ quote });

    const outgoingPayment = await client.outgoingPayment.create(
        {
            url: userWalletAddress.resourceServer,
            accessToken: "2AA5BAC0E5687A94A138"
        },
        {
            walletAddress: userWalletAddress.id,
            quoteId: quote.id
        }
    );

    console.log({ outgoingPayment });

})();