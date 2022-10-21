import React, { useEffect, useRef } from "react";
import {  useNavigate } from "react-router-dom";
import { ApolloError, useMutation } from "@apollo/client";
import { Layout, Spin } from "antd";
import { CONNECT_STRIPE } from "../../lib/graphql/mutations";
import {
    ConnectStripe as ConnectStripeData,
    ConnectStripeVariables,
} from "../../lib/graphql/mutations/ConnectStripe/__generated__/ConnectStripe";
import { displaySuccessNotification } from "../../lib/utils";
import { Viewer } from "../../lib/types";

interface Props {
    viewer: Viewer;
    setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;

export const Stripe = ({
    viewer,
    setViewer,
}: Props ) => {
    let navigate = useNavigate();
    const [connectStripe, { data, loading, error }] = useMutation<
        ConnectStripeData,
        ConnectStripeVariables
    >(CONNECT_STRIPE, {
        onCompleted: (data: ConnectStripeData) => {
            if (data && data.connectStripe) {
                setViewer({
                    ...viewer,
                    hasWallet: !!data.connectStripe.hasWallet,
                });
                displaySuccessNotification(
                    "You've successfully connected your Stripe Account!",
                    "You can now begin to create listings in the Host page."
                );

                navigate(`/user/${viewer.id}`)
            }
        },
        onError: (err: ApolloError) => {
            console.log(err);
            navigate(`/user/${viewer.id}?stripe_error=true`);
        }
    });
    const connectStripeRef = useRef(connectStripe);

    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get("code");

        if (code) {
            connectStripeRef.current({
                variables: {
                    input: { code },
                },
            });
        } else {
            navigate("/login")
        }
    }, [navigate]);


    if (loading) {
        return (
            <Content className="stripe">
                <Spin size="large" tip="Connecting your Stripe account..." />
            </Content>
        );
    }

    return null;
};
