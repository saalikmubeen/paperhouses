import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Input } from "antd";
import { MenuItems } from "./components";

import logo from "./assets/paperhouses-logo.png";
import { Viewer } from "../../types";
import { displayErrorMessage } from "../../utils";
import { MyWavyLink } from "../MyWavyLink";

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Header } = Layout;
const { Search } = Input;

export const AppHeader = ({ viewer, setViewer }: Props) => {
  const [search, setSearch] = useState("");
 

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
      const { pathname } = location;
      const pathnameSubStrings = pathname.split("/");

      if (!pathname.includes("/listings")) {
          setSearch("");
          return;
      }

      if (pathname.includes("/listings") && pathnameSubStrings.length === 3) {
          var replaced = pathnameSubStrings[2].replace(/%20/g, " ");
          setSearch(replaced);
          return;
      }
  }, [location]);

  const onSearch = (value: string) => {
      const trimmedValue = value.trim();

      if (trimmedValue) {
          navigate(`/listings/${trimmedValue}`);
      } else {
          displayErrorMessage("Please enter a valid search!");
      }
  };

  return (
      <Header className="app-header">
          <div className="app-header__logo-search-section">
              <div className="app-header__logo">
                  <MyWavyLink to="/" direction="up">
                      <img src={logo} alt="App logo" />
                  </MyWavyLink>
              </div>

              <div className="app-header__search-input">
                  <Search
                      placeholder="Search 'Los Angeles'"
                      enterButton
                      value={search}
                      onChange={(evt) => setSearch(evt.target.value)}
                      onSearch={onSearch}
                  />
              </div>
          </div>
          <div className="app-header__menu-section">
              <MenuItems viewer={viewer} setViewer={setViewer} />
          </div>
      </Header>
  );
};
