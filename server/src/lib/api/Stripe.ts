import stripe from "stripe";

const client = new stripe(`${process.env.STRIPE_SECRET_KEY}`);

export const Stripe = {
    connect: async (code: string) => {
        const response = await client.oauth.token({
            grant_type: "authorization_code",
            code,
        });

        return response; // response contains access_token, stripe_user_id and more
    },

    disconnect: async (stripeUserId: string) => {
        // @ts-ignore
        const response = await client.oauth.deauthorize({
            client_id: `${process.env.STRIPE_CLIENT_ID}`,
            stripe_user_id: stripeUserId,
        });

        return response;
    },

    charge: async (amount: number, source: string, stripeAccount: string) => {
        try {
            const res = await client.charges.create(
                {
                    amount,
                    currency: "usd",
                    source, // who's paying the fee
                    application_fee_amount: Math.round(amount * 0.05), // PaperHouses that's getting paid 5% of the amount for using our platform
                },
                {
                    stripe_account: stripeAccount, // owner/host of the listing getting paid the amount = amount  - 5% of the amount
                }
            );

            if (res.status !== "succeeded") {
                throw new Error("failed to create charge with Stripe");
            }
            
        }catch(err) {
            console.log(err);
            throw new Error("failed to create charge with Stripe");
        }
    },
};
