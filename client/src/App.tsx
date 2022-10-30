import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Affix, Layout, Spin } from "antd";
import { useMutation } from "@apollo/client";
import { Viewer } from "./lib/types";
import {
    Home,
    Host,
    Listing,
    Listings,
    NotFound,
    User,
    Login,
} from "./sections";
import { LOG_IN } from "./lib/graphql/mutations";
import { LogInVariables, LogIn as LogInData  } from "./lib/graphql/mutations/LogIn/__generated__/LogIn";
import { AppHeaderSkeleton, ErrorBanner } from "./lib/components";
import { AppHeader } from "./lib/components/AppHeader";
import { Stripe } from "./sections/Stripe";
import { Chat } from "./sections/Chat";

const initialViewer: Viewer = {
    id: null,
    token: null,
    avatar: null,
    hasWallet: null,
    didRequest: false,
};

export const App = () => {
    const [viewer, setViewer] = useState<Viewer>(initialViewer);

    const [logIn, { error }] = useMutation<LogInData, LogInVariables>(LOG_IN, {
        onCompleted: (data) => {
            if (data && data.logIn) {
                setViewer(data.logIn);

                if (data.logIn.token) {
                    sessionStorage.setItem("token", data.logIn.token);
                } else {
                    sessionStorage.removeItem("token");
                }
            }
        },
    });
    const logInRef = useRef(logIn);

    useEffect(() => {
        logInRef.current();
    }, []);

    if (!viewer.didRequest && !error) {
        return (
            <Layout className="app-skeleton">
                <AppHeaderSkeleton />
                <div className="app-skeleton__spin-section">
                    <Spin size="large" tip="Launching PaperHouses!" />
                </div>
            </Layout>
        );
    }

    const logInErrorBannerElement = error ? (
        <ErrorBanner description="We weren't able to verify if you were logged in. Please try again later!" />
    ) : null;

    return (
        <BrowserRouter>
            <Layout id="app">
                {logInErrorBannerElement}
                <Affix offsetTop={0} className="app__affix-header">
                    <AppHeader viewer={viewer} setViewer={setViewer} />
                </Affix>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/host" element={<Host viewer={viewer} />} />
                    <Route
                        path="/login"
                        element={<Login setViewer={setViewer} />}
                    />
                    <Route
                        path="/stripe"
                        element={
                            <Stripe viewer={viewer} setViewer={setViewer} />
                        }
                    />
                    <Route
                        path="/listing/:id"
                        element={<Listing viewer={viewer} />}
                    />

                    <Route path="/listings">
                        <Route index element={<Listings />} />
                        <Route path=":location" element={<Listings />} />
                    </Route>

                    <Route
                        path="/user/:id"
                        element={<User viewer={viewer} setViewer={setViewer} />}
                    />

                    <Route
                        path="/chat/:recipientId"
                        element={<Chat viewer={viewer} />}
                    />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};
