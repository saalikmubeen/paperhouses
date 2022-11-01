import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { Avatar, Button, Menu } from "antd";
import Icon, { HomeOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Viewer } from "../../../../types";
import { LOG_OUT } from "../../../../graphql/mutations";
import {  LogOut as LogOutData } from "../../../../graphql/mutations/LogOut/__generated__/LogOut"
import { displayErrorMessage, displaySuccessNotification } from "../../../../utils";

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Item, SubMenu } = Menu;

export const MenuItems = ({ viewer, setViewer }: Props) => {

  const [logOut] = useMutation<LogOutData>(LOG_OUT, {
    onCompleted: data => {
      if (data && data.logOut) {
        setViewer(data.logOut);
        sessionStorage.removeItem("token");
        displaySuccessNotification("You've successfully logged out!");
      }
    },
    onError: () => {
      displayErrorMessage(
        "Sorry! We weren't able to log you out. Please try again later!"
      );
    }
  });

  const handleLogOut = () => {
    logOut();
  };

  const subMenuLogin =
      viewer.id && viewer.avatar ? (
          <SubMenu title={<Avatar src={viewer.avatar} />}>
              <Item key="/user">
                  <Link to={`/user/${viewer.id}`}>
                      <Icon
                          component={
                              UserOutlined as React.ForwardRefExoticComponent<any>
                          }
                          style={{ marginRight: "5px" }}
                      />
                      Profile
                  </Link>
              </Item>
              <Item key="/logout">
                  <div onClick={handleLogOut}>
                      <Icon
                          component={
                              LogoutOutlined as React.ForwardRefExoticComponent<any>
                          }
                          style={{ marginRight: "5px" }}
                      />
                      Log out
                  </div>
              </Item>

          </SubMenu>
      ) : (
          <Item>
              <Link to="/login">
                  <Button type="primary">Sign In</Button>
              </Link>
          </Item>
      );

  return (
      <>
          <Menu mode="horizontal" selectable={false} className="menu">
              <Item key="/host">
                  <Link to="/host">
                      <Icon
                          component={
                              HomeOutlined as React.ForwardRefExoticComponent<any>
                          }
                          style={{ marginRight: "6px" }}
                      />
                      Host
                  </Link>
              </Item>
              {subMenuLogin}
          </Menu>
      </>
  );
};
