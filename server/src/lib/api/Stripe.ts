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
};
