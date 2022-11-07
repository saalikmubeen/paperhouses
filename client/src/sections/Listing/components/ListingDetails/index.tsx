import React from "react";
import { Link } from "react-router-dom";
import { Avatar, Divider, Rate, Tag, Typography } from "antd";
import {
    EnvironmentOutlined
} from "@ant-design/icons";
import { Listing as ListingData } from "../../../../lib/graphql/queries/Listing/__generated__/Listing";
import { iconColor } from "../../../../lib/utils";
import  { ShowLocation } from "../../../../lib/components/Map";
import { Viewer } from "../../../../lib/types";

interface Props {
  listing: ListingData["listing"];
  viewer: Viewer
}

const { Paragraph, Title } = Typography;

export const ListingDetails = ({ listing, viewer }: Props) => {
  const { title, description, image, type, address, city, numOfGuests, host, rating, numReviews } = listing;

  return (
      <div className="listing-details">
          <div
              style={{ backgroundImage: `url(${image})` }}
              className="listing-details__image"
          />

          <div className="listing-details__information">
              <Paragraph
                  type="secondary"
                  ellipsis
                  className="listing-details__city-address"
              >
                  <Link to={`/listings/${city}`}>
                      <EnvironmentOutlined style={{ color: iconColor }} />{" "}
                      {city}
                  </Link>
                  <Divider type="vertical" />
                  {address}
              </Paragraph>
              <Title level={3} className="listing-details__title">
                  {title}
              </Title>
              <Rate disabled defaultValue={rating} />{" "}
              <Title level={5} style={{ display: "inline" }}>({numReviews} reviews)</Title>
          </div>

          <Divider />

          <div className="listing-details__section">
              <Link to={`/user/${host.id}`}>
                  <Avatar src={host.avatar} size={64} />
                  <Title level={2} className="listing-details__host-name">
                      {host.name}
                  </Title>
              </Link>
          </div>

          <div>
              <Link to={(viewer.id && viewer.token) ? `/chat/${host.id}` : "/login"}>
                  <Title level={5}>
                      <Tag color={iconColor}>Message</Tag> {host.name} to know
                      more.
                  </Title>
              </Link>
          </div>

          <Divider />

          <div className="listing-details__section">
              <Title level={4}>About this space</Title>
              <div className="listing-details__about-items">
                  <Tag color="magenta">{type}</Tag>
                  <Tag color="magenta">{numOfGuests} Guests</Tag>
              </div>
              <Paragraph ellipsis={{ rows: 3, expandable: true }}>
                  {description}
              </Paragraph>
          </div>

          {/* <ShowLocation address={address}/> */}
      </div>
  );
};
