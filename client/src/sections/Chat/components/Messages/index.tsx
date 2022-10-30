import React, { useEffect, useRef } from "react";
import Message from "../Message";
import { Typography } from "antd";
import {
    Chat,
    Chat_chat_messages as ChatMessage,
    Chat_chat_participants,
} from "../../../../lib/graphql/queries/Chat/__generated__/Chat";
import { Viewer } from "../../../../lib/types";
import { DateSeparator } from "../DateSeparator";

const { Text } = Typography;

interface Props {
    messages: Chat["chat"]["messages"];
    viewer: Viewer;
    recipient: Chat_chat_participants
}

export const Messages = ({ messages, viewer, recipient } : Props) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const sameAuthor = (message: ChatMessage, index: number) => {
        if (index === 0) {
            return false;
        }
        return message.author.id === messages[index - 1].author.id;
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef?.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="all-messages-container">
            <Text
                style={{
                    color: "#797a7a",
                    marginTop: "15px",
                    fontSize: "15px",
                }}
            >
                This is the beginning of your conversation with{" "}
                {recipient.name}
            </Text>

            {messages.map((message, index) => {
                const thisMessageDate = new Date(
                    message.createdAt
                ).toDateString();
                const prevMessageDate =
                    index > 0 &&
                    new Date(messages[index - 1]?.createdAt).toDateString();

                const isSameDay =
                    index > 0 ? thisMessageDate === prevMessageDate : true;

                const incomingMessage = message.author.id !== viewer.id;

                return (
                    <div key={message.id} style={{ width: "97%" }}>
                        {(!isSameDay || index === 0) && (
                            <DateSeparator date={message.createdAt} />
                        )}

                        <Message
                            content={message.content}
                            username={message.author.name}
                            sameAuthor={sameAuthor(message, index)}
                            date={message.createdAt}
                            incomingMessage={incomingMessage}
                            avatar={message.author.avatar}
                            userId={message.author.id}
                        />
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};
