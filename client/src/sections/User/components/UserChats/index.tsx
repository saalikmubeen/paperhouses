import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Layout, Typography, Button, List, Avatar, Empty, Drawer } from "antd";
import Icon, { CommentOutlined } from "@ant-design/icons";
import { Viewer } from "../../../../lib/types";
import { User } from "../../../../lib/graphql/queries/User/__generated__/User";
import { Link } from "react-router-dom";
import { iconColor } from "../../../../lib/utils";


const { Content } = Layout;
const { Text, Title } = Typography;

interface Props {
    viewer: Viewer;
    chats: User["user"]["chats"]
}

export const UserChats = ({ viewer, chats }: Props) => {
    const [open, setOpen] = useState(false);

    const chatList = chats?.map((chat) => {
        return {
            ...chat,
            recipient: chat.participants.find((participant) => participant.id !== viewer.id) 
        }
    })

    console.log(chatList)

     const handleClose = () => {
         setOpen(false);
     };

     const showChatHistory = () => {
         setOpen(true);
     };

    return (
        <>
            <Button
                type="primary"
                className="user-profile__details-cta"
                onClick={showChatHistory}
            >
                Chat History
            </Button>
            <Drawer
                open={open}
                title={
                    <>
                        <Icon
                            component={
                                CommentOutlined as React.ForwardRefExoticComponent<any>
                            }
                            style={{
                                marginRight: "5px",
                                fontSize: "20px",
                                color: iconColor,
                            }}
                        />
                        <Title
                            level={4}
                            style={{ display: "inline", color: iconColor }}
                        >
                            Chat History
                        </Title>
                    </>
                }
                placement="right"
                onClose={handleClose}
            >
                {chatList && chatList.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={chatList}
                        renderItem={(item) => (
                            <Link to={`/chat/${item.recipient?.id}`}>
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                src={item.recipient?.avatar}
                                            />
                                        }
                                        title={item.recipient?.name}
                                    />
                                </List.Item>
                            </Link>
                        )}
                    />
                ) : (
                    <Empty description={<span>Empty chat history!</span>} />
                )}
            </Drawer>
        </>
    );
};
