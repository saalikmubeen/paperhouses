import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApolloClient, useMutation } from "@apollo/client";
import { Card, Layout, Spin, Typography } from "antd";
import { ErrorBanner } from "../../lib/components";
import { LOG_IN } from "../../lib/graphql/mutations";
import { AUTH_URL } from "../../lib/graphql/queries";
import {
    LogIn as LogInData,
    LogInVariables,
} from "../../lib/graphql/mutations/LogIn/__generated__/LogIn";
import { AuthUrl as AuthUrlData } from "../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl";
import {
    displaySuccessNotification,
    displayErrorMessage,
} from "../../lib/utils";
import { Viewer } from "../../lib/types";

// Image Assets
import googleLogo from "./assets/google_logo.jpg";
import { useScrollToTop } from "../../lib/hooks/useScrollToTop";

interface Props {
    setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;
const { Text, Title } = Typography;

export const Login = ({ setViewer }: Props) => {

    const client = useApolloClient();
    let navigate = useNavigate();


    const [
        logIn,
        { data: logInData, loading: logInLoading, error: logInError },
    ] = useMutation<LogInData, LogInVariables>(LOG_IN, {
        onCompleted: (data) => {
            if (data && data.logIn && data.logIn.token) {
                setViewer(data.logIn);
                sessionStorage.setItem("token", data.logIn.token);
                displaySuccessNotification("You've successfully logged in!");

                navigate(`/user/${data.logIn.id}`);
            }
        },
    });
    const logInRef = useRef(logIn);

    const handleAuthorize = async () => {
        try {
            const { data } = await client.query<AuthUrlData>({
                query: AUTH_URL,
            });
            window.location.href = data.authUrl;
        } catch {
            displayErrorMessage(
                "Sorry! We weren't able to log you in. Please try again later!"
            );
        }
    };

    useScrollToTop();

    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get("code");
        if (code) {
            logInRef.current({
                variables: {
                    input: { code },
                },
            });
        }
    }, []);

    if (logInLoading) {
        return (
            <Content className="log-in">
                <Spin size="large" tip="Logging you in..." />
            </Content>
        );
    }

    if (logInData && logInData.logIn) {
        return <></>;
    }

    const logInErrorBannerElement = logInError ? (
        <ErrorBanner description="Sorry! We weren't able to log you in. Please try again later!" />
    ) : null;

    return (
        <Content className="log-in">
            {logInErrorBannerElement}
            <Card className="log-in-card">
                <div className="log-in-card__intro">
                    <Title level={3} className="log-in-card__intro-title">
                        <span role="img" aria-label="wave">
                            👋
                        </span>
                    </Title>
                    <Title level={3} className="log-in-card__intro-title">
                        Log in to PaperHouses!
                    </Title>
                    <Text>
                        Sign in with Google to start booking available rentals!
                    </Text>
                </div>
                <button
                    className="log-in-card__google-button"
                    onClick={handleAuthorize}
                >
                    <img
                        src={googleLogo}
                        alt="Google Logo"
                        className="log-in-card__google-button-logo"
                    />
                    <span className="log-in-card__google-button-text">
                        Sign in with Google
                    </span>
                </button>
                <Text type="secondary">
                    Note: By signing in, you'll be redirected to the Google
                    consent form to sign in with your Google account.
                </Text>
            </Card>
        </Content>
    );
};
