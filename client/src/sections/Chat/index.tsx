import React, { useEffect } from "react";
import { Layout, Spin } from "antd";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { SEND_MESSAGE } from "../../lib/graphql/subscriptions/SendMessage";
import { Viewer } from "../../lib/types";
import { CHAT } from "../../lib/graphql/queries";
import {
    Chat as ChatData,
    ChatVariables,
} from "../../lib/graphql/queries/Chat/__generated__/Chat";
import {
    AppHeaderSkeleton,
    ErrorBanner,
    PageSkeleton,
} from "../../lib/components";
import { Messages } from "./components/Messages";
import { NewMessageInput } from "./components/NewMessageInput";
import { SendMessage as SendMessageData } from "../../lib/graphql/subscriptions/SendMessage/__generated__/SendMessage";

const { Content } = Layout;

interface Props {
    viewer: Viewer;
}

type Params = Record<"recipientId", string>;

export const Chat = (props: Props) => {
    let params = useParams<Params>() as Params;

    const { loading, error, data, subscribeToMore } = useQuery<
        ChatData,
        ChatVariables
    >(CHAT, {
        variables: {
            recipient: params.recipientId
        }
    });

    useEffect(() => {

        if(!loading && data?.chat) {
            subscribeToMore({
                document: SEND_MESSAGE,
                variables: { to: params.recipientId },
                updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev;
                    const newMessage = (
                        subscriptionData.data as unknown as SendMessageData
                    ).sendMessage;

                    const updatedChat =  Object.assign({}, prev, {
                        chat: {
                            ...prev.chat,
                            messages: [...prev.chat.messages, newMessage],
                        },
                    });

                    return updatedChat;
                },
            });
        }

    }, [params.recipientId, subscribeToMore, loading])

    if (loading) {
        return (
            <Layout className="app-skeleton">
                <AppHeaderSkeleton />
                <div className="app-skeleton__spin-section">
                    <Spin size="large" tip="Loading your chat...!" />
                </div>
            </Layout>
        );
    }

    if (error) {
        console.log(error)
        return (
            <Content className="user">
                <ErrorBanner description="We've encountered an error. Please try again soon." />
                <PageSkeleton />
            </Content>
        );
    }

    const chat = data ? data.chat : null;

    if(!chat) {
        return null;
    }

    const recipient = chat.participants.find((participant) => {
        return participant.id !== props.viewer.id;
    });


    return (
        <div className="chat-container">
            <Messages viewer={props.viewer} messages={chat.messages} recipient={recipient!}/>
            <NewMessageInput recipientId={params.recipientId} />
        </div>
    );
};