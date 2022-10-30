import React, { useState, useEffect } from "react";
import { Input, Button, Layout, Spin } from "antd";
import { useSubscription, useMutation, useLazyQuery, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { SEND_MESSAGE } from "../../lib/graphql/subscriptions/SendMessage";
import {
    SendMessage as SendMessageData,
    SendMessageVariables,
} from "../../lib/graphql/subscriptions/SendMessage/__generated__/SendMessage";
import { Viewer } from "../../lib/types";
import {
    CreateMessage as CreateMessageData,
    CreateMessageVariables,
} from "../../lib/graphql/mutations/CreateMessage/__generated__/CreateMessage";
import { CREATE_MESSAGE } from "../../lib/graphql/mutations";
import { displaySuccessNotification } from "../../lib/utils";
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

const { TextArea } = Input;

const { Content } = Layout;

interface Props {
    viewer: Viewer;
}

type Params = Record<"recipientId", string>;

export const Chat = (props: Props) => {
    let params = useParams<Params>() as Params;
    const [content, setContent] = useState("");

    const { loading, error, data, subscribeToMore } = useQuery<
        ChatData,
        ChatVariables
    >(CHAT, {
        variables: {
            recipient: params.recipientId
        }
    });

    // SUBSCRIPTION TO RECEIVE MESSAGE
    //  useSubscription<SendMessageData, SendMessageVariables>(SEND_MESSAGE, {
    //     variables: { to: params.recipientId },
    //     onData({ data }) {
    //         console.log(data.data?.sendMessage);
    //     },

        
    // });

    // MUTATION TO SEND MESSAGE
    const [createMessage] = useMutation<
        CreateMessageData,
        CreateMessageVariables
    >(CREATE_MESSAGE, {
        onCompleted: () => {
            displaySuccessNotification("Message Sent");
        },
        onError: (err) => {
            console.log(err);
        },
    });

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    const handleSend = () => {
        createMessage({
            variables: {
                input: {
                    content,
                    to: params.recipientId,
                },
            },
        });
    };

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

    return (
        <div>
            <TextArea
                showCount
                maxLength={100}
                style={{ height: 120 }}
                onChange={onChange}
                value={content}
                placeholder="can resize"
            />

            <Button type="primary" shape="round" onClick={handleSend}>
                Send
            </Button>


            <div>
                {
                    !chat ? null : (
                        <div>
                            {
                                chat.messages.map((message) => {
                                    return (
                                        <div key={message.id}>
                                            <h3>{message.content}</h3>
                                            <span>{message.author.name}</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                }
            </div>
        </div>
    );
};
