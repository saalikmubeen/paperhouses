import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { Avatar, Button, Menu, } from "antd";
import type { MenuProps } from "antd";
import Icon, {
    HomeOutlined,
    UserOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import { Viewer } from "../../../../types";
import { LOG_OUT } from "../../../../graphql/mutations";
import { LogOut as LogOutData } from "../../../../graphql/mutations/LogOut/__generated__/LogOut";
import {
    displayErrorMessage,
    displaySuccessNotification,
} from "../../../../utils";

interface Props {
    viewer: Viewer;
    setViewer: (viewer: Viewer) => void;
}

export const MenuItems = ({ viewer, setViewer }: Props) => {
    const navigate = useNavigate();

    const [logOut] = useMutation<LogOutData>(LOG_OUT, {
        onCompleted: (data) => {
            if (data && data.logOut) {
                setViewer(data.logOut);
                sessionStorage.removeItem("token");
                displaySuccessNotification("You've successfully logged out!");
                navigate("/");
            }
        },
        onError: () => {
            displayErrorMessage(
                "Sorry! We weren't able to log you out. Please try again later!"
            );
        },
    });

    const handleLogOut = () => {
        logOut();
    };

    let items: MenuProps["items"] = [
        {
            label: (
                <Link to="/host">
                    <Icon
                        component={
                            HomeOutlined as React.ForwardRefExoticComponent<any>
                        }
                        style={{ marginRight: "6px" }}
                    />
                    Become a Host
                </Link>
            ),
            key: "/host",
        },
    ];

    if (viewer.id && viewer.avatar) {
        items = [
            ...items,
            {
                key: "viewer",
                icon: <Avatar src={viewer.avatar} />,
                children: [
                    {
                        label: (
                            <Link to={`/user/${viewer.id}`}>
                                <Icon
                                    component={
                                        UserOutlined as React.ForwardRefExoticComponent<any>
                                    }
                                    style={{ marginRight: "10px" }}
                                />
                                Profile
                            </Link>
                        ),
                        key: "/user",
                    },
                    {
                        label: (
                            <div onClick={handleLogOut}>
                                <Icon
                                    component={
                                        LogoutOutlined as React.ForwardRefExoticComponent<any>
                                    }
                                    style={{ marginRight: "10px" }}
                                />
                                Log out
                            </div>
                        ),
                        key: "/logout",
                    },
                ],
            },
        ];
    } else {
        items = [
            ...items,
            {
                label: (
                    <Link to="/login">
                        <Button type="primary">Sign In</Button>
                    </Link>
                ),
                key: "/login"
            },
        ];
    }
    return (
        <>
            <Menu
                mode="horizontal"
                selectable={false}
                className="menu"
                items={items}
            />
        </>
    );
};
