import React, { useEffect } from "react";
import { Layout, Spin } from "antd";
import { useQuery, useSubscription } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { SEND_MESSAGE } from "../../lib/graphql/subscriptions/SendMessage";
import { Viewer } from "../../lib/types";
import { CHAT } from "../../lib/graphql/queries";
import {
    Chat as ChatData,
    ChatVariables,
} from "../../lib/graphql/queries/Chat/__generated__/Chat";
import {
    ErrorBanner,
    PageSkeleton,
} from "../../lib/components";
import { Messages } from "./components/Messages";
import { NewMessageInput } from "./components/NewMessageInput";
import { SendMessage as SendMessageData, SendMessageVariables } from "../../lib/graphql/subscriptions/SendMessage/__generated__/SendMessage";
import { useScrollToTop } from "../../lib/hooks/useScrollToTop";

const { Content } = Layout;

interface Props {
    viewer: Viewer;
}

type Params = Record<"recipientId", string>;

export const Chat = (props: Props) => {
    let params = useParams<Params>() as Params;
    const navigate = useNavigate();

    const { loading, error, data, subscribeToMore } = useQuery<
        ChatData,
        ChatVariables
    >(CHAT, {
        variables: {
            recipient: params.recipientId
        }
    });

    useScrollToTop();

    useEffect(() => {

        if (!props.viewer.id) {
            navigate("/");
            return;
        }

        if (!loading && data?.chat) {
            subscribeToMore({
                document: SEND_MESSAGE,
                variables: { to: params.recipientId },
                updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev;
                    const newMessage = (
                        subscriptionData.data as unknown as SendMessageData
                    ).sendMessage;

                    const updatedChat: ChatData = Object.assign({}, prev, {
                        chat: {
                            ...prev.chat,
                            messages: [...prev.chat.messages, newMessage],
                        },
                    });

                    return updatedChat;
                },
            });
        }
    }, [
        params.recipientId,
        subscribeToMore,
        loading,
        props.viewer.id,
        navigate,
    ]);

    if(!props.viewer.id) {
        return <></>;
    }

    if (loading) {
        return (
            <Content className="log-in">
                <Spin size="large" tip="Loading your chat...!" />
            </Content>
        );
    }

    if (error) {
        console.log(error)
        return (
            <Content className="user">
                <ErrorBanner description="Unable to fetch chat. Please try again soon." />
                <PageSkeleton />
            </Content>
        );
    }

    const chat = data ? data.chat : null;

    if(!chat) {
        return null;
    }

    console.log(chat)

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
