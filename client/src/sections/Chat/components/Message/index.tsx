import React from "react";
import { Typography, Avatar, message } from "antd";
import { iconColor } from "../../../../lib/utils";
import { Link } from "react-router-dom";

const { Text } = Typography;

interface MessageProps {
    content: string;
    sameAuthor: boolean;
    username: string;
    date: string;
    incomingMessage: boolean;
    avatar: string
    userId: string;
}


function formatDate(date: Date) {
    let hours = date.getHours();
    let minutes: string | number = date.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let strTime = hours + ":" + minutes + " " + ampm;
    
    return strTime;
}


const Message = ({
    content,
    sameAuthor,
    username,
    date,
    incomingMessage,
    avatar,
    userId
}: MessageProps) => {
    if (!incomingMessage) {
        return (
            <div className="message-container">
                    <div
                        className="message"
                        style={{
                            backgroundColor: iconColor,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: "16px",
                                color: "white",
                                marginBottom: "2px",
                            }}
                        >
                            {content}
                        </Text>

                        <Text
                            type="secondary"
                            style={{
                                color: "#cccdce",
                                textAlign: "right",
                                fontSize: "10px",
                            }}
                        >
                            {formatDate(new Date(date))}
                        </Text>
                    </div>
                </div>
        );
    }

    return (
        <div className="message-container">
            {!sameAuthor && (
                <div className="message-avatar-container">
                    <Link to={`/user/${userId}`}>
                        <Avatar src={avatar} />
                    </Link>
                </div>
            )}

            <div
                className="message"
                style={{
                    marginLeft: sameAuthor ? "60px" : "0px",
                    backgroundColor: "#d7d7d7",
                }}
            >
                <Text
                    style={{
                        fontSize: "16px",
                        color: "black",
                        marginBottom: "2px",
                    }}
                >
                    {content}
                </Text>

                <Text
                    type="secondary"
                    style={{
                        color: "#7f8183",
                        fontSize: "10px",
                    }}
                >
                    {formatDate(new Date(date))}
                </Text>
            </div>
        </div>
    );
};

export default Message;
